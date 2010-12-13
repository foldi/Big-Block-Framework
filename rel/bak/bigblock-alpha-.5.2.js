var BigBlock = {};
BigBlock.Sprites = [];

// initial props

BigBlock.curentFrame = 0;
BigBlock.inputBlock = false; // set = true to block user input

/**
 * BigBlock.ready() is called from <body> onload()
 * To pass params to BigBlock.Timer.play(), overwrite this function in the html file.
 * Params should be json formatted. 
 */
BigBlock.ready = function () { 
	BigBlock.Timer.play();
};

//

/**
 * Grid
 * A generic object that carries core grid properties. All grids appearing in a scene should inherit from the Grid object.
 * 
 * Default iPhone viewport 320px X 356px
 * Status bar (cannot hide) 20px
 * Url bar 60px
 * Button bar 44px
 * 
 * iPhone viewport running in full screen mode (installation on home screen) 320px X 480px
 * 
 * Full Grid running in iPhone mode 320px X 368px (40 cols X 46 cols)
 * 
 * @author Vince Allen 7-15-2010
 */

BigBlock.Grid = (function () {

				
	return {
		
		alias : 'Grid',
		
		pix_dim : 8, // the pixel dimensions; width & height; pixels are square
		width : 320, // global grid width
		height : 368, // global grid height
		
		x : 0, // will be set when grid divs are added to the dom
		y : 0,
		
		//cols : Math.round(320/8), // number of GLOBAL grid columns // replaced w Math.round(BigBlock.Grid.width/BigBlock.Grid.pix_dim)
		//rows : Math.round(368/8), // number of GLOBAL grid rows // replaced w Math.round(BigBlock.Grid.height/BigBlock.Grid.pix_dim)
		
		//quad_width : 160, // replaced w BigBlock.Grid.width/2
		//quad_height : 184, // replaced w BigBlock.Grid.height/2
		//quad_cols : Math.round(160/8), // number of QUAD grid columns // replaced w Math.round((BigBlock.Grid.width/2)/BigBlock.Grid.pix_dim)
		//quad_rows : Math.round(184/8), // number of QUAD grid rows // replaced w Math.round((BigBlock.Grid.height/2)/BigBlock.Grid.pix_dim)		
				
		build_start_time : new Date().getTime(),
		build_end_time : new Date().getTime(),
		build_offset : 0,
		build_section_count : 0,
		//build_section_total : Math.round((184/8))/2, // replaced w Math.round(((BigBlock.Grid.width/2)/8))/2
		build_rowNum : 0,
		char_width : 8,
		char_height : 8,
		styles : {},
		
		configure : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		setProps : function (params) {
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
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
				if (typeof(key) == 'undefined') {
					throw new Error('Err: GSS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: GSS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			for (var i in this.quads) {
				if (this.quads.hasOwnProperty(i)) {
					document.getElementById(this.quads[i].id).style[key] = value;
				}
			}						
					
		},
		add: function(){
		
			this.build_start_time = new Date().getTime();
			
			var win_dim = BigBlock.getWindowDim();
			
			try {	
				if (win_dim.width === false || win_dim.height === false) {
					win_dim.width = 800;
					win_dim.height = 600;
					throw new Error('Err: GA001');
				}
				
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		
			var css_i = document.styleSheets.length-1;
			for (var i = 0; i < 4; i++) {
				try {
					if (document.styleSheets[css_i].insertRule) { // Mozilla
						document.styleSheets[document.styleSheets.length - 1].insertRule("div#" + this.quads[i].id + " {background-color:transparent;width: " + BigBlock.Grid.width/2 + "px;height: " + BigBlock.Grid.height/2 + "px;position: absolute;left: " + ((win_dim.width / 2) - (this.quads[i].left)) + "px;top: " + ((win_dim.height / 2) - (this.quads[i].top)) + "px;z-index: " + this.quads[i].zIndex + "}", 0);
					} else if (document.styleSheets[css_i].addRule) { // IE
						document.styleSheets[document.styleSheets.length - 1].addRule("div#" + this.quads[i].id, "background-color:transparent;width: " + BigBlock.Grid.width/2 + "px;height: " + BigBlock.Grid.height/2 + "px;position: absolute;left: " + ((win_dim.width / 2) - (this.quads[i].left)) + "px;top: " + ((win_dim.height / 2) - (this.quads[i].top)) + "px;z-index: " + this.quads[i].zIndex);
					} else {
						throw new Error('Err: GA002');
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
			}
						
			this.x = ((win_dim.width / 2) - (this.quads[0].left)); // set the Grid x, y to the first quad's x, y
			this.y = ((win_dim.height / 2) - (this.quads[0].top));
			
			var grid_quad;
			for (i in this.quads) {
				if (this.quads.hasOwnProperty(i)) {
					grid_quad = document.createElement('div');
					grid_quad.setAttribute('id', this.quads[i].id);
					document.body.appendChild(grid_quad);
					
					for (var key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							document.getElementById(this.quads[i].id).style[key] = this.styles[key];
						}
					}
				}															
			}
			
		
		},
		/**
		 * Creates a css rule for every position in the grid
		 * @param key
		 * @param value
		 * 
		 */		
		build : function () {
			
			var colNum = 0;
			var quad_width = BigBlock.Grid.width/2;
			var quad_height = BigBlock.Grid.height/2;
			var build_section_total = Math.round((quad_height/BigBlock.Grid.pix_dim))/2;
			
			var css_i = document.styleSheets.length-1;
			
			for (var i = 0; i < ((Math.round(quad_width/BigBlock.Grid.pix_dim) * Math.round(quad_height/BigBlock.Grid.pix_dim)) / build_section_total); i++) {
				if (colNum < Math.round(quad_width/BigBlock.Grid.pix_dim)) {
					colNum++;
				} else {
					colNum = 1;
				}
				
				if (i % Math.round(quad_width/BigBlock.Grid.pix_dim) === 0) {
					this.build_rowNum++;
				}

				try {
					if (document.styleSheets[css_i].insertRule) { // Mozilla
						document.styleSheets[document.styleSheets.length-1].insertRule(".pos" + (i + this.build_offset) + " {left:" + ((colNum - 1) * this.pix_dim) + "px;top:" + ((this.build_rowNum - 1) * this.pix_dim) + "px;}", 0); // setup pos rules
					} else if (document.styleSheets[css_i].addRule) { // IE
						document.styleSheets[document.styleSheets.length-1].addRule(".pos" + (i + this.build_offset), " left:" + ((colNum - 1) * this.pix_dim) + "px;top:" + ((this.build_rowNum - 1) * this.pix_dim) + "px"); // setup pos rules
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}

			var total_rules;
			try {
				
				if (document.styleSheets[css_i].cssRules) { // Mozilla
					total_rules = document.styleSheets[css_i].cssRules.length;		
				} else if (document.styleSheets[css_i].rules) { // IE
					total_rules = document.styleSheets[css_i].rules.length;				
				} else {
					throw new Error('Err: GB002');
				}
									
			} catch(f) {
				BigBlock.Log.display(f.name + ': ' + f.message);
			}
						
			this.build_offset = total_rules;
			
			BigBlock.Loader.update({
				'total' : Math.round((total_rules / (Math.round(quad_width/BigBlock.Grid.pix_dim) * Math.round(quad_height/BigBlock.Grid.pix_dim))) * 100)
			});
			
			end_time = new Date().getTime();
			
			if (total_rules < (Math.round(quad_width/BigBlock.Grid.pix_dim) * Math.round(quad_height/BigBlock.Grid.pix_dim))) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		buildCharStyles : function () {

			var css_i = document.styleSheets.length - 1;
			
			try {
				if (document.styleSheets[css_i].insertRule) { // Mozilla
					document.styleSheets[css_i].insertRule(".text_bg{background-color: transparent;}", 0);
					document.styleSheets[css_i].insertRule(".char{width : 1px;height : 1px;position: absolute;float: left;line-height:0px;font-size:1%;}", 0);					
				} else if (document.styleSheets[css_i].addRule) { // IE
					document.styleSheets[css_i].addRule(".text_bg", "background-color: transparent");
					document.styleSheets[css_i].addRule(".char", "width : 1px;height : 1px;position: absolute;float: left;line-height:0px;font-size:1%;");
				} else {
					throw new Error('Errr: GBCS001');
				}
							
				var col_count = 1;
				for (var i=0; i < this.char_width*this.char_height; i++) {
				
					if (document.styleSheets[css_i].insertRule) { // Mozilla
						document.styleSheets[css_i].insertRule(".char_pos" + (i + 1) + "{left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;}", 0);
					} else if (document.styleSheets[css_i].addRule) { // IE
						document.styleSheets[css_i].addRule(".char_pos" + (i + 1), "left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;");
					} else {
						throw new Error('Err: GBCS001');
					}
									
					if (col_count + 1 <= this.char_width) {
						col_count++;
					} else {
						col_count = 1;
					}
				}				
				
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
						
			return true;
		}						
				

	};
	
})();

/**
 * Background object
 * Builds a background image out of divs described in a passed array of json objects.
 * 
 * @author Vince Allen 07-12-2010
 */
BigBlock.Background = (function () {
	
	return {
		
		alias : 'bg',
		busy : false,
		/**
		 * Adds the Background image to the scene.
		 * 
		 * @param {Object} bg_pix
		 */		
		add: function(bg_pix, beforeAdd, afterAdd){
			
			try{
				if (typeof(bg_pix) != 'object') {
					throw new Error("Err: BA001");
				} else {
					
					this.busy = true;
					
					if (typeof(beforeAdd) == 'function') { 
						beforeAdd();
					}
										
					for (var i = 0; i < bg_pix.length; i++) {
						BigBlock.SpriteAdvanced.create({
							alias: this.alias,
							x: 0,
							y: 0,
							life: 0,
							render_static: true,
							anim_state: 'stop',
							anim_loop: 1,
							anim: [{
								'frm': {
									'duration': 3,
									'pix': [bg_pix[i]],
									'label': '1'
								}
							}]
						
						});
					}	
					
					this.busy = false;
					
					if (typeof(afterAdd) == 'function') { 
						afterAdd();
					}				
					
				}
				

			
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Replaces the Background image. Pass a function to run after replacement.
		 * 
		 * @param {Object} bg_pix
		 * @param {Object} callback
		 */		
		replace: function (bg_pix, callback) {
			BigBlock.Background.remove();
			BigBlock.Background.add(bg_pix);
			
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Removes the Header. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */		
		remove : function (callback) {
			
			for (var i in BigBlock.GridStatic.quads) {
				if (BigBlock.GridStatic.quads.hasOwnProperty(i)) {
				
					var grid_static = document.getElementById(BigBlock.GridStatic.quads[i].id);
					
					if (grid_static.hasChildNodes()) {
						pixNodes = grid_static.childNodes; // get a collection of all children in BigBlock.GridStatic.id;
						var divs_to_remove = []; // array to store reference to div
						for (var j = 0; j < pixNodes.length; j++) { // loop thru children
							if (this.alias == pixNodes[j].getAttribute('alias')) {
								divs_to_remove.push(pixNodes[j]); // cannot remove div here; pixNodes is a live collection; removing divs will re-index it
							}
						}
						
						for (j in divs_to_remove) { // loop thru references and remove from dom
							if (divs_to_remove.hasOwnProperty(j)) {
								grid_static.removeChild(divs_to_remove[j]);
							}
						}
						
					}
					
				}
			}
			
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Overrides defaults properties before Header is created.
		 * 
		 * @param {Object} params
		 */		
		setProps : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		/**
		 * Allows setting specific styles after Background has been created and body styles have been set.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setBodyStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: BSBS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: BSBS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var body = document.getElementsByTagName('body');						
			body[0].style[key] = value;			
		}
		
	};
	
})();


/**
 * Char
 * A generic object that carries core text charcter properties. All text characters appearing in a scene should inherit from the Char object.
 * Chars make Words.
 * 
 * @author Vince Allen 05-10-2010
 */

BigBlock.Char = (function () {
						
	return {
		/**
		 * Sets all properties.
		 */
		configure: function() {
			this.alias = 'Char';
			this.x = 80;
			this.y = 1;
			this.state = 'start';
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render; depends on this.x, this.y;
			
			this.value = 'B'; // the default character to render
			this.word_id = 'B'; // the id of the parent word; used to delete chars
			
			this.render = -1; // set to positive number to eventually not render this object; value decrements in render()
			this.clock = 0;
			
			this.index = BigBlock.Sprites.length; // the position of this object in the Sprite array
			this.angle = Math.degreesToRadians(0);
			this.vel = 0;
			this.step = 0;
			
			this.life = 0; // 0 = forever
			this.className = 'white'; // color
			this.color_index = this.className + '0';
			this.color_max = 0;
			this.pulse_rate = 10; // controls the pulse speed
			
			this.anim_frame = 0;
			this.anim_frame_duration = 0;	
			this.anim_loop = 1;
			this.anim_state = 'stop';
			
			this.action = function () {};
			
			this.render_static = true;  
			
			this.afterDie = null;					
			
		},
		/**
		 * Returns the anim property.
		 *  
		 * @param {String} color_index
		 */
		getAnim : function (color_index) {
			
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
		/**
		 * Returns the current frame from the anim property. Sets the color to this.color_index.
		 * 
		 * @param {Object} anim
		 */
		getPix : function (anim) {
			
			var a = anim[0];
			if (typeof(a.frm.pix[0]) != 'undefined') {
				a.frm.pix[0].c = this.color_index; // change to this.color_index
			}
			return a.frm;
		},
		/**
		 * Called by Timer every each time screen is rendered.
		 */				
		run : function () {
			switch (this.state) {
				case 'stop':
				break;
				case 'start':
					this.state = 'run';
				break;
				case 'run':
					this.action.call(this);
				break;			
			}
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
					
			this.img = this.getPix(this.anim); // get pixels
			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.className + Math.round(this.color_max * p); // life adjusts color
			} else {
				this.color_index = this.className + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock/this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
			}
				
			if (this.clock++ >= this.life && this.life !== 0) {
				BigBlock.Timer.killObject(this);
			} else {
				this.clock++; // increment lifecycle clock
			}
		},
		start : function () {
			this.state = 'start';
		},
		stop : function () {
			this.state = 'stop';
		},
		/**
		 * Removes the Char from the Sprites array.
		 * 
		 * @param {Function} callback
		 */
		die : function (callback) {
			this.render_static = false;
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			BigBlock.Timer.killObject(this);
		},
		goToFrame : function (arg, anim_frame, anim) {
			return goToFrame(arg, anim_frame, anim);
		}							
	};
	
})();

/**
 * Simple Char object
 * A single character object w no animation.
 * 
 * @author Vince Allen 05-10-2010
 */
BigBlock.CharSimple = (function () {
	
	return {
		
		/**
		 * Clones the Char objects. Runs configure(). Overrides any Char properties with passed properties. Adds this object to the Sprites array.
		 * 
		 * @param {Object} params
		 */
		create: function (params) {
			var obj = BigBlock.clone(BigBlock.Char);  // CLONE Char
			obj.configure(); // run configure() to inherit Char properties
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var j in palette.classes) { // get length of color palette for this className
				if (palette.classes[j].name == obj.className) {
					obj.color_max = palette.classes[j].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.className + '0'; // overwrite color_index w passed className
			
			obj.anim = obj.getAnim(obj.color_index); // get new anim w overwritten color_index
		
			obj.char_pos = BigBlock.CharPresets.getChar(obj.value);
			
			obj.render_static = true;
			
			BigBlock.Sprites.push(obj);

		}
	};
	
})();

/**
 * Color object
 * Defines the color palette available to pixels.
 * 
 * @author Vince Allen 12-05-2009
 */
/*global BigBlock, console, document */
BigBlock.Color = (function () {
	
	var palette = {'classes' : [ // default colors
		{name : 'white',val: ['rgb(255,255,255)']},	
		{name : 'black',val: ['rgb(0,0,0)']},
		{name : 'grey_dark',val: ['rgb(90,90,90)']},
		{name : 'grey',val: ['rgb(150,150,150)']},
		{name : 'grey_light',val: ['rgb(200,200,200)']},
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
	var className = 'white_black';
	palette.classes[palette.classes.length] = {'name' : {},'val' : []};
	var scale = "";
	for (var i = 255; i > -1; i--) {
		if (i !== 0) {
			scale += "rgb(" + i + ", " + i + ", " + i + ");";
		} else {
			scale += "rgb(" + i + ", " + i + ", " + i + ")";
		}
	}
	var colors = scale.split(";");				
	
	palette.classes[palette.classes.length-1].name = className;
	palette.classes[palette.classes.length-1].val = [];
	
	for (i in colors) { // insert a css rule for every color
		if (colors.hasOwnProperty(i)) {
			palette.classes[palette.classes.length - 1].val[i] = colors[i];
		}
	}
		
	function getPalette () {
		return palette;
	}
	function getTotalColors () {
		var total = 0;
		for (var i in palette.classes) {
			if (palette.classes.hasOwnProperty(i)) {
				total += palette.classes[i].val.length;
			}
		}
		return total;
	}				
	function addToPalette (class_name) {
		palette.classes.push(class_name);
	}				
	
	return {
		current_class : 0,
		
		build : function () {
			var p = getPalette();
			var css_i = document.styleSheets.length - 1;
			
			for (var i in p.classes[this.current_class].val) {
				
				try {
					if (document.styleSheets[css_i].insertRule) { // Mozilla
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {
							document.styleSheets[css_i].insertRule("div.color" + p.classes[this.current_class].name + i + " {background-color:" + p.classes[this.current_class].val[i] + ";}", 0);
						}					
					} else if (document.styleSheets[css_i].addRule) { // IE
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {					
							document.styleSheets[css_i].addRule("div.color" + p.classes[this.current_class].name + i, "background-color:" + p.classes[this.current_class].val[i]);
						}					
					} else {
						throw new Error('Err: CB001');
					}					
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
			}
					
			this.current_class++;
			
			var total_rules;
			try {
				if (document.styleSheets[css_i].cssRules) { // Mozilla
					BigBlock.Loader.update({
						'total' : Math.round((document.styleSheets[css_i].cssRules.length / (getTotalColors())) * 100)
					});
					total_rules = document.styleSheets[css_i].cssRules.length;		
				} else if (document.styleSheets[css_i].rules) { // IE
					BigBlock.Loader.update({
						'total' : Math.round((document.styleSheets[css_i].rules.length / (getTotalColors())) * 100)
					});
					total_rules = document.styleSheets[css_i].rules.length;				
				} else {
					throw new Error('Err: CB002');
				}					
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
			if (total_rules < getTotalColors()) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		add : function (params) {
			try {
				if (typeof(params) == 'undefined') {
					throw new Error(console.log('Err: CA001'));
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}			
			 
			for (var i in params.classes) {
				if (palette.classes.hasOwnProperty(i)) {
					addToPalette(params.classes[i]);
				}
			}
		},
		getPalette: function () {
			return getPalette();
		}
		
	};
	
})();


/**
 * Emitter
 * The Emitter object creates new Particle objects based on properites passed on Sprite.add().
 * Particles are single pixels with no animation.
 * 
 * @author Vince Allen 12-05-2009
 */
/*global BigBlock, document */
BigBlock.Emitter = (function () {
	
	getTransformVariants = function (x, y, p_life, p_life_spread, p_velocity, p_velocity_spread, p_angle_spread, p_init_pos_spread_x, p_life_offset_x, p_init_pos_spread_y, p_life_offset_y) {
		
		var vars = {};
		
		var val = Math.ceil(Math.random() * ((100 - (p_life_spread * 100)) + 1)); // life spread
		vars.life = Math.ceil(p_life * ((100 - val) / 100));
							
		val = Math.ceil(Math.random() * ((100 - (p_velocity_spread * 100)) + 1)); // velocity spread
		vars.vel = p_velocity * ((100 - val) / 100);
																
		var dir = [1, -1];
		
		var d = dir[Math.getRamdomNumber(0,1)];
		vars.angle_var = Math.ceil(Math.random() * (p_angle_spread + 1)) * d; // angle spread
		
		var x_d = dir[Math.getRamdomNumber(0,1)];
		var adjusted_x = 0;
		if (p_init_pos_spread_x !== 0) {
			adjusted_x = Math.ceil(Math.random() * (p_init_pos_spread_x * BigBlock.Grid.pix_dim)) * x_d; // init pos spread_x	
		}
		
		var per;
		if (p_life_offset_x == 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_x)/(p_init_pos_spread_x * BigBlock.Grid.pix_dim);
			
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}
		
		var y_d = dir[Math.getRamdomNumber(0,1)];
		var adjusted_y = Math.floor(Math.random() * (p_init_pos_spread_y * BigBlock.Grid.pix_dim)) * y_d; // init pos spread_y
		
		if (p_life_offset_y == 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_y)/(p_init_pos_spread_y * BigBlock.Grid.pix_dim);
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
			var emitter = BigBlock.clone(BigBlock.Sprite);  // CLONE Sprite
			emitter.configure(); // run configure() to inherit Sprite properties

			// Default emitter properties
			
			emitter.x = BigBlock.Grid.width/2;
			emitter.y = BigBlock.Grid.height/2 + BigBlock.Grid.height/3;
				
			emitter.alias = 'emitter';
			
			emitter.emission_rate = 3; // values closer to 1 equal more frequent emissions
			
			emitter.p_count = 0; // tracks total particles created
			
			emitter.p_burst = 3;

			emitter.p_velocity = 3;
			emitter.p_velocity_spread = 1; // values closer to zero create more variability
			emitter.p_angle = 270;
			emitter.p_angle_spread = 20;
			emitter.p_life = 100;
			emitter.p_life_spread = 0.5; // values closer to zero create more variability
			emitter.p_life_offset_x = 0; // boolean 0 = no offset; 1 = offset
			emitter.p_life_offset_y = 0;	 // boolean 0 = no offset; 1 = offset		
			emitter.p_gravity = 0;
			emitter.p_init_pos_spread_x = 0;
			emitter.p_init_pos_spread_y = 0;
			emitter.p_spiral_vel_x = 0;
			emitter.p_spiral_vel_y = 0;
			
			emitter.action = function () {};
																
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						emitter[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var j in palette.classes) { // get length of color palette for this className
				if (palette.classes[j].name == emitter.className) {
					emitter.color_max = palette.classes[j].val.length-1;
					break;
				}
			}
			
							
			emitter.anim = [
				{'frm':
					{
						'duration' : 1,
						'pix' : []	
					}
				}		
			];
							
				
			
			emitter.run = function () {

				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						if (this.clock % this.emission_rate === 0) {
							this.state = 'emit';
						}
						this.action.call(this);
					break;
					case 'emit':
						
						for (var i = 0; i < this.p_burst; i++) {
							
							vars = getTransformVariants(this.x, this.y, this.p_life, this.p_life_spread, this.p_velocity, this.p_velocity_spread, this.p_angle_spread, this.p_init_pos_spread_x, this.p_life_offset_x, this.p_init_pos_spread_y, this.p_life_offset_y);
									
							var p_params = {
								alias: 'particle',
								className : this.className, // particles inherit the emitter's class name
								x: vars.x,
								y: vars.y,
								life : vars.life,
								gravity: this.p_gravity,
								angle: Math.degreesToRadians(this.p_angle + vars.angle_var),
								vel: vars.vel,
								color_max : this.color_max,
								p_spiral_vel_x : this.p_spiral_vel_x,
								p_spiral_vel_y : this.p_spiral_vel_y										
							};
							
							BigBlock.Particle.create(p_params);

							this.p_count++;

						}
						this.state = 'start';
					break;			
				}						
				this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
						
				this.img = this.getPix(this.anim, this.color_index); // get pixels
					
				if (this.clock++ >= this.life && this.life !== 0 && this.state != 'dead') {
					BigBlock.Timer.killObject(this);
				} else {
					this.clock++; // increment lifecycle clock
				}
				
			};
			emitter.getPix = function (anim) {
				return [
						{'frm':
							{
								'duration' : 1,
								'pix' : [
											{'c':'particle','i':0}
								]	
							}								
						}
					];
			};
			emitter.start = function () {
				this.state = 'start';
			};
			emitter.stop = function () {
				this.state = 'stop';
			};						
			
			BigBlock.Sprites.push(emitter);

		}
	};
	
})();

/**
 * Footer object
 * Adds a div below the active area that's visible in iPhone full screen mode and Android default mode.
 * 
 * @author Vince Allen 07-21-2010
 */
BigBlock.Footer = (function () {
	
	return {
		
		alias : 'app_footer',
		width : 320,
		height : 56,
		styles : {
			'zIndex' : -1,
			'position' : 'absolute'	
		},
		/**
		 * Adds the Footer to the dom.
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 * @param {String} backgroundColor
		 */				
		add: function(x, y, backgroundColor){

			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('FA001');
				} else {
					var d = document.createElement('div');
					d.setAttribute('id', this.alias);
					document.body.appendChild(d);
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = y + 'px';	
					
					if (typeof(backgroundColor) != 'undefined') {
						this.styles.backgroundColor = backgroundColor;
					}

					for (key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							document.getElementById(this.alias).style[key] = this.styles[key];
						}
					}
														
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Removes the Footer. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */
		remove : function (callback) {
			var d = document.getElementById(this.alias);
			document.body.removeChild(d);		
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Overrides defaults properties before Footer is created.
		 * 
		 * @param {Object} params
		 */
		setProps : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		/**
		 * Sets an individual style after Footer has been created.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: FSS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: FSS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var d = document.getElementById(this.alias);						
			d.style[key] = value;			
		}
		
	};
	
})();


/**
 * Header object
 * Adds a div above the active area that's visible in iPhone full screen mode and Android default mode.
 * 
 * @author Vince Allen 07-21-2010
 */
BigBlock.Header = (function () {
	
	return {
		
		alias : 'app_header',
		width : 320,
		height : 56,
		styles : {
			'zIndex' : -1,
			'position' : 'absolute'	
		},
		/**
		 * Adds the Header to the dom.
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 * @param {String} backgroundColor
		 */				
		add: function(x, y, backgroundColor){

			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('Err: HA001');
				} else {
					var d = document.createElement('div');
					d.setAttribute('id', this.alias);
					document.body.appendChild(d);
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = (y - this.height) + 'px';	
					
					if (typeof(backgroundColor) != 'undefined') {
						this.styles.backgroundColor = backgroundColor;
					}

					for (key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							document.getElementById(this.alias).style[key] = this.styles[key];
						}
					}
														
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Removes the Header. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */
		remove : function (callback) {
			var d = document.getElementById(this.alias);
			document.body.removeChild(d);		
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Overrides defaults properties before Header is created.
		 * 
		 * @param {Object} params
		 */
		setProps : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		/**
		 * Sets an individual style after Header has been created.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: HSS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: HSS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var d = document.getElementById(this.alias);						
			d.style[key] = value;			
		}
		
	};
	
})();


/**
 * Input Feedback object
 * Renders a block where user either clicks or touches.
 * 
 * @author Vince Allen 05-29-2010
 */
BigBlock.InputFeedback = (function () {
	
	return {
		
		life : 10,
		className : 'white',
		configure: function (params) {
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
			
		},
		
		display : function (x, y) {
			
			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('Err: IFD001');
				} else {
					BigBlock.SpriteSimple.create({
						alias : 'input_feedback',
						className : this.className,
						x : x - BigBlock.GridActive.x,
						y : y - BigBlock.GridActive.y,
						life : this.life
					});					
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
				
			
		},
		die : function () {
			BigBlock.Sprites[BigBlock.getObjIdByAlias('input_feedback')].die();
			delete BigBlock.InputFeedback;
		}
			
	};
	
})();


/**
 * Behavior Library
 * Returns preset behaviors
 * 
 * @author Vince Allen 12-21-2010
 */
BigBlock.BehaviorPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name){
			
				switch (name) {
				
					case 'move_wallCollide':
						return function(){
							
							var vx = (this.vel * BigBlock.Grid.pix_dim) * Math.cos(this.angle);
							var vy = (this.vel * BigBlock.Grid.pix_dim) * Math.sin(this.angle);
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
					
					
					case 'move':
						return function(){
							this.x += BigBlock.Grid.pix_dim;
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
})();


/**
 * Character Library
 * Returns preset text characters
 * 
 * @author Vince Allen 05-10-2009
 */

BigBlock.CharPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getChar: function(name){
				var character = false;
				
				switch (name) {

					case ' ':
						character = [];
					break;
					
					case 'A':
					case 'a':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 21},
								{p : 25},
								{p : 29},
								{p : 33},
								{p : 37}	
														
							];
					break;
					
					case 'B':
					case 'b':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 25},
								{p : 29},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36}
														
							];
					break;					

					case 'C':
					case 'c':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 25},
								{p : 29},								
								{p : 34},
								{p : 35},
								{p : 36}
														
							];
					break;
					
					case 'D':
					case 'd':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 21},
								{p : 25},
								{p : 29},	
								{p : 33},							
								{p : 34},
								{p : 35},
								{p : 36}
														
							];
					break;

					case 'E':
					case 'e':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 25},	
								{p : 33},							
								{p : 34},
								{p : 35},
								{p : 36}						
							];
					break;
																									
					case 'F':
					case 'f':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 25},
								{p : 33}								
							];
					break;
					
					case 'G':
					case 'g':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 5},								
								{p : 9},
								{p : 17},
								{p : 20},
								{p : 21},
								{p : 25},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}								
							];
					break;					

					case 'H':
					case 'h':
						character = [
								{p : 1},
								{p : 5},
								{p : 9},
								{p : 13},								
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 21},
								{p : 25},
								{p : 29},
								{p : 33},
								{p : 37}								
							];
					break;

					case 'I':
					case 'i':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 11},								
								{p : 19},
								{p : 27},
								{p : 34},
								{p : 35},
								{p : 36}							
							];
					break;

					case 'J':
					case 'j':
						character = [
								{p : 5},
								{p : 13},
								{p : 21},
								{p : 25},								
								{p : 29},
								{p : 26},
								{p : 34},
								{p : 35},
								{p : 36}							
							];
					break;
					
					case 'K':
					case 'k':
						character = [
								{p : 1},
								{p : 5},
								{p : 9},
								{p : 12},
								{p : 17},								
								{p : 18},
								{p : 19},
								{p : 25},
								{p : 28},
								{p : 33},
								{p : 37}						
							];
					break;					

					case 'L':
					case 'l':
						character = [
								{p : 1},
								{p : 9},
								{p : 17},								
								{p : 25},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36}						
							];
					break;	
					
					case 'M':
					case 'm':
						character = [
								{p : 1},
								{p : 5},
								{p : 9},								
								{p : 10},
								{p : 12},
								{p : 13},
								{p : 17},
								{p : 19},
								{p : 21},
								{p : 25},
								{p : 29},
								{p : 33},
								{p : 37}						
							];
					break;

					case 'N':
					case 'n':
						character = [
								{p : 1},
								{p : 5},
								{p : 9},								
								{p : 10},
								{p : 13},
								{p : 17},
								{p : 19},
								{p : 21},
								{p : 25},
								{p : 28},
								{p : 29},								
								{p : 33},
								{p : 37}						
							];
					break;
					
					case 'O':
					case 'o':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},								
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 21},
								{p : 25},
								{p : 29},								
								{p : 34},
								{p : 35},
								{p : 36}						
							];
					break;					

					case 'P':
					case 'p':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},								
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},								
								{p : 25},
								{p : 33}						
							];
					break;

					case 'Q':
					case 'q':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},								
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 19},
								{p : 21},								
								{p : 25},
								{p : 28},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}						
							];
					break;

					case 'R':
					case 'r':
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},								
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 18},
								{p : 19},								
								{p : 20},
								{p : 25},
								{p : 29},
								{p : 33},
								{p : 37}						
							];
					break;

					case 'S':
					case 's':
						character = [
								{p : 2},
								{p : 3},
								{p : 4},	
								{p : 5},							
								{p : 9},
								{p : 18},
								{p : 19},								
								{p : 20},
								{p : 29},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36}						
							];
					break;
					
					case 'T':
					case 't':
						character = [
								{p : 1},	
								{p : 2},
								{p : 3},
								{p : 4},	
								{p : 5},							
								{p : 11},
								{p : 19},
								{p : 27},								
								{p : 35}					
							];
					break;					

					case 'U':
					case 'u':
						character = [
								{p : 1},	
								{p : 5},
								{p : 9},
								{p : 13},	
								{p : 17},							
								{p : 21},
								{p : 25},
								{p : 29},								
								{p : 34},								
								{p : 35},								
								{p : 36}					
							];
					break;

					case 'V':
					case 'v':
						character = [
								{p : 1},	
								{p : 5},
								{p : 9},
								{p : 13},	
								{p : 17},							
								{p : 21},
								{p : 26},
								{p : 28},								
								{p : 35}				
							];
					break;

					case 'W':
					case 'w':
						character = [
								{p : 1},	
								{p : 4},
								{p : 7},
								{p : 9},	
								{p : 12},							
								{p : 15},
								{p : 17},
								{p : 20},								
								{p : 23},								
								{p : 25},								
								{p : 28},								
								{p : 31},								
								{p : 34},								
								{p : 35},								
								{p : 37},								
								{p : 38}				
							];
					break;

					case 'X':
					case 'x':
						character = [
								{p : 1},	
								{p : 5},
								{p : 10},
								{p : 12},	
								{p : 19},							
								{p : 26},
								{p : 28},
								{p : 33},								
								{p : 37}				
							];
					break;

					case 'Y':
					case 'y':
						character = [
								{p : 1},	
								{p : 5},
								{p : 10},
								{p : 12},	
								{p : 19},							
								{p : 27},
								{p : 35}				
							];
					break;

					case 'Z':
					case 'z':
						character = [
								{p : 1},	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 5},
								{p : 12},
								{p : 19},	
								{p : 26},							
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}				
							];
					break;

					// numbers
					
					case '1':
						character = [
								{p : 3},	
								{p : 10},
								{p : 11},
								{p : 19},
								{p : 27},
								{p : 35}			
							];
					break;					

					case '2':
						character = [
								{p : 1},	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 13},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 25},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}			
							];
					break;	

					case '3':
						character = [
								{p : 1},	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 13},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 29},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36}			
							];
					break;

					case '4':
						character = [	
								{p : 3},
								{p : 4},
								{p : 10},
								{p : 12},
								{p : 17},
								{p : 20},
								{p : 25},
								{p : 26},
								{p : 27},
								{p : 28},
								{p : 29},
								{p : 36}			
							];
					break;

					case '5':
						character = [	
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 5},
								{p : 9},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 29},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36}			
							];
					break;
					
					case '6':
						character = [	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 25},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36}			
							];
					break;	
					
					case '7':
						character = [	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 5},
								{p : 13},
								{p : 20},
								{p : 27},
								{p : 35}		
							];
					break;	
					
					case '8':
						character = [	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 25},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36}		
							];
					break;													

					case '9':
						character = [	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 21},
								{p : 28},
								{p : 34},
								{p : 35},
								{p : 36}		
							];
					break;
					
					case '0':
						character = [	
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 13},
								{p : 17},
								{p : 21},
								{p : 25},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36}		
							];
					break;
																																			
					// arrows

					case 'arrow_down':
						character = [
								{p : 3},	
								{p : 11},	
								{p : 17},
								{p : 19},	
								{p : 21},	
								{p : 26},
								{p : 27},
								{p : 28},
								{p : 35}		
							];
					break;
					
					case 'arrow_up':
						character = [
								{p : 3},	
								{p : 10},	
								{p : 11},
								{p : 12},	
								{p : 17},	
								{p : 19},
								{p : 21},
								{p : 27},
								{p : 35}		
							];
					break;					

					case 'arrow_left':
						character = [
								{p : 3},	
								{p : 10},	
								{p : 17},
								{p : 18},	
								{p : 19},	
								{p : 20},
								{p : 21},
								{p : 26},
								{p : 35}		
							];
					break;
					
					case 'arrow_right':
						character = [
								{p : 3},	
								{p : 12},	
								{p : 17},
								{p : 18},	
								{p : 19},	
								{p : 20},
								{p : 21},
								{p : 28},
								{p : 35}		
							];
					break;					

					// punctuation

					case "!":
						character = [
								{p : 3},
								{p : 11},
								{p : 19},
								{p : 35}
							];
					break;	

					case "@":
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 9},
								{p : 11},
								{p : 13},
								{p : 17},
								{p : 19},
								{p : 20},
								{p : 21},
								{p : 25},
								{p : 34},
								{p : 35},
								{p : 36}
							];
					break;

					case "#":
						character = [
								{p : 2},
								{p : 4},
								{p : 9},
								{p : 10},
								{p : 11},
								{p : 12},
								{p : 13},
								{p : 18},
								{p : 20},
								{p : 25},
								{p : 26},
								{p : 27},
								{p : 28},
								{p : 29},
								{p : 34},
								{p : 36}
							];
					break;

					case "$":
						character = [
								{p : 2},
								{p : 3},
								{p : 4},
								{p : 5},
								{p : 9},
								{p : 11},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 27},
								{p : 29},
								{p : 33},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 43}
							];
					break;

					case "%":
						character = [
								{p : 1},
								{p : 2},
								{p : 4},
								{p : 9},
								{p : 10},
								{p : 12},
								{p : 19},
								{p : 26},
								{p : 28},
								{p : 29},
								{p : 34},
								{p : 36},
								{p : 37}
							];
					break;

					case "^":
						character = [
								{p : 3},
								{p : 10},
								{p : 12}
							];
					break;

					case "&":
						character = [
								{p : 2},
								{p : 3},
								{p : 9},
								{p : 12},
								{p : 18},
								{p : 19},
								{p : 25},
								{p : 29},
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}
							];
					break;

					case "*":
						character = [
								{p : 3},
								{p : 9},
								{p : 11},
								{p : 13},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 25},
								{p : 27},
								{p : 29},
								{p : 35}
							];
					break;

					case "(":
						character = [
								{p : 3},
								{p : 10},
								{p : 18},
								{p : 26},
								{p : 35}
							];
					break;
					
					case ")":
						character = [
								{p : 3},
								{p : 12},
								{p : 20},
								{p : 28},
								{p : 35}
							];
					break;	
					
					case "-":
						character = [
								{p : 18},
								{p : 19},
								{p : 20}
							];
					break;									

					case "_":
						character = [
								{p : 34},
								{p : 35},
								{p : 36},
								{p : 37}
							];
					break;
					
					case "=":
						character = [
								{p : 10},
								{p : 11},
								{p : 12},
								{p : 13},
								{p : 26},
								{p : 27},
								{p : 28},
								{p : 29}								
							];
					break;					

					case "+":
						character = [
								{p : 3},
								{p : 11},
								{p : 17},
								{p : 18},
								{p : 19},
								{p : 20},
								{p : 21},
								{p : 27},
								{p : 35}								
							];
					break;	

					case ";":
						character = [
								{p : 3},
								{p : 27},
								{p : 34}							
							];
					break;

					case ":":
						character = [
								{p : 11},
								{p : 35}							
							];
					break;

					case "'":
						character = [
								{p : 3},	
								{p : 10},		
								{p : 18}	
							];
					break;
																																																																																		
					case ',':
						character = [
								{p : 34},	
								{p : 41}			
							];
					break;
					
					case ".":
						character = [
								{p : 33}	
							];
					break;	

					case '<':
						character = [
								{p : 3},	
								{p : 10}	,	
								{p : 17},	
								{p : 26},	
								{p : 35}		
							];
					break;

					case '>':
						character = [
								{p : 3},	
								{p : 12}	,	
								{p : 21},	
								{p : 28},	
								{p : 35}		
							];
					break;

					case "/":
						character = [
								{p : 4},
								{p : 12},
								{p : 19},
								{p : 26},
								{p : 34}
							];
					break;	
																				
					case "?":
						character = [
								{p : 1},
								{p : 2},
								{p : 3},
								{p : 12},
								{p : 18},
								{p : 19},
								{p : 34}
							];
					break;																			

					case "{":
						character = [
								{p : 3},
								{p : 4},
								{p : 11},
								{p : 18},
								{p : 27},
								{p : 35},
								{p : 36}
							];
					break;

					case "}":
						character = [
								{p : 2},
								{p : 3},
								{p : 11},
								{p : 20},
								{p : 27},
								{p : 34},
								{p : 35}
							];
					break;	
					
					case "[":
						character = [
								{p : 3},
								{p : 4},
								{p : 11},
								{p : 19},
								{p : 27},
								{p : 35},
								{p : 36}
							];
					break;

					case "]":
						character = [
								{p : 2},
								{p : 3},
								{p : 11},
								{p : 19},
								{p : 27},
								{p : 34},
								{p : 35}
							];
					break;

					case "|":
						character = [
								{p : 3},
								{p : 11},
								{p : 19},
								{p : 27},
								{p : 35}
							];
					break;
																																																																																																																			
					default:
						
					break;					
				}
				
				// Params
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
						if (params.hasOwnProperty(i)) {
							em[i] = params[i];
						}
					}
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
})();



