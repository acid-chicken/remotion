import {build} from 'bun';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}
console.time('Generated.');
const output = await build({
	entrypoints: [
		'src/index.ts',
		'src/writers/buffer.ts',
		'src/writers/web-fs.ts',
	],
	naming: '[name].mjs',
	external: ['@remotion/media-parser'],
});

if (!output.success) {
	process.exit(1);
}

for (const file of output.outputs) {
	const str = await file.text();
	const out = path.join('dist', 'esm', file.path);

	await Bun.write(out, str);
}

console.timeEnd('Generated.');
