import path from 'path';

const source = await Bun.file(
	path.join(__dirname, 'static', 'llms.txt'),
).text();

const output = Bun.file(
	path.join(__dirname, 'src', 'helpers', 'system-prompt.ts'),
);

const tsText = [
	'// Auto-generated by bun update-prompt.ts',
	'',
	'export const SYSTEM_PROMPT=`',
	source,
	'`.trimStart();',
].join('\n');

await Bun.write(output, tsText);