/**
 * Emitter Library
 * Returns preset Emitters
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.EmitterPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name, params){
				var grid = BigBlock.Grid;
				var em = {};
				
				switch (name) {
				
					case 'fire':
						em = {
							className : 'fire',
							x: grid.width / 2,
							y: grid.height / 1.25,
							life: 0,
							emission_rate: 1,
							//
							p_burst: 16,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 270,
							p_angle_spread: 0,
							p_life: 35,
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
							className : 'fire',
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
							p_life: 50,
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
							className : 'speak',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .75, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 15,
							p_life: 25,
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
							className : 'red_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 35,
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
							className : 'white_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 35,
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
							throw new Error('Err: EPGP001');
						} catch(e) {
							BigBlock.Log.display(e.name + ': ' + e.message);
						}
					break;					
				}
				
				// Params
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
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


/**
 * Loader object
 * Renders loading info to a div in the DOM
 * 
 * @author Vince Allen 12-05-2009
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
						
			//document.body.innerHTML = "<div id='" + this.id + "' class='" + this.class_name + "'><div id='" + this.id + "_bar' class='" + this.class_name + "_bar'>.</div></div>"; // insert the Loader container into the body

			var lc = document.createElement("div"); // create loader container div
			lc.setAttribute('id', this.id);			
			lc.setAttribute('class', this.class_name);
			if (typeof document.addEventListener != 'function') { // test for IE
				lc.setAttribute('className', this.class_name); // IE6
			}
														
			var b = document.getElementsByTagName('body');
			b[0].appendChild(lc); // add loader container to body

			var l = document.createElement("div"); // create loader
			l.setAttribute('id', this.id + '_bar');			
			l.setAttribute('class', this.class_name + '_bar');
			if (typeof document.addEventListener != 'function') { // test for IE
				l.setAttribute('className', this.class_name + '_bar'); // IE6
			}
		
			var lc_ = document.getElementById(this.id);
			lc_.appendChild(l); // add loader to loader container
									
			for (var key in this.style) { // loop thru styles and apply
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
			if (typeof(params) != 'undefined') {
				if (typeof(params.total) != 'undefined') {
					this.total = params.total;
				}
			}
			var width = (this.total/100) * 100;
			document.getElementById(this.id+'_bar').style.width = width + 'px';
		}
	};
	
})();


/**
 * Particle
 * Created by Emitters; the Emitter sets the intial properties and passes them to particles. They also inherit Sprite props.
 * 
 * @author Vince Allen 12-05-2009
 */

