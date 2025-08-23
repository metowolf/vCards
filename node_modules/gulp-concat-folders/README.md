[![Build Status](https://travis-ci.org/kappalys/gulp-concat-folders.svg?branch=master)](https://travis-ci.org/kappalys/gulp-concat-folders)

# gulp-concat-folders
Gulp plugin that lets you work with folders and treat them as package names

## Install
```
yarn add --dev gulp-concat-folders
```

# Rationale
This gives you a perfect solution to build different packages out of folders.
Given this structure:

```
path
  to
    folder
	  main
	    jquery.js
		ember.js
	  secondary
	    plugin.js
```

it is very easy to build

```
dist
  folder
    main.js
	secondary.js
```

## Usage

```javascript
let gulp = require('gulp');
let path = require('path');
let concatFolders = require('gulp-concat-folders');
let pathToFolder = 'path/to/folder';

gulp.task('task', done => {
	/*
    This will concat files present in the first level folders from the base
    folder provided as argument. If no base folder is provided, pwd will be
    used. This plugin returns a stream of vynil files, so you can safely
    pipe it to other plugins.
  */

	return gulp.src(path.join(pathToFolder, '**/*'))
		.pipe(concatFolders(pathToFolder))
		.pipe(gulp.dest('dist'));
}));
```
