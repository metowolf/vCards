import path from 'node:path';
import {constants as BufferConstants} from 'node:buffer';
import Vinyl from 'vinyl';
import Yazl from 'yazl';
import {getStreamAsBuffer, MaxBufferError} from 'get-stream';
import {gulpPlugin} from 'gulp-plugin-extras';

export default function gulpZip(filename, options) {
	if (!filename) {
		throw new Error('gulp-zip: `filename` required');
	}

	options = {
		compress: true,
		buffer: true,
		...options,
	};

	let firstFile;
	const zip = new Yazl.ZipFile();

	return gulpPlugin('gulp-zip', async file => {
		firstFile ??= file;

		// Because Windows...
		const pathname = file.relative.replaceAll('\\', '/');

		if (!pathname) {
			return;
		}

		if (file.isDirectory()) {
			zip.addEmptyDirectory(pathname, {
				mtime: options.modifiedTime || file.stat.mtime || new Date(),
				// Do *not* pass a mode for a directory, because it creates platform-dependent
				// ZIP files (ZIP files created on Windows that cannot be opened on macOS).
				// Re-enable if this PR is resolved: https://github.com/thejoshwolfe/yazl/pull/59
				// mode: file.stat.mode
			});
		} else {
			const stat = {
				compress: options.compress,
				mtime: options.modifiedTime || (file.stat ? file.stat.mtime : new Date()),
				mode: file.stat ? file.stat.mode : null,
			};

			if (file.isStream()) {
				zip.addReadStream(file.contents, pathname, stat);
			}

			if (file.isBuffer()) {
				zip.addBuffer(file.contents, pathname, stat);
			}
		}
	}, {
		supportsAnyType: true,
		async * onFinish() {
			zip.end();

			if (!firstFile) {
				return;
			}

			let data;
			if (options.buffer) {
				try {
					data = await getStreamAsBuffer(zip.outputStream, {maxBuffer: BufferConstants.MAX_LENGTH});
				} catch (error) {
					const error_ = error instanceof MaxBufferError ? new Error('The output ZIP file is too big to store in a buffer (larger than Buffer MAX_LENGTH). To output a stream instead, set the gulp-zip buffer option to `false`.') : error;
					throw error_;
				}
			} else {
				data = zip.outputStream;
			}

			yield new Vinyl({
				cwd: firstFile.cwd,
				base: firstFile.base,
				path: path.join(firstFile.base, filename),
				contents: data,
			});
		},
	});
}
