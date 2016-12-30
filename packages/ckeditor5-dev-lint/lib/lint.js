/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const jshint = require( 'gulp-jshint' );
const jscs = require( 'gulp-jscs' );
const fs = require( 'fs' );
const gulpFilter = require( 'gulp-filter' );
const gutil = require( 'gulp-util' );

module.exports = ( config = {} ) => {
	const ignoredFiles = config.ignoredFiles || [];
	const src = [ '**/*.js' ].concat( ignoredFiles.map( i => '!' + i ), getGitIgnore() );

	const tasks = {
		/**
		 * Returns a stream containing jshint and jscs reporters.
		 *
		 * @returns {Stream}
		 */
		lint() {
			return gulp.src( src )
				.pipe( lint() );
		},

		/**
		 * This method is executed on pre-commit hook, linting only files staged for the current commit.
		 *
		 * @returns {Stream}
		 */
		lintStaged() {
			const guppy = require( 'git-guppy' )( gulp );

			return guppy.stream( 'pre-commit', { base: './' } )
				.pipe( gulpFilter( src ) )
				.pipe( lint() )

				// Error reporting for gulp.
				.pipe( jscs.reporter( 'fail' ) )
				.on( 'error', errorHandler )
				.pipe( jshint.reporter( 'fail' ) )
				.on( 'error', errorHandler );

			/**
			 * Handles errors from jscs and jshint fail reporters. Stops the node process with an error code
			 * and prints an error message to the console.
			 */
			function errorHandler() {
				gutil.log( gutil.colors.red( 'Linting failed, commit aborted' ) );
				process.exit( 1 );
			}
		}
	};

	return tasks;

	/**
	 * Gets the list of ignores from `.gitignore`.
	 *
	 * @returns {String[]} The list of ignores.
	 */
	function getGitIgnore( ) {
		let gitIgnoredFiles = fs.readFileSync( '.gitignore', 'utf8' );

		return gitIgnoredFiles
			// Remove comment lines.
			.replace( /^#.*$/gm, '' )
			// Transform into array.
			.split( /\n+/ )
			// Remove empty entries.
			.filter( ( path ) => !!path )
			// Add `!` for ignore glob.
			.map( i => '!' + i );
	}

	/**
	 * Returns a stream with all linting plugins combined.
	 *
	 * @returns {Stream}
	 */
	function lint() {
		const stream = jshint();
		stream
			.pipe( jscs() )
			.pipe( jscs.reporter() )
			.pipe( jshint.reporter( 'jshint-reporter-jscs' ) );

		return stream;
	}
};
