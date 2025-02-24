/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

/**
 * Push the local changes to a remote server.
 *
 * @param {Object} options
 * @param {String} options.releaseBranch A name of the branch that should be used for releasing packages.
 * @param {String} options.version Name of tag connected with the release.
 * @param {String} [options.cwd] Root of the repository to prepare. `process.cwd()` by default.
 * @returns {Promise}
 */
module.exports = async function push( options ) {
	const {
		releaseBranch,
		version,
		cwd = process.cwd()
	} = options;

	const command = `git push origin ${ releaseBranch } v${ version }`;

	return tools.shExec( command, { cwd, verbosity: 'error', async: true } );
};
