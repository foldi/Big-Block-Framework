/**
 * UTILTY FUNCTIONS
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
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
	d = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));	
	return d;
};

BigBlock.clone = function(object) {
    function F() {}
    F.prototype = object;
    return F;
};
/**
 * Returns the grid index of the x,y coordinate
 * 
 * @param {Number} x
 * @param {Number} y
 */
BigBlock.getPixIndex = function (x,y) {
	
	// uses BigBlock.Grid.width/2; = quad width
	// uses BigBlock.Grid.height/2; = quad height
	// uses BigBlock.Grid.total_quad_cols = total quad grid columns
	
	if (x >= BigBlock.Grid.width/2) {
		x -= BigBlock.Grid.width/2;
	}
	
	if (y >= BigBlock.Grid.height/2) {
		y -= BigBlock.Grid.height/2;
	}	
		
	var target_x = Math.floor(x / BigBlock.Grid.blk_dim);
	var target_y = Math.floor(y / BigBlock.Grid.blk_dim);
	
	return target_x + (BigBlock.Grid.total_quad_cols * target_y);
			
};

/**
 * Returns the global x,y coordinate of a block based on its Block's pix_index 
 * @param {String} type
 * @param {Number} val
 * @param {Number} pix_index_offset
 * 
 */	
BigBlock.getPixLoc = function (type, val, pix_index_offset) {
	
	// uses Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim); = total global grid columns
	var loc;
	if (type == 'x') {
		pix_index_offset = pix_index_offset % BigBlock.Grid.total_global_cols;
		loc = val + (pix_index_offset * BigBlock.Grid.blk_dim);
	}
	
	if (type == 'y') {
		var offset_y;
		if (pix_index_offset > 0) {
			offset_y = Math.floor(pix_index_offset / BigBlock.Grid.total_global_cols);
		} else {
			offset_y = Math.ceil(pix_index_offset / BigBlock.Grid.total_global_cols);
		}
		
		loc = val + (offset_y * BigBlock.Grid.blk_dim);
	}	
	return loc;
};		

/**
 * Returns the column index of a Block based on its x, y coordinate. 
 * @param {Number} x
 * @param {Number} y
 * 
 */	
BigBlock.getColIndex = function (x, y) {
	var totalCols = BigBlock.Grid.width/BigBlock.Grid.blk_dim;
	return BigBlock.getFullGridIndex(x, y) % totalCols;
};

/**
 * Returns the index of a Block based on its x, y coordinate relative to the full viewport. 
 * @param {Number} x
 * @param {Number} y
 * 
 */	
BigBlock.getFullGridIndex = function (x, y) {
	if (BigBlock.Grid.blk_dim !== 0) {
				
		var target_x = Math.floor(x / BigBlock.Grid.blk_dim);
		var target_y = Math.floor(y / BigBlock.Grid.blk_dim);
		
		return target_x + (Math.round((BigBlock.Grid.width)/BigBlock.Grid.blk_dim) * target_y);
	} else {
		return 1;
	}				
};
/**
 * Returns the first index of the passed alias in the Blocks array.  
 * 
 * @param {String} alias
 */
BigBlock.getBlock = function (alias) {
	for (var i = 0; i < BigBlock.Blocks.length; i++) {
		if (BigBlock.Blocks[i].alias == alias) {
			return i;
		}
	}
	return false;
};
/**
 * Returns the first index of the passed word_id in the Blocks array.
 * 
 * @param {String} word_id
 */
BigBlock.getWord = function (word_id) {
	for (var i = 0; i < BigBlock.Blocks.length; i++) {
		if (BigBlock.Blocks[i].word_id == word_id) {
			return i;
		}
	}
	return false;
};
/**
 * Remove static Blocks from Static Grid.
 * 
 * @param {String} alias
 * @param {Function} callback
 */
BigBlock.removeStaticBlock = function (alias, callback) { 

	/*
	 * Requires alias; callback is optional
	 */
	
	try {
		if (typeof(alias) == "undefined") {
			throw new Error('URS001');
		}
		if (typeof(alias) != "string") {
			throw new Error("utility: removeStatic(): arguement 'alias' must be a string.");
		}
		if (typeof(callback) != "undefined" && typeof(callback) != "function") { 
			throw new Error("utility: removeStatic(): arguement 'callback' must be a function.");
		}
	} catch(e) {
			BigBlock.Log.display(e.name + ': ' + e.message);
	}	

	for (var i = 0; i < BigBlock.GridStatic.quads.length; i++) {
			
		var gs = document.getElementById(BigBlock.GridStatic.quads[i].id);
		
		if (gs.hasChildNodes()) {

			var nodes = gs.childNodes; // get a collection of all children in BigBlock.GridText.id;

			var tmp = [];
			
			// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
			 
			for(var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
				tmp[tmp.length] = nodes[x]; 
			}
								
			for (var j = 0; j < tmp.length; j++) { // loop thru children
				if (alias == tmp[j].getAttribute('name')) {
					gs.removeChild(tmp[j]);
				}
			}
			
			tmp = null;			
		}
			
	}
										
	if (typeof(callback) == 'function') { 
		callback();
	}
				
};

