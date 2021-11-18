/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

const chai = require( 'chai' );

require( '../../../../lib/utils/automated-tests/assertions/equalMarkup' );

const markupA = '<paragraph>foo bXXX[]r baz</paragraph>';
const markupB = '<paragraph>foo bYYY[]r baz</paragraph>';

describe( 'equalMarkup chai assertion', () => {
	it( 'should be added to chai assertions', () => {
		const assertion = new chai.Assertion();

		chai.expect( assertion ).to.have.property( 'equalMarkup' );
		chai.expect( assertion.equalMarkup ).to.be.instanceof( Function );
	} );

	it( 'should pass for equal markups', () => {
		chai.expect( function() {
			chai.expect( markupA ).to.equalMarkup( markupA );
		} ).to.not.throw();
	} );

	it( 'should not pass for unequal markups', () => {
		chai.expect( function() {
			chai.expect( markupA ).to.equalMarkup( markupB );
		} ).to.throw( 'Expected markup strings to be equal' );
	} );
} );
