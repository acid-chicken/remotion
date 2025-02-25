import type {AudioOrVideoSample, LogLevel} from '@remotion/media-parser';
import type {ProgressTracker} from './create/progress-tracker';
import {makeIoSynchronizer} from './io-manager/io-synchronizer';
import {Log} from './log';
import type {WebCodecsController} from './webcodecs-controller';

export type WebCodecsVideoDecoder = {
	processSample: (videoSample: AudioOrVideoSample) => Promise<void>;
	waitForFinish: () => Promise<void>;
	close: () => void;
	flush: () => Promise<void>;
};

export const createVideoDecoder = ({
	onFrame,
	onError,
	controller,
	config,
	logLevel,
	progress,
}: {
	onFrame: (frame: VideoFrame) => Promise<void>;
	onError: (error: DOMException) => void;
	controller: WebCodecsController;
	config: VideoDecoderConfig;
	logLevel: LogLevel;
	progress: ProgressTracker;
}): WebCodecsVideoDecoder => {
	const ioSynchronizer = makeIoSynchronizer({
		logLevel,
		label: 'Video decoder',
		progress,
	});
	let outputQueue = Promise.resolve();

	const addToQueue = (frame: VideoFrame) => {
		const cleanup = () => {
			frame.close();
		};

		controller._internals.signal.addEventListener('abort', cleanup, {
			once: true,
		});

		outputQueue = outputQueue
			.then(() => {
				if (controller._internals.signal.aborted) {
					return;
				}

				return onFrame(frame);
			})
			.then(() => {
				ioSynchronizer.onProcessed();
			})
			.catch((err) => {
				onError(err);
			})
			.finally(() => {
				controller._internals.signal.removeEventListener('abort', cleanup);
				cleanup();
			});
	};

	const onVideoFrame = (frame: VideoFrame) => {
		ioSynchronizer.onOutput(frame.timestamp);

		addToQueue(frame);
	};

	const videoDecoder = new VideoDecoder({
		output(frame) {
			onVideoFrame(frame);
		},
		error(error) {
			onError(error);
		},
	});

	const close = () => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		controller._internals.signal.removeEventListener('abort', onAbort);
		if (videoDecoder.state === 'closed') {
			return;
		}

		videoDecoder.close();
	};

	const onAbort = () => {
		close();
	};

	controller._internals.signal.addEventListener('abort', onAbort);

	videoDecoder.configure(config);

	const processSample = async (sample: AudioOrVideoSample) => {
		if (videoDecoder.state === 'closed') {
			return;
		}

		// @ts-expect-error - can have changed in the meanwhile
		if (videoDecoder.state === 'closed') {
			return;
		}

		progress.setPossibleLowestTimestamp(
			Math.min(
				sample.timestamp,
				sample.dts ?? Infinity,
				sample.cts ?? Infinity,
			),
		);

		await ioSynchronizer.waitFor({
			unemitted: 20,
			unprocessed: 2,
			minimumProgress: sample.timestamp - 10_000_000,
			controller,
		});
		if (sample.type === 'key') {
			await videoDecoder.flush();
		}

		videoDecoder.decode(new EncodedVideoChunk(sample));

		ioSynchronizer.inputItem(sample.timestamp, sample.type === 'key');
	};

	let inputQueue = Promise.resolve();

	return {
		processSample: (sample: AudioOrVideoSample) => {
			inputQueue = inputQueue.then(() => processSample(sample));
			return inputQueue;
		},
		waitForFinish: async () => {
			await videoDecoder.flush();
			Log.verbose(logLevel, 'Flushed video decoder');
			await ioSynchronizer.waitForFinish(controller);
			Log.verbose(logLevel, 'IO synchro finished');
			await outputQueue;
			Log.verbose(logLevel, 'Output queue finished');
			await inputQueue;
			Log.verbose(logLevel, 'Input queue finished');
		},
		close,
		flush: async () => {
			await videoDecoder.flush();
		},
	};
};
