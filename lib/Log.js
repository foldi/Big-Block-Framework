/*global BigBlock, console, opera */
/**
 Log object
 Provides methods to print messages, errors, timers, profilers, etc. to the browser console.
  
 @author Vince Allen 08-04-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Log = (function(){

	return {
		display: function(str) {

			if (typeof console !== "undefined") {
				console.log(str); // output error to console
			} else if (typeof opera !== "undefined" && typeof opera.wiiremote !== "undefined") { // wii uses alerts
				alert(str);
			} else if (typeof opera !== "undefined") { // opera uses error console
				opera.postError(str);
			}
		},
		/*
		Creates a new timer under the given name. Call console.timeEnd(name) with the same name to stop the timer and print the time elapsed..
		*/
		time: function (name) {
			if (console) {
				console.time(name);
			}
		},
		/*
		Stops a timer created by a call to console.time(name) and writes the time elapsed.
		*/
		timeEnd: function (name) {
			if (console) {
				console.timeEnd(name);
			}
		},
		/*
		Writes the number of times that the line of code where count was called was executed. The optional argument title will print a message in addition to the number of the count.
		*/
		count: function (name) {
			if (console) {
				console.count(name);
			}			
		},
		/*
		Allows to log provided data using tabular layout. The method takes one required parameter that represents table like data (array of arrays or list of objects). The other optional parameter can be used to specify columns and/or properties to be logged.
		*/
		table: function (data, columns) {
			if (console) {
				console.table(data, columns);
			}			
		}
	};

}());