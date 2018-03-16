/**
https://github.com/rajatsingla/JSON-table
@description
JSON table is a minimal, yet flexible HTML table editor, where you can attach formatting to each cell and it gives you JSON output.

@author		rajatsingla.in
@company	Scroll Media, India
@created	12-03-2018
*/

( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "JSONTableEditor requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

  'use strict'
