/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const chalk = require( 'chalk' );
const serveTranslations = require( './servetranslations' );
const MultipleLanguageTranslationService = require( '@ckeditor/ckeditor5-dev-utils/lib/translations/multiplelanguagetranslationservice' );

/**
 * CKEditorWebpackPlugin, for now, consists only of the translation mechanism (@ckeditor/ckeditor5#624, @ckeditor/ckeditor5#387,
 * @ckeditor/ckeditor5#6526).
 *
 * When one entry point (or to be precise one output JS file) is defined, language specified in `language` option will be
 * statically added to the bundle. When `additionalLanguages` option is set, languages specified there will be stored
 * in separate files.
 *
 * When multiple outputs are defined, all languages (from both `language` and `additionalLanguages` options) will be
 * stored in separate files. In that situation user will be warned that he needs to load at least one translation file
 * manually to get editor working.
 *
 * Translation files will be emitted in the `outputDirectory` or `'lang'` directory if `outputDirectory` is not set.
 *
 * Plugin tries to clean the output translation directory before each build to make sure, that all translations are correct.
 * See https://github.com/ckeditor/ckeditor5/issues/700 for more information.
 */
module.exports = class CKEditorWebpackPlugin {
	/**
	 * @param {Object} [options] Plugin options.
	 * @param {String} options.language The main language for internationalization - translations for that language
	 * will be added to the bundle(s).
	 * @param {Array.<String>|'all'} [options.additionalLanguages] Additional languages. Build is optimized when this option is not set.
	 * When `additionalLanguages` is set to 'all' then script will be looking for all languages and according translations during
	 * the compilation.
	 * @param {String} [options.outputDirectory='translations'] The output directory for the emitted translation files,
	 * should be relative to the webpack context.
	 * @param {Boolean} [options.strict] An option that make the plugin throw when the error is found during the compilation.
	 * @param {Boolean} [options.verbose] An option that make this plugin log all warnings into the console.
 	 * @param {Boolean} [options.allowMultipleJSAssets] An option that allows outputting translations to more than one JS asset.
 	 * @param {String} [options.sourceFilesPattern] An option that allows override the default pattern for CKEditor 5 source files.
 	 * @param {String} [options.packageNamesPattern] An option that allows override the default pattern for CKEditor 5 package names.
 	 * @param {String} [options.corePackagePattern] An option that allows override the default CKEditor 5 core package pattern.
	 */
	constructor( options = {} ) {
		this.options = {
			language: options.language,
			additionalLanguages: options.additionalLanguages,
			outputDirectory: options.outputDirectory || 'translations',
			strict: !!options.strict,
			verbose: !!options.verbose,
			allowMultipleJSAssets: !!options.allowMultipleJSAssets,
			sourceFilesPattern: options.sourceFileRegexp || /[/\\]ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/,
			packageNamesPattern: options.packageNamesPattern || /[/\\]ckeditor5-[^/\\]+[/\\]/,
			corePackagePattern: options.corePackagePattern || /[/\\]ckeditor5-core/,
			corePackageSampleResourcePath: options.corePackageSampleResourcePath || '@ckeditor/ckeditor5-core/src/editor/editor.js'
		};
	}

	apply( compiler ) {
		if ( !this.options.language ) {
			console.warn( chalk.yellow(
				'Warning: The `language` option is required for CKEditorWebpackPlugin plugin.'
			) );

			return;
		}

		const { allowMultipleJSAssets, language: mainLanguage } = this.options;
		let compileAllLanguages = false;
		let additionalLanguages = this.options.additionalLanguages || [];

		if ( typeof additionalLanguages == 'string' ) {
			if ( additionalLanguages !== 'all' ) {
				throw new Error( 'Error: The `additionalLanguages` option should be an array of language codes or `all`.' );
			}

			compileAllLanguages = true;
			additionalLanguages = []; // They will be searched in runtime.
		}

		// Currently, there is only one strategy to build translation files.
		// Though, bear in mind that there might be a need for a different build strategy in the future,
		// hence the translation service is separated from the webpack-specific environment.
		// See the TranslationService interface in the `servetranslation.js` file.
		const translationService = new MultipleLanguageTranslationService( {
			mainLanguage,
			compileAllLanguages,
			additionalLanguages,
			allowMultipleJSAssets
		} );

		serveTranslations( compiler, this.options, translationService );
	}
};