/*global Sprite, Grid, killObject */
BigBlock.Particle = (function () {

	getTransform = function (vel, angle, x, y, gravity, clock, life, className, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {
		var trans = {};									
		
		var spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_x * BigBlock.Grid.pix_dim));	
		var vx = (vel*BigBlock.Grid.pix_dim) * Math.cos(angle) + spiral_offset; // calculate how far obj should move on x,y axis

		spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_y * BigBlock.Grid.pix_dim));
		var vy = (vel*BigBlock.Grid.pix_dim) * Math.sin(angle) + spiral_offset;
		
		// uncomment to disregard spiral offset
		//var vx = (vel*BigBlock.Grid.pix_dim) * Math.cos(angle);
		//var vy = (vel*BigBlock.Grid.pix_dim) * Math.sin(angle);
		
		if (x + vx >= BigBlock.Grid.width) {
			//killObject(this); // !! 'this' is problematic here; created from a function invoked by call(); kills the obj invoking call()
		} else {
			trans.x = x + vx;
			trans.y = y + vy + (gravity*BigBlock.Grid.pix_dim);
		}
		
		var p = clock/life;
		trans.color_index = className + Math.round(color_max*p);
		return trans;
	};
			
	return {
		create: function(params){
			var particle = BigBlock.clone(BigBlock.Sprite); // CLONE Sprite
			particle.configure(); // run configure() to inherit Sprite properties
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						particle[i] = params[i];
					}
				}
			}
			
			particle.color_index = particle.className + '0'; // overwrite color_index w passed className
			
			particle.anim = [
					{'frm':
						{
							'duration' : 1,
							'pix' : [
										{'c':this.color_index,'i':0}
									]	
						}
					}		
				];
									
			particle.run = function () {

				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						
						var trans = getTransform(this.vel, this.angle, this.x, this.y, this.gravity, this.clock, this.life, this.className, this.color_max, this.p_spiral_vel_x, this.p_spiral_vel_y);
						this.x = trans.x;
						this.y = trans.y;
						this.color_index = trans.color_index;
						this.gravity *= 1.08;
															
					break;
					case 'dead':
					break;			
				}						
				this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
						
				this.img = this.getPix(this.anim, this.color_index); // get pixels
					
				if (this.clock++ >= this.life && this.life !== 0 && this.state != 'dead') {
					BigBlock.Timer.killObject(this);
				} else {
					this.clock++; // increment lifecycle clock
				}
				
			};
			particle.stop = function () {
				this.state = 'stop';
			};						

			BigBlock.Sprites.push(particle);
			
		}
		
		
	};
	
})();



