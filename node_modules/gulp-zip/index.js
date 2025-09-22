'use strict';
const path = require('path');
const BufferConstants = require('buffer').constants;
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const through = require('through2');
const Yazl = require('yazl');
const getStream = require('get-stream');

module.exports = (filename, options) => {
	if (!filename) {
		throw new PluginError('gulp-zip', '`filename` required');
	}

	options = {
		compress: true,
		buffer: true,
		...options
	};

	let firstFile;
	const zip = new Yazl.ZipFile();

	return through.obj((file, encoding, callback) => {
		if (!firstFile) {
			firstFile = file;
		}

		// Because Windows...
		const pathname = file.relative.replace(/\\/g, '/');

		if (!pathname) {
			callback();
			return;
		}

		if (file.isNull() && file.stat && file.stat.isDirectory && file.stat.isDirectory()) {
			zip.addEmptyDirectory(pathname, {
				mtime: options.modifiedTime || file.stat.mtime || new Date()
				// Do *not* pass a mode for a directory, because it creates platform-dependent
				// ZIP files (ZIP files created on Windows that cannot be opened on macOS).
				// Re-enable if this PR is resolved: https://github.com/thejoshwolfe/yazl/pull/59
				// mode: file.stat.mode
			});
		} else {
			const stat = {
				compress: options.compress,
				mtime: options.modifiedTime || (file.stat ? file.stat.mtime : new Date()),
				mode: file.stat ? file.stat.mode : null
			};

			if (file.isStream()) {
				zip.addReadStream(file.contents, pathname, stat);
			}

			if (file.isBuffer()) {
				zip.addBuffer(file.contents, pathname, stat);
			}
		}

		callback();
	}, function (callback) {
		if (!firstFile) {
			callback();
			return;
		}

		(async () => {
			let data;
			if (options.buffer) {
				try {
					data = await getStream.buffer(zip.outputStream, {maxBuffer: BufferConstants.MAX_LENGTH});
				} catch (error) {
					if (error instanceof getStream.MaxBufferError) {
						callback(new PluginError('gulp-zip', 'The output ZIP file is too big to store in a buffer (larger than Buffer MAX_LENGTH). To output a stream instead, set the gulp-zip buffer option to `false`.'));
					} else {
						callback(error);
					}

					return;
				}
			} else {
				data = zip.outputStream;
			}

			this.push(new Vinyl({
				cwd: firstFile.cwd,
				base: firstFile.base,
				path: path.join(firstFile.base, filename),
				contents: data
			}));

			callback();
		})();

		zip.end();
	});
};
