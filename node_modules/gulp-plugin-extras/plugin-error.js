/*
The MIT License (MIT)

Copyright (c) 2015, 2017-2018, 2022 Blaine Bublitz <blaine.bublitz@gmail.com> and Eric Schoffstall <yo@contra.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Adapted from https://github.com/gulpjs/plugin-error 2.0.1

import chalk from 'chalk';

const nonEnum = ['message', 'name', 'stack'];

const ignored = new Set([
	...nonEnum,
	'__safety',
	'_stack',
	'plugin',
	'showProperties',
	'showStack',
	'domain',
	'domainEmitter',
	'domainThrown',
]);

const properties = [
	'fileName',
	'lineNumber',
	'message',
	'name',
	'plugin',
	'showProperties',
	'showStack',
	'stack',
];

export default class PluginError extends Error {
	constructor(plugin, message, options) {
		super();

		const options_ = setDefaults(plugin, message, options);
		Object.assign(this, options_);

		if (typeof options_.error === 'object') {
			this.message = options_.error.message;
			this.stack = options_.error.stack;
			this.cause = options_.error.cause;
			Object.assign(this, options_.error);
		}

		for (const property of properties) {
			if (property in options_) {
				this[property] = options_[property];
			}
		}

		if (!this.stack) {
			const safety = {toString: this._messageWithDetails.bind(this) + '\nStack:'};
			Error.captureStackTrace(safety, this.constructor);
			this.__safety = safety;
		}

		if (!this.plugin) {
			throw new Error('Missing plugin name');
		}

		if (!this.message) {
			throw new Error('Missing error message');
		}

		if (message instanceof Error && options_.error.isPresentable) {
			this.showStack = false;
			this.showProperties = false;
		}
	}

	_messageWithDetails() {
		let message_ = `Message:\n    ${this.message}`;
		const details = this._messageDetails();
		if (details) {
			message_ += `\n${details}`;
		}

		return message_;
	}

	_messageDetails() {
		if (!this.showProperties) {
			return '';
		}

		const relevantProperties = Object.keys(this).filter(key => !ignored.has(key));
		return relevantProperties.length > 0 ? `Details:\n${relevantProperties.map(property => `    ${property}: ${this[property]}`).join('\n')}` : '';
	}

	toString() {
		const message_ = this.showStack ? (this.__safety ? this.__safety.stack : this.stack) : this._messageWithDetails();
		return formatMessage(message_, this);
	}
}

function formatMessage(message, thisArgument) {
	return `${chalk.red(thisArgument.name)} in plugin "${chalk.cyan(thisArgument.plugin)}"\n${message}`;
}

function setDefaults(plugin, message, options) {
	if (typeof plugin === 'object') {
		return {...plugin};
	}

	if (message instanceof Error) {
		options = {...options, error: message};
	} else if (typeof message === 'object') {
		options = {...message};
	} else {
		options = {...options, message};
	}

	options.plugin = plugin;
	return {showStack: false, showProperties: true, ...options};
}
