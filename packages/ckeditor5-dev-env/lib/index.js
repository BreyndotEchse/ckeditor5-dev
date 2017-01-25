/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const executeOnDependencies = require( './utils/executeondependencies' );

const tasks = {
	generateChangelog: require( './tasks/generatechangelog' ),

	createRelease: require( './tasks/createrelease' ),

	/**
	 * Generates the changelog for dependencies.
	 *
	 * @param {Object} options
	 * @params {String} options.cwd Current work directory.
	 * @params {String} options.workspace A relative path to the workspace.
	 * @returns {Promise}
	 */
	generateChangelogForDependencies( options ) {
		const execOptions = {
			cwd: options.cwd,
			workspace: options.workspace
		};

		const functionToExecute = ( repositoryName, repositoryPath ) => {
			process.chdir( repositoryPath );

			return tasks.generateChangelog();
		};

		const done = () => {
			process.chdir( options.cwd );
		};

		return executeOnDependencies( execOptions, functionToExecute, done );
	},

	/**
	 * Generates the changelog for dependencies.
	 *
	 * @param {Object} options
	 * @params {String} options.cwd Current work directory.
	 * @params {String} options.workspace A relative path to the workspace.
	 * @params {String} options.token GitHub token used to authenticate.
	 * @params {Boolean} options.init Whether to create first release using this package.
	 * @params {Boolean} options.debug Whether to show additional logs.
	 * @params {Object} options.dependencies Dependencies with versions of other CKEditor5 package.
	 * @returns {Promise}
	 */
	releaseDependencies( options ) {
		const execOptions = {
			cwd: options.cwd,
			workspace: options.workspace
		};

		const functionToExecute = ( repositoryName, repositoryPath ) => {
			process.chdir( repositoryPath );

			return tasks.createRelease( {
				init: options.init,
				token: options.token,
				dependencies: options.dependencies
			} );
		};

		const done = () => {
			process.chdir( options.cwd );
		};

		return executeOnDependencies( execOptions, functionToExecute, done );
	}
};

module.exports = tasks;
