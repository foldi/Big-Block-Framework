/**
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
 
var BigBlock = {};
BigBlock.Blocks = {}; // collects all blocks
BigBlock.BlocksKeys = []; // collects all block keys

// initial props

BigBlock.curentFrame = 0;
BigBlock.inputBlock = false; // set = true to block user input
BigBlock.URL_ittybitty8bit = "http://www.ittybitty8bit.com";
BigBlock.URL_Facebook = "http://www.facebook.com/pages/ittybitty8bit/124916544219794";
BigBlock.URL_Twitter = "http://www.twitter.com/ittybitty8bit";
BigBlock.CSSid_core = "core";
BigBlock.CSSid_color = "color";
BigBlock.CSSid_position = "i";
BigBlock.CSSid_char = "ch";
BigBlock.CSSid_char_pos = "ch_p";
BigBlock.CSSid_text_bg = "txt_bg";
BigBlock.CSSid_grid_pos = "grid_p";
BigBlock.user_agent = navigator.userAgent.toLowerCase();

if (BigBlock.user_agent.search("iphone") > -1) {
	BigBlock.is_iphone = true;
}

if (BigBlock.user_agent.search("ipad") > -1) {
	BigBlock.is_ipad = true;
}

if (window.navigator.standalone) {
	BigBlock.standalone = true;
}

/**
 * BigBlock.ready() is called from <body> onload()
 * To pass params to BigBlock.Timer.play(), overwrite this function in the html file.
 * Params should be json formatted. 
 */
BigBlock.ready = function () { 
	BigBlock.Timer.play();
};


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


//

/*global BigBlock, document, console, opera, alert, window, confirm */
/**
 UTILTY FUNCTIONS
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */
						
Math.degreesToRadians = function (degrees) {	
	return (Math.PI / 180.0) * degrees;
};
	
Math.radiansToDegrees = function (radians) {	
	return (180.0 / Math.PI) * radians;
};

Math.getRandomNumber = function (low, high) {
	return Math.floor(Math.random()*(high-(low-1))) + low;
};

Math.getDistanceBwTwoPts = function (x1, y1, x2, y2) {		
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
};

BigBlock.Utils = (function () {
	
	var gwidth,
		gheight,
		blk_dim;
	
	return {
		clone: function(object) {
		    function F() {}
		    F.prototype = object;
		    return F;
		},
		/**
		 * Returns the grid index of the x,y coordinate
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 */		
		getPixIndex: function (x,y) {

			// uses BigBlock.Grid.width
			// uses BigBlock.Grid.height
			// uses BigBlock.Grid.total_viewport_cols = total viewport columns

			var target_x, target_y;

			if (x >= BigBlock.Grid.width) {
				x -= BigBlock.Grid.width;
			}

			if (y >= BigBlock.Grid.height) {
				y -= BigBlock.Grid.height;
			}	

			target_x = Math.floor(x / BigBlock.Grid.blk_dim);
			target_y = Math.floor(y / BigBlock.Grid.blk_dim);

			return target_x + (BigBlock.Grid.total_viewport_cols * target_y);

		},
		/**
		 * Returns the global x,y coordinate of a block based on its Block's pix_index 
		 * @param {String} type
		 * @param {Number} val
		 * @param {Number} pix_index_offset
		 * 
		 */	
		getPixLoc: function (type, val, pix_index_offset) {

			// uses Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim); = total global grid columns
			var loc, offset_y;
			if (type === 'x') {
				pix_index_offset = pix_index_offset % BigBlock.Grid.total_viewport_cols;
				loc = val + (pix_index_offset * BigBlock.Grid.blk_dim);
			}

			if (type === 'y') {
				if (pix_index_offset > 0) {
					offset_y = Math.floor(pix_index_offset / BigBlock.Grid.total_viewport_cols);
				} else {
					offset_y = Math.ceil(pix_index_offset / BigBlock.Grid.total_viewport_cols);
				}

				loc = val + (offset_y * BigBlock.Grid.blk_dim);
			}	
			return loc;
		},
		/**
		 * Returns the column index of a Block based on its x, y coordinate. 
		 * @param {Number} x
		 * @param {Number} y
		 * 
		 */	
		getColIndex: function (x, y) {
			var totalCols = BigBlock.Grid.width/BigBlock.Grid.blk_dim;
			return BigBlock.getFullGridIndex(x, y) % totalCols;
		},
		/**
		 * Returns the first index of the passed alias in the Blocks array.  
		 * 
		 * @param {String} alias
		 */
		getBlock: function (alias) {
			var i, max;
			for (i = 0, max = BigBlock.Blocks.length; i < max; i += 1) {
				if (BigBlock.Blocks[i].alias === alias) {
					return i;
				}
			}
			return false;
		},
		/**
		 * Returns the first index of the passed word_id in the Blocks array.
		 * 
		 * @param {String} word_id
		 */
		getWord: function (word_id) {
			var i, max;
			for (i = 0, max = BigBlock.Blocks.length; i < max; i += 1) {
				if (BigBlock.Blocks[i].word_id === word_id) {
					return i;
				}
			}
			return false;
		},
		/**
		 * Remove static Blocks from Static Grid.
		 * 
		 * @param {String} alias
		 * @param {Function} callback
		 */
		removeStaticBlock: function (alias, callback) { 

			var x, x_max, y, y_max, gs, nodes, tmp;

			// Requires alias; callback is optional

			try {
				if (typeof(alias) === "undefined") {
					throw new Error("BigBlock.removeStatic(alias): requires an alias.");
				}
				if (typeof(alias) !== "string") {
					throw new Error("utility: removeStatic(): arguement 'alias' must be a string.");
				}
				if (typeof(callback) !== "undefined" && typeof(callback) !== "function") { 
					throw new Error("utility: removeStatic(): arguement 'callback' must be a function.");
				}
			} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
			}	

			gs = BigBlock.GridStatic.viewport.dom_ref;

			if (gs.hasChildNodes()) {

				nodes = gs.childNodes; // get a collection of all children in BigBlock.GridText.id;

				tmp = [];

				// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection

				for(x = 0, x_max = nodes.length; x < x_max; x += 1) { // make copy of DOM collection
					tmp[tmp.length] = nodes[x]; 
				}

				for (y = 0, y_max = tmp.length; y < y_max; y += 1) { // loop thru children
					if (alias === tmp[y].getAttribute("name")) {
						gs.removeChild(tmp[y]);
					}
				}

				tmp = null;			
			}

			if (typeof(callback) === "function") { 
				callback();
			}

		},
		/**
		 * Returns a unique number based on the current date/time in milliseconds.
		 */
		getUniqueId: function () {
		     var dateObj = new Date();
		     return dateObj.getTime() + Math.getRandomNumber(0,1000000000);
		},
		/**
		 * Returns true if point is inside rect.
		 * 
		 * @param {Number} pt_x
		 * @param {Number} pt_y
		 * @param {Number} rect_x1
		 * @param {Number} rect_x2
		 * @param {Number} rect_y1
		 * @param {Number} rect_y2
		 */
		ptInsideRect: function (pt_x, pt_y, rect_x1, rect_x2, rect_y1, rect_y2) {
			if (pt_x >= rect_x1 && pt_x < rect_x2 && pt_y >= rect_y1 && pt_y < rect_y2) {
				return true;
			}
			return false;
		},
		/**
		 * Returns the number of rules in the stylesheet.
		 * @param {Object} sheet
		 */
		getCSSLength: function (sheet) {
			if (sheet.cssRules) { // W3C
				this.getCSSLength = function () {
					return sheet.cssRules.length;
				};		
			} else if (sheet.rules) { // IE
				this.getCSSLength = function () {
					return sheet.rules.length;
				};
			}
			return this.getCSSLength(sheet);
		},
		/*
		Appends a CSS rule to a stylesheet.
		@param {Object} sheet
		@param {String} selector
		@param {String} rule
		*/
		appendCSSRule: function (sheet, selector, rule) {			
			if (sheet.insertRule) {
				this.appendCSSRule = function (sheet, selector, rule) {
					sheet.insertRule(selector + " {" + rule + "}", 0);					
				}
			} else if (sheet.addRule) {
				this.appendCSSRule = function (sheet, selector, rule) {
					sheet.addRule(selector + " " + rule);
				}				
			}
			this.appendCSSRule(sheet, selector, rule);
		},
		/*
		Adds an event listener.
		@param {Object} target
		@param {String} eventType
		@param {Function} handler
		*/
		addEventHandler: function (target, eventType, handler) {			
			if (target.addEventListener) { // W3C
				this.addEventHandler = function (target, eventType, handler) {
					target.addEventListener(eventType, handler, false);
				} 
			} else if (target.attachEvent) { // IE
				this.addEventHandler = function (target, eventType, handler) {
					target.attachEvent("on" + eventType, handler);
				}
			}
			this.addEventHandler(target, eventType, handler);
		},	
		/*
		Removes an event listener.
		@param {Object} target
		@param {String} eventType
		@param {Function} handler
		*/
		removeEventHandler: function (target, eventType, handler) {			
			if (target.removeEventListener) { // W3C
				this.removeEventHandler = function (target, eventType, handler) {
					target.removeEventListener(eventType, handler, false);
				} 
			} else if (target.detachEvent) { // IE
				this.removeEventHandler = function (target, eventType, handler) {
					target.detachEvent("on" + eventType, handler);
				}
			}
			this.removeEventHandler(target, eventType, handler);
		},					
		/**
		 * Returns the current window width and height in json format.
		 */
		getWindowDim: function () {
			var d = {
				'width' : false,
				'height' : false
			};
			if (typeof(window.innerWidth) !== "undefined") {
				d.width = window.innerWidth;		
			} else if (typeof(document.documentElement) !== "undefined" && typeof(document.documentElement.clientWidth) !== "undefined") {
				d.width = document.documentElement.clientWidth;
			} else if (typeof(document.body) !== "undefined") {
				d.width = document.body.clientWidth;
			}
			if (typeof(window.innerHeight) !== "undefined") {
				d.height = window.innerHeight;		
			} else if (typeof(document.documentElement) !== "undefined" && typeof(document.documentElement.clientHeight) !== "undefined") {
				d.height = document.documentElement.clientHeight;
			} else if (typeof(document.body) !== "undefined") {
				d.height = document.body.clientHeight;
			}	
			return d;	
		},
		inArray: function (needle, haystack) {
			var i, max, check;
			check = false;
			for (i = 0, max = haystack.length; i < max; i += 1) {
				if (typeof(needle) === typeof(haystack[i]) && needle === haystack[i]) { // needle, haystack must be the same data type
					check = true;
				}
			}
			return check;
		},
		/**
		 * Returns the file extension from a supplied path
		 * @param {String} path
		 */
		getFileExtension: function (path) {

			var val, arr;

			try {
				if (typeof path === "undefined") {
					throw new Error("BigBlock.getFileExtension(path): A path is required.");
				} else {
					arr = path.split(".");
					val = arr[arr.length-1];			
				}								
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}	

			return val;
		},
		/**
		 * 
		 * Returns an array of common mime-types based on file extension.
		 * 
		 * @param {String} ext
		 */
		getMimeTypeFromFileExt: function (ext) {

			try {
				if (typeof ext === "undefined") {
					throw new Error("BigBlock.getMimeTypeFromFileExt(ext): An extension is required.");
				} else {

					switch (ext) {
						case "aif":
							return ["audio/x-aiff", "audio/x-aiff"];

						case "au":
						case "snd":
							return ["audio/basic"];
						case "ogg":
							return ["audio/ogg"];			
						case "mp3":
							return ["audio/mpeg", "audio/x-mpeg"];																					
						case "wav":
							return ["audio/wav", "audio/x-wav"];
						default:
							return false;
					}			
				}								
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}	

		},
		/**
		 * Returns a MySql formatted datetime value based on the datetime now.
		 * 
		 */
		getMySqlDateTime: function () { // format 0000-00-00 00:00:00

			var dateObj, year, month, day, hours, minutes, seconds;

			dateObj = new Date();

			year = dateObj.getFullYear();
			month = dateObj.getMonth();
			if (month < 10) {
				month = "0" + month;
			}
			day = dateObj.getDate();
			if (day < 10) {
				day = "0" + day;
			}
			hours = dateObj.getHours();
			if (hours < 10) {
				hours = "0" + hours;
			}
			minutes = dateObj.getMinutes();
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			seconds = dateObj.getSeconds();
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		},
		/**
		 * Opens a new browser window.
		 * @param {String} url
		 * @param {String} name
		 */
		windowOpen: function (url, name) {
			try {
				if (typeof url === "undefined") {
					return false;
				} else {
					if (typeof name === "undefined") {
						name = "";
					}
					if (BigBlock.standalone) {
						if (confirm('Leaving app. Continue?')) {
							window.open(url, name);	
						}
					} else {
						window.open(url, name);
					}			
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}	
		},
		/**
		 * Get new location for block given velocity, angle, x and y locations. Returns an object literal with x and y values.
		 * 
		 * 
		 * @param {Number} vel
		 * @param {Number} angle
		 * @param {Number} x
		 * @param {Number} y
		 */
		getTransform: function (vel, angle, x, y) {

			var trans, vx, vy;

			trans = {};									
			vx = (vel) * Math.cos(Math.degreesToRadians(angle)); // calculate how far obj should move on x,y axis
			vy = (vel) * Math.sin(Math.degreesToRadians(angle));

			trans.x = x + vx;
			trans.y = y + vy;

			return trans;
				
		},
		getParticleTransform: function (vel, angle, x, y, gravity, clock, life, color, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {

			var trans, spiral_offset, vx, vy, p;

			trans = {};									

			spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_x * BigBlock.Grid.blk_dim));	
			vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle) + spiral_offset; // calculate how far obj should move on x,y axis

			spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_y * BigBlock.Grid.blk_dim));
			vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle) + spiral_offset;

			// uncomment to disregard spiral offset
			//var vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle);
			//var vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle);

			if (x + vx >= BigBlock.Grid.width) {
				// do nothing;
			} else {
				trans.x = x + vx;
				trans.y = y + vy + (gravity*BigBlock.Grid.blk_dim);
			}

			p = clock/life;
			trans.color_index = color + Math.round(color_max*p);
			return trans;
		},
		/**
		 * Returns an angle between two points.
		 * 
		 * @param {Number} y
		 * @param {Number} init_y
		 * @param {Number} x
		 * @param {Number} init_x
		 */
		getAngle: function (y, init_y, x, init_x) {
			return Math.atan2(y - init_y, x - init_x) * 180 / Math.PI;
		},
		/**
		 * Checks if obj1 collides w obj2. Obj1 is a projectile (BlockSmall), obj2 is a target (BlockSmall or BlockAnim).
		 * If collision is detected, the collisionAction property is executed for both objects.
		 * 
		 * @param {String} obj1_alias
		 * @param {Number} obj1_x
		 * @param {Number} obj1_y
		 * @param {Boolean} obj1_isHit
		 * @param {String} obj2_aliasRegExMatch
		 */
		checkCollision: function (obj1_alias, obj1_x, obj1_y, obj1_isHit, obj2_aliasRegExMatch) {

			var i, a, p, obj2_index, obj2_x, obj2_y;

			/*
			 * The function below only checks the current frame in the BlockAnim anim array.
			 */

			for (i in BigBlock.Blocks) { // loop thru Blocks

				if (BigBlock.Blocks.hasOwnProperty(i)) {

					// check for non-static Blocks, alias, not hit
					if (BigBlock.Blocks[i].anim !== false && BigBlock.Blocks[i].render_static === false && BigBlock.Blocks[i].alias.indexOf(obj2_aliasRegExMatch) !== -1 && obj1_isHit === false) {

						a = BigBlock.Blocks[i].anim_frame; // get the current frame in the animation array

						for (p in BigBlock.Blocks[i].anim[a].frm.pix) { // loop thru blocks
							if (BigBlock.Blocks[i].anim[a].frm.pix.hasOwnProperty(p)) {

								obj2_index = BigBlock.getFullGridIndex(BigBlock.Blocks[i].x, BigBlock.Blocks[i].y); // get block index

								// add index offset
								obj2_index = obj2_index + BigBlock.Blocks[i].anim[a].frm.pix[p].i;

								obj2_x = BigBlock.getPixLoc('x', BigBlock.Blocks[i].x, BigBlock.Blocks[i].anim[a].frm.pix[p].i);
								obj2_y = BigBlock.getPixLoc('y', BigBlock.Blocks[i].y, BigBlock.Blocks[i].anim[a].frm.pix[p].i);

								// if grid indexes match, blocks have collided
								if (obj2_index === BigBlock.getFullGridIndex(obj1_x, obj1_y)) {

									BigBlock.Blocks[obj1_alias].is_hit = true; // stops checking for collisions on this object
									BigBlock.Blocks[obj1_alias].render = 2; // stop rendering pollen after a few screen renders

									if (typeof(BigBlock.Blocks[obj1_alias].action_collide) === "function") { // run obj1 collide action
										BigBlock.Blocks[obj1_alias].action_collide();
									}									

									if (typeof(BigBlock.Blocks[i].action_collide) === "function") { // run obj2 collide action
										BigBlock.Blocks[i].action_collide();
									}

									break;
								}
							}
						}
					}
				}
			}
		}																						
								
	};
	
}());