/**
 * RenderManager object
 * Renders pixels to the grid.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.RenderMgr = (function () {
																		
	return {
						 				 
		renderPix : function (sprites) {
			
			/*
			 * CLEAN UP
			 * Resets the class of all divs in GridActive div
			 */
			
			var quads = BigBlock.GridActive.quads;
			
			for (var i in quads) {
				if (quads.hasOwnProperty(i)) {
					var q = document.getElementById(quads[i].id);
					
					if (q.hasChildNodes()) {
						pixNodes = q.childNodes; // get a collection of all children in quad;
						for (var j = 0; j < pixNodes.length; j++) { // reset classes in all children
							pixNodes[j].setAttribute('class', 'pix color');
							if (typeof document.addEventListener != 'function') { // test for IE
								pixNodes[j].setAttribute('className', 'pix color'); // IE6
							}				
						}
					}
				}		
			}
			
			if (document.getElementById('div_render_check')) { // remove render_check div
				var r = document.getElementsByTagName('body');
				r[0].removeChild(document.getElementById('div_render_check'));
			}							
			
			/*
			 * SPRITE LOOP
			 */
			
			// loop thru all existing non-text objects
			var parent_div;
			var pix_x;
			var pix_y;
			var div_id = 0;
			var d;
			for (i = 0; i < BigBlock.Sprites.length; i++) {
				
				/*
				 * RENDER CONDITIONS
				 * Do not render pixel or increment render counter if:
				 * Render property has timed out.
				 * State = 'dead'.
				 * 
				 * Do not render pixel but increment render counter if:
				 * Img property is undefined.
				 * Img.pix property is undefined.
				 * 
				 * Img.pix carries the properties of the pixel.
				 * c = the color class
				 * i = the position index in the grid
				 * 
				 * Do not render pixel but increment render and div_id if:
				 * Pixel position is off screen.
				 * 
				 * Static sprites are appended to the 'pix_grid_static' div and
				 * immediately deleted from the Sprite array. You cannot kill
				 * static sprites.
				 * 
				 */
				
				
				if (BigBlock.Sprites[i].render !== 0 && BigBlock.Sprites[i].state != 'dead') {
					
					var y = 0;
					if (typeof(BigBlock.Sprites[i].img) != 'undefined' && typeof(BigBlock.Sprites[i].img.pix) != 'undefined') {
						
						for (y in BigBlock.Sprites[i].img.pix) { // loop thru blocks attached to this Sprite
							
							// render pixel
							var pix_index_offset = BigBlock.Sprites[i].img.pix[y].i;
							var pix_index = pix_index_offset + BigBlock.Sprites[i].pix_index; 
							
							if (pix_index !== false) { // check that block is on screen; index should correspond to a location in the grid
								var color = BigBlock.Sprites[i].img.pix[y].c;
								
								var child = document.createElement("div");
								
								if (BigBlock.Sprites[i].render_static) {
								
									switch (BigBlock.Sprites[i].alias) {
										case 'Char':
											
											pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
											pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
											
											if (pix_x >= 0 && pix_x < BigBlock.GridStatic.width && pix_y >= 0 && pix_y < BigBlock.GridStatic.height) { // check that block is on screen
												pix_index = BigBlock.getPixIndex(pix_x, pix_y);
												child.setAttribute('class', 'pix text_bg pos' + pix_index); // overwrite class set above
												if (typeof document.addEventListener != 'function') { // test for IE
													child.setAttribute('className', 'pix text_bg pos' + pix_index); // IE6
													child.innerHTML = '.'; // IE6								
												}

												var char_pos = BigBlock.Sprites[i].char_pos; // get positions of all divs in the character
												for (k = 0; k < char_pos.length; k++) {
													var char_div = document.createElement("div");
													char_div.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color);													
													if (typeof document.addEventListener != 'function') { // test for IE
														char_div.setAttribute('className', 'char char_pos' + char_pos[k].p + ' color' + color); // IE6
														char_div.innerHTML = '.'; // IE6
													}
													child.appendChild(char_div); // add the character div to the Sprite's div							
												}
												child.setAttribute('id', BigBlock.Sprites[i].word_id);
												
												
												document.getElementById(BigBlock.RenderMgr.getQuad('text', pix_x, pix_y)).appendChild(child); 
											}
										
											
										break;
											
										default:

											pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
											pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
									
											if (pix_x >= 0 && pix_x < BigBlock.GridStatic.width && pix_y >= 0 && pix_y < BigBlock.GridStatic.height) { // check that block is on screen
												pix_index = BigBlock.getPixIndex(pix_x, pix_y);
												child.setAttribute('class', 'pix color' + color + ' pos' + pix_index);
												if (typeof document.addEventListener != 'function') { // test for IE
													child.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
													child.innerHTML = '.'; // IE6
												}
												child.setAttribute('id', '_static');
												child.setAttribute('alias', BigBlock.Sprites[i].alias);	
												
												
												document.getElementById(BigBlock.RenderMgr.getQuad('static', pix_x, pix_y)).appendChild(child);
											}

										break;
									}
								
								} else {
								
									d = document.getElementById(div_id);
									
									pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
									pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
									
									if (pix_x >= 0 && pix_x < BigBlock.GridActive.width && pix_y >= 0 && pix_y < BigBlock.GridActive.height) { // check that block is on screen
										
										pix_index = BigBlock.getPixIndex(pix_x, pix_y);
										
										if (!d) { // if this div does not exist, create it
											
											child.setAttribute('id', div_id);
											child.setAttribute('class', 'pix color' + color + ' pos' + pix_index); // update its class
											if (typeof document.addEventListener != 'function') { // test for IE
												child.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
												child.innerHTML = '.'; // IE6
											}
											
											document.getElementById(BigBlock.RenderMgr.getQuad('active', pix_x, pix_y)).appendChild(child); 
											
										} else {
											
											d.setAttribute('class', 'pix color' + color + ' pos' + pix_index); // update its class
											if (typeof document.addEventListener != 'function') { // test for IE
												d.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
											}
											
											parent_div = d.parentNode.getAttribute("id");
	
											var target_div = BigBlock.RenderMgr.getQuad('active', pix_x, pix_y);												 											
												
											if (parent_div != target_div) { // div does not switch quadrants
												document.getElementById(parent_div).removeChild(d); // remove div from old quad
												document.getElementById(target_div).appendChild(d); // append div to new quad
											}
	
										}
																			
									}

								}
								
							} else { // block is off screen
								d = document.getElementById(div_id);
								if (d) { // if div exists; remove it
									parent_div = d.parentNode.getAttribute("id");
									document.getElementById(parent_div).removeChild(d);
								}
							}
							div_id++; // increment the div_id; important for cycling thru static divs				
						}
						
					}					
					BigBlock.Sprites[i].render--; // decrement the render counter
				}
				if (BigBlock.Sprites[i].render_static && typeof(BigBlock.Sprites[i].img) != 'undefined') { // if this is a static object and the object has its img property
					BigBlock.Sprites[i].render_static = false; // MUST set the static property = 0; static sprites will not be deleted
					BigBlock.Sprites[i].die(); // kill the sprite
				}				
			}
			
			var div_render_check = document.createElement("div"); // add a div that event listeners will look for before executing commands; prevents triggering events while dom is busy
			div_render_check.setAttribute('id', 'div_render_check');
			var b = document.getElementsByTagName('body');
			b[0].appendChild(div_render_check);
		},
		
		/**
		 * Returns the correct quad grid based on passed x, y coords
		 * @param x
		 * @param y
		 * 
		 */		
		getQuad: function (quad_name, x, y) {
			
			var quad_obj;
			switch (quad_name) {
				case 'active':
					quad_obj = BigBlock.GridActive;
				break;
				case 'static':
					quad_obj = BigBlock.GridStatic;
				break;
				case 'text':
					quad_obj = BigBlock.GridText;
				break;								
			}
			
			if (x < BigBlock.Grid.width / 2 && y < BigBlock.Grid.height / 2) {
				return quad_obj.quads[0].id;
			}							
			if (x >= BigBlock.Grid.width/2 && y < BigBlock.Grid.height/2) {
				return quad_obj.quads[1].id;
			}
			if (x < BigBlock.Grid.width/2 && y >= BigBlock.Grid.height/2) {
				return quad_obj.quads[2].id;
			}
			if (x >= BigBlock.Grid.width/2 && y >= BigBlock.Grid.height/2) {
				return quad_obj.quads[3].id;
			}			
		},
		/**
		 * clearScene() will clear all divs from all quads as well as empty the Sprites array.
		 * 
		 * @param {Function} beforeClear
		 * @param {Function} afterClear
		 */
		clearScene: function(beforeClear, afterClear) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof(beforeClear) != 'undefined' && beforeClear != null) {
						if (typeof(beforeClear) != 'function') {
							throw new Error('Err: RMCS001');
						} else {
							beforeClear();
						}
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
				var quads;
				var i;
				var q;
				
				if (typeof(BigBlock.GridStatic) != 'undefined') {
					quads = BigBlock.GridStatic.quads;
					
					for (i in quads) {
						if (quads.hasOwnProperty(i)) {
							q = document.getElementById(quads[i].id);
							
							if (q.hasChildNodes()) {
								while (q.firstChild) {
									q.removeChild(q.firstChild);
								}
							}
						}
					}
					BigBlock.GridStatic.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridText) != 'undefined') {
					quads = BigBlock.GridText.quads;
					
					for (i in quads) {
						if (quads.hasOwnProperty(i)) {
							q = document.getElementById(quads[i].id);
							
							if (q.hasChildNodes()) {
								while (q.firstChild) {
									q.removeChild(q.firstChild);
								}
							}
						}
					}
					BigBlock.GridText.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridActive) != 'undefined') {
					quads = BigBlock.GridActive.quads;
					
					for (i in quads) {
						if (quads.hasOwnProperty(i)) {
							q = document.getElementById(quads[i].id);
							
							if (q.hasChildNodes()) {
								while (q.firstChild) {
									q.removeChild(q.firstChild);
								}
							}
						}
					}
					BigBlock.GridActive.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.Sprites) != 'undefined') {
					BigBlock.Sprites = [];
				}
				
				try {	
					if (typeof(afterClear) != 'undefined' && afterClear != null) {
						if (typeof(afterClear) != 'function') {
							throw new Error('Err: RMCS002');
						} else {
							afterClear();
						}
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
				}
				
				//
				
				BigBlock.inputBlock = false; // release user input block		
			
		}		
					
	};
	
})();



