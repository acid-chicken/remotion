mod commands;
mod errors;
mod ffmpeg;
mod frame_cache;
mod frame_cache_manager;
mod get_silent_parts;
mod global_printer;
mod image;
mod logger;
mod max_cache_size;
mod memory;
mod opened_stream;
mod opened_video;
mod opened_video_manager;
mod payloads;
mod rotation;
mod scalable_frame;
mod select_right_thread;
mod tone_map;

use commands::execute_command_and_print;
use errors::ErrorWithBacktrace;
use frame_cache_manager::make_frame_cache_manager;
use global_printer::{_print_verbose, print_error, set_verbose_logging};
use memory::{get_ideal_maximum_frame_cache_size, is_about_to_run_out_of_memory};
use opened_video_manager::make_opened_stream_manager;
use std::env;
use std::sync::mpsc;
use std::thread;

use payloads::payloads::{parse_cli, CliInputCommand, CliInputCommandPayload, Eof, OpenVideoStats};

extern crate png;

fn mainfn() -> Result<(), ErrorWithBacktrace> {
    let args = env::args();

    let first_arg =
        args.skip(1)
            .next()
            .ok_or(errors::ErrorWithBacktrace::from(std::io::Error::new(
                std::io::ErrorKind::Other,
                "No input",
            )))?;

    let opts: CliInputCommand = parse_init_command(&first_arg)?;

    match opts.payload {
        CliInputCommandPayload::StartLongRunningProcess(payload) => {
            set_verbose_logging(payload.verbose);

            let max_video_cache_size = payload
                .maximum_frame_cache_size_in_bytes
                .unwrap_or(get_ideal_maximum_frame_cache_size());

            _print_verbose(&format!(
                "Starting Rust process. Max video cache size: {}MB, max concurrency = {}",
                max_video_cache_size / 1024 / 1024,
                payload.concurrency
            ))?;

            start_long_running_process(payload.concurrency, max_video_cache_size)
        }
        _ => {
            panic!("only supports long running compositor")
        }
    }
}

pub fn parse_init_command(json: &str) -> Result<CliInputCommand, ErrorWithBacktrace> {
    let cli_input: CliInputCommand = serde_json::from_str(json)?;

    Ok(cli_input)
}

