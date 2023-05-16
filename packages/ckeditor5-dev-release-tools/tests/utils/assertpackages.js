/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const expect = require( 'chai' ).expect;
const sinon = require( 'sinon' );
const mockery = require( 'mockery' );

describe( 'dev-release-tools/utils', () => {
	describe( 'assertPackages()', () => {
		let assertPackages, sandbox, stubs;

		beforeEach( () => {
			sandbox = sinon.createSandbox();

			stubs = {
				fs: {
					pathExists: sandbox.stub()
				}
			};

			mockery.enable( {
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			} );

			mockery.registerMock( 'fs-extra', stubs.fs );

			assertPackages = require( '../../lib/utils/assertpackages' );
		} );

		afterEach( () => {
			mockery.deregisterAll();
			mockery.disable();
			sandbox.restore();
		} );

		it( 'should resolve if list of packages is empty', () => {
			return assertPackages( [] );
		} );

		it( 'should check if `package.json` exists for each package', () => {
			stubs.fs.pathExists.resolves( true );

			return assertPackages( [ 'ckeditor5-foo', 'ckeditor5-bar', 'ckeditor5-baz' ] )
				.then( () => {
					expect( stubs.fs.pathExists.callCount ).to.equal( 3 );
					expect( stubs.fs.pathExists.firstCall.args[ 0 ] ).to.equal( 'ckeditor5-foo/package.json' );
					expect( stubs.fs.pathExists.secondCall.args[ 0 ] ).to.equal( 'ckeditor5-bar/package.json' );
					expect( stubs.fs.pathExists.thirdCall.args[ 0 ] ).to.equal( 'ckeditor5-baz/package.json' );
				} );
		} );

		it( 'should throw one error for all packages with missing `package.json` file', () => {
			stubs.fs.pathExists
				.resolves( false )
				.withArgs( 'ckeditor5-bar/package.json' ).resolves( true );

			return assertPackages( [ 'ckeditor5-foo', 'ckeditor5-bar', 'ckeditor5-baz' ] )
				.then(
					() => {
						throw new Error( 'Expected to be rejected.' );
					},
					error => {
						expect( error ).to.be.an( 'Error' );
						expect( error.message ).to.equal(
							'The "package.json" file is missing in the "ckeditor5-foo" package.\n' +
							'The "package.json" file is missing in the "ckeditor5-baz" package.'
						);
					} );
		} );
	} );
} );
