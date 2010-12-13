/**
 * UTILTY FUNCTIONS
 * 
 * @author Vince Allen 12-05-2009
 */
			
/*global checkHasDupes : true, killObject : true, killAllObjects : true, Sprites : true, Grid */
			
Math.degreesToRadians = function (degrees) {	
	return (Math.PI / 180.0) * degrees;
};
	
Math.radiansToDegrees = function (radians) {	
	return (180.0 / Math.PI) * radians;
};

Math.getRamdomNumber = function (floor, ceiling) {
	return Math.floor(Math.random()*(ceiling+1)) + floor;
};

Math.getDistanceBwTwoPts = function (x1, y1, x2, y2) {	
	d = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));	
	return d;
};

BigBlock.clone = function(object) {
    function F() {}
    F.prototype = object;
    return new F;
};

BigBlock.getPixIndex = function (x,y) {
	
	// uses BigBlock.Grid.width/2; = quad width
	// uses BigBlock.Grid.height/2; = quad height
	// uses Math.round((BigBlock.Grid.width/2)/BigBlock.Grid.pix_dim; = total quad grid columns
	
	if (x >= BigBlock.Grid.width/2) {
		x -= BigBlock.Grid.width/2;
	}
	
	if (y >= BigBlock.Grid.height/2) {
		y -= BigBlock.Grid.height/2;
	}	
			
	if (BigBlock.Grid.pix_dim !== 0) {
				
		var target_x = Math.floor(x / BigBlock.Grid.pix_dim);
		var target_y = Math.floor(y / BigBlock.Grid.pix_dim);
		
		return target_x + (Math.round((BigBlock.Grid.width/2)/BigBlock.Grid.pix_dim) * target_y);
	} else {
		return 1;
	}				
};

/**
 * Returns the global x,y coordinate of a block based on its Sprite's pix_index 
 * @param type
 * @param pix_index
 * 
 */	
BigBlock.getPixLoc = function (type, val, pix_index_offset) {
	
	// uses Math.round(BigBlock.Grid.width/BigBlock.Grid.pix_dim); = total global grid columns
	var loc;
	if (type == 'x') {
		pix_index_offset = pix_index_offset % Math.round(BigBlock.Grid.width/BigBlock.Grid.pix_dim);
		loc = val + (pix_index_offset * BigBlock.Grid.pix_dim);
	}
	
	if (type == 'y') {
		var offset_y;
		if (pix_index_offset > 0) {
			offset_y = Math.floor(pix_index_offset / Math.round(BigBlock.Grid.width/BigBlock.Grid.pix_dim));
		} else {
			offset_y = Math.ceil(pix_index_offset / Math.round(BigBlock.Grid.width/BigBlock.Grid.pix_dim));
		}
		
		loc = val + (offset_y * BigBlock.Grid.pix_dim);
	}	
	return loc;
};		

BigBlock.getObjIdByAlias = function (alias) {
	var id = false;
	for (var i = 0; i < BigBlock.Sprites.length; i++) {
		if (BigBlock.Sprites[i].alias == alias) {
			id = i;
			return id;
		}
	}
	return id;
};

BigBlock.getObjIdByWordId = function (word_id) {
	var id = false;
	for (var i = 0; i < BigBlock.Sprites.length; i++) {
		if (BigBlock.Sprites[i].word_id == word_id) {
			id = i;
			return id;
		}
	}
	return id;
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

BigBlock.getUniqueId = function () {
     var dateObj = new Date();
     return dateObj.getTime() + Math.getRamdomNumber(0,1000);
};

BigBlock.removeStatic = function (alias, callback) { 

	/*
	 * remove static sprites from Static Grid.
	 * requires alias; callback is optional
	 */
	
	try {
		if (typeof(alias) == 'undefined') {
			throw new Error('URS001');
		}
		if (typeof(alias) != 'string') {
			throw new Error('URS002');
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
	if (pt_x > rect_x1 && pt_x < rect_x2 && pt_y > rect_y1 && pt_y < rect_y2) {
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
		if (typeof(needle) == typeof(haystack[i]) && needle == haystack) {
			check = true;
		}
	}
	return check;
};

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
