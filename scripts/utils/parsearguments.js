/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const minimist = require( 'minimist' );

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
module.exports = function parseArguments( cliArguments ) {
	const config = {
		number: [
			'concurrency'
		],

		string: [
			'packages',
			'npm-tag'
		],

		default: {
			concurrency: require( 'os' ).cpus().length / 2,
			packages: null,
			'npm-tag': 'latest'
		}
	};

	const options = minimist( cliArguments, config );

	if ( typeof options.packages === 'string' ) {
		options.packages = options.packages.split( ',' );
	}

	options.npmTag = options[ 'npm-tag' ];
	delete options[ 'npm-tag' ];

	return options;
};

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Number} concurrency
 *
 * @property {String} [npmTag='staging']
 *
 * @property {Array.<String>|null} packages
 */