/**
 * ScreenEvent object
 * Defines all events.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.ScreenEvent = (function () {
	return {
		/**
		 * Sets the properties of the ScreenEvent object.
		 * params are passed as a json string. params can be an empty object ie. {}
		 * 
		 * 
		 * @param params
		 * 
		 */		
		create: function (params) {
			
			this.alias = "ScreenEvent"; // DO NOT REMOVE; Timer checks BigBlock.ScreenEvent.alias to determine if BigBlock.ScreenEvent has been created in the html file
			
			
			try {
				if (typeof(params) == 'undefined') {
					throw new Error('Err: SEC001');
				} else {
					
					/*
					 * The following properties are used to prevent the user from clicking/tapping to fast.
					 */
					this.event_start = new Date().getTime(); 
					this.event_end = 0; 
					this.event_time = 0;
					if (typeof(params.event_buffer) != 'undefined') { // can pass in an event_buffer
						this.event_buffer = params.event_buffer;
					} else {
						this.event_buffer = 200;
					}
				
					// MOUSEUP
					
					if (typeof(params.mouseup) != 'undefined') {
						this.mouseup_event = params.mouseup;
					} else {
						
						this.mouseup_event = function(event) {

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
							BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
							
							//
								
							if (event.preventDefault) {
								event.preventDefault();
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							}
							
							if (document.removeEventListener) { // mozilla
								document.removeEventListener('touchstart', BigBlock.ScreenEvent.touch_event, false);
							} // IE does not have an equivalent event; 07-22-2010
								
								
							if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {
									
								BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
								
								if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
									BigBlock.InputFeedback.display(event.clientX, event.clientY);
								}
			
								if (typeof(BigBlock.TapTimeout) != 'undefined') {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
								
								BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
							
							}
							
						};
						
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('mouseup', this.mouseup_event, false); // add mousedown event listener
					} else if (window.attachEvent) { // IE
						document.attachEvent('onmouseup', this.mouseup_event)
					}
					
					// MOUSEMOVE
		
					if (typeof(params.mousemove) != 'undefined') {
						this.mousemove_event = params.mousemove;
					} else {
						this.mousemove_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
														
							if (typeof(event.preventDefault) != 'undefined') {
								event.preventDefault();
							}
							
						};
						
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('mousemove', this.mousemove_event, false); // add mousemove event listener
					} else if (window.attachEvent) { // IE
						document.attachEvent('onmousemove', this.mousemove_event)
					}
										
					// MOUSEUP
		
					if (typeof(params.mousedown) != 'undefined') {
						this.mousedown_event = params.mousedown;
					} else {
						this.mousedown_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (typeof(event.preventDefault) != 'undefined') {
								event.preventDefault();
							}
							
						};
						
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('mousedown', this.mousedown_event, false); // add mouseup event listener
					} else if (window.attachEvent) { // IE
						document.attachEvent('onmousedown', this.mousedown_event)
					}				
					
					// TOUCH START
		
					if (typeof(params.touchstart) != 'undefined') {
						this.touch_event_start = params.touchstart;
					} else {
						this.touch_event_start = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
									
							BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
							BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
							
							//
												
							if (typeof(event.preventDefault) != 'undefined') {
								event.preventDefault();
							}
							
							this.touch = event.touches[0];
							
							document.removeEventListener('click', BigBlock.ScreenEvent.click_event, false);
							
							if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {
							
								BigBlock.ScreenEvent.frameAdvance(event, this.touch.clientX, this.touch.clientY);
								
								if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
									BigBlock.InputFeedback.display(this.touch.clientX, this.touch.clientY);
								}
								
								if (typeof(BigBlock.TapTimeout) != 'undefined') {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
								
								BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
								
							}
							
						};
					
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('touchstart', this.touch_event_start, false); // add touch event listener
					} // IE does not have an equivalent event; 07-22-2010
					
					// TOUCH MOVE
		
					if (typeof(params.touchmove) != 'undefined') {
						this.touch_event_move = params.touchmove;
					} else {
						this.touch_event_move = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (typeof(event.preventDefault) != 'undefined') {
								event.preventDefault();
							}

						};
						
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('touchmove', this.touch_event_move, false); // add touch event listener
					} // IE does not have an equivalent event; 07-22-2010
										
					// TOUCH END
		
					if (typeof(params.touchend) != 'undefined') {
						this.touch_event_end = params.touchend;
					} else {
						this.touch_event_end = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (typeof(event.preventDefault) != 'undefined') {
								event.preventDefault();
							}
							if (typeof(event.stopPropagation) != 'undefined') {
								event.stopPropagation();
							}					
							
						};
						
					}
					
					if (document.addEventListener) { // mozilla
						document.addEventListener('touchend', this.touch_event_end, false); // add touch event listener
					} // IE does not have an equivalent event; 07-22-2010
					
					//
										
					if (typeof(params.frameAdvance) != 'undefined') {
						this.frameAdvance = params.frameAdvance; // manages scene frames
					} else {
						this.frameAdvance = function (event, x, y) {

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
																			
							if (typeof(event.touches) != 'undefined') {
								var touch = event.touches[0];
							}
							
							switch (BigBlock.curentFrame) {
								
								case 1:
		
									if (typeof(BigBlock.TapTimeout) != 'undefined') {
										BigBlock.TapTimeout.die();
									}
									
								break;																														
																																													
							}					
						};
					}
					
					if (typeof(params.inputFeedback) != 'undefined') {
						this.inputFeedback = params.inputFeedback; // manages event input feedback
					}	
		
					
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
						
		}
	};
})();


