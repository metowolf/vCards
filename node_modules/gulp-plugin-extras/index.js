import transformStream from 'easy-transform-stream';
import PluginError from './plugin-error.js';

export function gulpPlugin(name, onFile, {
	onFinish,
	supportsDirectories = false,
	supportsAnyType = false,
} = {}) {
	return transformStream(
		{
			objectMode: true,
		},
		async file => {
			if (!supportsAnyType) {
				if (file.isNull() && !(supportsDirectories && file.isDirectory())) {
					return file;
				}

				if (file.isStream()) {
					throw new PluginError(name, 'Streaming not supported');
				}
			}

			try {
				return await onFile(file);
			} catch (error) {
				throw new PluginError(name, error, {
					fileName: file.path,
					showStack: true,
				});
			}
		},
		onFinish && async function * (stream) {
			try {
				yield * onFinish(stream);
			} catch (error) {
				throw new PluginError(name, error, {showStack: true});
			}
		},
	);
}

export {default as PluginError} from './plugin-error.js';
