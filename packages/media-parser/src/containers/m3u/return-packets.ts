import type {AudioTrack, VideoTrack} from '../../get-tracks';
import type {LogLevel} from '../../log';
import {parseMedia} from '../../parse-media';
import type {M3uState} from '../../state/m3u-state';
import type {OnAudioSample, OnVideoSample} from '../../webcodec-sample-types';
import {getChunks} from './get-chunks';
import {getPlaylist} from './get-playlist';
import type {M3uStructure} from './types';

export const iteratorOverTsFiles = async ({
	structure,
	onVideoTrack,
	m3uState,
	onAudioTrack,
	onDoneWithTracks,
	playlistUrl,
	logLevel,
}: {
	structure: M3uStructure;
	onVideoTrack: (track: VideoTrack) => Promise<OnVideoSample | null>;
	onAudioTrack: (track: AudioTrack) => Promise<OnAudioSample | null>;
	onDoneWithTracks: () => void;
	m3uState: M3uState;
	playlistUrl: string;
	logLevel: LogLevel;
}) => {
	const playlist = getPlaylist(structure);
	const chunks = getChunks(playlist);

	const lastChunkProcessed = m3uState.getLastChunkProcessed();
	const chunkIndex = lastChunkProcessed + 1;
	// TODO: Be able to pause / resume / cancel / seek
	const chunk = chunks[chunkIndex];
	const isLastChunk = chunkIndex === chunks.length - 1;

	const src = new URL(chunk.url, playlistUrl).toString();
	await parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		logLevel,
		onTracks: () => {
			if (!m3uState.hasEmittedDoneWithTracks()) {
				m3uState.setHasEmittedDoneWithTracks();
				onDoneWithTracks();
				return null;
			}
		},
		onAudioTrack: async ({track}) => {
			const callbackOrFalse = m3uState.hasEmittedAudioTrack();
			if (callbackOrFalse === false) {
				const callback = await onAudioTrack(track);

				if (!callback) {
					m3uState.setHasEmittedAudioTrack(null);
					return null;
				}

				m3uState.setHasEmittedAudioTrack(callback);
				return (sample) => {
					return callback(sample);
				};
			}

			return callbackOrFalse;
		},
		onVideoTrack: async ({track}) => {
			const callbackOrFalse = m3uState.hasEmittedVideoTrack();
			if (callbackOrFalse === false) {
				const callback = await onVideoTrack(track);

				if (!callback) {
					m3uState.setHasEmittedVideoTrack(null);
					return null;
				}

				m3uState.setHasEmittedVideoTrack(callback);
				return (sample) => {
					return callback(sample);
				};
			}

			return callbackOrFalse;
		},
	});

	m3uState.setLastChunkProcessed(chunkIndex);
	if (isLastChunk) {
		m3uState.setAllChunksProcessed();
	}
};