/**
 * Sprite
 * A generic object that carries core sprite properties. All sprites appearing in a scene should inherit from the Sprite object.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.Sprite = (function () {
	
	function goToFrame (arg, anim_frame, anim) {
		try {
			if (typeof(arg) == 'undefined') {
				throw new Error('Err: SGTF001');
			}
			if (typeof(anim_frame) == 'undefined') {
				throw new Error('Err: SGTF002');
			}
			if (typeof(anim) == 'undefined') {
				throw new Error('Err: SGTF003');
			}						
		} catch(e) {
			BigBlock.Log.display(e.name + ': ' + e.message);
		}
				
		switch (typeof(arg)) {
			case 'number':
				try {
					if (arg - 1 < 0 || arg - 1 >= anim.length) {
						throw new Error('Err: SGTF004');
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
				}
				return arg-1;
			
			
			case 'string':
			
				switch (arg) {
					case 'nextFrame':
						return anim_frame++;	
					
					
					case 'lastFrame':
						return anim_frame--;
					
					
					default: // search for index of frame label
						var a = getFrameIndexByLabel(arg, anim);
						return a;
								
				}
			
			break;			
		}
		
	}
							
	function getFrameIndexByLabel (arg, anim) {
		try {
			if (typeof(arg) == 'undefined') {
				throw new Error('Err: SGFIBL001');
			}
			if (typeof(anim) == 'undefined') {
				throw new Error('Err: SGFIBL002');
			}			
		} catch(e) {
			BigBlock.Log.display(e.name + ': ' + e.message);
		}
				
		var error = 0;
		for (var i in anim) {
			if (anim.hasOwnProperty(i)) {
				if (arg == anim[i].frm.label) {
					return i;
				}
				error++;
			}
		}
		
		try {
			if (error !== 0) {
				throw new Error('Err: SGFIBL003');
			}
		} catch(er) {
			BigBlock.Log.display(er.name + ': ' + er.message);
		}
		
	}				
					
	return {
		configure: function(){
			this.alias = 'Sprite';
			this.x = 1;
			this.y = 1;
			this.state = 'start';
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render; depends on this.x, this.y;
			
			this.render = -1; // set to positive number to eventually not render this object; value decrements in render()
			this.clock = 0;
			
			this.index = BigBlock.Sprites.length; // the position of this object in the Sprite array
			this.angle = Math.degreesToRadians(0);
			this.vel = 0;
			this.step = 0;
			
			this.life = 0; // 0 = forever
			this.className = 'white'; // color
			this.color_index = this.className + '0';
			this.color_max = 0;
			this.pulse_rate = 10; // controls the pulse speed
			
			this.anim_frame = 0;
			this.anim_frame_duration = 0;	
			this.anim_loop = 1;
			this.anim_state = 'stop';
			
			this.afterDie = null;
			
			/*
			 * STATIC SPRITES
			 * if sprite never moves, set = 1 to prevents unneccessary cleanup and increase performance
			 * to kill the sprite, first set = 0, then call die()
			 * 
			 */
			
			this.render_static = false;  
			
			//
			
			this.action = function () {};					
			
		},
		getAnim : function (color_index) {
			
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
		getPix : function (anim) {
			
			var a = anim[0];
			if (typeof(a.frm.pix[0]) != 'undefined') {
				a.frm.pix[0].c = this.color_index; // change to this.color_index
			}
			return a.frm;
		},					
		run : function () {
			switch (this.state) {
				case 'stop':
				break;
				case 'start':
					this.state = 'run';
				break;
				case 'run':
					this.action.call(this);
				break;			
			}

			if (this.x >= 0 && this.x < BigBlock.Grid.width && this.y >= 0 && this.y < BigBlock.Grid.height) {
				this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
			} else {
				this.pix_index = false;
			}
					
			this.img = this.getPix(this.anim, this.color_index); // get pixels
			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.className + Math.round(this.color_max * p); // life adjusts color
			} else {
				if (this.pulse_rate !== 0) {
					this.color_index = this.className + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock / this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
				} else {
					this.color_index = this.className + '0';
				}
			}
				
			if (this.clock++ >= this.life && this.life !== 0) {
				BigBlock.Timer.killObject(this);
			} else {
				this.clock++; // increment lifecycle clock
			}
		},
		start : function () {
			this.state = 'start';
		},
		stop : function () {
			this.state = 'stop';
		},
		die : function (callback) {
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			BigBlock.Timer.killObject(this);
		},
		goToFrame : function (arg, anim_frame, anim) {
			return goToFrame(arg, anim_frame, anim);
		}				
	};
	
})();


/**
 * Advanced Sprite object
 * An extension of the simple Sprite object. Supports animation and multi-color. 
 * Anim is passed via Sprite.anim() as a json object. Colors are set in anim json.
 * 
 * 
 * @author Vince Allen 01-16-2009
 */
