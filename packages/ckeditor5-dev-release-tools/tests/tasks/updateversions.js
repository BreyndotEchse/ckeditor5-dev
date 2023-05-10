/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { expect } = require( 'chai' );
const sinon = require( 'sinon' );
const proxyquire = require( 'proxyquire' );

describe( 'dev-release-tools/release', () => {
	let updateVersions, sandbox, stubs;

	describe( 'updateVersions()', () => {
		beforeEach( () => {
			sandbox = sinon.createSandbox();

			stubs = {
				outputJsonSync: sandbox.stub(),
				getPackageJson: sandbox.stub().returns( { version: '1.0.0' } ),
				readJsonSync: sandbox.stub().returns( { version: '1.0.0' } ),
				sync: sandbox.stub().returns( [ '/ckeditor5-dev' ] ),
				shExec: sandbox.stub().throws( new Error( 'is not in this registry' ) )
			};

			updateVersions = proxyquire( '../../lib/tasks/updateversions.js', {
				'fs-extra': { writeJsonSync: stubs.outputJsonSync, readJsonSync: stubs.readJsonSync },
				'../utils/getpackagejson': stubs.getPackageJson,
				'glob': { globSync: stubs.sync },
				'@ckeditor/ckeditor5-dev-utils': { tools: { shExec: stubs.shExec } }
			} );
		} );

		afterEach( () => {
			sandbox.restore();
		} );

		it( 'should update the version field in all found packages including the root package', () => {
			stubs.sync.returns( [
				'/ckeditor5-dev/packages/package1/package.json',
				'/ckeditor5-dev/packages/package2/package.json',
				'/ckeditor5-dev/packages/package3/package.json',
				'/ckeditor5-dev/package.json'
			] );

			updateVersions( { version: '1.0.1', packagesDirectory: 'packages' } );

			expect( stubs.sync.firstCall.args[ 0 ] ).to.deep.equal( [ 'package.json', 'packages/*/package.json' ] );
			expect( stubs.outputJsonSync.callCount ).to.equal( 4 );
			expect( stubs.outputJsonSync.getCall( 0 ).args[ 0 ] ).to.contain( '/ckeditor5-dev/packages/package1/package.json' );
			expect( stubs.outputJsonSync.getCall( 3 ).args[ 0 ] ).to.equal( '/ckeditor5-dev/package.json' );
			expect( stubs.outputJsonSync.firstCall.args[ 1 ] ).to.deep.equal( { version: '1.0.1' } );
		} );

		it( 'should update the version field in the root package when packagesDirectory is not provided', () => {
			stubs.sync.returns( [ '/ckeditor5-dev' ] );

			updateVersions( { version: '1.0.1' } );

			expect( stubs.sync.firstCall.args[ 0 ] ).to.deep.equal( [ 'package.json' ] );
			expect( stubs.outputJsonSync.callCount ).to.equal( 1 );
			expect( stubs.outputJsonSync.firstCall.args[ 0 ] ).to.contain( '/ckeditor5-dev' );
			expect( stubs.outputJsonSync.firstCall.args[ 1 ] ).to.deep.equal( { version: '1.0.1' } );
		} );

		it( 'should throw an error when the version is already in use', () => {
			stubs.getPackageJson.returns( { version: '1.0.0', name: 'stub-package' } );
			stubs.shExec.returns( '' );

			expect( () => updateVersions( { version: '1.0.1' } ) )
				.to.throw( Error, 'Provided version 1.0.1 is already used in npm by stub-package' );
		} );

		it( 'should not throw an error when version is not in use', () => {
			stubs.shExec.throws( new Error( 'is not in this registry' ) );
			stubs.getPackageJson.returns( { version: '1.0.0', name: 'stub-package' } );

			expect( () => updateVersions( { version: '1.0.1' } ) ).to.not.throw( Error );
		} );

		it( 'should throw an error when checking the version availability check throws error', () => {
			stubs.shExec.throws( new Error( 'custom error' ) );
			stubs.getPackageJson.returns( { version: '1.0.0', name: 'stub-package' } );

			expect( () => updateVersions( { version: '1.0.1' } ) ).to.throw( Error, 'custom error' );
		} );

		it( 'should accept 0.0.0 version for nightly releases', () => {
			expect( () => updateVersions( { version: '0.0.0-nightly-20230510.0' } ) ).not.to.throw( Error );
		} );

		it( 'should throw when new version is not greater than old version', () => {
			stubs.getPackageJson.returns( { version: '1.0.1' } );

			expect( () => updateVersions( { version: '1.0.0' } ) )
				.to.throw( Error, 'Provided version 1.0.0 must be greater than 1.0.1 or match pattern 0.0.0-nightly.' );
		} );

		it( 'should throw an error when new version is not a valid semver version', () => {
			expect( () => updateVersions( { version: 'x.y.z' } ) ).to.throw( Error );
		} );

		it( 'should be able to provide custom cwd', () => {
			updateVersions( { version: '1.0.1', cwd: 'Users/username/ckeditor5-dev/custom-dir' } );

			expect( stubs.sync.firstCall.args[ 1 ] ).to.deep.equal( {
				cwd: 'Users/username/ckeditor5-dev/custom-dir',
				absolute: true,
				nodir: true
			} );
		} );

		it( 'should provide the package path and not root package path for npm version check when packagesDirectory is provided', () => {
			stubs.sync.returns( [
				'/ckeditor5-dev/packages/package1/package.json',
				'/ckeditor5-dev/package.json'
			] );

			updateVersions( { version: '1.0.1', packagesDirectory: 'packages' } );

			expect( stubs.getPackageJson.secondCall.args[ 0 ] ).to.contain( '/ckeditor5-dev/packages/package1' );
		} );

		it( 'should provide the root package for npm version check when packagesDirectory is not provided', () => {
			stubs.sync.returns( [ '/ckeditor5-dev/package.json' ] );

			updateVersions( { version: '1.0.1' } );

			expect( stubs.getPackageJson.secondCall.args[ 0 ] ).to.contain( '/ckeditor5-dev' );
		} );
	} );
} );
