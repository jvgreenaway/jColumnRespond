/*
 * jColumnRespond.js (a simple way to globally manage javascript based on coloum values set in CSS media queries)
 * Author: James Greenaway [jamesgreenaway@gmail.com]
 */
(function(win,doc,undefined) {
	
	'use strict';
	
	win.colRespond = function(breakpoints) {
		
		// array for registered functions
		var mediaListeners = [];
		
		// array that corresponds to mediaListeners that holds the cuurrent on/off state
		var mediaInit = [];
	
		// array of media query breakpoints; adjust as needed
		var mediaBreakpoints = breakpoints;
		
		// store the current breakpoint and columns
		var curr = '';
		var currCols = null;

		// window resize event timer stuff
		// var resizeTimer;
		var resizeW = 0;
		var resizeTmrFast = 100;
		var resizeTmrSlow = 500;
		var resizeTmrSpd = resizeTmrSlow;
		
		// cross browser window width
		var winWidth = function() {
			
			var w = 0;
			
			// IE
			if (!window.innerWidth) {
				
				if (!(document.documentElement.clientWidth === 0)) {
				
					// strict mode
					w = document.documentElement.clientWidth;
				} else {
					
					// quirks mode
					w = document.body.clientWidth;
				}
			} else {
				
				// w3c
				w = window.innerWidth;
			}
			
			return w;
		};
		
		// takes the breakpoint/s arguement from an object and tests it against the current state
		var testForCurr = function(elm) {
			
			// if there's an array of breakpoints
			if (typeof elm === 'object') {
				if (elm.join().indexOf(curr) >= 0) {
					return true;
				}
			
			// if the string is '*' then run at every breakpoint
			} else if (elm === '*') {
				return true;
			
			// or if it's a single breakpoint
			} else if (typeof elm === 'string') {
				if (curr === elm) {
					return true;
				}
			}
		};


		// send media to the mediaListeners array
		var addFunction = function(elm) {
			
			var brkpt = elm['breakpoint'];
			var entr = elm['enter'] || undefined;
			
			// add function to stack
			mediaListeners.push(elm);
			
			// add corresponding entry to mediaInit
			mediaInit.push(false);
			
			// apply new enter fn if matched
			if (testForCurr(brkpt)) {
				if (entr !== undefined) {
					entr.call();
				}
				mediaInit[(mediaListeners.length - 1)] = true;
			}
		};
		
		// loops through all registered functions and determines if they should be fired
		var cycleThrough = function() {
			
			var enterArray = [];
			var exitArray = [];
			
			for (var i = 0; i < mediaListeners.length; i++) {
				var brkpt = mediaListeners[i]['breakpoint'];
				var entr = mediaListeners[i]['enter'] || undefined;
				var exit = mediaListeners[i]['exit'] || undefined;
				
				if (brkpt === '*') {
					if (entr !== undefined) {
						enterArray.push(entr);
					}
					if (exit !== undefined) {
						exitArray.push(exit);
					}
				} else if (testForCurr(brkpt)) {
					if (entr !== undefined && !mediaInit[i]) {
						enterArray.push(entr);
					}
					mediaInit[i] = true;
				} else {
					if (exit !== undefined && mediaInit[i]) {
						exitArray.push(exit);
					}
					mediaInit[i] = false;
				}
			}
			
			// loop through exit functions to call
			for (var j = 0; j < exitArray.length; j++) {
				exitArray[j].call();
			}
			
			// then loop through enter functions to call
			for (var k = 0; k < enterArray.length; k++) {
				enterArray[k].call();
			}
		};
		
		// find out what the current cols are - eg body:after { content: 'currCols'; }
		var measurecolumns = function() {
			var bodyAfterContent = window.getComputedStyle(document.body,':after').getPropertyValue('content');
			currCols = Number( bodyAfterContent.replace( /"/g, '' ).replace( /'/g, '' ) );
			return currCols;
		};


		// checks for the correct breakpoint against the mediaBreakpoints list
		var returnBreakpoint = function() {
			
			for (var i = 0; i < mediaBreakpoints.length; i++) {
				
				if ( currCols === mediaBreakpoints[i]['coloums'] && curr !== mediaBreakpoints[i]['label'] ) {
					
					// update curr variable
					curr = mediaBreakpoints[i]['label'];
					
					// run the loop
					cycleThrough();
				}
			}
		};
		
		
		// self-calling function that checks the browser width and delegates if it detects a change
		var checkResize = function() {
			
			// get current width
			var w = winWidth();
			
			// if there is a change speed up the timer, measure new currCols then fire the returnBreakpoint function
			if (w !== resizeW) {
				resizeTmrSpd = resizeTmrFast;
				measurecolumns();
				returnBreakpoint();
			
			// otherwise keep on keepin' on
			} else {
				resizeTmrSpd = resizeTmrSlow;
			}
			
			resizeW = w;
			
			// calls itself on a setTimeout
			setTimeout(checkResize, resizeTmrSpd);
		};
		checkResize();
		
		// return
		return {
			addFunc: function(elm) { addFunction(elm); },
			getBreakpoint: function() { return curr; },
			getcolumns: function() { return currCols; }
			// mediaListeners: function() { return mediaListeners; },
			// mediaBreakpoints: function() { return mediaBreakpoints; },
			// measurecolumns: function() { return measurecolumns(); }
		};
	
	};
	
}(this,this.document));