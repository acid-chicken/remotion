import {fetchWithCorsCatch} from './fetch-with-cors-catch';
import {getInt16AsFloat, getInt8AsFloat} from './probe-wave-file';

export const getPartialWaveData = async ({
	dataOffset,
	src,
	bitsPerSample,
	channelIndex,
	sampleRate,
	fromSeconds,
	toSeconds,
	blockAlign,
	fileSize,
}: {
	dataOffset: number;
	src: string;
	bitsPerSample: number;
	channelIndex: number;
	sampleRate: number;
	fromSeconds: number;
	toSeconds: number;
	blockAlign: number;
	fileSize: number;
}) => {
	const startByte =
		dataOffset + Math.floor(fromSeconds * sampleRate) * blockAlign;
	const endByte =
		dataOffset + Math.floor(toSeconds * sampleRate - 1) * blockAlign;

	if (endByte > fileSize - 1) {
		throw new Error(
			`End byte ${endByte} is greater than file size ${fileSize}`,
		);
	}

	const response = await fetchWithCorsCatch(src, {
		headers: {
			range: `bytes=${startByte}-${endByte}`,
		},
	});

	if (response.status !== 206) {
		throw new Error(
			`Tried to read bytes ${startByte}-${endByte} from ${src}, but the response status code was not 206. This means the server might not support returning a partial response.`,
		);
	}

	const arrayBuffer = await response.arrayBuffer();
	const uintArray = new Uint8Array(arrayBuffer);

	const samples = [];

	for (let i = 0; i < uintArray.length; i += blockAlign) {
		const sampleStart = i + channelIndex * (bitsPerSample / 8);

		let sample;
		if (bitsPerSample === 16) {
			sample = getInt16AsFloat(uintArray, sampleStart);
		} else if (bitsPerSample === 8) {
			sample = getInt8AsFloat(uintArray, sampleStart);
		} else {
			throw new Error(`Unsupported bits per sample: ${bitsPerSample}`);
		}

		samples.push(sample);
	}

	return samples;
};
