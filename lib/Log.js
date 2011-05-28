/*global BigBlock, window, console, opera */
/**
 Log object
 Provides methods to print messages, errors, timers, profilers, etc. to the browser console.
  
 @author Vince Allen 08-04-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Log = (function () {
	
	/*
	Browsers like Camino will report they support the console object. But Camino won't support the methods in the Firebug console api.
	To be safe, test for each method. Also, because these tests are run before the Log object returns, we don't have to check them
	each time the method is invoked.
	*/
	
	var display, time, timeEnd, count, table;
	
	if (typeof console !== "undefined" && typeof console.log !== "undefined") {
		display = function(str) {
			console.log(str); // output error to console
		};	
	} else {
		display = function () {};	
	}

	if (typeof window.opera !== "undefined") {
		display = function(str) {
			window.opera.postError(str); // opera uses proprietary error console
		};
	}
	
	if (typeof console !== "undefined" && typeof console.time !== "undefined") {
		time = function (name) {
			if (this.timer_enabled) {
				console.time(name);
			}			
		};
	} else {
		time = function () {};
	}
	
	if (typeof console !== "undefined" && typeof console.timeEnd !== "undefined") {
		timeEnd = function (name) {
			if (this.timer_enabled) {
				console.timeEnd(name);
			}			
		};
	} else {
		timeEnd = function () {};
	}
	
	if (typeof console !== "undefined" && typeof console.count !== "undefined") {
		count = function (name) {
			if (this.count_enabled) {
				console.count(name);
			}			
		};
	} else {
		count = function () {};
	}
	
	if (typeof console !== "undefined" && typeof console.table !== "undefined") {
		table = function (data, columns) {
			console.table(data, columns);			
		};
	} else {
		table = function () {};
	}
	
	return {
		timer_enabled: false,
		count_enabled: false,
		display: display,
		/*
		Creates a new timer under the given name. Call console.timeEnd(name) with the same name to stop the timer and print the time elapsed..
		*/
		time: time,
		/*
		Stops a timer created by a call to console.time(name) and writes the time elapsed.
		*/
		timeEnd: timeEnd,
		/*
		Writes the number of times that the line of code where count was called was executed. The optional argument title will print a message in addition to the number of the count.
		*/
		count: count,
		/*
		Allows to log provided data using tabular layout. The method takes one required parameter that represents table like data (array of arrays or list of objects). The other optional parameter can be used to specify columns and/or properties to be logged.
		*/
		table: table,
		error: function(e) {
			return BigBlock.Log.display(e.name.toUpperCase() + " line: " + e.lineNumber + " " + e.message);
		}		
	};

}());