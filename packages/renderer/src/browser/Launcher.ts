/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {HeadlessBrowser} from './Browser';
import {BrowserRunner} from './BrowserRunner';

import type {LaunchOptions} from './LaunchOptions';

export const launchChrome = async ({
	args,
	executablePath,
	defaultViewport,
	indent,
	logLevel,
	userDataDir,
}: LaunchOptions): Promise<HeadlessBrowser> => {
	const timeout = 60000;
	const runner = new BrowserRunner({
		executablePath,
		processArguments: args,
		userDataDir,
	});
	runner.start(logLevel, indent);

	let browser;
	try {
		const connection = await runner.setupConnection({
			timeout,
		});
		browser = await HeadlessBrowser.create({
			connection,
			defaultViewport,
			closeCallback: runner.close.bind(runner),
			forgetEventLoop: runner.forgetEventLoop.bind(runner),
			rememberEventLoop: runner.rememberEventLoop.bind(runner),
		});
	} catch (error) {
		runner.kill();
		throw error;
	}

	try {
		await browser.waitForTarget(
			(t) => {
				return t.type() === 'page';
			},
			{timeout},
		);
	} catch (error) {
		await browser.close(false, logLevel, indent);
		throw error;
	}

	return browser;
};