/*global BigBlock, document, window, Audio, setTimeout */
/**
 Audio object
 Provides an interface to play audio files. Browser must be HTML 5 compliant.
  
 @author Vince Allen 01-01-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Audio = (function () {
	
	var supported = true;

	if (typeof window.Audio === "undefined") {
		supported = false;
		BigBlock.Log.display("This browser does not support HTML5 audio.");
	}															

	return {
		
		alias : "audio",
		supported : supported,
		playlist : {}, // contains instances of Audio elements
		pause_timeout: null,
		debug: false,
		is_single_channel: false,  // typically set by checking BigBlock.is_iphone and BigBlock.is_ipad
		single_channel_id: null, // the id of the single channel Audio element
		last_play: new Date().getTime(), // the last time the single channel Audio element played 
		last_play_delay: 500, // the time to wait before allowing the single channel Audio element to play
		muted : false,	
		format: ["wav", "mp3", "ogg"],
		loading_list: [],
		loading_complete: false,
		/**
		 * Adds an audio element to the DOM. Also runs load() to set up the audio file for playback.
		 * Uses new Audio([url]) which returns a new audio element, with the src attribute set to the value passed in the argument, if applicable.
		 * 
		 * @param {String} id
		 * @param {String} path
		 * @param {String} loop
		 * 
		 */				
		add: function(id, path, loop, after_load) {
			
			var f, f_max, i, i_max, mime_type, supported_mime_type, audio;
			
			if (supported) {
						
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}				
					if (typeof path === "undefined") {
						throw new Error("Path to audio file required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				for (f = 0, f_max = this.format.length; f < f_max; f++) { // loop thru formats to find the first that this browser will play
					
					mime_type = BigBlock.Utils.getMimeTypeFromFileExt(this.format[f]); // get mime-type
					
					audio = new Audio(path + id + "." + this.format[f]); // create audio element
					
					if (loop) {
						audio.loop = loop;
					}
					
					supported_mime_type = ""; // loop thru mime_type
					
					for (i = 0, i_max = mime_type.length; i < i_max; i++) {
						supported_mime_type = this.canPlayType(audio, mime_type[i]); // check media.canPlayType 
						if (supported_mime_type !== "") {
							if (this.debug) {
								BigBlock.Log.display("This browser will try to play " + id + " audio file in " + mime_type[i] + " format.");
							}
							break;
						}
					}
					
					if (supported_mime_type !== "") {
						break;
					}
				
				}

				if (supported_mime_type !== "") {
					
					audio.id = id; // add the id to the audio element; useful to identify audio file when events fire
					this.playlist[id] = audio; // add audio element to playlist
					
					i = this.playlist[id];
					
					if (i.addEventListener) {
						i.addEventListener("canplay", function (e) {
							BigBlock.Audio.playlist[e.target.id].removeEventListener("canplay", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("loadstart", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("progress", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("suspend", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("abort", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("error", this.eventHandler, false);
							BigBlock.Audio.playlist[e.target.id].removeEventListener("emptied", this.eventHandler, false);				
							BigBlock.Audio.playlist[e.target.id].removeEventListener("stalled", this.eventHandler, false);							
							BigBlock.Audio.eventHandler(e, after_load);
						}, false); // add canplay event listener
						i.addEventListener("loadstart", this.eventHandler, false); // add loadstart event listener
						i.addEventListener("progress", this.eventHandler, false); 
						i.addEventListener("suspend", this.eventHandler, false); 
						i.addEventListener("abort", this.eventHandler, false); 
						i.addEventListener("error", this.eventHandler, false); 
						i.addEventListener("emptied", this.eventHandler, false); 
						i.addEventListener("stalled", this.eventHandler, false); 
					} else if (i.attachEvent) { // IE
						i.attachEvent("canplay", function (e) {BigBlock.Audio.eventHandler(e, after_load);}, false);
						i.attachEvent("loadstart", this.eventHandler, false);
						i.attachEvent("progress", this.eventHandler, false); 
						i.attachEvent("suspend", this.eventHandler, false); 
						i.attachEvent("abort", this.eventHandler, false); 
						i.attachEvent("error", this.eventHandler, false); 
						i.attachEvent("emptied", this.eventHandler, false); 
						i.attachEvent("stalled", this.eventHandler, false);					
					}
					
					if (i.load) {
						this.loading_list.push(id);						
						i.load(); // load the file
						/*
						 * Firefox requires calling load() on the audio object. Safari seems to auto load the file, but does not throw an error calling load() directly.
						 */							
					} else {
						/*
						 * If the load() method does not exist, assume the Audio object is supported not but fully implemented.
						 * Delete the audio object from this.playlist.
						 */
						this.supported = false;	// will abort trying to load any further audio files
						this.playlist = [];				
						BigBlock.Log.display("This browser does not support HTML5 audio.");	
					}
					
				} else {
					BigBlock.Log.display("Audio mime-type " + mime_type + " not supported. " + this.format + " files will not be played.");
					if (BigBlock.Audio.is_single_channel) { // if single channel
						BigBlock.Audio.supported = false;	// will abort trying to load any further audio files
						BigBlock.Audio.playlist = [];							
					}					
				}
			
			}

		},
		eventHandler: function (e, after_load) {
			
			var i, max, message;
			
			message = "An audio event for " + e.target.id + " just fired.";
			
			switch (e.type) {
				case "loadstart":
					message = "Audio: eventHandler: Audio file " + e.target.id + " has started loading.";
					break;	
				case "progress":
					message = "Audio: eventHandler: Audio file " + e.target.id + " is loading.";
					break;	
				case "suspend":
					message = "Audio: eventHandler: The user agent is intentionally not currently fetching " + e.target.id + ", but does not have the entire media resource downloaded.";
					break;
				case "abort":
					message = "Audio: eventHandler: The user agent stopped fetching " + e.target.id + " before it was completely downloaded, but not due to an error.";
					break;	
				case "error":
					message = "Audio: eventHandler: An error occurred while fetching " + e.target.id + ".";
					if (BigBlock.Audio.is_single_channel) {
						BigBlock.Audio.supported = false;	// will abort trying to load any further audio files
						BigBlock.Audio.playlist = [];							
					}					
					break;
				case "emptied":
					message = "Audio: eventHandler: " + e.target.id + "'s network state just switched to NETWORK_EMPTY.";
					break;	
				case "stalled":
					message = "Audio: eventHandler: The user agent is trying to fetch " + e.target.id + ", but data is unexpectedly not forthcoming.";					
					break;																															
				case "canplay":
					message = "Audio: eventHandler: Audio file " + e.target.id + " is ready to play.";
					if (typeof after_load !== "undefined") {
						setTimeout(function () {after_load();}, 0);
					}
					break;
			}
			
			// remove file from loading array
			if (e.type !== "loadstart" && e.type !== "progress" && e.type !== "suspend" && e.type !== "emptied" && e.type !== "stalled") {
				for (i = 0, max = BigBlock.Audio.loading_list.length; i < max; i++) {
					if (BigBlock.Audio.loading_list[i] === e.target.id) {
						BigBlock.Audio.loading_list.splice(i, 1);
						
						if (BigBlock.Audio.loading_list.length < 1) {
							BigBlock.Audio.loading_complete = true;
						}
						break;
					}			
				}
				BigBlock.Audio.playlist[e.target.id].removeEventListener("loadstart", this.eventHandler, false);
				BigBlock.Audio.playlist[e.target.id].removeEventListener("progress", this.eventHandler, false);
				BigBlock.Audio.playlist[e.target.id].removeEventListener("suspend", this.eventHandler, false);
				BigBlock.Audio.playlist[e.target.id].removeEventListener("abort", this.eventHandler, false);
				BigBlock.Audio.playlist[e.target.id].removeEventListener("error", this.eventHandler, false);
				BigBlock.Audio.playlist[e.target.id].removeEventListener("emptied", this.eventHandler, false);				
				BigBlock.Audio.playlist[e.target.id].removeEventListener("stalled", this.eventHandler, false);
			}

			
			try {
				if (BigBlock.Audio.debug === true) {
					throw new Error(message);
				}															
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
		},
		/**
		 * Returns the empty string (a negative response), "maybe", or "probably" based on how confident the user agent is that it can play media resources of the given type.
		 * Allows the user agent to avoid downloading resources that use formats it cannot render.
		 * 
		 * @param {String} type
		 * 
		 */				
		canPlayType: function(element, type) {
			
			try {
				if (typeof type === "undefined") {
					throw new Error("A type is required");
				}															
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}

			try {
				if (element.canPlayType) { // check that the browser supports the canPlayType method
					return element.canPlayType(type);
				} else {
					return "maybe";
				}						
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
			return false;
			
		},		
		/**
		 * Causes the element to reset and start selecting and loading a new media resource from scratch.
		 * 
		 * @param {String} id
		 * 
		 */			
		load: function (id) {

			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					this.playlist[id].load(); // load the sound									
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		},
		/**
		 * Plays an audio element.
		 * 
		 * @param {String} id
		 * 
		 */			
		play: function (id, before_play, after_play) {
			
			var duration, rs, start_time, time_now;
			
			if (this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				// rs;
				
				try {
					
					if (this.is_single_channel) { // single channel audio
						
						if (typeof this.playlist[this.single_channel_id] !== "undefined") {
						
							time_now = new Date().getTime();
							if (time_now - this.last_play > this.last_play_delay) { // check that this.last_play_delay has passed
							
								rs = this.getReadyState(this.single_channel_id, true);

								if (rs.state >= 2 && this.muted === false) { // check that the sound is ready to play
								
									start_time = this.track_labels[id].start_time;
									duration = this.track_labels[id].duration;
									
									this.pause(this.single_channel_id); // pause the sound
									
									this.setCurrentTime(this.single_channel_id, start_time); // set the time to start playing
									
									this.playlist[this.single_channel_id].play(); // play the sound
									this.last_play = time_now;
									
									this.pause_timeout = setTimeout(function () {
										BigBlock.Audio.pause(BigBlock.Audio.single_channel_id);
									}, duration);								
								
								} else {
									if (this.debug) {
										BigBlock.Log.display("Audio: State: " + rs.state + " Message: " + rs.message);
									}
								}
							
							}
			
						}
													
					} else { // multi-channel audio
						
						if (typeof this.playlist[id] !== "undefined") {
							
							rs = this.getReadyState(id, true);
							
							if (rs.state >= 2 && this.muted === false) { // check that the sound is ready to play
								if (typeof before_play !== "undefined") {
									before_play();
								}
								if (typeof after_play !== "undefined") {
									duration = this.getDuration(id) * 1000;
									setTimeout(function () {
										after_play();
									}, duration);
								}
								this.playlist[id].pause();
								this.playlist[id].play();
								
							}
						
						}
						
					}					
														
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
			}
		},
		/**
		 * Sets the paused attribute to true, loading the media resource if necessary.
		 * 
		 * @param {String} id
		 * 
		 */			
		pause: function (id, toggle) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				var rs = this.getReadyState(id, true);
	
				if (rs.state > 2) { // check that the sound is ready
				
					if (typeof toggle !== "undefined") { // should this toggle bw paused/play
						if (this.isPaused(id) === false) {
							try {
								this.playlist[id].pause(); // pause the sound
							} catch(e) {
								BigBlock.Log.display(e.name + ': ' + e.message);
							}							
						} else {
							var timeRanges = this.getPlayed(id);
							var ended = this.isEnded(id);
							if (timeRanges.length > 0 && ended !== true) { // if file has started playing and then paused; if file has not ended; start playing again
								try {
									this.playlist[id].play(); // play the sound
								} catch(e) {
									BigBlock.Log.display(e.name + ': ' + e.message);
								}								
							}				
						}
					} else {
						try {
							this.playlist[id].pause(); // pause the sound										
						} catch(e) {
							BigBlock.Log.display(e.name + ': ' + e.message);
						}					
					}
				
				} else {
					BigBlock.Log.display("Audio: " + rs.message);
				}			
			}
		},
		/**
		 * Returns true if playback is paused; false otherwise.
		 * 
		 * @param {String} id
		 * 
		 */			
		isPaused: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].paused;							
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},
		/**
		 * Returns a TimeRanges object that represents the ranges of the media resource that the user agent has played.
		 * 
		 * @param {String} id
		 * 
		 */			
		getPlayed: function (id) {
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
						
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].played;									
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},
		/**
		 * Returns true if playback has reached the end of the media resource.
		 * 
		 * @param {String} id
		 * 
		 */			
		isEnded: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
						
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].ended;
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},
		/**
		 * Returns the current rate playback, where 1.0 is normal speed.
		 * 
		 * @param {String} id
		 * 
		 */			
		getPlaybackRate: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].playbackRate;
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},				
		/**
		 * Returns a value that expresses the current state of the element with respect to rendering the current playback position, from the codes in the list below.
		 * 
		 * @param {String} id
		 * @param {Boolean} debug
		 * 
		 */			
		getReadyState: function (id, debug) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				var state = this.playlist[id].readyState; // get the ready state
				
				var val; // will be an object or integer depending on value of debug
				
				if (typeof debug !== "undefined") { // if debug has a value return the message along with the state value
					
					var message;
	
					switch (state) {
						case 0:
							message = "HAVE_NOTHING: No data for the current playback position is available.";												
							break;
							
						case 1:
							message = "HAVE_METADATA : Enough of the resource has been obtained that the duration of the resource is available. No media data is available for the immediate current playback position.";
							break;
							
						case 2:
							message = "HAVE_CURRENT_DATA: Data for the immediate current playback position is available, but not enough data is available to successfully advance the current playback position in the direction of playback.";
							break;
							
						case 3:
							message = "HAVE_FUTURE_DATA: Data for the immediate current playback position is available. However, not enough data is avaialble to determine if playback will out-pace the data stream.";
							break;
							
						case 4:
							message = "HAVE_ENOUGH_DATA: All data for the immediate current playback position is available.";
							break;					
																									
					}
									
					val = {
						state : state,
						message : message
					};
					
				} else {
					
					val = state; 
				
				}
				
				return val;
			
			}
			
		},
		/**
		 * Returns the current state of network activity for the element, from the codes in the list below.
		 * 
		 * @param {String} id
		 * @param {Boolean} debug
		 * 
		 */			
		getNetworkState: function (id, debug) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
				var state = this.playlist[id].networkState; // get the ready state
				var val; // will be an object or integer depending on value of debug
				
				if (typeof debug !== "undefined") { // if debug has a value return the message along with the state value
					
					var message;
	
					switch (state) {
						case 0:
							message = "NETWORK_EMPTY: The element has not yet been initialized. All attributes are in their initial states.";
							break;
							
						case 1:
							message = "NETWORK_IDLE: The element's resource selection algorithm is active and has selected a resource, but it is not actually using the network at this time.";
							break;
							
						case 2:
							message = "NETWORK_LOADING: The user agent is actively trying to download data.";
							break;
							
						case 3:
							message = "NETWORK_NO_SOURCE: The element's resource selection algorithm is active, but it has so not yet found a resource to use.";
							break;				
																									
					}
									
					val = {
						state : state,
						message : message
					};
					
				} else {
					
					val = state; 
				
				}
				
				return val;
			
			}
			
		},				
		/**
		 * Returns the length of the media resource, in seconds, assuming that the start of the media resource is at time zero.
		 * Returns NaN if the duration isn't available.
		 * Returns Infinity for unbounded streams.
		 * 
		 * @param {String} id
		 * 
		 */			
		getDuration: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					return this.playlist[id].duration;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
			}
		},		
		/**
		 * Returns the current playback position, in seconds.
		 * Will throw an INVALID_STATE_ERR exception if there is no selected media resource.
		 * 
		 * @param {String} id
		 * 
		 */			
		getCurrentTime: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].currentTime;										
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},		
		/**
		 * Sets the current playback position, in seconds.
		 * Will throw an INVALID_STATE_ERR exception if there is no selected media resource.
		 * Will throw an INDEX_SIZE_ERR exception if the given time is not within the ranges to which the user agent can seek.
		 * 
		 * @param {String} id
		 * @param {Number} time
		 */			
		setCurrentTime: function (id, time) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {	
					this.playlist[id].currentTime = time;										
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
			
		},		
		/**
		 * Returns the current playback volume, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest.
		 * 
		 * @param {String} id
		 * 
		 */			
		getVolume: function (id) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					return this.playlist[id].volume;										
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
			}
		},		
		/**
		 * Sets the current playback volume, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest.
		 * Throws an INDEX_SIZE_ERR if the new value is not in the range 0.0 .. 1.0.
		 * 
		 * @param {String} id
		 * @param {Number} volume
		 * 
		 */			
		setVolume: function (id, volume) {
			
			if (typeof this.playlist[id] !== "undefined" && this.supported) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof id === "undefined") {
						throw new Error("An id is required");
					}
					if (typeof volume === "undefined") {
						throw new Error("A volume value between 0.0 and 1.0 is required");
					}																
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}

				try {
					this.playlist[id].volume = volume;										
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}			
			}
		},				
		/**
		 * Mutes all audio elements in playlist.
		 * 
		 * 
		 */			
		mute: function () {
			
			var i;
			
			if (this.supported) { // browser must support HTML5 Audio
	
				for (i in this.playlist) {
					if (this.playlist.hasOwnProperty(i)) {
						try {	
							this.playlist[i].muted = true; // mutes the sound						
						} catch(e) {
							BigBlock.Log.display(e.name + ": " + e.message);
						}
					}			
				}
				
				this.muted = true;
			
			}
			
		},		
		/**
		 * Unmutes all audio elements in playlist.
		 * 
		 * 
		 */			
		unmute: function () {
			
			var i;
			
			if (this.supported) { // browser must support HTML5 Audio
			
				for (i in this.playlist) {
					if (this.playlist.hasOwnProperty(i)) {
						try {
							this.playlist[i].muted = false;	// unmutes the sound										
						} catch(e) {
							BigBlock.Log.display(e.name + ": " + e.message);
						}
					}				
				}
				
				this.muted = false;
			
			}
			
		}
		
	};
	
}());

/**
 * Block
 * A generic object that carries core Block properties. All sprites appearing in a scene should inherit from the Block object.
 * 
 * IMPORTANT: BlockAnim's should not carry action_inputs; if they do, only the top left block of the Block will trigger the action.
 * Instead, use Button class.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Block = (function () {	
					
	return {
		configure: function(){

			this.last_x = false;
			this.last_y = false;
			this.pix_index = false; // the grid index for this block based on this.x, this.y;
			this.clock = 0;
			this.color_index = this.color + '0';
			this.color_max = 0;
			this.anim = false; // BlockSmall has no anim property; other Block types set their anim property after running configure();
			this.anim_frame = 0;
			this.last_anim_frame = false;
			this.is_position_updated = true;
			this.is_anim_updated = false;
			this.className = "Block";
															
			// user configurable
			
			this.alias = BigBlock.Utils.getUniqueId();
			this.color = 'white'; // color
			this.x = 0;
			this.y = 0;
			
			this.render = -1; // set to positive number to eventually not render this object; value decrements in render()
			
			this.angle = Math.degreesToRadians(0);
			this.vel = 0;
			
			this.life = 0; // 0 = forever
			this.pulse_rate = 0; // controls the pulse speed
			
			this.after_destroy = false;
			
			/*
			 * STATIC Block
			 * if Block never moves, set = 1 to prevents unnecessary cleanup and increase performance
			 * to kill the Block, first set = 0, then call destroy()
			 * 
			 */
			
			this.render_static = false;  
			
			//
			
			this.action_render = false;
			this.action_input = false; // called by the mouseup and touchstart methods of ScreenEvent; use for links on Words or to trigger actions on BlockSmalls; do not use on BlockAnims, instead, use Button	
			
		},
		getAnim_delete : function (color_index) {
			
			return [
					{'frm':
						{
							'duration' : 1,
							'pix' : [
										{'c':color_index,'i':0}
									]	
						}
					}		
				];
		},
		getBlocks : function () {
			
			var a = this.anim[0];
			if (typeof(a.frm.pix[0]) !== "undefined") {
				a.frm.pix[0].c = this.color_index; // change to this.color_index
			}
			return a.frm;
		},					
		run : function () {
				
			if (typeof(this.action_render) === "function") { // call action_render if it exists
				this.action_render(this); 
			}
			
			// GET POSITION

			if (this.last_x === this.x && this.last_y === this.y) { // compare last position to current; if they are equal do not run BigBlock.Utils.getPixIndex();
				this.is_position_updated = true; // !! should be set to false; problem w divs that do not move when they are first created
			} else {
				
				this.pix_index = false;
				if (BigBlock.Utils.ptInsideRect(this.x, this.y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) {
					this.pix_index = BigBlock.Utils.getPixIndex(this.x, this.y); // get new pixel index to render
				}
				
				this.last_x = this.x;
				this.last_y = this.y;
				
				this.is_position_updated = true;
			
			}
					
			// GET BLOCKS TO RENDER
			/*
			 * RenderMgr loops thru the img property to render blocks.
			 */
			if (this.anim === false) { // BlockSmall does not have an anim property
				this.img = false;
			} else {
				this.img = this.getBlocks(); // get pixels
			}
			
			if (this.last_anim_frame === this.anim_frame) { // check if animation frame has changed; if so, render functions will update divs
				this.is_anim_updated = false;
			} else {
				this.last_anim_frame = this.anim_frame;
				this.is_anim_updated = true;
			}
			
			this.is_color_updated = false;			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.color + Math.round(this.color_max * p); // life adjusts color
				if (this.color_max > 0) {
					this.is_color_updated = true;
				}
			} else {
				if (this.pulse_rate !== 0) {
					this.color_index = this.color + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock / this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
					if (this.color_max > 0) {
						this.is_color_updated = true;
					}
				} else {
					this.color_index = this.color + '0';
				}
				
			}
			
			this.clock++;
				
			if (this.clock >= this.life && this.life !== 0) { // destroy this Block if its clock is greater than its life property
				this.destroy();			
			}
			
		},
		destroy : function (callback) {
			if (typeof(callback) === 'function') { this.after_destroy = callback; }
			this.render = 0; // prevents render manager from receiving this object's blocks
			BigBlock.Timer.destroyObject(this);		
		}			
	};
	
}());