BigBlock.SpriteAdvanced = (function () { 
	
	return {
		
		create: function (params) {
			var sprite = BigBlock.clone(BigBlock.Sprite); // CLONE Sprite
			sprite.configure(); // run configure() to inherit Sprite properties

			sprite.anim = [ // will provide a single pixel if no anim param is supplied
					{'frm':
						{
							'duration' : 1,
							'pix' : [
										{'c':'white0','i':0}
									]	
						}
					}		
				]; // get blank anim
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						sprite[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var j in palette.classes) { // get length of color palette for this className
				if (palette.classes[j].name == sprite.className) {
					sprite.color_max = palette.classes[j].val.length-1;
					break;
				}
			}
									
			sprite.getPix = function (anim) { // overwrite the getPix function
				try {
					if (typeof(anim) == 'undefined') {
						throw new Error('Err: SAGP001');
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				switch (this.anim_state) {
					
					case 'stop':
						
						if (typeof(anim[this.anim_frame]) == 'undefined') {
							this.anim_frame = 0;
						}
						var a = anim[this.anim_frame];
						
						if (this.anim_frame_duration === 0) {
							a = anim[this.anim_frame];
							if (typeof(a.frm.enterFrame) == 'function') {
								a.frm.enterFrame.call(this);
							}
						}
						
						this.anim_frame_duration++;	

					break;
					
					case 'play':

		
						if (typeof(anim[this.anim_frame]) == 'undefined') {
							this.anim_frame = 0;
						}
						a = anim[this.anim_frame];
								
						var duration = a.frm.duration; // get this frame's duration
													
						if (this.anim_frame_duration < duration) { // check if the frame's current duration is less than the total duration
							
							if (this.anim_frame_duration === 0) { // if this
								a = anim[this.anim_frame];
								if (typeof(a.frm.enterFrame) == 'function') {
									a.frm.enterFrame.call(this);
								} // call enter frame
							} 
							
							this.anim_frame_duration++; // if yes, increment
							
						} else { // if no, call exitFrame() and advance frame	

						
							a = anim[this.anim_frame];
							if (typeof(a.frm.exitFrame) == 'function') {
								a.frm.exitFrame.call(this);
							} // call exit frame
							
							this.anim_frame_duration = 0;
							this.anim_frame++;
							
							if (typeof(anim[this.anim_frame]) == 'undefined') { // if anim is complete 
								if (this.anim_loop == 1) { // if anim should loop, reset anim_frame
									this.anim_frame = 0;
								} else { // if anim does NOT loop, send back an empty frame, kill object
									a = {'frm':
											{
												'duration' : 1,
												'pix' : []	
											}								
										};
									this.die(this);
									return a;
								}
							}
							

									
							a = anim[this.anim_frame];
		
						}
						
					break;
			
				}

				// always return frm regardless of state
				if (typeof(a) != 'undefined') {
					return a.frm;
				}
			};
			sprite.start = function () {
				this.anim_state = 'start';
			};
			sprite.stop = function () {
				this.anim_state = 'stop';
			};
			sprite.goToAndPlay = function (arg) {
				try {
					if (typeof(arg) == 'undefined') {
						throw new Error('Err: SAGTAP001');
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				this.anim_frame = this.goToFrame(arg, this.anim_frame, this.anim);
				this.anim_state = 'play';
			};
			sprite.goToAndStop = function (arg) {
				try {
					if (typeof(arg) == 'undefined') {
						throw new Error('Err: SAGTAS001');
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				this.anim_frame = this.goToFrame(arg, this.anim_frame, this.anim);
				
				if (typeof(arg) == 'number') {
					this.anim_frame_duration = 0;
				}
				this.anim_state = 'stop';
			};						

			BigBlock.Sprites.push(sprite);
			
		}
	};

})();


/**
 * Simple Sprite object
 * A single pixel object w no animation.
 * 
 * @author Vince Allen 01-16-2009
 */
BigBlock.SpriteSimple = (function () {
	
	return {
		
		create: function (params) {
			var sprite = BigBlock.clone(BigBlock.Sprite);  // CLONE Sprite
			sprite.configure(); // run configure() to inherit Sprite properties
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						sprite[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var j in palette.classes) { // get length of color palette for this className
				if (palette.classes[j].name == sprite.className) {
					sprite.color_max = palette.classes[j].val.length-1;
					break;
				}
			}
			
			sprite.color_index = sprite.className + '0'; // overwrite color_index w passed className
			
			sprite.anim = sprite.getAnim(sprite.color_index); // get new anim w overwritten color_index
			
			BigBlock.Sprites.push(sprite);
			

		}
	};
	
})();



/**
 * Tap Timeout object
 * Use to trigger a visual cue after a specified time interval.
 * 
 * @author Vince Allen 05-29-2010
 */
BigBlock.TapTimeout = (function () {
	
	return {
		
		timeout_length : 3000,
		timeout_obj : false,
		arrow_direction : 'up',
		x : BigBlock.Grid.width/2 - (BigBlock.Grid.pix_dim),
		y : BigBlock.Grid.height - (BigBlock.Grid.pix_dim * 2),
		className : "white",
		
		start: function (params) {
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
			
			this.timeout_obj = setTimeout("BigBlock.TapTimeout.display()", this.timeout_length);
			
		},
		
		display : function () {
			
			BigBlock.WordSimple.create({
				word_id : 'tap_timeout_word_tap',
				x : this.x,
				y : this.y,
				value : "tap",
				className : this.className
			});
			
			switch (this.arrow_direction) {

				case 'left':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x - (BigBlock.Grid.pix_dim * 2),
						y : this.y,
						value : "arrow_left",
						className : this.className
					});
				break;
				
				case 'right':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x,
						y : this.y,
						value : "arrow_right",
						className : this.className
					});
				break;

				case 'down':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x,
						y : this.y,
						value : "arrow_down",
						className : this.className
					});
				break;
																
				default:
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + BigBlock.Grid.pix_dim,
						y : this.y - BigBlock.Grid.pix_dim,
						value : "arrow_up",
						className : this.className
					});
				break;	
				

			}
		},

		stop : function () {
			
			clearTimeout(this.timeout_obj);
						
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')]) != 'undefined') {
				BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')].remove();
			}
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')]) != 'undefined') {
				BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')].remove();
			}
		},

		setProps : function (params) {
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
		},
				
		die : function () {
			this.stop();
			delete BigBlock.TapTimeout;
		}
			
	};
	
})();


