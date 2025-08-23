import process from 'node:process';
import path from 'node:path';

export default function isPathCwd(path_) {
	let cwd = process.cwd();

	path_ = path.resolve(path_);

	if (process.platform === 'win32') {
		cwd = cwd.toLowerCase();
		path_ = path_.toLowerCase();
	}

	return path_ === cwd;
}