/*global BigBlock */
/**
 BlockAnim object
 An extension of the simple Block object. Supports animation and multi-color. 
 Anim is passed via Block.anim() as a json object. Colors are set in anim json.
 
 IMPORTANT: BlockAnims should not carry action_inputs; if they do, only the top left block of the Block will trigger the action.
 Instead, use the Button class.
  
 revisions:
 01-07-2010: changed name from SpriteAdvanced to BlockAnim
 
 @author Vince Allen 01-16-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.BlockAnim = (function () { 
	
	return {
		
		create: function (params) {
			var i,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Block
				obj = new F,
				max;
			
			obj.configure(); // run configure() to inherit Word properties

			obj.anim_frame_duration = 0;	
			obj.anim_loop = false;
			obj.anim_state = 'stop';
			
			obj.anim = [ // will provide a single pixel if no anim param is supplied
					{'frm':
						{
							'duration' : 1,
							'pix' : [
										{'c':'white0','i':0}
									]	
						}
					}		
				]; // get blank anim
										
			if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}

			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = palette.classes.length; i < max; i++) { // get length of color palette for this color
				if (palette.classes[i].name === obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
									
			obj.getBlocks = function () { // overwrite the getPix function
			
				try {
					if (typeof(this.anim) === "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.getPix(): getPix() requires an anim json object.");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
				switch (this.anim_state) {
					
					case "stop":
						var a = this.anim[this.anim_frame];
					break;
					
					case "play":

						if (typeof(this.anim[this.anim_frame]) !== "undefined") {
							
							a = this.anim[this.anim_frame];
									
							var duration = a.frm.duration; // get this frame's duration
														
							if (this.anim_frame_duration < duration) { // check if the frame's current duration is less than the total duration
								
								if (this.anim_frame_duration === 0) { // if this
									a = this.anim[this.anim_frame];
									if (typeof(a.frm.enter_frame) === "function") {
										a.frm.enter_frame.call(this);
									} // call enter frame
								} 
								
								this.anim_frame_duration++; // if yes, increment
								
							} else { // if no, call exitFrame() and advance frame	
	
							
								//a = this.anim[this.anim_frame];
								
								if (typeof(a.frm.exit_frame) === "function") {
									a.frm.exit_frame.call(this);
								} // call exit frame
								
								this.anim_frame_duration = 0;
								this.anim_frame++;
								
								if (typeof(this.anim[this.anim_frame]) === "undefined") { // if anim is complete 
									if (this.anim_loop) { // if anim should loop, reset anim_frame
										this.anim_frame = 0;
									} else {
										this.anim_frame--;
									}
								}
									
								a = this.anim[this.anim_frame];
			
							}
						
						}
						
					break;
			
				}

				if (typeof(a) !== "undefined") { // always return frm regardless of state
					return a.frm;
				}
			};
			obj.play = function () {
				this.anim_state = "play";
			};			
			obj.stop = function () {
				this.anim_state = "stop";
			};
			obj.goToAndPlay = function (arg) {
				try {
					if (typeof(arg) === "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.goToAndPlay(): goToAndPlay(arg) requires a frame number, label or keyword(nextFrame, lastFrame).");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
				this.anim_frame_duration = 0;
				this.anim_frame = this.goToFrame(arg);
				this.anim_state = "play";
			};
			obj.goToAndStop = function (arg) {
				try {
					if (typeof(arg) === "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.goToAndStop(): goToAndStop(arg) requires a frame number, label or keyword(nextFrame, lastFrame)");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
				this.anim_frame = this.goToFrame(arg);
				
				if (typeof(arg) === "number") {
					this.anim_frame_duration = 0;
				}

				this.anim_state = "stop";
			};	
								
			obj.goToFrame = function (arg) {
				
				var current_frame, frame;
				
				try {
					if (typeof(arg) === "undefined") {
						throw new Error("BigBlock.Sprite.goToFrame(): goToFrame(arg, anim_frame, anim) requires a frame number, label or keyword(nextFrame, lastFrame)");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
				
				current_frame = this.anim_frame;
					
				switch (typeof(arg)) {
					case "number":
						try {
							if (arg - 1 < 0 || arg - 1 >= this.anim.length) {
								throw new Error("BigBlock.Sprite.goToFrame(): Frame number does not exist.");
							}
						} catch(e) {
							BigBlock.Log.display(e.name + ': ' + e.message);
						}
						this.anim_frame = arg-1;
						
						break;
						
					case "string":
					
						switch (arg) {
							case "next_frame":
								
								frame = this.anim_frame;
								
								if (this.anim_loop === true) {								
									frame++;										
								} else {
									if (this.anim_frame + 1 < this.anim.length) {
										frame++;
									} // else do not change frame
								}
								this.anim_frame = frame;
								
								break;
							
							case "previous_frame":
							
								frame = this.anim_frame;
							
								if (this.anim_loop === true) {
									frame--;
								} else {
									if (this.anim_frame - 1 >= 0) {
										frame--;
									} // else do not change frame
								}
								this.anim_frame = frame;
								
								break;
							
							default: // search for index of frame label
								this.anim_frame = this.getFrameIndexByLabel(arg);
								break;
						}
					
					break;			
				}
				
				if (typeof(this.anim[this.anim_frame]) === "undefined") { // allows animation to loop using next/previous if anim_loop = true
					if (this.anim_frame > 0) {
						this.anim_frame = 0;
					} else {
						this.anim_frame = this.anim.length - 1;
					}
				}
				
				// check for exit frame
				if (current_frame !== this.anim_frame) {
					
					// check for exit frame
					if (typeof(this.anim[current_frame].frm.exit_frame) !== "undefined" && typeof(this.anim[current_frame].frm.exit_frame) === "function") {
						this.anim[current_frame].frm.exit_frame.call(this);
					}				
				
					// check for enter frame
					if (typeof(this.anim[this.anim_frame].frm.enter_frame) !== "undefined" && typeof(this.anim[this.anim_frame].frm.enter_frame) === "function") {
						this.anim[this.anim_frame].frm.enter_frame.call(this);
					}
				
				}
				
				return this.anim_frame;
			};
			
			obj.getFrameIndexByLabel = function (arg) {
				
				var i, error;
				
				try {
					if (typeof(arg) === "undefined") {
						throw new Error("BigBlock.Sprite.getFrameIndexByLabel(): getFrameIndexByLabel(arg) requires a label");
					}			
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
						
				error = 0;
				for (i in this.anim) {
					if (this.anim.hasOwnProperty(i)) {
						if (arg === this.anim[i].frm.label) {
							return i;
						}
						error++;
					}
				}
				
				try {
					if (error !== 0) {
						throw new Error("BigBlock.Sprite.getFrameIndexByLabel(): Frame label does not exist.");
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
				}
		
			};			

			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
		}
	};

}());

/*global BigBlock */
/**
 BlockBig object
 Creates a one-color, one-frame BlockAnim based on passed width, height and color values.
 
 @author Vince Allen 01-16-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.BlockBig = (function () {
	
	return {
		
		create: function (params) {
			
			var i, h, h_max, w, w_max;
			
			if (typeof params.width === "undefined") {
				params.width = Math.pow(BigBlock.Grid.blk_dim, 2);
			}
			if (typeof params.height === "undefined") {
				params.height = Math.pow(BigBlock.Grid.blk_dim, 2);
			}
			if (typeof params.color === "undefined") {
				params.color = "white";
			}						
			
			var F = BigBlock.Utils.clone(BigBlock.Block);  // CLONE Block
			var obj = new F;
			
			obj.configure(); // run configure() to inherit Word properties

			obj.anim = [ // create empty anim property; filled via the loop below
				{'frm':
					{
						'duration' : 1,
						'pix' : [
									
						]	
					}
				}		
			];
			
			i = 0;
			for (h = 0, h_max = Math.floor(params.height/BigBlock.Grid.blk_dim); h < h_max; h++) { // loop thru height
				for (w = 0, w_max = Math.floor(params.width/BigBlock.Grid.blk_dim); w < w_max; w++) { // loop thru width
					obj.anim[0].frm.pix[i] = {"c": params.color + "0","i": ((BigBlock.Grid.width/BigBlock.Grid.blk_dim)*h)+w}; // add a block to the anim property
					i++;
				}				
			}
			
			if (typeof params !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}

			obj.color_index = obj.color + "0";
			obj.img = obj.getBlocks(); // get pixels
																	
			obj.render_static = true;

			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
						
		}
	};
	
}());

/*global BigBlock */
/**
 BlockSmall object
 A single block w no animation.
  
 revisions:
 01-07-2011 - changed name from SpriteSimple to BlockSmall
   
 @author Vince Allen 01-16-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.BlockSmall = (function () {
	
	return {
		
		create: function (params) {
			
			var i,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Block
				obj = new F,
				max;
			
			obj.configure(); // run configure() to inherit Block properties
						
			if (typeof params !== 'undefined') { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = palette.classes.length; i < max; i++) { // get length of color palette for this color
				if (palette.classes[i].name === obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.color + '0'; // overwrite color_index w passed color

			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
		}
	};
	
}());

/*global BigBlock */
/**
 Button object
 Creates clickable groups of blocks that carry functions to execute on events. Buttons must be static.
 Creates a BlockAnim (render_static = true) while also populating a "map" property with x, y, width, height, and a function to run when clicked/touched.
 Width and Height of the button graphic must be supplied.
 Can also create hot spots without a graphic as long as x, y, width, height are passed and anim = 
 Rollovers currently not supported; 
  
 @author Vince Allen 01-06-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Button = (function () {
		
	return {
		
		alias: 'button',
		map: [],
		/**
		 * Creates a BlockAnim (render_static = true) while also populating a "map" property with x, y, width, height, and a function to run when clicked/touched.
		 * 
		 * @param {Object} key
		 */				
		create: function (params) {
			
			try {
				if (typeof params === "undefined") {
					throw new Error("Button.create(): params argument required");
				}
				if (typeof params.x === "undefined") {
					throw new Error("Button.create(): params.x argument required");
				}
				if (typeof params.y === "undefined") {
					throw new Error("Button.create(): params.y argument required");
				}
				if (typeof params.width === "undefined") {
					throw new Error("Button.create(): params.width argument required");
				}
				if (typeof params.height === "undefined") {
					throw new Error("Button.create(): params.height argument required");
				}				
				if (typeof params.alias === "undefined") {
					params.alias = "button"+BigBlock.Utils.getUniqueId(); // assign unique id if alias is not passed
				}
				if (typeof params.action_input === "undefined") {
					params.action_input = false; // force an empty function if action_input is not passed
				}																																		
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
			this.map[this.map.length] = { // add coords to map
				alias: params.alias,
				x: params.x,
				y: params.y,
				width: params.width,
				height: params.height,
				url: params.url,
				action_input: params.action_input
			};
			
			params.render_static = true; // force static
			params.className = "Button"; // force className
			params.after_destroy = false;
			
			/*
			 * This version of the Button class forces buttons to be static.
			 * Future versions will allow active buttons with rollovers, active states, etc. Uncomment the following for use with active buttons.
			 */
			
			/*params.destroy = function () {
				if (typeof(callback) == 'function') { this.after_destroy = callback; }
				this.render = 0; // prevents render manager from rendering this object's blocks
				BigBlock.Timer.destroyObject(this);					
				BigBlock.removeStaticBlock(this.alias);	// remove static blocks associated with this object			
			};*/
			
			
			// if anim = "undefined", use width/height to draw button
			
			if (typeof params.anim === "undefined") {
				BigBlock.BlockBig.create(params); // create a BlockBig
			} else {				
				BigBlock.BlockAnim.create(params); // create a BlockAnim
			}
			
		},
		/**
		 * Removes an entry from Button.map. Typically used when removing buttons but not changing scenes.
		 * 
		 * @param {String} alias
		 */
		deleteFromMap: function (alias) {
			var i, max;
			for (i = 0, max = BigBlock.Button.map.length; i < max; i++) {
				if (BigBlock.Button.map[i].alias === alias) {
					BigBlock.Button.map.splice(i,1);
					return true;
				}
			}
			return false;			
		},
		destroy: function (alias) {
			this.deleteFromMap(alias);
			BigBlock.removeStaticBlock(alias);
		}
	};
	
}());

/*global BigBlock */
/**
 Character
 A single character object w no animation.
  
 @author Vince Allen 05-10-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC 
  
 */

