import {exampleVideos} from '@remotion/example-videos';
import {nodeReader} from '@remotion/media-parser/node';
import {expect, test} from 'bun:test';
import {convertMedia} from '../convert-media';

test('should be able to remux server side', async () => {
	const {save} = await convertMedia({
		src: exampleVideos.bigBuckBunny,
		reader: nodeReader,
		container: 'mp4',
	});

	const data = await save();
	expect(data.size).toBeGreaterThan(1000);
});
