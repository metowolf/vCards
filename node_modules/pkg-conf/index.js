import path from 'node:path';
import {findUp, findUpSync} from 'find-up';
import {loadJsonFile, loadJsonFileSync} from 'load-json-file';

const filePaths = new WeakMap();
const findNextCwd = pkgPath => path.resolve(path.dirname(pkgPath), '..');

const addFilePath = (object, filePath) => {
	filePaths.set(object, filePath);
	return object;
};

export async function packageConfig(namespace, options = {}) {
	if (!namespace) {
		throw new TypeError('Expected a namespace');
	}

	const filePath = await findUp('package.json', options.cwd ? {cwd: options.cwd} : {});

	if (!filePath) {
		return addFilePath({...options.defaults}, filePath);
	}

	const packageJson = await loadJsonFile(filePath);

	if (options.skipOnFalse && packageJson[namespace] === false) {
		return packageConfig(namespace, {...options, cwd: findNextCwd(filePath)});
	}

	return addFilePath({...options.defaults, ...packageJson[namespace]}, filePath);
}

export function packageConfigSync(namespace, options = {}) {
	if (!namespace) {
		throw new TypeError('Expected a namespace');
	}

	const filePath = findUpSync('package.json', options.cwd ? {cwd: options.cwd} : {});

	if (!filePath) {
		return addFilePath({...options.defaults}, filePath);
	}

	const packageJson = loadJsonFileSync(filePath);

	if (options.skipOnFalse && packageJson[namespace] === false) {
		return packageConfigSync(namespace, {...options, cwd: findNextCwd(filePath)});
	}

	return addFilePath({...options.defaults, ...packageJson[namespace]}, filePath);
}

export function packageJsonPath(config) {
	return filePaths.get(config);
}