BigBlock.Character = (function () {
	
	return {
		
		/**
		 * Clones the Character objects. Runs configure(). Overrides any Character properties with passed properties. Adds this object to the Blocks array.
		 * 
		 * @param {Object} params
		 */
		create: function (params) {
			var i,
				max,
				pal,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Block
				obj = new F;
			
			obj.configure(); // run configure() to inherit Block properties
									
			if (typeof params !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			obj.className = "Character"; // force the className
						
			pal = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = pal.classes.length; i < max; i++) { // get length of color palette for this color
				if (pal.classes[i].name === obj.color) {
					obj.color_max = pal.classes[i].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.color + "0"; // overwrite color_index w passed color

			obj.char_pos = BigBlock.CharPresets.getChar(obj.character, obj.font);
			
			obj.render_static = true;
			
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;

		}
	};
	
}());

/*global BigBlock */
/**
 Color
 Defines the color palette available to pixels.
  
 @author Vince Allen 12-05-2009
 
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC

 */

BigBlock.Color = (function () {
			
	/*function getPalette () {
		return palette;
	}*/
/*	function getTotalColors () {
		var i, max, total;
		total = 0;
		for (i = 0, max = this.palette.classes.length; i < max; i++) {
			total += this.palette.classes[i].val.length;
		}
		return total;
	}	*/			
	/*function addToPalette (class_name) {
		palette.classes[palette.classes.length] = class_name;
	}*/				
	
	return {
		palette: null,
		current_class : 0,
		rules_loaded: 0,	
		build : function () {
			
			var i,
				max,
				//palette = getPalette(),
				classes = this.palette.classes,
				current_class = this.current_class,
				sheet = document.styleSheets[document.styleSheets.length - 1],
				total_rules,
				total_colors;
				
			for (i in classes[current_class].val) {
				if (!classes[current_class].val[i]) {
					BigBlock.Log.display("Error: BigBlock.Color.build: invalid style rule. Check that class objects do not have empty values.");
				}
				if (classes[current_class].val.hasOwnProperty(i)) {
					BigBlock.Utils.appendCSSRule(sheet, "." + BigBlock.CSSid_color + classes[current_class].name + i, "background-color:" + classes[current_class].val[i] + ";");	
					this.rules_loaded += 1;
				}
			}
					
			this.current_class += 1;

			//total_rules = BigBlock.Utils.getCSSLength(sheet);
			
			total_colors = this.getTotalColors();
			
			BigBlock.Loader.update({
				'total' : Math.round((this.rules_loaded / (total_colors)) * 100)
			});
						
			if (this.rules_loaded < total_colors) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		add : function (params) {
			var i, max;
			try {
				if (typeof params === "undefined") {
					throw new Error("BigBlock.Color.add(): params are required.");
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			for (i = 0, max = params.classes.length; i < max; i++) {
				this.palette.classes[this.palette.classes.length] = params.classes[i];
				//addToPalette(params.classes[i]);
			}
		},
		getPalette: function () {
			return this.palette;
			//return getPalette();
		},
		getTotalColors: function () {
			var i, max, total;
			total = 0;
			for (i = 0, max = this.palette.classes.length; i < max; i++) {
				total += this.palette.classes[i].val.length;
			}
			return total;
		},
		reset: function () {
			
			var color, colors, s, i;
			
			this.palette = {'classes' : [ // default colors
				{name : 'white',val: ['rgb(255,255,255)']},
				{name : 'black',val: ['rgb(0,0,0)']},
				{name : 'black0_glass',val: ['rgb(102,102,102)']},
				{name : 'grey_dark',val: ['rgb(90,90,90)']},
				{name : 'grey_dark0_glass',val: ['rgb(140,140,140)']},
				{name : 'grey',val: ['rgb(150,150,150)']},
				{name : 'grey0_glass',val: ['rgb(200,200,200)']},		
				{name : 'grey_light',val: ['rgb(200,200,200)']},
				{name : 'grey_light0_glass',val: ['rgb(255,255,255)']},
				{name: 'red',val : ['rgb(255,0,0)']},	
				{name: 'magenta',val : ['rgb(255,0,255)']},	
				{name: 'blue',val: ['rgb(0,0,255)']},	
				{name: 'cyan',val: ['rgb(0,255,255)']},	
				{name: 'green',val: ['rgb(0,255,0)']},	
				{name: 'yellow',val: ['rgb(255,255,0)']},	
				{name: 'orange',val: ['rgb(255,126,0)']},	
				{name: 'brown',val: ['rgb(160,82,45)']},	
				{name: 'pink',val: ['rgb(238,130,238)']}									
			]};

			// default gradients
			color = 'white_black';
			this.palette.classes[this.palette.classes.length] = {'name' : {},'val' : []};
			s = "";
			for (i = 255; i > -1; i -= 50) {
				if (i - 50 > -1) {
					s += "rgb(" + i + ", " + i + ", " + i + ");";
				} else {
					s += "rgb(" + i + ", " + i + ", " + i + ")";
				}
			}
			colors = s.split(";");				

			this.palette.classes[this.palette.classes.length-1].name = color;
			this.palette.classes[this.palette.classes.length-1].val = [];

			for (i in colors) { // insert a css rule for every color
				if (colors.hasOwnProperty(i)) {
					this.palette.classes[this.palette.classes.length - 1].val[i] = colors[i];
				}
			}
			
			this.current_class = 0;	
			this.rules_loaded = 0;		
		}		
		
	};
	
}());
BigBlock.Color.reset();

/*global BigBlock, window, openDatabase */
/**
 Database object
 Provides an interface to read/write values to the browser's local storage area. Browser must be HTML 5 compliant.
  
 @author Vince Allen 12-27-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Database = (function () {

	var supported = true;

	if (typeof window.openDatabase === "undefined") {
		supported = false;
		if (BigBlock.Log) {
			BigBlock.Log.display("This browser does not support a local database.");
		}
	}	
		
	return {
		
		supported: supported,
		alias: "database",
		my_results: null,
		/**
		 * Returns a value in the localStorage.
		 * 
		 * @param {String} key
		 */				
		open: function(shortName) {
			
			try {
				if (typeof shortName === "undefined") {
					throw new Error("Database.open(): shortName argument required");
				}						
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
			try {
			    if (supported === true) {
			        this.shortName = shortName;
			        this.version = "1.0";
			        this.displayName = "Database: " + shortName;
			        this.maxSize = 65536; // in bytes
			        this.db = openDatabase(this.shortName, this.version, this.displayName, this.maxSize); // the database instance
			    }
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
		},
		/**
		 * Create a database table.
		 * 
		 * @param {String} sql
		 * 
		 */				
		createTable: function(sql) {
			
			if (this.supported === true) {
				
				try {
					if (typeof sql === "undefined") {
						throw new Error("Database.createTable(): sql argument required");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				if (typeof this.db !== "undefined") {
					this.db.transaction(function(transaction){
						/* The first query causes the transaction to (intentionally) fail if the table exists. */
						transaction.executeSql(sql, [], BigBlock.Database.nullDataHandler, BigBlock.Database.errorHandler);
					});
				}
			
			}			
			
		},
		/**
		 * Executes sql query.
		 * 
		 * @param {String} sql
		 * 
		 */				
		executeSql: function(sql){
			
			if (this.supported === true) {

				try {
					if (typeof sql === "undefined") {
						throw new Error("Database.executeSql(): sql argument required");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
								
				if (typeof this.db !== "undefined") {
					this.db.transaction(function(transaction){
						transaction.executeSql(sql, [], // array of values for the ? placeholders
						BigBlock.Database.dataHandler, BigBlock.Database.errorHandler);
					});
				}	
			
			}
			
		},
		/**
		 * Inserts data.
		 * 
		 * @param {String} table
		 * @param {String} fields
		 * @param {Array} values
		 * 
		 */				
		executeSqlInsert: function(table, fields, values) {
			
			if (this.supported === true) {

				try {
					if (typeof table === "undefined") {
						throw new Error("Database.executeSqlInsert(): table argument required");
					}
					if (typeof fields === "undefined") {
						throw new Error("Database.executeSqlInsert(): fields argument required");
					}
					if (typeof values === "undefined") {
						throw new Error("Database.executeSqlInsert(): values argument required");
					}
					if (typeof this.db === "undefined") {
						throw new Error("Database.executeSqlInsert(): database does not exist");
					}																					
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}				
				
				this.db.transaction(function(transaction) {
					
					var i, max, value_placeholders;
					
					if (fields.indexOf(",") !== -1) {
						
						value_placeholders = "";
						
						for (i = 0, max = fields.split(",").length; i < max; i++) { // get string of ?'s based on number of fields
							if (i === fields.split(",").length - 1) {
								value_placeholders = value_placeholders + "?";
							}
							else {
								value_placeholders = value_placeholders + "?,";
							}
						}
					
					} else {
						value_placeholders = "?";
					}
					var sql = "INSERT into " + table + " (" + fields + ") VALUES ( " + value_placeholders + " );";
					
					transaction.executeSql(sql, 
					values, // array of values for the ? placeholders
					BigBlock.Database.nullDataHandler, BigBlock.Database.errorHandler);
				});

			}		
			
		},		
		dataHandler: function (transaction, results) { // callbacks do NOT have access to 'this'
		    BigBlock.Database.results = results;
		},				
		/**
		 * Function called when no data is returned.
		 * 
		 */				
		nullDataHandler: function (transaction, results) {
			 
		},
		/**
		 * Function called on error.
		 * 
		 */				
		errorHandler: function (transaction, error) {
			 BigBlock.Log.display(error.code + ": " + error.message);
		}		
		
	};
	
}());

/*global BigBlock */
/**
 Emitter
 The Emitter object creates new Particle objects based on properites passed on Block.add().
 Particles are single pixels with no animation.
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.Emitter = (function () {
	
	var getTransformVariants = function (x, y, p_life, p_life_spread, p_velocity, p_velocity_spread, p_angle_spread, p_init_pos_spread_x, p_life_offset_x, p_init_pos_spread_y, p_life_offset_y) {
		
		var vars = {};
		
		var val = Math.ceil(Math.random() * ((100 - (p_life_spread * 100)) + 1)); // life spread
		vars.life = Math.ceil(p_life * ((100 - val) / 100));
							
		val = Math.ceil(Math.random() * ((100 - (p_velocity_spread * 100)) + 1)); // velocity spread
		vars.vel = p_velocity * ((100 - val) / 100);
																
		var dir = [1, -1];
		
		var d = dir[Math.getRandomNumber(0,1)];
		vars.angle_var = Math.ceil(Math.random() * (p_angle_spread + 1)) * d; // angle spread
		
		var x_d = dir[Math.getRandomNumber(0,1)];
		var adjusted_x = 0;
		if (p_init_pos_spread_x !== 0) {
			adjusted_x = Math.ceil(Math.random() * (p_init_pos_spread_x * BigBlock.Grid.blk_dim)) * x_d; // init pos spread_x	
		}
		
		var per;
		if (p_life_offset_x === 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_x)/(p_init_pos_spread_x * BigBlock.Grid.blk_dim);
			
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}
		
		var y_d = dir[Math.getRandomNumber(0,1)];
		var adjusted_y = Math.floor(Math.random() * (p_init_pos_spread_y * BigBlock.Grid.blk_dim)) * y_d; // init pos spread_y
		
		if (p_life_offset_y === 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_y)/(p_init_pos_spread_y * BigBlock.Grid.blk_dim);
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}					
		
		vars.x = x + adjusted_x;
		vars.y = y + adjusted_y;					
		
		return vars;
	};
			
	return {
		
		create: function (params) {
			var i,
				max,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Word
				obj = new F;
			
			obj.configure(); // run configure() to inherit Word properties

			//delete F.prototype.configure; // delete configure from the protoype

			// Default emitter properties
			
			obj.x = BigBlock.Grid.width/2;
			obj.y = BigBlock.Grid.height/2 + BigBlock.Grid.height/3;
			
			obj.state = "start";
				
			obj.render = 0;
			
			obj.emission_rate = 3; // values closer to 1 equal more frequent emissions
			
			obj.p_count = 0; // tracks total particles created
			
			obj.p_burst = 3;

			obj.p_velocity = 3;
			obj.p_velocity_spread = 1; // values closer to zero create more variability
			obj.p_angle = 270;
			obj.p_angle_spread = 20;
			obj.p_life = 100;
			obj.p_life_spread = 0.5; // values closer to zero create more variability
			obj.p_life_offset_x = 0; // boolean 0 = no offset; 1 = offset
			obj.p_life_offset_y = 0;	 // boolean 0 = no offset; 1 = offset		
			obj.p_gravity = 0;
			obj.p_init_pos_spread_x = 0;
			obj.p_init_pos_spread_y = 0;
			obj.p_spiral_vel_x = 0;
			obj.p_spiral_vel_y = 0;
			
			obj.action_render = function () {};
																
			if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = palette.classes.length; i < max; i++) { // get length of color palette for this color
				if (palette.classes[i].name === obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
							
			obj.action_render = function () {
				var i;
				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						if (this.clock % this.emission_rate === 0) {
							this.state = 'emit';
						}						
					break;
					case 'emit':
						
						var vars, action_render;
						
						action_render = function () {
							
							var trans = BigBlock.Utils.getParticleTransform(this.vel, this.angle, this.x, this.y, this.gravity, this.clock, this.life, this.color, this.color_max, this.p_spiral_vel_x, this.p_spiral_vel_y);
							
							this.x = trans.x;
							this.y = trans.y;
							this.color_index = trans.color_index;
							this.gravity *= 1.08;									
																
						};
						
						for (i = 0; i < this.p_burst; i++) {
							
							vars = getTransformVariants(this.x, this.y, this.p_life, this.p_life_spread, this.p_velocity, this.p_velocity_spread, this.p_angle_spread, this.p_init_pos_spread_x, this.p_life_offset_x, this.p_init_pos_spread_y, this.p_life_offset_y);
							
							BigBlock.BlockSmall.create({
								color : this.color, // particles inherit the emitter's color
								x: vars.x,
								y: vars.y,
								life : vars.life,
								gravity: this.p_gravity,
								angle: Math.degreesToRadians(this.p_angle + vars.angle_var),
								vel: vars.vel,
								color_max : this.color_max,
								p_spiral_vel_x : this.p_spiral_vel_x,
								p_spiral_vel_y : this.p_spiral_vel_y,
								action_render : action_render								
							});

							this.p_count++;

						}
						this.state = 'start';
					break;			
				}						
				
			};
			obj.start = function () {
				this.state = 'start';
			};
			obj.stop = function () {
				this.state = 'stop';
			};						
			
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;

		}
	};
	
}());

/*global BigBlock, document */
/**
 Grid
 A generic object that carries core grid properties. All grids appearing in a scene should inherit from the Grid object.
  
 Default iPhone viewport 320px X 356px
 Status bar (cannot hide) 20px
 Url bar 60px
 Button bar 44px
  
 iPhone viewport running in full screen mode (installation on home screen) 320px X 480px
  
 Full Grid running in iPhone mode 320px X 368px (40 cols X 46 cols)
 
 @author Vince Allen 7-15-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Grid = (function () {

				
	return {
		
		alias : 'Grid',
		
		blk_dim : 8, // the pixel dimensions; width & height; pixels are square
		width : 320, // grid width
		height : 368, // grid height
		
		x : 0, // will be set when grid divs are added to the dom
		y : 0,
		
		//cols : Math.round(320/8), // number of grid columns
		//rows : Math.round(368/8), // number of grid rows
				
		total_viewport_cols : false, // set in Timer
				
		//
				
		build_start_time : new Date().getTime(),
		build_end_time : new Date().getTime(),
		build_offset : 0,
		build_section_count : 0,
		//build_section_total : Math.round((184/8))/2, // replaced w Math.round(((BigBlock.Grid.width/2)/8))/2
		build_rowNum : 0,
		char_width : 8,
		char_height : 8,
		styles : {},
		div: null,
		total_rules: 0,
		count_timer: 0,
		configure : function (params) {
			var key;
			if (typeof params !== "undefined") {
				for (key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
			this.div = document.createElement("div");
		},
		setProps : function (params) {
			var i;
			if (typeof params !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
		},
		/**
		 * Allows setting specific styles after GridActive has been created and div has been added to the dom.
		 * @param key
		 * @param value
		 * 
		 */
		setStyle : function (key, value) {
			try {
				if (typeof key === "undefined") {
					throw new Error("BigBlock.Grid.setStyle(): BigBlock.Grid.setStyle(key, value) requires a style key.");
				}
				if (typeof value === "undefined") {
					throw new Error("BigBlock.Grid.setStyle(): BigBlock.Grid.setStyle(key, value) requires a style value.");
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
			}

			document.getElementById(this.viewport.id).style[key] = value;
			
			this.styles[key] = value; // save new value						
					
		},
		add: function(){
			
			var win_dim, s, viewport_div, key;
			
			this.build_start_time = new Date().getTime();
			
			win_dim = BigBlock.Utils.getWindowDim();
			
			try {	
				if (win_dim.width === false || win_dim.height === false) {
					win_dim.width = 800;
					win_dim.height = 600;
					throw new Error("BigBlock.Grid.setStyle(): Detecting window size failed. Browser does not support window.innerWidth or document.documentElement.clientWidth. Using 800 x 600.");
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		
			s = document.styleSheets[document.styleSheets.length - 1];
						
			try {
				if (s.insertRule) { // Mozilla
					s.insertRule("div#" + this.viewport.id + " {background-color:transparent;width: " + this.viewport.width + "px;height: " + this.viewport.height + "px;position: absolute;left: " + ((win_dim.width / 2) + this.viewport.left - this.width/2) + "px;top: " + ((win_dim.height / 2) + this.viewport.top - this.height/2) + "px;z-index: " + this.viewport.zIndex + "}", 0);
				} else if (s.addRule) { // IE
					s.addRule("div#" + this.viewport.id, "background-color:transparent;width: " + this.viewport.width + "px;height: " + this.viewport.height + "px;position: absolute;left: " + ((win_dim.width / 2) + this.viewport.left - this.width/2) + "px;top: " + ((win_dim.height / 2) + this.viewport.top - this.height/2) + "px;z-index: " + this.viewport.zIndex);
				} else {
					throw new Error('Cannot add grid styles: BigBlock.Grid');
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
						
			this.x = ((win_dim.width / 2) - this.width/2); // set the Grid x, y to the first viewport's x, y
			this.y = ((win_dim.height / 2) - this.height/2);
			
			viewport_div = document.createElement('div');
			viewport_div.setAttribute('id', this.viewport.id);

			for (key in this.styles) {
				if (this.styles.hasOwnProperty(key)) {
					viewport_div.style[key] = this.styles[key];
				}
			}
			
			document.body.appendChild(viewport_div); // append viewport to dom

			this.viewport.dom_ref = document.getElementById(this.viewport.id);
		
		},
		/**
		 * Creates a css rule for every position in the grid
		 * @param key
		 * @param value
		 * 
		 */		
		build : function () {
			
			this.count_timer++;
			
			BigBlock.Log.time("build"+this.count_timer);			
			
			var i,
				max,
				sheet = document.styleSheets[document.styleSheets.length - 1],
				blk_dim = BigBlock.Grid.blk_dim,
				colNum = 0,
				width = this.viewport.width,
				height = this.viewport.height,
				viewport_width = Math.round(width/blk_dim),
				viewport_height = Math.round(height/blk_dim),
				build_section_total = Math.round(height/blk_dim),
				total_rules_target = viewport_width * viewport_height;

			for (i = 0, max = ((viewport_width * viewport_height) / build_section_total) * 4; i < max; i += 1) { // loop thru row; adding multiplier speeds up build, reduces the number of times the call is made
				if (colNum < viewport_width) {
					colNum += 1;
				} else {
					colNum = 1;
				}
				
				if (i % viewport_width === 0) {
					this.build_rowNum += 1;
				}
				// consider adding rules to a document fragment and append to stylesheet after loop
				BigBlock.Utils.appendCSSRule(sheet, "." + BigBlock.CSSid_position + (i + this.build_offset), "left:" + ((colNum - 1) * blk_dim) + "px;top:" + ((this.build_rowNum - 1) * blk_dim) + "px;");

			}
			
			this.total_rules += max;		
			this.build_offset = this.total_rules;
			
			BigBlock.Loader.update({
				"total" : Math.round((this.total_rules / total_rules_target) * 100)
			});
			
			BigBlock.Log.timeEnd("build"+this.count_timer);
			
			if (this.total_rules < total_rules_target) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		buildCharStyles : function () {
			
			var i,
				max,
				col_count,
				char_width = this.char_width,
				char_height = this.char_height,
				sheet = document.styleSheets[document.styleSheets.length - 1];
			
			BigBlock.Utils.appendCSSRule(sheet, "." + BigBlock.CSSid_text_bg, "background-color: transparent;");
			BigBlock.Utils.appendCSSRule(sheet, "." + BigBlock.CSSid_char, "width: 1px;height: 1px;position: absolute;float: left;line-height: 0px;font-size: 1%;");
						
			col_count = 1;
			for (i = 0, max = char_width * char_height; i < max; i += 1) {
				
				BigBlock.Utils.appendCSSRule(sheet, "." + BigBlock.CSSid_char_pos + (i + 1), "left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;");
								
				if (col_count + 1 <= char_width) {
					col_count += 1;
				} else {
					col_count = 1;
				}
			}				
		
			return true;
		}						
				

	};
	
}());

/*global BigBlock, Image */
/**
 Interface
 Provides methods to run when passing params from one object to another.
 
 @author Vince Allen 05-28-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */
BigBlock.ImagePreloader = (function () {
	/** @lends BigBlock.ImagePreloader.prototype */
	var state = "static",
		images = {};

	return {
		state: state,
		images: images,
		/**
			@description Creates a new Image object, adds it to the 'images' property, sets the image's initial properties and adds event handlers to detect when load is complete or if an error occurs. Check the status of the entire collection of images at BigBlock.ImagePreloader.state. Check the status of specific images at BigBlock.ImagePreloader.images[name].state.
			@param {Array} params An array of images to preload formatted like: 
			[
				{
					path : "/images/", 
					name : "btn_sprite_default",
					extension: ".png"
				}
			]
		*/			
		fetch : function (params) {

			var i, max, img_name, params_required, onload, onerror, onabort;

			params_required = {name: "string", extension: "string"};

			onload = function () {
				BigBlock.ImagePreloader.images[this.name].state = "loaded";
				BigBlock.ImagePreloader.images[this.name].loaded = true;
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			onerror = function () {
				BigBlock.ImagePreloader.images[this.name].state = "error";
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			onabort = function () {
				BigBlock.ImagePreloader.images[this.name].state = "aborted";
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			for (i = 0, max = params.length; i < max; i += 1) {

				if (BigBlock.Interface.checkRequiredParams(params[i], params_required, true, "BigBlock.ImagePreloader")) { // interface

					img_name = params[i].name;
					this.images[img_name] = {};
					this.images[img_name].my_image = new Image();
					this.images[img_name].my_image.name = params[i].name;				
					this.images[img_name].state = "loading";
					this.images[img_name].loaded = false;

					this.images[img_name].my_image.onload = onload;
					this.images[img_name].my_image.onerror = onerror;
					this.images[img_name].my_image.onabort = onabort;
					this.images[img_name].my_image.src = params[i].path + params[i].name + params[i].extension; // IMPORTANT: Must set the image.src AFTER onload has been assigned to the new image object

				} else {
					this.state = "error";
				}

			}

		},
		/**
			@description Checks all image objects to see if they've loaded. If all have loaded, sets the state of BigBlock.ImagePreloader to "loaded". Each event attached to an Image object runs checkPreloaderState().
		*/
		checkPreloaderState : function () {
			var i;
			for (i in this.images) {
				if (this.images.hasOwnProperty(i)) {
					if (this.images[i].state !== "loaded") {
						return false;
					}
				}
			}
			this.state = "loaded";
		}
	};

}());


/*global BigBlock */
/**
 Interface
 Provides methods to run when passing params from one object to another.
 
 @author Vince Allen 05-28-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */			
BigBlock.Interface = (function () {
	/** @lends BigBlock.Interface.prototype */
	return {
		/**
			@description Checks the passed params match the required params. 
			@param {Object} params_passed
			@param {Object} params_required
			@param {Boolean} debug
			@returns {Boolean} True if all params match; False if any params do not match.
		 */
		checkRequiredParams : function (params_passed, params_required, debug, name) {
			var i, msg;
			for (i in params_required) { // loop thru required params
				if (params_required.hasOwnProperty(i)) {
					try {
						if (typeof params_passed[i] !== params_required[i] || params_passed[i] === "") { // if there is not a corresponding key in the passed params; or params passed value is blank 
							if (params_passed[i] === "") {
								msg = "BigBlock.Interface.checkRequiredParams: required param '" + i + "' is empty.";
							} else if (typeof params_passed[i] === "undefined") {
								msg = "BigBlock.Interface.checkRequiredParams: required param '" + i + "' is missing from passed params.";
							} else {
								msg = "BigBlock.Interface.checkRequiredParams: passed param '" + i + "' must be type " + params_required[i] + ". Passed as " + typeof params_passed[i] + ".";
							}
							if (name) {
								msg = msg + " from: " + name;
							}
							throw new Error(msg);
						}
					} catch (e) {
						if (debug) {
							BigBlock.Log.error(e);
						}
						return false;
					}
				}
			}
			return true;
		}
	};

}());


/**
 * Behavior Library
 * Returns preset behaviors
 * 
 * @author Vince Allen 12-21-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.BehaviorPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name){

				switch (name) {

					case "getRandomGraphic":
						
						/*
						 * Use to switch randomly bw an array of graphics saved as this.poses. Object must also have an idleTimeout property set to 0.
						 */
					
						return function () {
													
							if (this.idleTimeout === 0) {
								var alias = this.alias;
								this.idleTimeout = setTimeout(function(){
									var a = BigBlock.Blocks[BigBlock.getBlock(alias)];
									if (typeof(a) !== "undefined" && typeof(a.poses) !== "undefined") {
										a.goToAndStop(a.poses[Math.getRandomNumber(0, a.poses.length-1)]);
										a.idleTimeout = 0;
									}
								}, Math.getRandomNumber(500, 1000));
							}
							
						};
					
					case "move_wallCollide":
					
						/*
						 * Block will rebound off walls defined by Grid. 
						 */
						
						return function(){
							
							var vx = (this.vel * BigBlock.Grid.blk_dim) * Math.cos(this.angle);
							var vy = (this.vel * BigBlock.Grid.blk_dim) * Math.sin(this.angle);
							if (this.x + vx > 0 && this.x + vx < BigBlock.Grid.width) {
								this.x = this.x + vx;
							}
							else {
								this.vel *= 1.5;
								this.angle += Math.degreesToRadians(180);
							}
							
							if (this.y + vy > 0 && this.y + vy < BigBlock.Grid.height) {
								this.y = this.y + vy;
							}
							else {
								this.vel *= 1.5;
								this.angle += Math.degreesToRadians(180);
							}
							
							if (Math.floor(this.vel--) > 0) { // decelerate
								this.vel--;
							}
							else {
								this.vel = 0;
							}
						};
					
					
					case "move":
						return function(){
							this.x += BigBlock.Grid.blk_dim;
						};

				}				
			}
		};
	}

	return {
		install: function() {
			if(!u) { // Instantiate only if the instance doesn't exist.
				u = cnstr();
			}
			return u;
		}
	};
}());

/**
 * Character Library
 * Returns preset text characters
 * 
 * @author Vince Allen 05-10-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.CharPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getChar: function(val, font) {
				
				if (typeof(font) === 'undefined') {
					font = 'bigblock_bold';
				}
				
				var character = false;
				
				switch (font) {

					case 'bigblock_plain':	

						switch (val) {
		
							case ' ':
								character = [];
							break;
							
							case 'A':
							case 'a':
								character = [
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:18},{p:19},{p:20},{p:21},{p:25},{p:29},{p:33},{p:37}	
																
									];
							break;
							
							case 'B':
							case 'b':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:18},{p:19},{p:20},{p:25},{p:29},{p:33},{p:34},{p:35},{p:36}
																
									];
							break;					
		
							case 'C':
							case 'c':
								character = [
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:25},{p:29},{p:34},{p:35},{p:36}
																
									];
							break;
							
							case 'D':
							case 'd':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:21},{p:25},{p:29},{p:33},{p:34},{p:35},{p:36}
																
									];
							break;
		
							case 'E':
							case 'e':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:17},{p:18},{p:19},{p:25},{p:33},{p:34},{p:35},{p:36}						
									];
							break;
																											
							case 'F':
							case 'f':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:17},{p:18},{p:19},{p:25},{p:33}								
									];
							break;
							
							case 'G':
							case 'g':
								character = [
										{p:2},{p:3},{p:4},{p:5},{p:9},{p:17},{p:20},{p:21},{p:25},{p:29},{p:34},{p:35},{p:36},{p:37}								
									];
							break;					
		
							case 'H':
							case 'h':
								character = [
										{p:1},{p:5},{p:9},{p:13},{p:17},{p:18},{p:19},{p:20},{p:21},{p:25},{p:29},{p:33},{p:37}								
									];
							break;
		
							case 'I':
							case 'i':
								character = [
										{p:2},{p:3},{p:4},{p:11},{p:19},{p:27},{p:34},{p:35},{p:36}							
									];
							break;
		
							case 'J':
							case 'j':
								character = [
										{p:5},{p:13},{p:21},{p:25},{p:29},{p:26},{p:34},{p:35},{p:36}							
									];
							break;
							
							case 'K':
							case 'k':
								character = [
										{p:1},{p:5},{p:9},{p:12},{p:17},{p:18},{p:19},{p:25},{p:28},{p:33},{p:37}						
									];
							break;					
		
							case 'L':
							case 'l':
								character = [
										{p:1},{p:9},{p:17},{p:25},{p:33},{p:34},{p:35},{p:36}						
									];
							break;	
							
							case 'M':
							case 'm':
								character = [
										{p:1},{p:5},{p:9},{p:10},{p:12},{p:13},{p:17},{p:19},{p:21},{p:25},{p:29},{p:33},{p:37}						
									];
							break;
		
							case 'N':
							case 'n':
								character = [
										{p:1},{p:5},{p:9},{p:10},{p:13},{p:17},{p:19},{p:21},{p:25},{p:28},{p:29},{p:33},{p:37}						
									];
							break;
							
							case 'O':
							case 'o':
								character = [
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:21},{p:25},{p:29},{p:34},{p:35},{p:36}						
									];
							break;					
		
							case 'P':
							case 'p':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:18},{p:19},{p:20},{p:25},{p:33}						
									];
							break;
		
							case 'Q':
							case 'q':
								character = [
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:19},{p:21},{p:25},{p:28},{p:29},{p:34},{p:35},{p:36},{p:37}						
									];
							break;
		
							case 'R':
							case 'r':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:18},{p:19},{p:20},{p:25},{p:29},{p:33},{p:37}						
									];
							break;
		
							case 'S':
							case 's':
								character = [
										{p:2},{p:3},{p:4},{p:5},{p:9},{p:18},{p:19},{p:20},{p:29},{p:33},{p:34},{p:35},{p:36}						
									];
							break;
							
							case 'T':
							case 't':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:5},{p:11},{p:19},{p:27},{p:35}					
									];
							break;					
		
							case 'U':
							case 'u':
								character = [
										{p:1},{p:5},{p:9},{p:13},{p:17},{p:21},{p:25},{p:29},{p:34},{p:35},{p:36}					
									];
							break;
		
							case 'V':
							case 'v':
								character = [
										{p:1},{p:5},{p:9},{p:13},{p:17},{p:21},{p:26},{p:28},{p:35}				
									];
							break;
		
							case 'W':
							case 'w':
								character = [
										{p:1},{p:4},{p:7},{p:9},{p:12},{p:15},{p:17},{p:20},{p:23},{p:25},{p:28},{p:31},{p:34},{p:35},{p:37},{p:38}				
									];
							break;
		
							case 'X':
							case 'x':
								character = [
										{p:1},{p:5},{p:10},{p:12},{p:19},{p:26},{p:28},{p:33},{p:37}				
									];
							break;
		
							case 'Y':
							case 'y':
								character = [
										{p:1},{p:5},{p:10},{p:12},{p:19},{p:27},{p:35}				
									];
							break;
		
							case 'Z':
							case 'z':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:5},{p:12},{p:19},{p:26},{p:33},{p:34},{p:35},{p:36},{p:37}				
									];
							break;
		
							// numbers
							
							case '1':
								character = [
										{p:3},{p:10},{p:11},{p:19},{p:27},{p:35}			
									];
							break;					
		
							case '2':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:13},{p:18},{p:19},{p:20},{p:25},{p:33},{p:34},{p:35},{p:36},{p:37}			
									];
							break;	
		
							case '3':
								character = [
										{p:1},{p:2},{p:3},{p:4},{p:13},{p:18},{p:19},{p:20},{p:29},{p:33},{p:34},{p:35},{p:36}			
									];
							break;
		
							case '4':
								character = [	
										{p:3},{p:4},{p:10},{p:12},{p:17},{p:20},{p:25},{p:26},{p:27},{p:28},{p:29},{p:36}			
									];
							break;
		
							case '5':
								character = [	
										{p:1},{p:2},{p:3},{p:4},{p:5},{p:9},{p:17},{p:18},{p:19},{p:20},{p:29},{p:33},{p:34},{p:35},{p:36}			
									];
							break;
							
							case '6':
								character = [	
										{p:2},{p:3},{p:4},{p:9},{p:17},{p:18},{p:19},{p:20},{p:25},{p:29},{p:34},{p:35},{p:36}			
									];
							break;	
							
							case '7':
								character = [	
										{p:2},{p:3},{p:4},{p:5},{p:13},{p:20},{p:27},{p:35}		
									];
							break;	
							
							case '8':
								character = [	
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:18},{p:19},{p:20},{p:25},{p:29},{p:34},{p:35},{p:36}		
									];
							break;													
		
							case '9':
								character = [	
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:18},{p:19},{p:20},{p:21},{p:28},{p:34},{p:35},{p:36}		
									];
							break;
							
							case '0':
								character = [	
										{p:2},{p:3},{p:4},{p:9},{p:13},{p:17},{p:21},{p:25},{p:29},{p:34},{p:35},{p:36}		
									];
							break;
																																					
							// arrows
		
							case 'arrow_down':
								character = [
										{p:3},{p:11},{p:17},{p:19},{p:21},{p:26},{p:27},{p:28},{p:35}		
									];
							break;
							
							case 'arrow_up':
								character = [
										{p:3},{p:10},{p:11},{p:12},{p:17},{p:19},{p:21},{p:27},{p:35}		
									];
							break;					
		
							case 'arrow_left':
								character = [
										{p:3},{p:10},{p:17},{p:18},{p:19},{p:20},{p:21},{p:26},{p:35}		
									];
							break;
							
							case 'arrow_right':
								character = [
										{p:3},{p:12},{p:17},{p:18},{p:19},{p:20},{p:21},{p:28},{p:35}		
									];
							break;					
		
							// punctuation
		
							case "!":
								character = [
										{p:3},{p:11},{p:19},{p:35}
									];
							break;	
		
							case "@":
								character = [
										{p:2},{p:3},{p:4},{p:9},{p:11},{p:13},{p:17},{p:19},{p:20},{p:21},{p:25},{p:34},{p:35},{p:36}
									];
							break;
		
							case "#":
								character = [
										{p:2},{p:4},{p:9},{p:10},{p:11},{p:12},{p:13},{p:18},{p:20},{p:25},{p:26},{p:27},{p:28},{p:29},{p:34},{p:36}
									];
							break;
		
							case "$":
								character = [
										{p:2},{p:3},{p:4},{p:5},{p:9},{p:11},{p:18},{p:19},{p:20},{p:27},{p:29},{p:33},{p:34},{p:35},{p:36},{p:43}
									];
							break;
		
							case "%":
								character = [
										{p:1},{p:2},{p:4},{p:9},{p:10},{p:12},{p:19},{p:26},{p:28},{p:29},{p:34},{p:36},{p:37}
									];
							break;
		
							case "^":
								character = [
										{p:3},{p:10},{p:12}
									];
							break;
		
							case "&":
								character = [
										{p:2},{p:3},{p:9},{p:12},{p:18},{p:19},{p:25},{p:29},{p:34},{p:35},{p:36},{p:37}
									];
							break;
		
							case "*":
								character = [
										{p:3},{p:9},{p:11},{p:13},{p:18},{p:19},{p:20},{p:25},{p:27},{p:29},{p:35}
									];
							break;
		
							case "(":
								character = [
										{p:3},{p:10},{p:18},{p:26},{p:35}
									];
							break;
							
							case ")":
								character = [
										{p:3},{p:12},{p:20},{p:28},{p:35}
									];
							break;	
							
							case "-":
								character = [
										{p:18},{p:19},{p:20}
									];
							break;									
		
							case "_":
								character = [
										{p:34},{p:35},{p:36},{p:37}
									];
							break;
							
							case "=":
								character = [
										{p:10},{p:11},{p:12},{p:13},{p:26},{p:27},{p:28},{p:29}								
									];
							break;					
		
							case "+":
								character = [
										{p:3},{p:11},{p:17},{p:18},{p:19},{p:20},{p:21},{p:27},{p:35}								
									];
							break;	
		
							case ";":
								character = [
										{p:3},{p:27},{p:34}							
									];
							break;
		
							case ":":
								character = [
										{p:11},{p:35}							
									];
							break;
		
							case "'":
								character = [
										{p:3},{p:10},{p:18}	
									];
							break;
																																																																																				
							case ',':
								character = [
										{p:34},{p:41}			
									];
							break;
							
							case ".":
								character = [
										{p:33}	
									];
							break;	
		
							case '<':
								character = [
										{p:3},{p:10},{p:17},{p:26},{p:35}		
									];
							break;
		
							case '>':
								character = [
										{p:3},{p:12},{p:21},{p:28},{p:35}		
									];
							break;
		
							case "/":
								character = [
										{p:4},{p:12},{p:19},{p:26},{p:34}
									];
							break;	
																						
							case "?":
								character = [
										{p:1},{p:2},{p:3},{p:12},{p:18},{p:19},{p:34}
									];
							break;																			
		
							case "{":
								character = [
										{p:3},{p:4},{p:11},{p:18},{p:27},{p:35},{p:36}
									];
							break;
		
							case "}":
								character = [
										{p:2},{p:3},{p:11},{p:20},{p:27},{p:34},{p:35}
									];
							break;	
							
							case "[":
								character = [
										{p:3},{p:4},{p:11},{p:19},{p:27},{p:35},{p:36}
									];
							break;
		
							case "]":
								character = [
										{p:2},{p:3},{p:11},{p:19},{p:27},{p:34},{p:35}
									];
							break;
		
							case "|":
								character = [
										{p:3},{p:11},{p:19},{p:27},{p:35}
									];
							break;

							// currency
							
							case "currency_cents":
								character = [
									{p:2},{p:9},{p:10},{p:11},{p:17},{p:25},{p:26},{p:27},{p:34}
									];
							break;
																																																																																																																												
							default:
								
							break;					
						}
					
						break;
										
					case 'bigblock_bold':					
				
						switch (val) {
		
							case ' ':
								character = [];
							break;
							
							case 'A':
							case 'a':
								character = [
									{p : 4},{p : 5},{p : 12},{p : 13},{p : 18},{p : 19},{p : 22},{p : 23},{p : 26},{p : 27},{p : 30},{p : 31},{p : 34},{p : 35},{p : 36},{p : 37},{p : 38},{p : 39},{p : 42},{p : 43},{p : 44},{p : 45},{p : 46},{p : 47},{p : 50},{p : 51},{p : 54},{p : 55},{p : 58},{p : 59},{p : 62},{p : 63}														
									];
							break;
							
							case 'B':
							case 'b':
								character = [
									{p:2},{p:3},{p:10},{p:11},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}														
									];
							break;					
		
							case 'C':
							case 'c':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:42},{p:43},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}														
									];
							break;
							
							case 'D':
							case 'd':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:10},{p:11},{p:12},{p:13},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:58},{p:59},{p:60},{p:61}														
									];
							break;
		
							case 'E':
							case 'e':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}					
									];
							break;
																											
							case 'F':
							case 'f':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:58},{p:59}								
									];
							break;
							
							case 'G':
							case 'g':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}								
									];
							break;					
		
							case 'H':
							case 'h':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}							
									];
							break;
		
							case 'I':
							case 'i':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:20},{p:21},{p:28},{p:29},{p:36},{p:37},{p:44},{p:45},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}							
									];
							break;
		
							case 'J':
							case 'j':
								character = [
									{p:6},{p:7},{p:14},{p:15},{p:22},{p:23},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}							
									];
							break;
							
							case 'K':
							case 'k':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}						
									];
							break;					
		
							case 'L':
							case 'l':
								character = [
									{p:2},{p:3},{p:10},{p:11},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:42},{p:43},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}						
									];
							break;	
							
							case 'M':
							case 'm':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}						
									];
							break;
		
							case 'N':
							case 'n':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:10},{p:11},{p:12},{p:13},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}						
									];
							break;
							
							case 'O':
							case 'o':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}					
									];
							break;					
		
							case 'P':
							case 'p':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:58},{p:59}						
									];
							break;
		
							case 'Q':
							case 'q':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:54},{p:55},{p:62},{p:63}						
									];
							break;
		
							case 'R':
							case 'r':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}						
									];
							break;
		
							case 'S':
							case 's':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:36},{p:37},{p:38},{p:39},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}						
									];
							break;
							
							case 'T':
							case 't':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:20},{p:21},{p:28},{p:29},{p:36},{p:37},{p:44},{p:45},{p:52},{p:53},{p:60},{p:61}					
									];
							break;					
		
							case 'U':
							case 'u':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}					
									];
							break;
		
							case 'V':
							case 'v':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:52},{p:53},{p:60},{p:61}				
									];
							break;
		
							case 'W':
							case 'w':
								character = [
									{p:1},{p:2},{p:7},{p:8},{p:9},{p:10},{p:15},{p:16},{p:17},{p:18},{p:23},{p:24},{p:25},{p:26},{p:31},{p:32},{p:33},{p:34},{p:37},{p:38},{p:39},{p:40},{p:41},{p:42},{p:45},{p:46},{p:47},{p:48},{p:49},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:56},{p:57},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63},{p:64}				
									];
							break;
		
							case 'X':
							case 'x':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:36},{p:37},{p:44},{p:45},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}				
									];
							break;
		
							case 'Y':
							case 'y':
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:36},{p:37},{p:44},{p:45},{p:52},{p:53},{p:60},{p:61}				
									];
							break;
		
							case 'Z':
							case 'z':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:20},{p:21},{p:22},{p:23},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}				
									];
							break;
		
							// numbers
							
							case '1':
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:18},{p:19},{p:20},{p:21},{p:26},{p:27},{p:28},{p:29},{p:36},{p:37},{p:44},{p:45},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}			
									];
							break;					
		
							case '2':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:22},{p:23},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}			
									];
							break;	
		
							case '3':
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:22},{p:23},{p:30},{p:31},{p:36},{p:37},{p:38},{p:39},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}			
									];
							break;
		
							case '4':
								character = [	
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:54},{p:55},{p:62},{p:63}			
									];
							break;
		
							case '5':
								character = [	
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:52},{p:53},{p:54},{p:55},{p:60},{p:61},{p:62},{p:63}			
									];
							break;
							
							case '6':
								character = [	
									{p:2},{p:3},{p:10},{p:11},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}			
									];
							break;	
							
							case '7':
								character = [	
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:22},{p:23},{p:30},{p:31},{p:38},{p:39},{p:46},{p:47},{p:54},{p:55},{p:62},{p:63}		
									];
							break;	
							
							case '8':
								character = [	
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}		
									];
							break;													
		
							case '9':
								character = [	
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:54},{p:55},{p:62},{p:63}	
									];
							break;
							
							case '0':
								character = [	
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:22},{p:23},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}		
									];
							break;
																																					
							// arrows
		
							case 'arrow_down':
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:20},{p:21},{p:28},{p:29},{p:33},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:40},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:51},{p:52},{p:53},{p:54},{p:60},{p:61}		
									];
							break;
							
							case 'arrow_up':
								character = [
									{p:4},{p:5},{p:11},{p:12},{p:13},{p:14},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:25},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:32},{p:36},{p:37},{p:44},{p:45},{p:52},{p:53},{p:60},{p:61}		
									];
							break;					
		
							case 'arrow_left':
								character = [
									{p:4},{p:11},{p:12},{p:18},{p:19},{p:20},{p:25},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:32},{p:33},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:40},{p:42},{p:43},{p:44},{p:51},{p:52},{p:60}		
									];
							break;
							
							case 'arrow_right':
								character = [
									{p:5},{p:13},{p:14},{p:21},{p:22},{p:23},{p:25},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:32},{p:33},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:40},{p:45},{p:46},{p:47},{p:53},{p:54},{p:61}		
									];
							break;					
		
							// punctuation
		
							case "!":
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:20},{p:21},{p:28},{p:29},{p:52},{p:53},{p:60},{p:61}
									];
							break;	
		
							case "@":
								character = [
									{p:3},{p:4},{p:5},{p:6},{p:11},{p:12},{p:13},{p:14},{p:17},{p:18},{p:21},{p:22},{p:23},{p:24},{p:25},{p:26},{p:29},{p:30},{p:31},{p:32},{p:33},{p:34},{p:41},{p:42},{p:51},{p:52},{p:53},{p:54},{p:59},{p:60},{p:61},{p:62}
									];
							break;
		
							case "#":
								character = [
		
									{p:2},{p:3},{p:6},{p:7},{p:9},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:16},{p:17},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:24},{p:26},{p:27},{p:30},{p:31},{p:34},{p:35},{p:38},{p:39},{p:41},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:48},{p:49},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:56},{p:58},{p:59},{p:62},{p:63}
									];
							break;
		
							case "$":
								character = [
									{p:4},{p:5},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:20},{p:21},{p:22},{p:27},{p:28},{p:29},{p:36},{p:37},{p:38},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:60},{p:61}
									];
							break;
		
							case "%":
								character = [
									{p:2},{p:3},{p:6},{p:7},{p:10},{p:11},{p:14},{p:15},{p:22},{p:23},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:42},{p:43},{p:50},{p:51},{p:54},{p:55},{p:58},{p:59},{p:62},{p:63}
									];
							break;
		
							case "^":
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:19},{p:20},{p:21},{p:22},{p:27},{p:28},{p:29},{p:30},{p:34},{p:35},{p:38},{p:39},{p:42},{p:43},{p:46},{p:47}
									];
							break;
		
							case "&":
								character = [
									{p:3},{p:4},{p:11},{p:12},{p:17},{p:18},{p:21},{p:22},{p:25},{p:26},{p:27},{p:28},{p:29},{p:30},{p:35},{p:36},{p:41},{p:42},{p:47},{p:48},{p:49},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:56},{p:59},{p:60},{p:61},{p:62}
									];
							break;
		
							case "*":
								character = [
									{p:4},{p:10},{p:12},{p:14},{p:20},{p:21},{p:25},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:35},{p:36},{p:37},{p:42},{p:44},{p:46},{p:52}
									];
							break;
		
							case "(":
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:18},{p:19},{p:26},{p:27},{p:34},{p:35},{p:42},{p:43},{p:52},{p:53},{p:60},{p:61}
									];
							break;
							
							case ")":
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:22},{p:23},{p:30},{p:31},{p:38},{p:39},{p:46},{p:47},{p:52},{p:53},{p:60},{p:61}
									];
							break;	
							
							case "-":
								character = [
									{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39}
									];
							break;									
		
							case "_":
								character = [
									{p:50},{p:51},{p:52},{p:53},{p:54},{p:55},{p:58},{p:59},{p:60},{p:61},{p:62},{p:63}
									];
							break;
							
							case "=":
								character = [
									{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:18},{p:19},{p:20},{p:21},{p:22},{p:23},{p:42},{p:43},{p:44},{p:45},{p:46},{p:47},{p:50},{p:51},{p:52},{p:53},{p:54},{p:55}								
									];
							break;					
		
							case "+":
								character = [
									{p:12},{p:13},{p:20},{p:21},{p:26},{p:27},{p:28},{p:29},{p:30},{p:31},{p:34},{p:35},{p:36},{p:37},{p:38},{p:39},{p:44},{p:45},{p:52},{p:53}								
									];
							break;	
		
							case ";":
								character = [
									{p:12},{p:13},{p:20},{p:21},{p:36},{p:37},{p:44},{p:45},{p:50},{p:51},{p:58},{p:59}							
									];
							break;
		
							case ":":
								character = [
									{p:12},{p:13},{p:20},{p:21},{p:44},{p:45},{p:52},{p:53}							
									];
							break;
		
							case "'":
								character = [
									{p:6},{p:7},{p:14},{p:15},{p:20},{p:21},{p:28},{p:29}	
									];
							break;
																																																																																				
							case ',':
								character = [
									{p:37},{p:38},{p:45},{p:46},{p:51},{p:52},{p:59},{p:60}			
									];
							break;
							
							case ".":
								character = [
									{p:52},{p:53},{p:60},{p:61}	
									];
							break;	
		
							case '<':
								character = [
									{p:14},{p:15},{p:20},{p:21},{p:22},{p:23},{p:26},{p:27},{p:28},{p:29},{p:34},{p:35},{p:36},{p:37},{p:44},{p:45},{p:46},{p:47},{p:54},{p:55}		
									];
							break;
		
							case '>':
								character = [
									{p:10},{p:11},{p:18},{p:19},{p:20},{p:21},{p:28},{p:29},{p:30},{p:31},{p:36},{p:37},{p:38},{p:39},{p:42},{p:43},{p:44},{p:45},{p:50},{p:51}		
									];
							break;
		
							case "/":
								character = [
									{p:5},{p:6},{p:13},{p:14},{p:20},{p:21},{p:28},{p:29},{p:35},{p:36},{p:43},{p:44},{p:50},{p:51},{p:58},{p:59}
									];
							break;	
																						
							case "?":
								character = [
									{p:2},{p:3},{p:4},{p:5},{p:6},{p:7},{p:10},{p:11},{p:12},{p:13},{p:14},{p:15},{p:22},{p:23},{p:30},{p:31},{p:36},{p:37},{p:44},{p:45},{p:60},{p:61}
									];
							break;																			
		
							case "{":
								character = [
									{p:5},{p:6},{p:13},{p:14},{p:20},{p:21},{p:27},{p:28},{p:29},{p:35},{p:36},{p:37},{p:44},{p:45},{p:53},{p:54},{p:61},{p:62}
									];
							break;
		
							case "}":
								character = [
									{p:3},{p:4},{p:11},{p:12},{p:20},{p:21},{p:28},{p:29},{p:30},{p:36},{p:37},{p:38},{p:44},{p:45},{p:51},{p:52},{p:59},{p:60}
									];
							break;	
							
							case "[":
								character = [
									{p:3},{p:4},{p:5},{p:6},{p:11},{p:12},{p:13},{p:14},{p:19},{p:20},{p:27},{p:28},{p:35},{p:36},{p:43},{p:44},{p:51},{p:52},{p:53},{p:54},{p:59},{p:60},{p:61},{p:62}
									];
							break;
		
							case "]":
								character = [
									{p:3},{p:4},{p:5},{p:6},{p:11},{p:12},{p:13},{p:14},{p:21},{p:22},{p:29},{p:30},{p:37},{p:38},{p:45},{p:46},{p:51},{p:52},{p:53},{p:54},{p:59},{p:60},{p:61},{p:62}
									];
							break;
		
							case "|":
								character = [
									{p:4},{p:5},{p:12},{p:13},{p:20},{p:21},{p:28},{p:29},{p:36},{p:37},{p:44},{p:45},{p:52},{p:53},{p:60},{p:61}
									];
							break;
							
							// currency
							
							case "currency_cents":
								character = [
									{p:3},{p:4},{p:9},{p:10},{p:11},{p:12},{p:13},{p:14},{p:17},{p:18},{p:19},{p:20},{p:21},{p:22},{p:25},{p:26},{p:33},{p:34},{p:41},{p:42},{p:43},{p:44},{p:45},{p:46},{p:49},{p:50},{p:51},{p:52},{p:53},{p:54},{p:59},{p:60}
									];
							break;
																																																																																																																					
							default:
								
							break;					
						}
				
				
					break;
					
				}
				
				return character;				
			}
		};
	}

	return {
		install: function() {
			if(!u) { // Instantiate only if the instance doesn't exist.
				u = cnstr();
			}
			return u;
		}
	};
}());

/**
 * Emitter Library
 * Returns preset Emitters
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.EmitterPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name, params) {
				var i;
				var grid = BigBlock.Grid;
				var em = {};
				
				switch (name) {
				
					case 'fire':
						em = {
							color : 'fire',
							x: grid.width / 2,
							y: grid.height / 1.25,
							life: 0,
							emission_rate: 1,
							//
							p_burst: 16,
							p_velocity: 1.5,
							p_velocity_spread: 0.1, // values closer to zero create more variability
							p_angle: 270,
							p_angle_spread: 0,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0
			
						};
					break;
					
					case 'spark':
						em = {
							color : 'fire',
							x: grid.width / 2,
							y: grid.height / 1.25,
							life: 0,
							emission_rate: 50,
							//
							p_burst: 1,
							p_velocity: 1.5,
							p_velocity_spread: 1, // values closer to zero create more variability
							p_angle: 270,
							p_angle_spread: 0,
							p_life: 25,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 1,
							p_spiral_vel_y : 0
			
						};
					break;

					case 'speak':
						em = {
							color : 'speak',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: 0.75, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 15,
							p_life: 12,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 0, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 0,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0	
						};
					break;		
					
					case 'trail_red':
						em = {
							color : 'red_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: 0.1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0						
						};
					break;
					
					case 'trail_white':
						em = {
							color : 'white_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: 0.1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0						
						};
					break;
							
					default:
						try {		
							throw new Error("BigBlock.EmitterPresets.getPreset(): BigBlock.EmitterPresets: preset does not exist.");
						} catch(e) {
							BigBlock.Log.display(e.name + ": " + e.message);
						}
					break;					
				}
				
				// Params
				if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
					for (i in params) {
						if (params.hasOwnProperty(i)) {
							em[i] = params[i];
						}
					}
				}
				
				return em;				
			}
		};
	}

	return {
		install: function() {
			if(!u) { // Instantiate only if the instance doesn't exist.
				u = cnstr();
			}
			return u;
		}
	};
})();

/*global BigBlock, window, document */
/**
 Loader object
 Renders loading info to a div in the DOM
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */
BigBlock.Loader = (function () {
	
	return {
		
		id : 'loader',
		class_name : 'loader_container',
		style : {
			position : 'absolute',
			backgroundColor : 'transparent',
			border : '1px solid #aaa',
			padding : '2px',
			textAlign : 'center',
			color: '#aaa'
		},
		style_bar : {
			fontSize: '1%',
			position: 'absolute',
			top: '2px',
			left: '2px',
			backgroundColor: '#999',
			color: '#999',
			height: '10px',
			cssFloat: 'left'
		},
		width : 100,
		height : 10,
		format : 'percentage',
		total : 0,
		msg : '&nbsp;',
		bar_color : '#999',
		
		add: function(){	
			
			var key;
			
			try {	
				if (window.innerWidth) { // mozilla
					this.style.left = (window.innerWidth / 2 - (this.width / 2)) + 'px';	
					this.style.top = (window.innerHeight / 2 - (this.height / 2)) + 'px';
				} else if (document.documentElement.clientWidth) { // IE
					this.style.left = (document.documentElement.clientWidth / 2 - (this.width / 2)) + 'px';	
					this.style.top = (document.documentElement.clientHeight / 2 - (this.height / 2)) + 'px';								
				} else {
					this.style.left = '350px';
					this.style.top = '195px';
					throw new Error('Err: LA001');
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
			this.style.width = this.width + 'px';
			this.style.height = this.height + 'px';
						
			var lc = document.createElement("div"); // create loader container div
			lc.setAttribute('id', this.id);			
			lc.setAttribute('class', this.class_name);
			if (typeof document.addEventListener !== 'function') { // test for IE
				lc.setAttribute('className', this.class_name); // IE6
			}
														
			var b = document.getElementsByTagName('body').item(0);
			b.appendChild(lc); // add loader container to body

			var l = document.createElement("div"); // create loader
			l.setAttribute('id', this.id + '_bar');			
			l.setAttribute('class', this.class_name + '_bar');
			if (typeof document.addEventListener !== 'function') { // test for IE
				l.setAttribute('className', this.class_name + '_bar'); // IE6
			}
		
			var lc_ = document.getElementById(this.id);
			lc_.appendChild(l); // add loader to loader container
									
			for (key in this.style) { // loop thru styles and apply
				if (this.style.hasOwnProperty(key)) {
					document.getElementById(this.id).style[key] = this.style[key];
				}
			}
			
			for (key in this.style_bar) { // loop thru styles and apply
				if (this.style_bar.hasOwnProperty(key)) {
					document.getElementById(this.id + '_bar').style[key] = this.style_bar[key];
				}
			}

			document.getElementById(this.id + '_bar').style.cssFloat = 'left';
				
			
		},
		update: function (params) {
			if (typeof(params) !== 'undefined') {
				if (typeof(params.total) !== 'undefined') {
					this.total = params.total;
				}
			}
			var width = (this.total/100) * 100;
			document.getElementById(this.id+'_bar').style.width = width + 'px';
		}
	};
	
}());

/*global BigBlock, window, localStorage */
/**
 LocalStorage object
 Provides an interface to read/write values to the browser's local storage area. Browser must be HTML 5 compliant.
  
 @author Vince Allen 12-27-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC

 */
BigBlock.LocalStorage = (function () {

	var supported = true;

	if (typeof(window.localStorage) === "undefined") {
		supported = false;
		BigBlock.Log.display("This browser does not support localStorage.");
	}
		
	return {
		
		supported: supported,
		alias: "local_storage",
		/**
		 * Returns a value in the localStorage.
		 * 
		 * @param {String} key
		 */				
		getItem: function(key) {
			if (this.supported === true) {
				try {
					return localStorage.getItem(key);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		},
		/**
		 * Sets a value in the localStorage.
		 * 
		 * @param {String} key
		 * @param {String} value
		 * 
		 */				
		setItem: function(key, value) {
			if (this.supported === true) {
				try {
					return localStorage.setItem(key, value);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		},
		/**
		 * Removes a key/value pair in the localStorage.
		 * 
		 * @param {String} key
		 * 
		 */				
		removeItem: function(key) {
			if (this.supported === true) {
				try {
					return localStorage.removeItem(key);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		}
,
		/**
		 * Clears the entire localStorage.
		 * 
		 * 
		 */				
		clear: function() {
			if (this.supported === true) {
				try {
					return localStorage.clear();
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		}		
		
	};
	
}());



/*global BigBlock, document */
/**
 RenderManager object
 Renders pixels to the grid.
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.RenderMgr = (function () {
																		
	return {
		last_rendered_div: null,
		grid_static_fragment: null,
		grid_text_fragment: null,
		render_rate_test_array : [],		 
		renderBlocks : function (blocksToRender) {		
			
			var i, i_max, start, div_id, obj, blk, y, y_max;
			
			if (BigBlock.Timer.debug_frame_rate) {
				start = new Date().getTime();
			}
			
			// BLOCKS LOOP
			
			this.grid_static_fragment = document.createDocumentFragment();
			this.grid_text_fragment = document.createDocumentFragment();
			
			
			// loop thru all existing non-text objects
			div_id = 0;
						
			for (i = 0, i_max = blocksToRender.length; i < i_max; i += 1) {
							
				obj = blocksToRender[i];
				
				if (obj.img === false) { // if BlockSmall; 
					
					if (obj.pix_index !== false) { // if BlockSmall is on screen
					
						if (obj.render_static) {
							
							switch (obj.className) {
								case 'Character':
									this.renderChar(div_id, obj, obj.color_index, 0);
									
								break;
									
								default:
									this.renderStaticBlock(obj, obj.color_index, 0);
								break;
							}
														
						} else {
							this.renderActiveBlock(div_id, obj, obj.color_index, 0);
							div_id += 1; // increment the div_id															
						}
					
					}						
					
				} else { // BlockAnim or BlockBig
					
					for (y = 0, y_max = obj.img.pix.length; y < y_max; y += 1) { // loop thru blocks attached to this Object							
						
						blk = obj.img.pix[y];
						
						if (obj.render_static) {
							this.renderStaticBlock(obj, blk.c, blk.i);
						} else {
							this.renderActiveBlock(div_id, obj, blk.c, blk.i);
							div_id += 1; // increment the div_id
						}

					}					
					
				}
										
				if (obj.render_static && typeof obj.img !== "undefined") { // if this is a static object and the object has its img property
					obj.render_static = false; // MUST set the static property = 0; static Blocks will not be deleted
					obj.destroy(); // destroy the Block
				}			
			}
			
			document.getElementById(BigBlock.GridStatic.viewport.id).appendChild(this.grid_static_fragment); // append the static block to the Static Grid
			document.getElementById(BigBlock.GridText.viewport.id).appendChild(this.grid_text_fragment); // add character to dom
			
			this.last_rendered_div = BigBlock.GridActive.viewport.last_el; // store the last rendered id; will use for cleanup							
			BigBlock.GridActive.viewport.last_el = false; // reset viewport's last element
			
			
			//  reset the remaining live divs 
			if (this.last_rendered_div) {
				while (this.last_rendered_div.nextSibling !== null) { // while the last rendered div has a sibling
					i = this.last_rendered_div.nextSibling; // get the sibling
					this.setBlockAttribute(i, "class", "pix color i0"); // reset its class
					this.last_rendered_div = i; // set this.last_rendered_div equal to the div we just reset; this.last_rendered_div should eventually run out of siblings
				}
			}		
		},
		renderActiveBlock: function (id, obj, color, offset) {
			
			var x, y, index, d;

			if ((obj.img !== false && obj.is_position_updated) !== false || obj.is_anim_updated !== false) { // only Block Anim should call getPixLoc
				x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
				y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
				index = BigBlock.Utils.getPixIndex(x, y);
			} else {
				x = obj.x;
				y = obj.y;
				index = obj.pix_index;
			}
			
			if (BigBlock.Utils.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
					
				if (obj.is_position_updated || obj.is_anim_updated || obj.is_color_updated) {	// always redrawing active blocks even if they do not move or change color; uncomment to check for is_ properties			
										
					if (BigBlock.GridActive.viewport.last_el) {
						d = BigBlock.GridActive.viewport.last_el.nextSibling;
					} else {
						d = BigBlock.GridActive.viewport.dom_ref.firstChild;
					}
					BigBlock.GridActive.viewport.last_el = d;							

					this.setBlockAttribute(d, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);				
				}																														
			
			} else {
				return false;
			}		
		},
		renderStaticBlock: function (obj, color, offset) {
			
			var x, y, index, child;
			
			x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
	
			if (BigBlock.Utils.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
				
				index = BigBlock.Utils.getPixIndex(x, y);
				
				child = BigBlock.GridStatic.div.cloneNode(false); // dom method; clone a div element
				
				this.setBlockAttribute(child, 'id', '_static'); // all static blocks have the same id
				this.setBlockAttribute(child, 'name', obj.alias); // set the block name to alias of the object; used to remove static blocks
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);
				
				this.grid_static_fragment.appendChild(child); // append the static block to the Static Grid doc fragment
				
			} else {
				return false;
			}	
		},
		renderChar: function (id, obj, color, offset) {
			
			var x, y, index, child, char_pos, k, k_max, char_div, gl_limit;
			
			x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
			
			if (BigBlock.Utils.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height) && y < BigBlock.GridStatic.height) { // check that block is on screen
			
				index = BigBlock.Utils.getPixIndex(x, y);
				
				child = BigBlock.GridText.div.cloneNode(false); // dom method; clone a div element	
				//this.setBlockAttribute(child, 'id', BigBlock.Utils.getUniqueId()); // uncomment to give each text div a unique id
				this.setBlockAttribute(child, 'name', obj.word_id);	
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_text_bg + ' ' + BigBlock.CSSid_position + index);
				
				char_pos = obj.char_pos; // get positions of all divs in the character
				
				for (k = 0, k_max = char_pos.length; k < k_max; k += 1) {
					char_div = BigBlock.GridText.div.cloneNode(false); // dom method; create a div for each block in the letter
					
					gl_limit = BigBlock.Grid.blk_dim * 4; // check for glass													
					
					if (char_pos[k].p < gl_limit && obj.glass === true) {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color + '_glass0');														
					} else {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color);																										
					}
					child.appendChild(char_div); // add the character div to the Block's div							
				}
				
				this.grid_text_fragment.appendChild(child); // add character to text doc fragment
										
			}			
		},
		setBlockAttribute: function (obj, key, val) {
			if (typeof obj !== "object" || obj === null) {
				return false;
			} else {
				obj.setAttribute(key, val);
				if (typeof document.addEventListener !== "function" && key === "class") { // test for IE					
					obj.setAttribute("className", val); // IE
					obj.innerHTML = "."; // IE6
				}				
			}
		},
		/**
		 * clearScene() will clear all divs from all viewports, empty the Blocks array, and empty the Button.map property
		 * 
		 * @param {Function} beforeClear
		 * @param {Function} afterClear
		 */
		clearScene: function(before, after) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof before !== "undefined" && before !== null) {
						if (typeof before !== "function") {
							throw new Error("BigBlock.RenderMgr.clearScene(beforeClear, afterClear): beforeClear must be a function");
						} else {
							before();
						}
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				if (typeof BigBlock.GridStatic !== "undefined") {
					document.getElementById(BigBlock.GridStatic.viewport.id).innerHTML = "";	
					BigBlock.GridStatic.setStyle("backgroundColor", "transparent");
				}
				
				if (typeof BigBlock.GridText !== "undefined") {
					document.getElementById(BigBlock.GridText.viewport.id).innerHTML = "";
					BigBlock.GridText.setStyle("backgroundColor", "transparent");
				}
				
				// never remove divs from GridActive
				
				if (typeof BigBlock.Blocks !== "undefined") { // clear Block array
					BigBlock.Blocks = {};
				}
				
				if (typeof BigBlock.BlocksKeys !== "undefined") { // clear Block Keys array
					BigBlock.BlocksKeys = [];
				}				
				
				if (typeof BigBlock.Button.map !== "undefined") { // clear Button.map array
					BigBlock.Button.map = [];
				}
					
				try {	
					if (typeof after !== "undefined" && after !== null) {
						if (typeof after !== "function") {
							throw new Error("BigBlock.RenderMgr.clearScene(beforeClear, afterClear): afterClear must be a function.");
						} else {
							after();
						}
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ": " + er.message);
				}
				
				//
				
				BigBlock.inputBlock = false; // release user input block	
		}	
					
	};
	
}());

/*global BigBlock, document */
/**
 ScreenEvent object
 Defines all events.
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.ScreenEvent = (function () {
	
	var event_buffer, inputFeedback, removeListensers, getEventLocation, checkButtonAction, checkBlockAction, checkInputBlock, preventDefault, stopPropagation;
	
	// use may NOT configure these options

	event_buffer = 200; // default event buffer in milliseconds
		
	inputFeedback = function (evt_x, evt_y) {
		if (BigBlock.Timer.input_feedback === true) { // INPUT FEEDBACK
			BigBlock.BlockSmall.create({
				x: evt_x,
				y: evt_y,
				life: 10,
				color: "white_black"
			});
		}			
	};
	
	removeListensers = function (event_name, event) {
		BigBlock.Utils.removeEventHandler(BigBlock.GridActive.viewport.dom_ref, event_name, event);
		
	//	var q = BigBlock.GridActive.viewport.dom_ref; // remove listeners from viewport
	//	if (q.removeEventListener) {
	//		q.removeEventListener(event_name, event, false);
	//	} // IE does not have an equivalent event; 07-22-2010							
	};
	
	getEventLocation = function (event) {
		var evt_loc = {
			x: false,
			y: false
		};
		if (typeof BigBlock.GridActive !== 'undefined') {
			evt_loc.x = event.clientX - BigBlock.GridActive.x;
			evt_loc.y = event.clientY - BigBlock.GridActive.y;
		}
		return evt_loc;
	};
	
	checkButtonAction = function (evt_x, evt_y, event) {
		
		var i, max, x1, y1, x2, y2;
				
		// Check the Button object to see if any objects exist 
		// and if the event location is within any rects contained in Button.map								
		if (typeof BigBlock.Button !== "undefined" && typeof BigBlock.Button.map !== "undefined") {
			for (i = 0, max = BigBlock.Button.map.length; i < max; i++) {
				x1 = BigBlock.Button.map[i].x;
				y1 = BigBlock.Button.map[i].y;
				x2 = x1 + BigBlock.Button.map[i].width;	
				y2 = y1 + BigBlock.Button.map[i].height;										
				if (BigBlock.Utils.ptInsideRect(evt_x, evt_y, x1, x2, y1, y2) && BigBlock.Button.map[i].action_input !== false) {
					BigBlock.Button.map[i].action_input(event, BigBlock.Button.map[i]);
					return false; // do not fire any more events; only one button at any time
				}
			}
		}							
		return true;
	};
	
	checkBlockAction = function (evt_x, evt_y, event) {
		
		var i, max, x, y, width, height;
		
		// loops thru Block and looks for action_inputs
		for (i = 0, max = BigBlock.BlocksKeys.length; i < max; i++) {
			if (typeof BigBlock.Blocks[BigBlock.BlocksKeys[i]] !== "undefined" && typeof BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input !== 'undefined' && BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input !== false && typeof BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input === "function") {
				x = BigBlock.Blocks[BigBlock.BlocksKeys[i]].x;
				y = BigBlock.Blocks[BigBlock.BlocksKeys[i]].y;
				width = BigBlock.Blocks[BigBlock.BlocksKeys[i]].width;
				height = BigBlock.Blocks[BigBlock.BlocksKeys[i]].height;	
				if (typeof width === "undefined") {
					width = BigBlock.Grid.blk_dim;
				}
				if (typeof height === "undefined") {
					height = BigBlock.Grid.blk_dim;
				}												
				if (BigBlock.Utils.ptInsideRect(evt_x, evt_y, x, (x + width), y, (y + height))) {
					
					BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input(event);
					return false; // do not fire any more events; only one button at any time
				}											
			}
		}
		return true;							
	};	
	
	checkInputBlock = function () {
		if (BigBlock.inputBlock === true) {
			return false; // check to block user input
		}
		return true;		
	};
	
	preventDefault = function (event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}		
	};
	
	stopPropagation = function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}		
	};
	
	return {

		current_frame : 0,
		resetCurrentFrame : function () {
			this.current_frame = 0;
		},
		screen_mouseup : false,	
		screen_mousedown : false,	
		screen_mousemove : false,	
		screen_touchstart : false,	
		screen_touchmove : false,	
		screen_touchend : false,
		screen_click : false,
		frameAdvance : function (event, x, y) {
					
		},			
		create: function (params) {
			
			this.alias = "ScreenEvent"; // DO NOT REMOVE; Timer checks BigBlock.ScreenEvent.alias to determine if BigBlock.ScreenEvent has been created in the html file
			
			this.evtListener = [];
			
			this.screen_mouseup = BigBlock.ScreenEvent.screen_mouseup;			
			this.screen_mousedown = BigBlock.ScreenEvent.screen_mousedown;			
			this.screen_mousemove = BigBlock.ScreenEvent.screen_mousemove;			
			this.screen_touchstart = BigBlock.ScreenEvent.screen_touchstart;			
			this.screen_touchmove = BigBlock.ScreenEvent.screen_touchmove;			
			this.screen_touchend = BigBlock.ScreenEvent.screen_touchend;			
			this.screen_click = BigBlock.ScreenEvent.screen_click;
			this.frameAdvance = BigBlock.ScreenEvent.frameAdvance;
			this.inputFeedback = inputFeedback;
			this.removeListensers = removeListensers;
			this.getEventLocation = getEventLocation;
			this.checkButtonAction = checkButtonAction;
			this.checkBlockAction = checkBlockAction;
			this.checkInputBlock = checkInputBlock;
			this.preventDefault = preventDefault;
			this.stopPropagation = stopPropagation;
			
			/*
			 * The following properties are used to prevent the user from clicking/tapping to fast.
			 */
			
			this.event_start = new Date().getTime(); 
			this.event_end = 0; 
			this.event_time = 0;
			if (params.event_buffer) { // can pass in an event_buffer
				this.event_buffer = params.event_buffer;
			} else {
				this.event_buffer = event_buffer;
			}
		
			// MOUSEUP
				
			this.mouseup_event = function (event) {
				
				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
							
				BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
				BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
				
				BigBlock.ScreenEvent.removeListensers('touchstart', BigBlock.ScreenEvent.touchstart_event);

				if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {
					
					var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
										
					if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}
					
					if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}																																				
						
					if (typeof BigBlock.ScreenEvent.screen_mouseup !== "undefined" && typeof BigBlock.ScreenEvent.screen_mouseup === "function") {
						BigBlock.ScreenEvent.screen_mouseup(evt_loc.x, evt_loc.y, event);
					}
					
					if (!BigBlock.Timer.is_paused) {
					
						BigBlock.ScreenEvent.current_frame++;
					
						BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
					
						BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
					
					}
				
					BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
					
				}
				
			};
		
			
			// MOUSEMOVE

			this.mousemove_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
				
				if (typeof BigBlock.ScreenEvent.screen_mousemove !== "undefined" && typeof BigBlock.ScreenEvent.screen_mousemove === "function") {
					BigBlock.ScreenEvent.screen_mousemove(evt_loc.x, evt_loc.y, event);
				}
					
			};

			
			// MOUSEDOWN

			this.mousedown_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
				
				if (typeof BigBlock.ScreenEvent.screen_mousedown !== "undefined" && typeof BigBlock.ScreenEvent.screen_mousedown === "function") {
					BigBlock.ScreenEvent.screen_mousedown(evt_loc.x, evt_loc.y, event);
				}
											
			};
								
					
			// TOUCH START

			this.touchstart_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
						
				BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
				BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds

				this.touch = event.touches[0];
				
				BigBlock.ScreenEvent.removeListensers('mouseup', BigBlock.ScreenEvent.mouseup_event);
				
				if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {

					var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
																	
					if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}

					if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
						return false;									
					}
						
					if (typeof BigBlock.ScreenEvent.screen_touchstart !== "undefined" && typeof BigBlock.ScreenEvent.screen_touchstart === "function") {
						BigBlock.ScreenEvent.screen_touchstart(evt_loc.x, evt_loc.y, event);
					}
					
					if (!BigBlock.Timer.is_paused) {
						
						BigBlock.ScreenEvent.current_frame++;
						
						BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);

						BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
						
					}
				
					BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
					
				}
				
			};
			

			
			// TOUCH MOVE
			
			this.touchmove_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
				
				if (typeof BigBlock.ScreenEvent.screen_touchmove !== "undefined" && typeof BigBlock.ScreenEvent.screen_touchmove === "function") {
					BigBlock.ScreenEvent.screen_touchmove(evt_loc.x, evt_loc.y, event);
				}
			};


								
			// TOUCH END

			this.touchend_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}			
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
				
				if (typeof BigBlock.ScreenEvent.screen_touchend !== "undefined" && typeof BigBlock.ScreenEvent.screen_touchend === "function") {
					BigBlock.ScreenEvent.screen_touchend(evt_loc.x, evt_loc.y, event);
				}							
			};

					

			// CLICK - for Wii ONLY
						
			this.click_event = function(event) {
				
				var opera;
				
				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				if (typeof opera !== "undefined" && typeof opera.wiiremote !== "undefined") { // detect wii
							
					BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
					BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
					
					BigBlock.ScreenEvent.removeListensers('touchstart', BigBlock.ScreenEvent.touch_event);
						
					if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {

						var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
																							
						if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
							return false;
						}

						if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
							return false;									
						}
						
						if (typeof BigBlock.ScreenEvent.screen_touchstart !== "undefined" && typeof BigBlock.ScreenEvent.screen_touchstart === "function") {
							BigBlock.ScreenEvent.screen_click();
						}
						
						if (!BigBlock.Timer.is_paused) {
							
							BigBlock.ScreenEvent.current_frame++;
																	
							BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
						
							BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
						
						}
						
						BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
						
					}
				}
			};
		}		
	};
}());

