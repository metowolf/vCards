'use strict';
const blueimpMd5 = require('blueimp-md5');

module.exports = data => {
	if (Array.isArray(data)) {
		data = data.join('');
	}

	return blueimpMd5(data);
};