/**
 * Timer object
 * Sets up a render loop based on the Javascript timer object.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.Timer = (function () {
	
	var build_start = new Date().getTime();
	
	function getBuildStart () {
		return build_start;
	}
	
	return {
		
		// public defaults
		alias : "Timer",
		frame_rate : 33, // set the frame rate in milliseconds
		start : new Date().getTime(),
		end : new Date().getTime(),
		time : 0,
		clock : 0,
		errors : [],
		build_start : new Date().getTime(),
		sprites_to_kill : [],
		tap_timeout : true,
		tap_timeout_params : false,
		input_feedback : true,
		input_feedback_grad : false,
		grid_active_styles : false,
		grid_static_styles : false,
		grid_text_styles : false,
		document_body_style : {
			backgroundColor : '#333'
		},
		app_header : false,
		app_header_styles : {

		},
		app_footer : false,
		app_footer_styles : {

		},			
		before_play : false,
		play : function(params) { // called after all objects are ready
					
			// Timer
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
						
			// <body>
			for (var key in this.document_body_style) { // loop thru styles and apply to <body>
				if (this.document_body_style.hasOwnProperty(key)) {
					var body = document.getElementsByTagName('body');				
					body[0].style[key] = this.document_body_style[key];
				}
			}

			// CORE STYLES
			
			var core_styles = document.createElement('style'); // add core style sheet
			core_styles.setAttribute('type', 'text/css');
			
			var head = document.getElementsByTagName('head');
			head[0].appendChild(core_styles);
			
			var css_i = document.styleSheets.length - 1;
			var css = {
				'body' : 'margin: 0;padding: 0;background-color:#ccc;',
				'div.color' : 'background-color : transparent;',
				'div.pix' : 'float:left;width:' + BigBlock.Grid.pix_dim + 'px;height:' + BigBlock.Grid.pix_dim + 'px;position:absolute;line-height:0px;font-size:1%;'
			};
			
			try {
				if (document.styleSheets[css_i].insertRule) { // Mozilla
					for (var i in css) {
						if (css.hasOwnProperty(i)) {
							document.styleSheets[css_i].insertRule(i + " {" + css[i] + "}", 0);
						}
					}
				} else if (document.styleSheets[css_i].addRule) { // IE
					for (var i in css) {
						if (css.hasOwnProperty(i)) {
							document.styleSheets[css_i].addRule(i, css[i], 0);
						}
					}
				} else {
					throw new Error('Err: TP001');
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}

			/**
			 * Create GridInit
			 * 
			 * The GridInit is added to the DOM before other Grids. It will trigger any scrollbars if app
			 * is viewed in a frame (Facebook). Subsequent Grids will calculate width and height accurately. 
			 */
			
			BigBlock.GridInit = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridInit.configure({
					'quads': [
						{'id' : 'qI_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : -100}, 
						{'id' : 'qI_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : 1}, 
						{'id' : 'qI_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : 1}, 
						{'id' : 'qI_br', 'left' : 0, 'top' : 0, 'zIndex' : 1}
					]
			});
												
			// Create GridActive
			
			BigBlock.GridActive = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridActive.configure({
					'quads': [
						{'id' : 'qA_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : 1}, 
						{'id' : 'qA_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : 1}, 
						{'id' : 'qA_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : 1}, 
						{'id' : 'qA_br', 'left' : 0, 'top' : 0, 'zIndex' : 1}
					],
					'styles' : this.grid_active_styles
			});

			// Create GridStatic
			
			BigBlock.GridStatic = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridStatic.configure({
					'quads': [
						{'id' : 'qS_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : -10}, 
						{'id' : 'qS_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : -1}, 
						{'id' : 'qS_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : -1}, 
						{'id' : 'qS_br', 'left' : 0, 'top' : 0, 'zIndex' : -1}
					],
					'styles' : this.grid_static_styles		
			});

			
			
			// Create GridText
			
			BigBlock.GridText = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridText.configure({
					'quads': [
						{'id' : 'qT_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : 20}, 
						{'id' : 'qT_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : 2}, 
						{'id' : 'qT_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : 2}, 
						{'id' : 'qT_br', 'left' : 0, 'top' : 0, 'zIndex' : 2}
					],
					'styles' : this.grid_text_styles					
			});
												
			// Input Feedback
			
			if (this.input_feedback === true) {
				if (this.input_feedback_grad !== false) {
					input_feedback = this.input_feedback_grad;
				} else {
					input_feedback = "rgb(255, 255, 255);rgb(239, 239, 239);rgb(216, 216, 216);rgb(189, 189, 189);rgb(159, 159, 159);rgb(127, 127, 127);rgb(96, 96, 96);rgb(66, 66, 66);rgb(39, 39, 39);rgb(16, 16, 16)";					
				}
				var my_palette = {
					'classes': [{
						name: 'input_feedback',
						val: input_feedback.split(";")
					}]
				};
				
				BigBlock.Color.add(my_palette);
				
				BigBlock.InputFeedback.configure({
					className: 'input_feedback'
				});
				
			}
			
			// Screen Event
			
			if (typeof(BigBlock.ScreenEvent.alias) == 'undefined') {
				BigBlock.ScreenEvent.create({});
			}
			
			//
			
			this.add_char_loader();
						
		},

		add_char_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			
			BigBlock.Loader.update();

			var char_styles = document.createElement('style'); // add color style sheet
			char_styles.setAttribute('type', 'text/css');
			var head = document.getElementsByTagName('head');
			head[0].appendChild(char_styles); 
			
			this.build_char();

		},
		
		build_char : function () {
			
			if (BigBlock.GridActive.buildCharStyles()) {
				this.add_color_loader();
			} else {
				var t = setTimeout(this.build_char, 1); // if not finishing building the colors, call again
			}
									
		},
				
		add_color_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			
			BigBlock.Loader.update();

			var color_styles = document.createElement('style'); // add color style sheet
			color_styles.setAttribute('type', 'text/css');
			var head = document.getElementsByTagName('head');
			head[0].appendChild(color_styles); 
			
			this.build_color();
	
		},
		
		build_color : function () {

			if (BigBlock.Color.build()) {
				BigBlock.Timer.add_grid_loader();
			} else {
				var t = setTimeout(BigBlock.Timer.build_color, 1); // if not finishing building the colors, call again
			}
									
		},
		
		add_grid_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			
			BigBlock.Loader.update();

			var grid_styles = document.createElement('style'); // add a style sheet node to the head element to hold grid styles
			grid_styles.setAttribute('type', 'text/css');
			var head = document.getElementsByTagName('head');
			head[0].appendChild(grid_styles);			

			BigBlock.Timer.build_grid();
									
					
		},
		build_grid : function(){
			
			if (BigBlock.GridActive.build()) {
				//document.body.innerHTML = ""; // clear the body of all elements
				while (document.getElementById('loader')) {
					var l = document.getElementById('loader');
					var b = document.getElementsByTagName('body');
					b[0].removeChild(l);
				}
				
				BigBlock.GridInit.add(); // add grid to DOM								
				BigBlock.GridActive.add(); // add grid to DOM
				BigBlock.GridStatic.add(); // add grid_static to DOM
				BigBlock.GridText.add(); // add grid_static to DOM
				for (var i in BigBlock.Sprites) { // loop thru Sprites and set state = start
					if (BigBlock.Sprites.hasOwnProperty(i)) {
						BigBlock.Sprites[i].state = 'start';
					}
				}
				
				BigBlock.Log.display(new Date().getTime() - getBuildStart() + 'ms'); // log the build time

				delete BigBlock.GridInit.build; // remove GridInit methods
				delete BigBlock.GridInit.add;				
				delete BigBlock.GridActive.build; // remove GridActive methods
				delete BigBlock.GridActive.add;
				delete BigBlock.GridStatic.add; // remove GridStatic methods				
				delete BigBlock.GridStatic.build;
				delete BigBlock.GridText.add; // remove GridText methods
				delete BigBlock.GridText.build;				
				delete BigBlock.Loader; // remove Loader object
				delete BigBlock.Timer.add_color_loader; // remove build methods
				delete BigBlock.Timer.build_color; 
				delete BigBlock.Timer.add_grid_loader; 
				delete BigBlock.Timer.build_grid; 
				delete BigBlock.Timer.play; 
				
				if (BigBlock.Timer.tap_timeout) {
					if (typeof(BigBlock.CharPresets.getChar) != 'function') { // if not already installed
						BigBlock.CharPresets = BigBlock.CharPresets.install(); // needed for timeout chars
					}
					if (typeof(BigBlock.TapTimeout) != 'undefined') {
						BigBlock.TapTimeout.start(BigBlock.Timer.tap_timeout_params); // setup tap timeout
					}
				}
						
				// app_header
				if (BigBlock.Timer.app_header !== false) {

					var header_x = BigBlock.GridActive.x;
					var header_y = BigBlock.GridActive.y;
					
					var header_bgColor;
					if (typeof(BigBlock.Timer.app_header_styles.backgroundColor) == 'undefined') {
						header_bgColor = BigBlock.Timer.document_body_style.backgroundColor;
					} else {
						header_bgColor = BigBlock.Timer.app_header_styles.backgroundColor;
					}
					
					BigBlock.Header.add(header_x, header_y, header_bgColor);						
				}
				
				// app_footer
				if (BigBlock.Timer.app_footer !== false) {

					var footer_x = BigBlock.GridActive.x;
					var footer_y = BigBlock.GridActive.y + BigBlock.GridActive.height;
					
					var footer_bgColor;
					if (typeof(BigBlock.Timer.app_footer_styles.backgroundColor) == 'undefined') {
						footer_bgColor = BigBlock.Timer.document_body_style.backgroundColor;
					} else {
						footer_bgColor = BigBlock.Timer.app_footer_styles.backgroundColor;
					}
					
					BigBlock.Footer.add(footer_x, footer_y, footer_bgColor);						
				}							
						
				// before_play()

				if (BigBlock.Timer.before_play !== false) {
					if (typeof(BigBlock.Timer.before_play) == 'function') {
						BigBlock.Timer.before_play();
					}
				}
							
				BigBlock.Timer.run();
			} else {
				var t = setTimeout(BigBlock.Timer.build_grid, 1); // if not finishing building the grid, call again
			}
		
		},
		run : function () {
			
			for (var i=0;i<BigBlock.Sprites.length;i++) {
				if (typeof(BigBlock.Sprites[i]) == "object") {
					if (typeof(BigBlock.Sprites[i].run) == "function") {
						BigBlock.Sprites[i].run();
					}
				}
			}
			
			BigBlock.Timer.cleanUpSprites();
				
			this.end = new Date().getTime(); // mark the end of the run
			this.time = this.end - this.start; // calculate how long the run took in milliseconds
			
			if (this.time <= this.frame_rate+1) {
				this.buffer = setTimeout('BigBlock.Timer.render()',this.frame_rate-this.time);
			} else {
				BigBlock.Timer.render();
			}

			
		},
		cleanUpSprites : function () {
			for (var i = 0; i < this.sprites_to_kill.length; i++) { // loop thru Timer.sprites_to_kill and tag Sprites to remove
				if (typeof(this.sprites_to_kill[i]) != 'undefined' && typeof(BigBlock.Sprites[this.sprites_to_kill[i]]) != 'undefined') {
					BigBlock.Sprites[this.sprites_to_kill[i]].state = 'dead'; // cannot remove sprites here bc indexes will be out of synch
				}
			}
			
			var reset_index = false;
			for (var y = 0; y < BigBlock.Sprites.length; y++) {
				if (BigBlock.Sprites[y].state == 'dead') { 
					
					if (typeof(BigBlock.Sprites[y].afterDie) == 'function') {
						BigBlock.Sprites[y].afterDie(); // call afterDie function
					}
					BigBlock.Sprites.splice(y, 1); // remove Sprite
					reset_index = true;		
				}
			}
			
			if (reset_index) { // only loop thru Sprites to reset index if a Sprite was removed from the array
				for (var x = 0; x < BigBlock.Sprites.length; x++) { // loop thru the Sprites and reset their index
					BigBlock.Sprites[x].index = x;
				}
			}	
			this.sprites_to_kill = [];			
		},
		render : function(){
			this.clock++;
									
			BigBlock.RenderMgr.renderPix(BigBlock.Sprites);
			
			this.buffer = setTimeout('BigBlock.Timer.run()',this.frame_rate); // call run again
			
			this.start = new Date().getTime(); // mark the beginning of the run
		},
		killObject : function (obj) {
			
			if (typeof(obj) != 'undefined') {
				if (typeof(BigBlock.Sprites[obj.index]) == "object") {
					
					try{
						if (BigBlock.Sprites[obj.index].render_static) {
							// static sprites are not in the Sprites array
						} else {
							this.sprites_to_kill.push(obj.index); // copy object to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
						}
					} catch(e) {
						BigBlock.Log.display(e.name + ': ' + e.message);
					}
				}
			}
		}												
		
		
	};
	
})();


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
	for (var i in BigBlock.Sprites) {
		if (BigBlock.Sprites[i].alias == alias) {
			id = i;
			return id;
		}
	}
	return id;
};

BigBlock.getObjIdByWordId = function (word_id) {
	var id = false;
	for (var i in BigBlock.Sprites) {
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
			  if (window.console && window.console.firebug) {
				console.log(str); // output error to Firebug console
			  } else {
				// other browsers
				}
			} catch(e) {
			  // do nothing
			}
		}
	};

})(); 

BigBlock.getUniqueId = function () {
     var dateObj = new Date();
     return dateObj.getTime() + BigBlock.Sprites.length;
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

	for (var i in BigBlock.GridStatic.quads) {
		if (BigBlock.GridStatic.quads.hasOwnProperty(i)) {
			
			var grid_static = document.getElementById(BigBlock.GridStatic.quads[i].id);
			
			if (grid_static.hasChildNodes()) {
				pixNodes = grid_static.childNodes; // get a collection of all children in BigBlock.GridText.id;
				var divs_to_remove = []; // array to store reference to div
				
				for (var j = 0; j < pixNodes.length; j++) { // loop thru children
					if (alias == pixNodes[j].getAttribute('alias')) {
						divs_to_remove.push(pixNodes[j]); // cannot remove div here; pixNodes is a live collection; removing divs will re-index it
					}
				}
				
				for (j in divs_to_remove) { // loop thru references and remove from dom
					if (divs_to_remove.hasOwnProperty(j)) {
						grid_static.removeChild(divs_to_remove[j]);
					}
				}
				
			}
					
		}
	}
									

	
	if (typeof(callback) == 'function') { 
		callback();
	}
		
				
};

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



/**
 * Word
 * A generic object that carries core word properties. All words appearing in a scene should inherit from the Word object.
 * 
 * @author Vince Allen 05-11-2010
 */

BigBlock.Word = (function () {
						
	return {
		configure: function(){
			this.alias = 'Word';
			this.word_id = 'word1';
			this.x = BigBlock.Grid.width/2;
			this.y = BigBlock.Grid.height/2;
			this.state = 'run';
			this.value = 'BIG BLOCK'; // the default character to render
			this.center = false; // set = true to center text			
			this.className = 'white'; // color
			this.afterDie = null;
			this.render = 0;
			this.render_static = true;
			this.index = BigBlock.Sprites.length; // the position of this object in the Sprite array
		},
		die : function (callback) { // use remove() to kill Words; !! need to change back to using this function
										
			
			
		},
		remove : function (callback) { // removes div from dom; the corresponding character objects have already been removed from the Sprites array
		
			var word_id = this.word_id;
			var quads = BigBlock.GridText.quads;
			
			for (var i in quads) {
				if (quads.hasOwnProperty(i)) {
					var q = document.getElementById(quads[i].id);
					
					if (q.hasChildNodes()) {
						pixNodes = q.childNodes; // get a collection of all children in BigBlock.GridText.id;
						var divs_to_remove = []; // array to store reference to div
						for (var j = 0; j < pixNodes.length; j++) { // loop thru children
							var id = pixNodes[j].getAttribute('id');
							if (id == word_id + '_char') {
								divs_to_remove.push(pixNodes[j]); // cannot remove div here; pixNodes is a live collection; removing divs will re-index it
							}
						}
						
						for (j in divs_to_remove) { // loop thru references and remove from dom
							if (divs_to_remove.hasOwnProperty(j)) {
								q.removeChild(divs_to_remove[j]);
							}
						}
						
					}
				}			
			}
			
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			
			// remove the word
			this.render_static = false;
			BigBlock.Timer.killObject(this);
			
						
		}
	};
	
})();


/**
 * Simple Word object
 * Loops thru passed word and creates characters.
 * All words on on the same horizontal line.
 * 
 * @author Vince Allen 05-11-2010
 */
BigBlock.WordSimple = (function () {
	
	return {
		create: function (params) {
			var obj = BigBlock.clone(BigBlock.Word);  // CLONE Word
			
			obj.configure(); // run configure() to inherit Word properties
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var j in params) {
					if (params.hasOwnProperty(j)) {
						obj[j] = params[j];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var i in palette.classes) { // get length of color palette for this className
				if (palette.classes[i].name == obj.className) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			// check to center text
			if (obj.center) {
				var word_width = obj.value.length * BigBlock.Grid.pix_dim;
				obj.x = BigBlock.Grid.width/2 - word_width/2;
			}

			try {
				if (typeof(BigBlock.CharPresets.getChar) == 'undefined') {
					throw new Error('Err: WSC001');
				} else {
					if (BigBlock.CharPresets.getChar(obj.value)) { // if the value of this word matches a preset in the character library, use a predefined character like 'arrow_up'
		
						BigBlock.CharSimple.create({
							word_id : obj.word_id + '_char', // pass the word id to the characters
							value: obj.value,
							x : obj.x,
							y : obj.y,
							className : obj.className
						});	
										
					} else {
		
						for (i=0;i<obj.value.length;i++) { // use a standard for loop to iterate over a string; Opera does not like using for..in
							BigBlock.CharSimple.create({
								word_id : obj.word_id + '_char', // pass the word id to the characters
								value: obj.value.substr(i,1),
								x : obj.x + (i * BigBlock.Grid.pix_dim),
								y : obj.y,
								className : obj.className
							});				
						}
										
					}				
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
					
			/* IMPORTANT: add Word after adding Chars; Word's index will be out of synch and Word will not be deleted after sprite loop in RenderManager
			 * Need to keep word in Sprites array so we have a reference to its characters when we need to remove them.
			 */
			BigBlock.Sprites.push(obj);
			
		}
	};
	
})();