/*global BigBlock, document, clearTimeout, setTimeout, setInterval*/
/**
 Timer object
 Sets up a render loop based on the Javascript timer object.
  
 @author Vince Allen 12-05-2009
 
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Timer = (function () {
	
	return {
		
		// for debugging

		frame_rate_test_start : false,
		frame_rate_test_end : false,	
		run_interval : false, // holds the run interval
		clock : 0, // increments after frame render is complete
		console_timer_name : "frame_rate" + this.clock,
		mobile_safari_time: new Date().getTime(),
		mobile_safari_build_start: new Date().getTime(),
		
		// end debugging
		
		// user configurable
		
		before_play : false,
		debug_frame_rate : true, // debugging	
		document_body_style : { backgroundColor : '#000'},
		event_buffer : false,
		force_max_frame_rate : false,						
		frame_rate : 33, // set the frame rate in milliseconds
		frame_rate_test_interval : 100, // debugging
		grid_active_styles : false,
		grid_text_styles : false,
		grid_static_styles : false,
		grid_bg_styles : { backgroundColor : '#333' },
		input_feedback : true,	
		is_paused: false,
		max_active_blocks: 200,
				
		// end user configurable
		
		// non-configurable
		
		alias : "Timer",
		F: false, // holds the cloned Grid object; use later to delete unnecesarry methods from Grid objects
		build_timeout: false, // holds timeout obj for buildChars and buildColors
		errors : [],
		blocks_to_destroy : [],
		dom_sheet: document.createElement('style'),
		dom_head: document.getElementsByTagName('head').item(0),
		play : function(params) { // called after all objects are ready
			
			var i, s, key, css, grid_top_offset, grid_active_styles;
			
			if (!BigBlock.is_iphone && !BigBlock.is_ipad) {
				BigBlock.Log.time("timer_build");
			}

			this.dom_sheet.setAttribute('type', 'text/css'); // build methods will clone the sheet created above
					
			// Timer
			
			if (typeof params !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
						
			// <body>
			i = document.getElementsByTagName('body').item(0);
			for (key in this.document_body_style) { // loop thru styles and apply to <body>
				if (this.document_body_style.hasOwnProperty(key)) {				
					i.style[key] = this.document_body_style[key];
				}
			}

			// CORE STYLES
			
			this.dom_head.appendChild(this.dom_sheet.cloneNode(false));
				
			s = document.styleSheets[document.styleSheets.length - 1];
									
			css = {
				'body' : 'margin: 0;padding: 0;background-color:#ccc;',
				'.color' : 'background-color : transparent;',
				'.pix' : 'float:left;width:' + BigBlock.Grid.blk_dim + 'px;height:' + BigBlock.Grid.blk_dim + 'px;position:absolute;line-height:0px;font-size:1%;'
			};
			
			for (i in css) {
				if (css.hasOwnProperty(i)) {
					BigBlock.Utils.appendCSSRule(s, i, css[i]);
				}
			}
							
			// GRIDS
			grid_top_offset = 0;
			
			/**
			 * Create GridInit
			 * 
			 * The GridInit is added to the DOM before other Grids. It will trigger any scrollbars if app
			 * is viewed in a frame (Facebook). Subsequent Grids will calculate width and height accurately. 
			 */

			this.F = BigBlock.Utils.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridInit = new this.F;
			
			BigBlock.GridInit.configure({
				'viewport':	{'id' : 'init', 'width': BigBlock.Grid.width, 'height': BigBlock.Grid.height, 'left' : 0, 'top' : 0, 'zIndex' : -100, dom_ref: null, last_el: null}
			});
															
			// Create GridActive

			this.F = BigBlock.Utils.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridActive = new this.F;

			/*
			 * IE Divs will not detect mouse up if there's no background color or image.
			 * However, image reference does NOT need to be valid. IE just needs to think there's an image.
			 * 
			 */
			// grid_active_styles;
			if (document.attachEvent) { // IE
				grid_active_styles = {
					backgroundImage : "url('trans.gif')" // this does not need to be a valid reference
				};
			} else {
				grid_active_styles = this.grid_active_styles;
			}
					
			BigBlock.GridActive.configure({
					'viewport': {'id' : 'active', 'width': BigBlock.Grid.width, 'height': BigBlock.Grid.height, 'left' : 0, 'top' : 0, 'zIndex' : 10, dom_ref: null, last_el: false},				
					'styles' : grid_active_styles
			});

			// Create GridStatic

			this.F = BigBlock.Utils.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridStatic = new this.F;

			BigBlock.GridStatic.configure({
					'viewport':  {'id' : 'static', 'width': BigBlock.Grid.width, 'height': BigBlock.Grid.height, 'left' : 0, 'top' : 0, 'zIndex' : -10, dom_ref: null, last_el: null},					
					'styles' : this.grid_static_styles		
			});

			
			
			// Create GridText

			this.F = BigBlock.Utils.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridText = new this.F;

			BigBlock.GridText.configure({
					'viewport': {'id' : 'text', 'width': BigBlock.Grid.width, 'height': BigBlock.Grid.height, 'left' : 0, 'top' : 0, 'zIndex' : 1, dom_ref: null, last_el: null}, 
					'styles' : this.grid_text_styles					
			});
			
			BigBlock.Grid.total_viewport_cols = Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim); // number of total cols in viewport
			
			// Create GridBG

			this.F = BigBlock.Utils.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridBG = new this.F;

			BigBlock.GridBG.configure({
					'viewport': {'id' : 'GBG', 'width': BigBlock.Grid.width, 'height': BigBlock.Grid.height, 'left' : 0, 'top' : 0, 'zIndex' : -20, dom_ref: null, last_el: null},
					'styles' : this.grid_bg_styles					
			});
			
			//delete this.F.prototype.configure; // delete configure from the Grid prototype; will delete from all Grids			
															
			//
			
			this.build_char();
						
		},
		/*
		Only called once. No need for recursive function.
		*/
		build_char : function () {
			
			this.dom_head.appendChild(this.dom_sheet.cloneNode(false));
			
			if (BigBlock.GridActive.buildCharStyles()) {
				this.add_color_loader();
			} else {
				BigBlock.Log.display("BigBlock.Timer.build_char failed.");
			}						
		},
				
		add_color_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			BigBlock.Loader.update();

			this.dom_head.appendChild(this.dom_sheet.cloneNode(false));
						
			this.build_color();
	
		},
		
		build_color : function () {

			if (BigBlock.Color.build()) {
				clearTimeout(this.build_timeout);
				BigBlock.Timer.add_grid_loader();
			} else {
				this.build_timeout = setTimeout(BigBlock.Timer.build_color, 10); // if not finishing building the colors, call again
			}
									
		},
		
		add_grid_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			BigBlock.Loader.update();

			this.dom_head.appendChild(this.dom_sheet.cloneNode(false));
			
			BigBlock.Timer.build_grid();
									
					
		},
		build_grid : function(){
			
			var e, BtnLike, n;
			
			if (BigBlock.GridActive.build()) {
				
				document.getElementsByTagName('body').item(0).removeChild(document.getElementById('loader')); // remove loader from viewport

				BigBlock.GridInit.add(); // add GridInit to DOM								
				BigBlock.GridActive.add(); // add GridActive to DOM

				for (n = 0; n < BigBlock.Timer.max_active_blocks; n += 1) { // preload the active viewport with max number of active blocks
					BigBlock.GridActive.viewport.dom_ref.appendChild(BigBlock.GridActive.div.cloneNode(false));
				}
				
				BigBlock.GridStatic.add(); // add GridStatic to DOM
				BigBlock.GridText.add(); // add GridText to DOM
				BigBlock.GridBG.add(); // add GridBG to DOM
								
				/*delete BigBlock.Loader; // remove Loader object		
				delete BigBlock.Timer.add_color_loader; // remove build methods
				delete BigBlock.Timer.build_color; 
				delete BigBlock.Timer.add_grid_loader; 
				delete BigBlock.Timer.build_grid; 
				delete BigBlock.Timer.play; 
				
				delete BigBlock.Timer.F.prototype.add;
				delete BigBlock.Timer.F.prototype.build;
				delete BigBlock.Timer.F.prototype.buildCharStyles;
				delete BigBlock.Timer.F; // remove the prototype*/
				
				// Screen Event
				
				if (typeof BigBlock.ScreenEvent.alias === "undefined") {
					BigBlock.ScreenEvent.create({
						event_buffer : BigBlock.Timer.event_buffer
					});
				}
				
				// add all screen events to GridActive

				BigBlock.ScreenEvent.evtListener = {}; // collect all events here then loop thru to add
				
				BigBlock.ScreenEvent.evtListener.click = BigBlock.ScreenEvent.click_event; // for wii
				
				//
				
				BigBlock.ScreenEvent.evtListener.mouseup = BigBlock.ScreenEvent.mouseup_event;
				BigBlock.ScreenEvent.evtListener.mousemove = BigBlock.ScreenEvent.mousemove_event;
				BigBlock.ScreenEvent.evtListener.mousedown = BigBlock.ScreenEvent.mousedown_event;
				
				//
				
				BigBlock.ScreenEvent.evtListener.touchstart = BigBlock.ScreenEvent.touchstart_event;
				BigBlock.ScreenEvent.evtListener.touchmove = BigBlock.ScreenEvent.touchmove_event;
				BigBlock.ScreenEvent.evtListener.touchend = BigBlock.ScreenEvent.touchend_event;
				
				//
				
				for (e in BigBlock.ScreenEvent.evtListener) {
					if (BigBlock.ScreenEvent.evtListener.hasOwnProperty(e)) {
						BigBlock.Utils.addEventHandler(document.getElementById(BigBlock.GridActive.viewport.id), e, BigBlock.ScreenEvent.evtListener[e]);
					}					
				}

				// before_play function
				if (BigBlock.Timer.before_play !== false) {
					if (typeof BigBlock.Timer.before_play === "function") {
						BigBlock.Timer.before_play();
					}
				}
				
				// reveals and positions Facebook 'Like' button; override w PHP in the host page
				if (typeof BtnLike !== "undefined") {
					if (BtnLike.fb_like) {
						setTimeout(function () {
							BtnLike.fb_like();
						}, 500);
					}
				}
				
				clearTimeout(BigBlock.Timer.build_timeout);

				/*	
				 * 33ms (~30fps): The optimum time to render a frame.
				 * 
				 * The following values many vary depending on the browser running the script:
				 * 
				 * 10ms setInterval limit: the smallest possible interval
				 * 6ms queued events: other events in the event queue will add ms to the interval
				 * 
				 * 17ms (33ms - 16ms): The maximum time the internal functions have to execute and maintain a 30 fps overall framerate
				 * 
				 */
				
				if (!BigBlock.is_iphone && !BigBlock.is_ipad) {
					BigBlock.Log.timeEnd("timer_build");
				} else {
					now = new Date().getTime();
					BigBlock.Log.display("build: " + (now - BigBlock.Timer.mobile_safari_build_start) + "ms");
				}
												
				BigBlock.Timer.run_interval = setInterval(function () { // call run using interval and BigBlock.Timer.frame_rate 
					BigBlock.Timer.run();
				},10); 
				
			} else {
				this.build_timeout = setTimeout(BigBlock.Timer.build_grid, 10); // if not finishing building the grid, call again; using timeout allows loader to render in between calls to build; less calls = less timeouts = faster build
			}
		
		},
		run : function () {
			
			var i, max, blocks_to_render = [], obj, time_to_render, ms_to_wait, now;
			
			if (!this.is_paused) {
				
				this.frame_rate_test_end = new Date().getTime(); // mark the end of the frame render
				time_to_render = this.frame_rate_test_end - this.frame_rate_test_start; // calculate time to render frame
				
				if (this.force_max_frame_rate) {
					if (this.frame_rate_test_start !== false && this.frame_rate_test_end !== false) { // enforce the maximum frame rate; if rate is faster, this script pauses the function.
						ms_to_wait = this.frame_rate - time_to_render;
						
						while (new Date().getTime() < this.frame_rate_test_end + ms_to_wait) {
							// wait to match intended frame rate
						}
					}
				}
				
				this.frame_rate_test_start = new Date().getTime(); // mark the beginning of the run loop

				if (this.blocks_to_destroy.length > 0) { // CLEAN UP LOOP; only run clean up if blocks need to be destroyed
					this.cleanUpBlocks();
				}
									
				for (i = 0, max = BigBlock.BlocksKeys.length; i < max; i += 1) { // RUN LOOP
					if (typeof BigBlock.Blocks[BigBlock.BlocksKeys[i]] !== "undefined") {
						obj = BigBlock.Blocks[BigBlock.BlocksKeys[i]];
						obj.run();						
						if (typeof obj.img !== "undefined" && obj.render !== 0) { // if render or life has expired, do not add to render array
							blocks_to_render[blocks_to_render.length] = obj; // blocks_to_render is an array of objects					
							obj.render -= 1; // decrement the render counter of this object
						}
					}			
				}										
				
				if (BigBlock.BlocksKeys.length > 0) { // RENDER LOOP; only run render if Blocks exist
					BigBlock.RenderMgr.renderBlocks(blocks_to_render);
				}
			
				BigBlock.BlockSmall.create({ // create a transparent block to always hide first div in Grid Active when Blocks.length < 1
					alias: "cleaner",
					color: "transparent",
					life: 2
				});
				
				this.clock += 1;
				
				if (this.clock % this.frame_rate_test_interval === 0 && this.debug_frame_rate) {
					
					if (BigBlock.is_iphone || BigBlock.is_ipad) {
						now = new Date().getTime();
						BigBlock.Log.display(this.frame_rate_test_interval + " frames; " + (now - this.mobile_safari_time) + "ms");
						this.mobile_safari_time = new Date().getTime();
					} else {
						BigBlock.Log.timeEnd(this.console_timer_name);
						this.console_timer_name = "frame_rate" + this.clock;
						BigBlock.Log.time(this.console_timer_name);
					}
					
				}
				
				 // Frame render time = this.cleanUpBlocks + Blocks.run() + RenderMgr.renderBlocks()

			}
			
		},
		cleanUpBlocks : function () {
			
			var i, i_max, y, y_max;
			
			for (i = 0, i_max = this.blocks_to_destroy.length; i < i_max; i += 1) { // loop thru Timer.blocks_to_destroy and remove Blocks

				if (typeof BigBlock.Blocks[this.blocks_to_destroy[i]] !== "undefined" && typeof BigBlock.Blocks[this.blocks_to_destroy[i]].after_destroy === "function") {
					BigBlock.Blocks[this.blocks_to_destroy[i]].after_destroy(); // call after_destroy function
				}
									
				delete BigBlock.Blocks[this.blocks_to_destroy[i]]; // DELETE obj from BigBlock.Blocks

				for (y = 0, y_max = BigBlock.BlocksKeys.length; y < y_max; y += 1) { // delete the Block obj's key
					if (BigBlock.BlocksKeys[y] === this.blocks_to_destroy[i]) { 
						BigBlock.BlocksKeys.splice(y, 1);
						break;
					}
				}				
			}
			
			this.blocks_to_destroy = [];
					
		},
		/**
		 * destroyObject is called by an object's destroy() function when it should be removed from the Blocks array.
		 * 
		 * @param {Object} obj
		 */
		destroyObject : function (obj) {			
			if (typeof obj !== "undefined") {
				this.blocks_to_destroy[this.blocks_to_destroy.length] = obj.alias; // copy object alias to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
			}
		}
	};
	
}());

