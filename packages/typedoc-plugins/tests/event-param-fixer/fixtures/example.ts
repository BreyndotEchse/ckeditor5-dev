/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module fixtures/example
 */

export default class ExampleClass {
	/**
	 * Observable public property.
	 *
	 * @observable
	 */
	public key: number;

	constructor() {
		this.key = 1;
	}
}

/**
 * @fires event-foo
 */
export class CustomExampleNonDefaultClass extends ExampleClass {}

/**
 * @eventName event-foo-no-text
 */
export type EventFooNoText = {
	name: string;
};

/**
 * An event associated with the type.
 *
 * @eventName event-foo
 */
export type EventFoo = {
	name: string;
};

/**
 * An event associated with the type. Event with three params.
 *
 * @eventName event-foo-with-params
 *
 * @param {String} p1 Description for first param.
 * @param {module:utils/object~Object} p2 Description for second param.
 * @param p3 Complex {@link module:utils/object~Object description} for `third param`.
 */
export type EventFooWithParams = {
	name: string;
	args: [
		p1: string,
		p2: number,
		p3: boolean
	];
};
