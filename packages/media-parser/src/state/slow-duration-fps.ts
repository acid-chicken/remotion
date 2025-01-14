import type {AudioOrVideoSample} from '../webcodec-sample-types';

export const slowDurationAndFpsState = () => {
	let smallestVideoSample: number | undefined;
	let largestVideoSample: number | undefined;
	let smallestAudioSample: number | undefined;
	let largestAudioSample: number | undefined;
	let videoSamples = 0;
	let audioSamples = 0;

	const getSlowDurationInSeconds = () => {
		let videoDuration: number | null = null;
		let audioDuration: number | null = null;
		if (smallestVideoSample !== undefined && largestVideoSample !== undefined) {
			const startingTimestampDifference =
				largestVideoSample - smallestVideoSample;
			const timeBetweenSamples =
				startingTimestampDifference / (videoSamples - 1);
			videoDuration = timeBetweenSamples * videoSamples;
		}

		if (smallestAudioSample !== undefined && largestAudioSample !== undefined) {
			const startingTimestampDifferenceAudio =
				largestAudioSample - smallestAudioSample;
			const timeBetweenSamplesAudio =
				startingTimestampDifferenceAudio / (audioSamples - 1);
			audioDuration = timeBetweenSamplesAudio * audioSamples;
		}

		if (videoDuration === null && audioDuration === null) {
			throw new Error('No samples');
		}

		return Math.max(videoDuration ?? 0, audioDuration ?? 0);
	};

	return {
		addVideoSample: (videoSample: AudioOrVideoSample) => {
			videoSamples++;
			const presentationTimeInSeconds = videoSample.cts / videoSample.timescale;
			if (
				largestVideoSample === undefined ||
				presentationTimeInSeconds > largestVideoSample
			) {
				largestVideoSample = presentationTimeInSeconds;
			}

			if (
				smallestVideoSample === undefined ||
				presentationTimeInSeconds < smallestVideoSample
			) {
				smallestVideoSample = presentationTimeInSeconds;
			}
		},
		addAudioSample: (audioSample: AudioOrVideoSample) => {
			audioSamples++;
			const presentationTimeInSeconds = audioSample.cts / audioSample.timescale;
			if (
				largestAudioSample === undefined ||
				presentationTimeInSeconds > largestAudioSample
			) {
				largestAudioSample = presentationTimeInSeconds;
			}

			if (
				smallestAudioSample === undefined ||
				presentationTimeInSeconds < smallestAudioSample
			) {
				smallestAudioSample = presentationTimeInSeconds;
			}
		},
		getSlowDurationInSeconds,
		getFps: () => {
			return videoSamples / getSlowDurationInSeconds();
		},
		getSlowNumberOfFrames: () => videoSamples,
	};
};

export type SlowDurationAndFpsState = ReturnType<
	typeof slowDurationAndFpsState
>;