BigBlock.Log = (function(){

	return {
		display: function(str) {
			try {
				if (typeof(console) != 'undefined') {
					console.log(str); // output error to console
				} else if (typeof(opera) != 'undefined' && typeof(opera.wiiremote) != 'undefined') { // wii uses alerts
					alert(str);
				} else if (typeof(opera) != 'undefined') { // opera uses error console
					opera.postError(str);
				}
			} catch(e) {
			  // do nothing
			}
		}
	};

})(); 

/**
 * Returns a unique number based on the current date/time in milliseconds.
 */
BigBlock.getUniqueId = function () {
     var dateObj = new Date();
     return dateObj.getTime() + Math.getRandomNumber(0,1000000000);
};


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
BigBlock.ptInsideRect = function (pt_x, pt_y, rect_x1, rect_x2, rect_y1, rect_y2) {
	if (pt_x >= rect_x1 && pt_x <= rect_x2 && pt_y >= rect_y1 && pt_y <= rect_y2) {
		return true;
	}
	return false
};

/**
 * Returns the style sheet element by type.
 * @param {String} type
 */
BigBlock.getBigBlockCSS = function (id) {
		
	var c = document.styleSheets;
	
	for (i=0; i<c.length; i++) {
		if (c[i].cssRules) { // Mozilla
			var rules = c[i].cssRules;
			for (x=0; x<rules.length; x++) {
				if (rules[x].selectorText == id) {
					return c[i];
				} 
			}
		} else if (c[i].rules) { // IE
			var rules = c[i].rules;
			for (x=0; x<rules.length; x++) {
				if (rules[x].selectorText == id) {
					return c[i];
				} 
			} 			
		}
	}
	return false;
}

/**
 * Returns the current window width and height in json format.
 */
BigBlock.getWindowDim = function () {
	var d = {
		'width' : false,
		'height' : false
	};
	if (typeof(window.innerWidth) != 'undefined') {
		d.width = window.innerWidth;		
	} else if (typeof(document.documentElement) != 'undefined' && typeof(document.documentElement.clientWidth) != 'undefined') {
		d.width = document.documentElement.clientWidth;
	} else if (typeof(document.body) != 'undefined') {
		d.width = document.body.clientWidth;
	}
	if (typeof(window.innerHeight) != 'undefined') {
		d.height = window.innerHeight;		
	} else if (typeof(document.documentElement) != 'undefined' && typeof(document.documentElement.clientHeight) != 'undefined') {
		d.height = document.documentElement.clientHeight;
	} else if (typeof(document.body) != 'undefined') {
		d.height = document.body.clientHeight;
	}	
	return d;	
}
	                   

BigBlock.inArray = function (needle, haystack) {
	var check = false;
	for (var i = 0; i < haystack.length; i++) {
		if (typeof(needle) == typeof(haystack[i]) && needle == haystack[i]) { // needle, haystack must be the same data type
			check = true;
		}
	}
	return check;
};
/**
 * Returns the file extension from a supplied path
 * @param {String} path
 */
BigBlock.getFileExtension = function (path) {
	
	var val;
	
	try {
		if (typeof(path) == "undefined") {
			throw new Error("BigBlock.getFileExtension(path): A path is required.");
		} else {
			var arr = path.split(".");
			val = arr[arr.length-1];			
		}								
	} catch(e) {
		BigBlock.Log.display(e.name + ': ' + e.message);
	}	
	
	return val;
};
/**
 * 
 * Returns an array of common mime-types based on file extension.
 * 
 * @param {String} ext
 */
BigBlock.getMimeTypeFromFileExt = function (ext) {
	
	try {
		if (typeof(ext) == "undefined") {
			throw new Error("BigBlock.getMimeTypeFromFileExt(ext): An extension is required.");
		} else {

			switch (ext) {
				case "aif":
				 	return ["audio/x-aiff", "audio/x-aiff"];
					break;
				case "au":
				case "snd":
				 	return ["audio/basic"];
					break;
				case "ogg":
				 	return ["audio/ogg"];
							break;			
				case "mp3":
				 	return ["audio/mpeg", "audio/x-mpeg"];
						break;																					
				case "wav":
				 	return ["audio/wav", "audio/x-wav"];
					break;
				default:
					return false;
					break;	
					
			}			
		}								
	} catch(e) {
		BigBlock.Log.display(e.name + ': ' + e.message);
	}	
	
}

//

BigBlock.checkHasDupes = function (A) {
	var i, j, n;
	var objs = [];
	n=A.pix.length;
								
	for (i = 0; i < n; i++) { // outer loop uses each item i at 0 through n
		for (j = i + 1; j < n; j++) { // inner loop only compares items j at i+1 to n
			if (A.pix.i.i == A.pix.j.i) {
				objs = [A.pix.i, A.pix.j];
				return objs;
			}
		}
	}
	return false;
};

/**
 * Returns a MySql formatted datetime value based on the datetime now.
 * 
 */