/*global BigBlock, document, console, opera, alert, window, confirm */
/**
 UTILTY FUNCTIONS
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */
						
Math.degreesToRadians = function (degrees) {	
	return (Math.PI / 180.0) * degrees;
};
	
Math.radiansToDegrees = function (radians) {	
	return (180.0 / Math.PI) * radians;
};

Math.getRandomNumber = function (low, high) {
	return Math.floor(Math.random()*(high-(low-1))) + low;
};

Math.getDistanceBwTwoPts = function (x1, y1, x2, y2) {		
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
};

BigBlock.Utils = (function () {
	
	var gwidth,
		gheight,
		blk_dim;
	
	return {
		clone: function(object) {
		    function F() {}
		    F.prototype = object;
		    return F;
		},
		/**
		 * Returns the grid index of the x,y coordinate
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 */		
		getPixIndex: function (x,y) {

			// uses BigBlock.Grid.width
			// uses BigBlock.Grid.height
			// uses BigBlock.Grid.total_viewport_cols = total viewport columns

			var target_x, target_y;

			if (x >= BigBlock.Grid.width) {
				x -= BigBlock.Grid.width;
			}

			if (y >= BigBlock.Grid.height) {
				y -= BigBlock.Grid.height;
			}	

			target_x = Math.floor(x / BigBlock.Grid.blk_dim);
			target_y = Math.floor(y / BigBlock.Grid.blk_dim);

			return target_x + (BigBlock.Grid.total_viewport_cols * target_y);

		},
		/**
		 * Returns the global x,y coordinate of a block based on its Block's pix_index 
		 * @param {String} type
		 * @param {Number} val
		 * @param {Number} pix_index_offset
		 * 
		 */	
		getPixLoc: function (type, val, pix_index_offset) {

			// uses Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim); = total global grid columns
			var loc, offset_y;
			if (type === 'x') {
				pix_index_offset = pix_index_offset % BigBlock.Grid.total_viewport_cols;
				loc = val + (pix_index_offset * BigBlock.Grid.blk_dim);
			}

			if (type === 'y') {
				if (pix_index_offset > 0) {
					offset_y = Math.floor(pix_index_offset / BigBlock.Grid.total_viewport_cols);
				} else {
					offset_y = Math.ceil(pix_index_offset / BigBlock.Grid.total_viewport_cols);
				}

				loc = val + (offset_y * BigBlock.Grid.blk_dim);
			}	
			return loc;
		},
		/**
		 * Returns the column index of a Block based on its x, y coordinate. 
		 * @param {Number} x
		 * @param {Number} y
		 * 
		 */	
		getColIndex: function (x, y) {
			var totalCols = BigBlock.Grid.width/BigBlock.Grid.blk_dim;
			return BigBlock.getFullGridIndex(x, y) % totalCols;
		},
		/**
		 * Returns the first index of the passed alias in the Blocks array.  
		 * 
		 * @param {String} alias
		 */
		getBlock: function (alias) {
			var i, max;
			for (i = 0, max = BigBlock.Blocks.length; i < max; i += 1) {
				if (BigBlock.Blocks[i].alias === alias) {
					return i;
				}
			}
			return false;
		},
		/**
		 * Returns the first index of the passed word_id in the Blocks array.
		 * 
		 * @param {String} word_id
		 */
		getWord: function (word_id) {
			var i, max;
			for (i = 0, max = BigBlock.Blocks.length; i < max; i += 1) {
				if (BigBlock.Blocks[i].word_id === word_id) {
					return i;
				}
			}
			return false;
		},
		/**
		 * Remove static Blocks from Static Grid.
		 * 
		 * @param {String} alias
		 * @param {Function} callback
		 */
		removeStaticBlock: function (alias, callback) { 

			var x, x_max, y, y_max, gs, nodes, tmp;

			// Requires alias; callback is optional

			try {
				if (typeof(alias) === "undefined") {
					throw new Error("BigBlock.removeStatic(alias): requires an alias.");
				}
				if (typeof(alias) !== "string") {
					throw new Error("utility: removeStatic(): arguement 'alias' must be a string.");
				}
				if (typeof(callback) !== "undefined" && typeof(callback) !== "function") { 
					throw new Error("utility: removeStatic(): arguement 'callback' must be a function.");
				}
			} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
			}	

			gs = BigBlock.GridStatic.viewport.dom_ref;

			if (gs.hasChildNodes()) {

				nodes = gs.childNodes; // get a collection of all children in BigBlock.GridText.id;

				tmp = [];

				// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection

				for(x = 0, x_max = nodes.length; x < x_max; x += 1) { // make copy of DOM collection
					tmp[tmp.length] = nodes[x]; 
				}

				for (y = 0, y_max = tmp.length; y < y_max; y += 1) { // loop thru children
					if (alias === tmp[y].getAttribute("name")) {
						gs.removeChild(tmp[y]);
					}
				}

				tmp = null;			
			}

			if (typeof(callback) === "function") { 
				callback();
			}

		},
		/**
		 * Returns a unique number based on the current date/time in milliseconds.
		 */
		getUniqueId: function () {
		     var dateObj = new Date();
		     return dateObj.getTime() + Math.getRandomNumber(0,1000000000);
		},
		/**
		 * Returns true if point is inside rect.
		 * 
		 * @param {Number} pt_x
		 * @param {Number} pt_y
		 * @param {Number} rect_x1
		 * @param {Number} rect_x2
		 * @param {Number} rect_y1
		 * @param {Number} rect_y2
		 */
		ptInsideRect: function (pt_x, pt_y, rect_x1, rect_x2, rect_y1, rect_y2) {
			if (pt_x >= rect_x1 && pt_x < rect_x2 && pt_y >= rect_y1 && pt_y < rect_y2) {
				return true;
			}
			return false;
		},
		/**
		 * Returns the number of rules in the stylesheet.
		 * @param {Object} sheet
		 */
		getCSSLength: function (sheet) {
			if (sheet.cssRules) { // W3C
				this.getCSSLength = function () {
					return sheet.cssRules.length;
				};		
			} else if (sheet.rules) { // IE
				this.getCSSLength = function () {
					return sheet.rules.length;
				};
			}
			return this.getCSSLength(sheet);
		},
		/*
		Appends a CSS rule to a stylesheet.
		@param {Object} sheet
		@param {String} selector
		@param {String} rule
		*/
		appendCSSRule: function (sheet, selector, rule) {			
			if (sheet.insertRule) {
				this.appendCSSRule = function (sheet, selector, rule) {
					sheet.insertRule(selector + " {" + rule + "}", 0);					
				}
			} else if (sheet.addRule) {
				this.appendCSSRule = function (sheet, selector, rule) {
					sheet.addRule(selector, rule);
				}				
			}
			this.appendCSSRule(sheet, selector, rule);
		},
		/*
		Adds an event listener.
		@param {Object} target
		@param {String} eventType
		@param {Function} handler
		*/
		addEventHandler: function (target, eventType, handler) {			
			if (target.addEventListener) { // W3C
				this.addEventHandler = function (target, eventType, handler) {
					target.addEventListener(eventType, handler, false);
				} 
			} else if (target.attachEvent) { // IE
				this.addEventHandler = function (target, eventType, handler) {
					target.attachEvent("on" + eventType, handler);
				}
			}
			this.addEventHandler(target, eventType, handler);
		},	
		/*
		Removes an event listener.
		@param {Object} target
		@param {String} eventType
		@param {Function} handler
		*/
		removeEventHandler: function (target, eventType, handler) {			
			if (target.removeEventListener) { // W3C
				this.removeEventHandler = function (target, eventType, handler) {
					target.removeEventListener(eventType, handler, false);
				} 
			} else if (target.detachEvent) { // IE
				this.removeEventHandler = function (target, eventType, handler) {
					target.detachEvent("on" + eventType, handler);
				}
			}
			this.removeEventHandler(target, eventType, handler);
		},					
		/**
		 * Returns the current window width and height in json format.
		 */
		getWindowDim: function () {
			var d = {
				'width' : false,
				'height' : false
			};
			if (typeof(window.innerWidth) !== "undefined") {
				d.width = window.innerWidth;		
			} else if (typeof(document.documentElement) !== "undefined" && typeof(document.documentElement.clientWidth) !== "undefined") {
				d.width = document.documentElement.clientWidth;
			} else if (typeof(document.body) !== "undefined") {
				d.width = document.body.clientWidth;
			}
			if (typeof(window.innerHeight) !== "undefined") {
				d.height = window.innerHeight;		
			} else if (typeof(document.documentElement) !== "undefined" && typeof(document.documentElement.clientHeight) !== "undefined") {
				d.height = document.documentElement.clientHeight;
			} else if (typeof(document.body) !== "undefined") {
				d.height = document.body.clientHeight;
			}	
			return d;	
		},
		inArray: function (needle, haystack) {
			var i, max, check;
			check = false;
			for (i = 0, max = haystack.length; i < max; i += 1) {
				if (typeof(needle) === typeof(haystack[i]) && needle === haystack[i]) { // needle, haystack must be the same data type
					check = true;
				}
			}
			return check;
		},
		/**
		 * Returns the file extension from a supplied path
		 * @param {String} path
		 */
		getFileExtension: function (path) {

			var val, arr;

			try {
				if (typeof path === "undefined") {
					throw new Error("BigBlock.getFileExtension(path): A path is required.");
				} else {
					arr = path.split(".");
					val = arr[arr.length-1];			
				}								
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}	

			return val;
		},
		/**
		 * 
		 * Returns an array of common mime-types based on file extension.
		 * 
		 * @param {String} ext
		 */
		getMimeTypeFromFileExt: function (ext) {

			try {
				if (typeof ext === "undefined") {
					throw new Error("BigBlock.getMimeTypeFromFileExt(ext): An extension is required.");
				} else {

					switch (ext) {
						case "aif":
							return ["audio/x-aiff", "audio/x-aiff"];

						case "au":
						case "snd":
							return ["audio/basic"];
						case "ogg":
							return ["audio/ogg"];			
						case "mp3":
							return ["audio/mpeg", "audio/x-mpeg"];																					
						case "wav":
							return ["audio/wav", "audio/x-wav"];
						default:
							return false;
					}			
				}								
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}	

		},
		/**
		 * Returns a MySql formatted datetime value based on the datetime now.
		 * 
		 */
		getMySqlDateTime: function () { // format 0000-00-00 00:00:00

			var dateObj, year, month, day, hours, minutes, seconds;

			dateObj = new Date();

			year = dateObj.getFullYear();
			month = dateObj.getMonth();
			if (month < 10) {
				month = "0" + month;
			}
			day = dateObj.getDate();
			if (day < 10) {
				day = "0" + day;
			}
			hours = dateObj.getHours();
			if (hours < 10) {
				hours = "0" + hours;
			}
			minutes = dateObj.getMinutes();
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			seconds = dateObj.getSeconds();
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

		},
		/**
		 * Opens a new browser window.
		 * @param {String} url
		 * @param {String} name
		 */
		windowOpen: function (url, name) {
			try {
				if (typeof url === "undefined") {
					return false;
				} else {
					if (typeof name === "undefined") {
						name = "";
					}
					if (BigBlock.standalone) {
						if (confirm('Leaving app. Continue?')) {
							window.open(url, name);	
						}
					} else {
						window.open(url, name);
					}			
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}	
		},
		/**
		 * Get new location for block given velocity, angle, x and y locations. Returns an object literal with x and y values.
		 * 
		 * 
		 * @param {Number} vel
		 * @param {Number} angle
		 * @param {Number} x
		 * @param {Number} y
		 */
		getTransform: function (vel, angle, x, y) {

			var trans, vx, vy;

			trans = {};									
			vx = (vel) * Math.cos(Math.degreesToRadians(angle)); // calculate how far obj should move on x,y axis
			vy = (vel) * Math.sin(Math.degreesToRadians(angle));

			trans.x = x + vx;
			trans.y = y + vy;

			return trans;
				
		},
		getParticleTransform: function (vel, angle, x, y, gravity, clock, life, color, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {

			var trans, spiral_offset, vx, vy, p;

			trans = {};									

			spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_x * BigBlock.Grid.blk_dim));	
			vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle) + spiral_offset; // calculate how far obj should move on x,y axis

			spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_y * BigBlock.Grid.blk_dim));
			vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle) + spiral_offset;

			// uncomment to disregard spiral offset
			//var vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle);
			//var vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle);

			if (x + vx >= BigBlock.Grid.width) {
				// do nothing;
			} else {
				trans.x = x + vx;
				trans.y = y + vy + (gravity*BigBlock.Grid.blk_dim);
			}

			p = clock/life;
			trans.color_index = color + Math.round(color_max*p);
			return trans;
		},
		/**
		 * Returns an angle between two points.
		 * 
		 * @param {Number} y
		 * @param {Number} init_y
		 * @param {Number} x
		 * @param {Number} init_x
		 */
		getAngle: function (y, init_y, x, init_x) {
			return Math.atan2(y - init_y, x - init_x) * 180 / Math.PI;
		},
		/**
		 * Checks if obj1 collides w obj2. Obj1 is a projectile (BlockSmall), obj2 is a target (BlockSmall or BlockAnim).
		 * If collision is detected, the collisionAction property is executed for both objects.
		 * 
		 * @param {String} obj1_alias
		 * @param {Number} obj1_x
		 * @param {Number} obj1_y
		 * @param {Boolean} obj1_isHit
		 * @param {String} obj2_aliasRegExMatch
		 */
		checkCollision: function (obj1_alias, obj1_x, obj1_y, obj1_isHit, obj2_aliasRegExMatch) {

			var i, a, p, obj2_index, obj2_x, obj2_y;

			/*
			 * The function below only checks the current frame in the BlockAnim anim array.
			 */

			for (i in BigBlock.Blocks) { // loop thru Blocks

				if (BigBlock.Blocks.hasOwnProperty(i)) {

					// check for non-static Blocks, alias, not hit
					if (BigBlock.Blocks[i].anim !== false && BigBlock.Blocks[i].render_static === false && BigBlock.Blocks[i].alias.indexOf(obj2_aliasRegExMatch) !== -1 && obj1_isHit === false) {

						a = BigBlock.Blocks[i].anim_frame; // get the current frame in the animation array

						for (p in BigBlock.Blocks[i].anim[a].frm.pix) { // loop thru blocks
							if (BigBlock.Blocks[i].anim[a].frm.pix.hasOwnProperty(p)) {

								obj2_index = BigBlock.getFullGridIndex(BigBlock.Blocks[i].x, BigBlock.Blocks[i].y); // get block index

								// add index offset
								obj2_index = obj2_index + BigBlock.Blocks[i].anim[a].frm.pix[p].i;

								obj2_x = BigBlock.getPixLoc('x', BigBlock.Blocks[i].x, BigBlock.Blocks[i].anim[a].frm.pix[p].i);
								obj2_y = BigBlock.getPixLoc('y', BigBlock.Blocks[i].y, BigBlock.Blocks[i].anim[a].frm.pix[p].i);

								// if grid indexes match, blocks have collided
								if (obj2_index === BigBlock.getFullGridIndex(obj1_x, obj1_y)) {

									BigBlock.Blocks[obj1_alias].is_hit = true; // stops checking for collisions on this object
									BigBlock.Blocks[obj1_alias].render = 2; // stop rendering pollen after a few screen renders

									if (typeof(BigBlock.Blocks[obj1_alias].action_collide) === "function") { // run obj1 collide action
										BigBlock.Blocks[obj1_alias].action_collide();
									}									

									if (typeof(BigBlock.Blocks[i].action_collide) === "function") { // run obj2 collide action
										BigBlock.Blocks[i].action_collide();
									}

									break;
								}
							}
						}
					}
				}
			}
		}																						
								
	};
	
}());

