import {Transform as TransformStream} from 'node:stream';

export default function transformStream(options = {}, transformer, flusher) {
	if (typeof options === 'function') {
		flusher = transformer;
		transformer = options;
	}

	return new TransformStream({
		...options,
		transform(chunk, encoding, callback) {
			(async () => {
				try {
					const value = await transformer(chunk, encoding, this);

					// If the callback throws, we don't want to cause an infinite recursion.
					try {
						callback(undefined, value);
					} catch {}
				} catch (error) {
					callback(error);
				}
			})();
		},
		flush(callback) {
			if (typeof flusher !== 'function') {
				callback();
				return;
			}

			(async () => {
				try {
					for await (const chunk of flusher(this)) {
						this.push(chunk);
					}

					// If the callback throws, we don't want to cause an infinite recursion.
					try {
						callback();
					} catch {}
				} catch (error) {
					callback(error);
				}
			})();
		},
	});
}