BigBlock.getMySqlDateTime = function () { // format 0000-00-00 00:00:00
	
	var dateObj = new Date();
	
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth();
	if (month < 10) {
		month = "0" + month;
	}
	var day = dateObj.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	var hours = dateObj.getHours();
	if (hours < 10) {
		hours = "0" + hours;
	}
	var minutes = dateObj.getMinutes();
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	var seconds = dateObj.getSeconds();
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	
	return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
	
};
/**
 * Opens a new browser window.
 * @param {String} url
 * @param {String} name
 */
BigBlock.windowOpen = function (url, name) {
	try {
		if (typeof(url) == "undefined") {
			throw new Error("BigBlock.windowOpen(): url is required.");
			return false;
		} else {
			if (typeof(name) == "undefined") {
				name = "";
			}
			window.open(url, name);			
		}
	} catch(e) {
		BigBlock.Log.display(e.name + ': ' + e.message);
	}	
};
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
BigBlock.checkCollision = function (obj1_alias, obj1_x, obj1_y, obj1_isHit, obj2_aliasRegExMatch) {

	/*
	 * The function below only checks the current frame in the BlockAnim anim array.
	 */
	
	for (var i in BigBlock.Blocks) { // loop thru Blocks
		
		// check for non-static Blocks, alias, not hit
		if (BigBlock.Blocks[i].anim !== false && BigBlock.Blocks[i].render_static === false && BigBlock.Blocks[i].alias.indexOf(obj2_aliasRegExMatch) != -1 && obj1_isHit === false) {
			
			var a = BigBlock.Blocks[i].anim_frame; // get the current frame in the animation array
			
			for (var p in BigBlock.Blocks[i].anim[a].frm.pix) { // loop thru blocks
				
				var obj2_index = BigBlock.getFullGridIndex(BigBlock.Blocks[i].x, BigBlock.Blocks[i].y); // get block index
				
				// add index offset
				obj2_index = obj2_index + BigBlock.Blocks[i].anim[a].frm.pix[p].i;
				
				obj2_x = BigBlock.getPixLoc('x', BigBlock.Blocks[i].x, BigBlock.Blocks[i].anim[a].frm.pix[p].i);
				obj2_y = BigBlock.getPixLoc('y', BigBlock.Blocks[i].y, BigBlock.Blocks[i].anim[a].frm.pix[p].i);
				
				var obj2_quad = BigBlock.RenderMgr.getQuad('active', obj2_x, obj2_y);
				var obj1_quad = BigBlock.RenderMgr.getQuad('active', obj1_x, obj1_y);
				
				// if the auads match && grid indexes match, blocks have collided
				if (obj1_quad == obj2_quad && obj2_index == BigBlock.getFullGridIndex(obj1_x, obj1_y)) {
					
					BigBlock.Blocks[obj1_alias].is_hit = true; // stops checking for collisions on this object
					BigBlock.Blocks[obj1_alias].render = 2; // stop rendering pollen after a few screen renders
					
					if (typeof(BigBlock.Blocks[obj1_alias].action_collide) == "function") { // run obj1 collide action
						BigBlock.Blocks[obj1_alias].action_collide();
					}									
					
					if (typeof(BigBlock.Blocks[i].action_collide) == "function") { // run obj2 collide action
						BigBlock.Blocks[i].action_collide();
					}
					
					break;
				}
			}
		}
	}				
	
};

/**
 * Get new location for block given velocity, angle, x and y locations. Returns an object literal with x and y values.
 * 
 * 
 * @param {Number} vel
 * @param {Number} angle
 * @param {Number} x
 * @param {Number} y
 */
BigBlock.getTransform = function (vel, angle, x, y) {

	var trans = {};									
		
	var vx = (vel) * Math.cos(Math.degreesToRadians(angle)); // calculate how far obj should move on x,y axis
	var vy = (vel) * Math.sin(Math.degreesToRadians(angle));
					
	trans.x = x + vx;
	trans.y = y + vy;

	return trans;
};

BigBlock.getParticleTransform = function (vel, angle, x, y, gravity, clock, life, color, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {
	
	var trans = {};									
	
	var spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_x * BigBlock.Grid.blk_dim));	
	var vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle) + spiral_offset; // calculate how far obj should move on x,y axis

	spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_y * BigBlock.Grid.blk_dim));
	var vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle) + spiral_offset;
	
	// uncomment to disregard spiral offset
	//var vx = (vel*BigBlock.Grid.blk_dim) * Math.cos(angle);
	//var vy = (vel*BigBlock.Grid.blk_dim) * Math.sin(angle);
	
	if (x + vx >= BigBlock.Grid.width) {
		// do nothing;
	} else {
		trans.x = x + vx;
		trans.y = y + vy + (gravity*BigBlock.Grid.blk_dim);
	}
	
	var p = clock/life;
	trans.color_index = color + Math.round(color_max*p);
	return trans;
}

/**
 * Returns an angle between two points.
 * 
 * @param {Number} y
 * @param {Number} init_y
 * @param {Number} x
 * @param {Number} init_x
 */
BigBlock.getAngle = function (y, init_y, x, init_x) {
	return Math.atan2(y - init_y, x - init_x) * 180 / Math.PI;
};