/*global BigBlock, document */
/**
 Simple Word object
 Loops thru passed word and creates characters.
 All words on on the same horizontal line.
  
 @author Vince Allen 05-11-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */
BigBlock.Word = (function () {
	
	return {
		create: function (params) {
			var i,
				max,
				palette,
				word_width,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Block
				obj = new F;
			
			obj.configure(); // run configure() to inherit Block properties
						
			if (typeof params !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			palette = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = palette.classes.length; i < max; i++) { // get length of color palette for this color
				if (palette.classes[i].name === obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			obj.className = "Word"; // force the className
			obj.render = 0; // force render = 0; Words are references to Characters; they should not be rendered
			
			// check to center text
			if (obj.center) {
				word_width = obj.word.length * BigBlock.Grid.blk_dim;
				obj.x = BigBlock.Grid.width/2 - word_width/2;
			}
			
			obj.destroy = function (callback) {// overwrite the Block's destroy function; include function to remove associated Character from the Text Grid
				
				var i, i_max, q, word_id, nodes, tmp, x, x_max;
				
				// check if this obj is a Word; if so, destroy the associated Characters				
				word_id = this.alias;
				q = document.getElementById(BigBlock.GridText.viewport.id);
				
				if (q.hasChildNodes()) {
					
					nodes = q.childNodes; // get a collection of all children in BigBlock.GridText.id;

					tmp = [];
					
					// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 
					for(x = 0, x_max = nodes.length; x < x_max; x++) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}

					for (x = 0, x_max = tmp.length; x < x_max; x++) { // loop thru children
						var id = tmp[x].getAttribute('name');
						if (id === word_id) {
							q.removeChild(tmp[x]);
						}
					}
					
				}
				
				if (typeof callback === "function") { this.after_destroy = callback; }
				this.render = 0; // prevents render manager from receiving this object's blocks
				BigBlock.Timer.destroyObject(this);	
			
			};
							
			/* IMPORTANT: 
			 * Need to add word to Blocks object so we have a reference to its characters when we need to remove them.
			 */
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
			try {
				if (typeof BigBlock.CharPresets.getChar === "undefined") {
					throw new Error("BigBlock.Word.create(): BigBlock.CharPresets = BigBlock.CharPresets.install() must be run before creating Words.");
				} else {
								
					if (BigBlock.CharPresets.getChar(obj.word)) { // if the value of this word matches a preset in the character library, use a predefined character like 'arrow_up'
		
						BigBlock.Character.create({
							word_id : obj.alias, // pass the word alias to the characters
							character: obj.word,
							x : obj.x,
							y : obj.y,
							color : obj.color,
							font : obj.font,
							glass : obj.glass
						});			
										
					} else {
						
						var s = new String(obj.word); // convert property (obj.word) into Object; faster than iterating over the property
						
						for (i = 0, max = s.length; i < max; i++) { // use a standard for loop to iterate over a string
						
							BigBlock.Character.create({
								word_id : obj.alias, // pass the word's alias to the characters
								character: s.substr(i,1),
								x : obj.x + (i * BigBlock.Grid.blk_dim),
								y : obj.y,
								color : obj.color,
								font : obj.font,
								glass : obj.glass
							});									
						}										
					}
						
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
		}
	};
	
}());