fn start_long_running_process(
    threads: usize,
    maximum_frame_cache_size_in_bytes: u64,
) -> Result<(), ErrorWithBacktrace> {
    let mut finish_thread_handles = vec![];
    let mut send_to_thread_handles = vec![];
    let mut receive_video_stats_in_main_thread_handles: Vec<mpsc::Receiver<OpenVideoStats>> =
        vec![];
    let mut receive_close_video_in_main_thread_handles: Vec<mpsc::Receiver<()>> = vec![];
    let mut receive_free_in_main_thread_handles: Vec<mpsc::Receiver<()>> = vec![];
    let mut thread_map = select_right_thread::ThreadMap::new(threads);

    for thread_index in 0..threads {
        let (send_to_thread, receive_in_thread) = mpsc::channel::<CliInputCommand>();
        let (send_video_stats_to_main_thread, receive_video_stats_in_main_thread) =
            mpsc::channel::<OpenVideoStats>();
        let (send_free_to_main_thread, receive_free_in_main_thread) = mpsc::channel::<()>();
        let (send_close_video_to_main_thread, receive_close_video_in_main_thread) =
            mpsc::channel::<()>();

        let wait_for_thread_finish = thread::spawn(move || {
            let mut frame_cache_manager = make_frame_cache_manager().unwrap();
            let mut opened_video_manager = make_opened_stream_manager().unwrap();

            loop {
                let _message = receive_in_thread.recv();
                if _message.is_err() {
                    break;
                }
                let message = _message.unwrap();
                let current_maximum_cache_size =
                    max_cache_size::get_instance().lock().unwrap().get_value();

                if is_about_to_run_out_of_memory() && current_maximum_cache_size.is_some() {
                    ffmpeg::emergency_memory_free_up(&mut frame_cache_manager, thread_index)
                        .unwrap();
                    max_cache_size::get_instance()
                        .lock()
                        .unwrap()
                        .set_value(Some(current_maximum_cache_size.unwrap() / 2));
                }

                match message.payload {
                    CliInputCommandPayload::Eof(_) => {
                        break;
                    }
                    _ => {}
                };

                let res = (|| -> Result<(), ErrorWithBacktrace> {
                    match message.payload {
                        CliInputCommandPayload::CloseAllVideos(_) => {
                            opened_video_manager.close_all_videos(&mut frame_cache_manager)?;
                            send_close_video_to_main_thread.send(()).map_err(|e| {
                                ErrorWithBacktrace::from(std::io::Error::new(
                                    std::io::ErrorKind::Other,
                                    format!("Failed to send close video message: {}", e),
                                ))
                            })?;
                            Ok(())
                        }
                        CliInputCommandPayload::ExtractFrame(command) => {
                            let res = ffmpeg::extract_frame(
                                command.src,
                                command.original_src,
                                command.time,
                                command.transparent,
                                command.tone_mapped,
                                current_maximum_cache_size,
                                thread_index,
                                &mut opened_video_manager,
                                &mut frame_cache_manager,
                            )?;
                            global_printer::synchronized_write_buf(0, &message.nonce, &res)?;
                            if let Some(cache_size) = current_maximum_cache_size {
                                ffmpeg::keep_only_latest_frames_and_close_videos(
                                    cache_size,
                                    &mut opened_video_manager,
                                    &mut frame_cache_manager,
                                    thread_index,
                                )?;
                            }
                            Ok(())
                        }
                        CliInputCommandPayload::FreeUpMemory(payload) => {
                            ffmpeg::keep_only_latest_frames_and_close_videos(
                                payload.remaining_bytes,
                                &mut opened_video_manager,
                                &mut frame_cache_manager,
                                thread_index,
                            )?;
                            send_free_to_main_thread.send(()).map_err(|e| {
                                ErrorWithBacktrace::from(std::io::Error::new(
                                    std::io::ErrorKind::Other,
                                    format!("Failed to send free memory message: {}", e),
                                ))
                            })?;
                            Ok(())
                        }
                        CliInputCommandPayload::GetOpenVideoStats(_) => {
                            let res = ffmpeg::get_open_video_stats(
                                &mut frame_cache_manager,
                                &mut opened_video_manager,
                            )?;
                            send_video_stats_to_main_thread
                                .send(res.clone())
                                .map_err(|e| {
                                    ErrorWithBacktrace::from(std::io::Error::new(
                                        std::io::ErrorKind::Other,
                                        format!("Failed to send video stats message: {}", e),
                                    ))
                                })?;
                            Ok(())
                        }
                        _ => panic!("Command cannot be executed on thread"),
                    }
                })();
                if res.is_err() {
                    print_error(&message.nonce, res.err().unwrap())
                }
            }
        });
        send_to_thread_handles.push(send_to_thread);
        receive_video_stats_in_main_thread_handles.push(receive_video_stats_in_main_thread);
        receive_close_video_in_main_thread_handles.push(receive_close_video_in_main_thread);
        receive_free_in_main_thread_handles.push(receive_free_in_main_thread);
        finish_thread_handles.push(wait_for_thread_finish);
    }

    max_cache_size::get_instance()
        .lock()
        .unwrap()
        .set_value(Some(maximum_frame_cache_size_in_bytes));

    loop {
        let mut input = String::new();
        let matched = match std::io::stdin().read_line(&mut input) {
            Ok(_) => input,
            Err(_) => {
                break;
            }
        };

        input = matched.trim().to_string();
        if input == "EOF" {
            for send_handle in send_to_thread_handles {
                send_handle.send(CliInputCommand {
                    payload: CliInputCommandPayload::Eof(Eof {}),
                    nonce: "".to_string(),
                })?;
            }
            break;
        }

        let opts = parse_cli(&input)?;
        let nonce = opts.nonce.clone();
        let _result: Result<(), ErrorWithBacktrace> = match opts.payload {
            CliInputCommandPayload::ExtractFrame(command) => {
                let thread_id = thread_map.select_right_thread(
                    &command.src,
                    command.time,
                    command.transparent,
                )?;
                let input_to_send = parse_cli(&input)?;
                send_to_thread_handles[thread_id].send(input_to_send)?;
                Ok(())
            }
            CliInputCommandPayload::GetOpenVideoStats(_) => {
                for handle in &send_to_thread_handles {
                    handle.send(opts.clone())?;
                }

                let mut open_video_stats_all: Vec<OpenVideoStats> = vec![];
                for handle in &receive_video_stats_in_main_thread_handles {
                    let data = handle.recv()?;
                    open_video_stats_all.push(data.clone());
                }
                let concated: OpenVideoStats = OpenVideoStats {
                    frames_in_cache: open_video_stats_all.iter().map(|x| x.frames_in_cache).sum(),
                    open_streams: open_video_stats_all.iter().map(|x| x.open_streams).sum(),
                    open_videos: open_video_stats_all.iter().map(|x| x.open_videos).sum(),
                };
                let str = serde_json::to_string(&concated)?;
                global_printer::synchronized_write_buf(0, &nonce, &str.as_bytes())?;
                Ok(())
            }
            CliInputCommandPayload::FreeUpMemory(_) => {
                for handle in &send_to_thread_handles {
                    handle.send(opts.clone())?;
                }

                for handle in &receive_free_in_main_thread_handles {
                    handle.recv()?;
                }
                // TODO: Is "Hi" right?
                global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
                Ok(())
            }
            CliInputCommandPayload::CloseAllVideos(_) => {
                for handle in &send_to_thread_handles {
                    handle.send(opts.clone())?;
                }

                for handle in &receive_close_video_in_main_thread_handles {
                    handle.recv()?;
                }
                // TODO: Is "Hi" right?
                global_printer::synchronized_write_buf(0, &nonce, &format!("hi").as_bytes())?;
                Ok(())
            }
            _ => {
                execute_command_and_print(opts)?;
                Ok(())
            }
        };
        if _result.is_err() {
            print_error(&nonce, _result.err().unwrap())
        }
    }

    for handle in finish_thread_handles {
        handle.join()?;
    }

    Ok(())
}

fn main() {
    match mainfn() {
        Ok(_) => (),
        Err(err) => errors::handle_global_error(err),
    }
}
