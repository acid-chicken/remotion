import type {VideoConfig} from 'remotion/no-react';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {HeadlessBrowser} from './browser/Browser';
import type {Page} from './browser/BrowserPage';
import {isFlakyNetworkError, isTargetClosedErr} from './browser/flaky-errors';
import type {CountType} from './get-frame-padded-index';
import type {VideoImageFormat} from './image-format';
import {getRetriesLeftFromError} from './is-delay-render-error-with-retry';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages, isUserCancelledRender} from './make-cancel-signal';
import type {Pool} from './pool';
import {renderFrame} from './render-frame';
import type {FrameAndAssets, OnArtifact} from './render-frames';
import type {BrowserReplacer} from './replace-browser';

export const renderFrameAndRetryTargetClose = async ({
	frame,
	retriesLeft,
	attempt,
	assets,
	imageFormat,
	binariesDirectory,
	cancelSignal,
	composition,
	countType,
	downloadMap,
	frameDir,
	framesToRender,
	jpegQuality,
	onArtifact,
	onDownload,
	onError,
	outputDir,
	poolPromise,
	scale,
	stoppedSignal,
	timeoutInMilliseconds,
	indent,
	logLevel,
	makeBrowser,
	makeNewPage,
	browserReplacer,
	concurrencyOrFramesToRender,
	framesRenderedObj,
	lastFrame,
	onFrameBuffer,
	onFrameUpdate,
}: {
	frame: number;
	retriesLeft: number;
	attempt: number;
	imageFormat: VideoImageFormat;
	cancelSignal: CancelSignal | undefined;
	binariesDirectory: string | null;
	poolPromise: Promise<Pool<Page>>;
	jpegQuality: number;
	frameDir: string;
	scale: number;
	countType: CountType;
	assets: FrameAndAssets[];
	framesToRender: number[];
	onArtifact: OnArtifact | null;
	onDownload: RenderMediaOnDownload | null;
	downloadMap: DownloadMap;
	composition: Omit<VideoConfig, 'defaultProps' | 'props'>;
	onError: (err: Error) => void;
	stoppedSignal: {stopped: boolean};
	timeoutInMilliseconds: number;
	outputDir: string | null;
	indent: boolean;
	logLevel: LogLevel;
	makeBrowser: () => Promise<HeadlessBrowser>;
	makeNewPage: (frame: number) => Promise<Page>;
	browserReplacer: BrowserReplacer;
	concurrencyOrFramesToRender: number;
	lastFrame: number;
	framesRenderedObj: {count: number};
	onFrameBuffer: null | ((buffer: Buffer, frame: number) => void) | undefined;
	onFrameUpdate:
		| null
		| ((
				framesRendered: number,
				frameIndex: number,
				timeToRenderInMilliseconds: number,
		  ) => void);
}): Promise<void> => {
	const index = framesToRender.indexOf(frame);
	const assetsOnly = index === -1;
	try {
		await Promise.race([
			renderFrame({
				frame,
				assetsOnly,
				index: index === -1 ? null : index,
				attempt,
				assets,
				binariesDirectory,
				cancelSignal,
				countType,
				downloadMap,
				frameDir,
				framesToRender,
				imageFormat,
				indent,
				jpegQuality,
				logLevel,
				onArtifact,
				onDownload,
				poolPromise,
				scale,
				composition,
				framesRenderedObj,
				lastFrame,
				onError,
				onFrameBuffer,
				onFrameUpdate,
				outputDir,
				stoppedSignal,
				timeoutInMilliseconds,
			}),
			new Promise((_, reject) => {
				cancelSignal?.(() => {
					reject(new Error(cancelErrorMessages.renderFrames));
				});
			}),
		]);
	} catch (err) {
		const isTargetClosedError = isTargetClosedErr(err as Error);
		const shouldRetryError = (err as Error).stack?.includes(
			NoReactInternals.DELAY_RENDER_RETRY_TOKEN,
		);
		const flakyNetworkError = isFlakyNetworkError(err as Error);

		if (isUserCancelledRender(err) && !shouldRetryError) {
			throw err;
		}

		if (!isTargetClosedError && !shouldRetryError && !flakyNetworkError) {
			throw err;
		}

		if (stoppedSignal.stopped) {
			return;
		}

		if (retriesLeft === 0) {
			Log.warn(
				{
					indent,
					logLevel,
				},
				`The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
			);
			throw err;
		}

		if (shouldRetryError) {
			const pool = await poolPromise;
			// Replace the closed page
			const newPage = await makeNewPage(frame);
			pool.release(newPage);
			Log.warn(
				{indent, logLevel},
				`delayRender() timed out while rendering frame ${frame}: ${(err as Error).message}`,
			);
			const actualRetriesLeft = getRetriesLeftFromError(err as Error);

			return renderFrameAndRetryTargetClose({
				frame,
				retriesLeft: actualRetriesLeft,
				attempt: attempt + 1,
				assets,
				imageFormat,
				binariesDirectory,
				cancelSignal,
				composition,
				countType,
				downloadMap,
				frameDir,
				framesToRender,
				indent,
				jpegQuality,
				logLevel,
				onArtifact,
				onDownload,
				onError,
				outputDir,
				poolPromise,
				scale,
				stoppedSignal,
				timeoutInMilliseconds,
				makeBrowser,
				makeNewPage,
				browserReplacer,
				concurrencyOrFramesToRender,
				framesRenderedObj,
				lastFrame,
				onFrameBuffer,
				onFrameUpdate,
			});
		}

		Log.warn(
			{indent, logLevel},
			`The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`,
		);
		// Replace the entire browser
		await browserReplacer.replaceBrowser(makeBrowser, async () => {
			const pages = new Array(concurrencyOrFramesToRender)
				.fill(true)
				.map(() => makeNewPage(frame));
			const puppeteerPages = await Promise.all(pages);
			const pool = await poolPromise;
			for (const newPage of puppeteerPages) {
				pool.release(newPage);
			}
		});
		await renderFrameAndRetryTargetClose({
			frame,
			retriesLeft: retriesLeft - 1,
			attempt: attempt + 1,
			assets,
			binariesDirectory,
			cancelSignal,
			composition,
			countType,
			downloadMap,
			frameDir,
			framesToRender,
			imageFormat,
			indent,
			jpegQuality,
			logLevel,
			onArtifact,
			makeBrowser,
			onDownload,
			onError,
			outputDir,
			poolPromise,
			scale,
			stoppedSignal,
			timeoutInMilliseconds,
			browserReplacer,
			makeNewPage,
			concurrencyOrFramesToRender,
			framesRenderedObj,
			lastFrame,
			onFrameBuffer,
			onFrameUpdate,
		});
	}
};
