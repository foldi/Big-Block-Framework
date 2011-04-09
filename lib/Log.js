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

		}
	};

}());