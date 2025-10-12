'use strict';

let through = require('through2');
let path = require('path');
let vinyl = require('vinyl');
let concatSourceMaps = require('concat-with-sourcemaps');
let log = require('fancy-log');
let os = require('os');

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(base, opts) {
  opts = opts || {};

  // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
  if (typeof opts.newLine !== 'string') {
    opts.newLine = os.EOL;
  }

  let usingSourceMaps = false;
  let files = {};
  let latestMod;
  let latestExt;
  let fileName;
  let concat;

  function bufferContents(file, enc, cb) {
    if (base == null) {
      base = file.base;
    }

    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new Error('gulp-concat-folders: Streaming not supported'));
      cb();
      return;
    }

    // enable sourcemap support for concat
    // if a sourcemap initialized file comes in
    if (file.sourceMap && usingSourceMaps === false) {
      usingSourceMaps = true;
    }

    // set latest file if not already set,
    // or if the current file was modified more recently.
    if (!latestMod || file.stat && file.stat.mtime > latestMod) {
      latestMod = file.stat && file.stat.mtime;
    }

    // ignore files in the base folder
    if (file.relative.includes(path.sep)) {
      let parsedPath = path.parse(file.relative);
      let filePath = file.relative.split(path.sep);
      let folder = filePath.shift();

      // construct concat instance
      if (files[folder] == null) {
        files[folder] = new concatSourceMaps(usingSourceMaps, `${folder}${parsedPath.ext}`, opts.newLine);
      }

       files[folder].add(file.relative, file.contents, file.sourceMap);
       latestExt = parsedPath.ext;
    }

    cb();
    return;
  }

  function endStream(cb) {
    // no files passed in, no file goes out
    if (files === {}) {
      cb();
      return;
    }

    for (let folder in files) {
      let concat = files[folder];

      let file = new vinyl(concat);
      file.path = path.join(base, `${folder}${latestExt}`);

      file.contents = concat.content;

      if (concat.sourceMapping) {
        file.sourceMap = JSON.parse(concat.sourceMap);
      }

      this.push(file);
    }

    cb();
    return;
  }

  return through.obj(bufferContents, endStream);
};
