var BigBlock = {};
BigBlock.Sprites = [];

// initial props

BigBlock.curentFrame = 0;
BigBlock.inputBlock = false; // set = true to block user input
BigBlock.URL_ittybitty8bit = 'http://www.ittybitty8bit.com';
BigBlock.URL_Facebook = 'http://www.facebook.com/pages/ittybitty8bit/124916544219794';
BigBlock.URL_Twitter = 'http://www.twitter.com/ittybitty8bit';
BigBlock.CSSid_core = '.core';
BigBlock.CSSid_color = '.color';
BigBlock.CSSid_char_pos = '.char_pos';
BigBlock.CSSid_grid_pos = '.grid_pos';

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
		 * Removes the Background. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */		
		remove : function (callback) {
			
			for (var i = 0; i < BigBlock.GridStatic.quads.length; i++) {

				var gs = document.getElementById(BigBlock.GridStatic.quads[i].id);
				
				if (gs.hasChildNodes()) {
					
					var nodes = gs.childNodes; // get a collection of all children in BigBlock.GridStatic.id;
				
					var tmp = [];
					
					// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 
					for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}					
					
					for (var j = 0; j < tmp.length; j++) { // loop thru children
						if (this.alias == tmp[j].getAttribute('alias')) {
							gs.removeChild(tmp[j]); // remove from DOM
						}
					}
					
					tmp = null;
					
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
			var b = document.getElementsByTagName('body').item(0);						
			b.style[key] = value;			
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
			
			this.url = false;
			this.link_color = false;								
			
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
			
			var pal = BigBlock.Color.getPalette(); // Color
			for (i = 0; i < pal.classes.length; i++) { // get length of color palette for this className
				if (pal.classes[i].name == obj.className) {
					obj.color_max = pal.classes[i].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.className + '0'; // overwrite color_index w passed className
			
			obj.anim = obj.getAnim(obj.color_index); // get new anim w overwritten color_index
		
			obj.char_pos = BigBlock.CharPresets.getChar(obj.value, obj.font);
			
			obj.render_static = true;
			
			BigBlock.Sprites[BigBlock.Sprites.length] = obj;

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
	
	var pInfoLogo = "rgb(191, 192, 194);rgb(0, 0, 0);rgb(153, 153, 153);rgb(238, 137, 151);rgb(102, 102, 102);rgb(255, 255, 255);rgb(240, 78, 99);rgb(204, 204, 204);rgb(128, 145, 173);rgb(192, 239, 255)";
	var pPhnBg = "rgb(191, 192, 194);rgb(0, 0, 0);rgb(153, 153, 153);rgb(102, 102, 102);rgb(204, 204, 204);rgb(128, 145, 173);rgb(255, 255, 255);rgb(192, 239, 255)";
	var pTxtLogo = "rgb(238, 137, 151);rgb(255, 255, 255);rgb(240, 78, 99)";
	var pTxtPanel = "rgb(238, 137, 151);rgb(255, 255, 255);rgb(240, 78, 99)";
	
	var palette = {'classes' : [ // default colors
		{name: 'pInfoLogo',val: pInfoLogo.split(";")},
		{name: 'pPhnBg',val: pPhnBg.split(";")},
		{name: 'pTxtLogo',val: pTxtLogo.split(";")},
		{name: 'pTxtPanel',val: pTxtPanel.split(";")},
		{name : 'white',val: ['rgb(255,255,255)']},
		{name : 'black',val: ['rgb(0,0,0)']},
		{name : 'black0_glass',val: ['rgb(102,102,102)']},
		{name : 'grey_dark',val: ['rgb(90,90,90)']},
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
	var className = 'white_black';
	palette.classes[palette.classes.length] = {'name' : {},'val' : []};
	var s = "";
	for (var i = 255; i > -1; i -= 50) {
		if (i - 50 > -1) {
			s += "rgb(" + i + ", " + i + ", " + i + ");";
		} else {
			s += "rgb(" + i + ", " + i + ", " + i + ")";
		}
	}
	var colors = s.split(";");				
	
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
		for (var i = 0; i < palette.classes.length; i++) {
			total += palette.classes[i].val.length;
			
		}
		return total;
	}				
	function addToPalette (class_name) {
		palette.classes[palette.classes.length] = class_name;
	}				
	
	return {
		current_class : 0,
		
		build : function () {
			var p = getPalette();

			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_color);

			for (var i in p.classes[this.current_class].val) {
				
				try {
					if (s.insertRule) { // Mozilla
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {
							s.insertRule("div.color" + p.classes[this.current_class].name + i + " {background-color:" + p.classes[this.current_class].val[i] + ";}", 0);
						}					
					} else if (s.addRule) { // IE
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {					
							s.addRule("div.color" + p.classes[this.current_class].name + i, "background-color:" + p.classes[this.current_class].val[i] + ";color:" + p.classes[this.current_class].val[i]);
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
				if (s.cssRules) { // Mozilla
					BigBlock.Loader.update({
						'total' : Math.round((s.cssRules.length / (getTotalColors())) * 100)
					});
					total_rules = s.cssRules.length;		
				} else if (s.rules) { // IE
					BigBlock.Loader.update({
						'total' : Math.round((s.rules.length / (getTotalColors())) * 100)
					});
					total_rules = s.rules.length;				
				} else {
					throw new Error('Err: CB002');
				}					
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
			if (total_rules < getTotalColors()) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				for (i = 0; i < p.classes.length; i++) {
					delete BigBlock[p.classes[i].name]; // delete any color array properties after they've been added to CSS.
				}
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
			 
			for (var i = 0; i < params.classes.length; i++) {
				addToPalette(params.classes[i]);
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
	
	var getTransformVariants = function (x, y, p_life, p_life_spread, p_velocity, p_velocity_spread, p_angle_spread, p_init_pos_spread_x, p_life_offset_x, p_init_pos_spread_y, p_life_offset_y) {
		
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
			for (i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
				if (palette.classes[i].name == emitter.className) {
					emitter.color_max = palette.classes[i].val.length-1;
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
							
							var vars = getTransformVariants(this.x, this.y, this.p_life, this.p_life_spread, this.p_velocity, this.p_velocity_spread, this.p_angle_spread, this.p_init_pos_spread_x, this.p_life_offset_x, this.p_init_pos_spread_y, this.p_life_offset_y);
									
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
			
			BigBlock.Sprites[BigBlock.Sprites.length] = emitter;

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
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = y + 'px';	
					
					if (typeof(backgroundColor) != 'undefined') {
						this.styles.backgroundColor = backgroundColor;
					}
										
					for (key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							d.style[key] = this.styles[key];
						}
					}
					
					document.body.appendChild(d);
														
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
			for (var i = 0; i < this.quads.length; i++) {
				document.getElementById(this.quads[i].id).style[key] = value;
			}
			this.styles[key] = value; // save new value						
					
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
		
			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_grid_pos);
						
			for (var i = 0; i < 4; i++) {
				try {
					if (s.insertRule) { // Mozilla
						s.insertRule("div#" + this.quads[i].id + " {background-color:transparent;width: " + BigBlock.Grid.width/2 + "px;height: " + BigBlock.Grid.height/2 + "px;position: absolute;left: " + ((win_dim.width / 2) - (this.quads[i].left)) + "px;top: " + ((win_dim.height / 2) - (this.quads[i].top)) + "px;z-index: " + this.quads[i].zIndex + "}", 0);
					} else if (s.addRule) { // IE
						s.addRule("div#" + this.quads[i].id, "background-color:transparent;width: " + BigBlock.Grid.width/2 + "px;height: " + BigBlock.Grid.height/2 + "px;position: absolute;left: " + ((win_dim.width / 2) - (this.quads[i].left)) + "px;top: " + ((win_dim.height / 2) - (this.quads[i].top)) + "px;z-index: " + this.quads[i].zIndex);
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
			for (i = 0; i < this.quads.length; i++) {

				grid_quad = document.createElement('div');
				grid_quad.setAttribute('id', this.quads[i].id);

				for (var key in this.styles) {
					if (this.styles.hasOwnProperty(key)) {
						grid_quad.style[key] = this.styles[key];
					}
				}
			
				document.body.appendChild(grid_quad);																			
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

			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_grid_pos);	
			
			for (var i = 0; i < ((Math.round(quad_width/BigBlock.Grid.pix_dim) * Math.round(quad_height/BigBlock.Grid.pix_dim)) / build_section_total); i++) {
				if (colNum < Math.round(quad_width/BigBlock.Grid.pix_dim)) {
					colNum++;
				} else {
					colNum = 1;
				}
				
				if (i % Math.round(quad_width/BigBlock.Grid.pix_dim) === 0) {
					this.build_rowNum++;
				}


				if (s.insertRule) { // Mozilla
					s.insertRule(".pos" + (i + this.build_offset) + " {left:" + ((colNum - 1) * this.pix_dim) + "px;top:" + ((this.build_rowNum - 1) * this.pix_dim) + "px;}", 0); // setup pos rules
				} else if (s.addRule) { // IE
					s.addRule(".pos" + (i + this.build_offset), " left:" + ((colNum - 1) * this.pix_dim) + "px;top:" + ((this.build_rowNum - 1) * this.pix_dim) + "px"); // setup pos rules
				}

			}

			var total_rules;
			try {
				
				if (s.cssRules) { // Mozilla
					total_rules = s.cssRules.length-1; // must subtract 1 rule for the id selectorText added in the Timer	
				} else if (s.rules) { // IE
					total_rules = s.rules.length-1;				
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
					
			if (total_rules < (Math.round(quad_width/BigBlock.Grid.pix_dim) * Math.round(quad_height/BigBlock.Grid.pix_dim))) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		buildCharStyles : function () {
	
			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_char_pos);

			if (s.insertRule) { // Mozilla
				s.insertRule(".text_bg{background-color: transparent;}", 0);
				s.insertRule(".char{width : 1px;height : 1px;position: absolute;float: left;line-height:0px;font-size:1%;}", 0);					
			} else if (s.addRule) { // IE
				s.addRule(".text_bg", "background-color: transparent");
				s.addRule(".char", "width : 1px;height : 1px;position: absolute;float: left;line-height:0px;font-size:1%;");
			} 
						
			var col_count = 1;
			for (var i=0; i < this.char_width*this.char_height; i++) {
			
				if (s.insertRule) { // Mozilla
					s.insertRule(".char_pos" + (i + 1) + "{left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;}", 0);
				} else if (s.addRule) { // IE
					s.addRule(".char_pos" + (i + 1), "left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;");
				}
								
				if (col_count + 1 <= this.char_width) {
					col_count++;
				} else {
					col_count = 1;
				}
			}				
		
			return true;
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
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = (y - this.height) + 'px';	
					
					if (typeof(backgroundColor) != 'undefined') {
						this.styles.backgroundColor = backgroundColor;
					}

					for (key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							d.style[key] = this.styles[key];
						}
					}
					
					document.body.appendChild(d);
														
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

					case 'getRandomGraphic':
						
						/*
						 * Use to switch randomly bw an array of graphics saved as this.poses. Object must also have an idleTimeout property set to 0.
						 */
					
						return function () {
													
							if (this.idleTimeout == 0) {
								var alias = this.alias;
								this.idleTimeout = setTimeout(function(){
									var a = BigBlock.Sprites[BigBlock.getObjIdByAlias(alias)];
									if (typeof(a) != 'undefined') {
										a.goToAndStop(a.poses[Math.getRamdomNumber(0, a.poses.length-1)]);
										a.idleTimeout = 0;
									}
								}, Math.getRamdomNumber(500, 1000));
							}
							
						}

					
					case 'move_wallCollide':
					
						/*
						 * Block will rebound off walls defined by Grid. 
						 */
						
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
			getChar: function(val, font) {
				
				if (typeof(font) == 'undefined') {
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
 * Panel Library
 * Returns preset images for ittybitty8bit info panel.
 * 
 * @author Vince Allen 08-08-2010
 */

BigBlock.PanelInfoGraphics = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	function cnstr() { // All of the normal singleton code goes here.
		
		return {
			getImg: function(name) {
						
				var img = false;
						
				switch (name) {
							
					case 'pPhnBg':
					
						img = [
							{'frm':
								{
									'duration' : 1,									
									'pix' : [
										{'c':'pPhnBg0','i': (40*0)+2},{'c':'pPhnBg0','i': (40*0)+3},{'c':'pPhnBg0','i': (40*0)+4},{'c':'pPhnBg0','i': (40*0)+5},{'c':'pPhnBg0','i': (40*0)+6},{'c':'pPhnBg0','i': (40*0)+7},{'c':'pPhnBg0','i': (40*0)+8},{'c':'pPhnBg0','i': (40*0)+9},{'c':'pPhnBg0','i': (40*0)+10},{'c':'pPhnBg0','i': (40*0)+11},{'c':'pPhnBg0','i': (40*0)+12},{'c':'pPhnBg0','i': (40*0)+13},{'c':'pPhnBg0','i': (40*0)+14},{'c':'pPhnBg0','i': (40*0)+15},{'c':'pPhnBg0','i': (40*0)+16},{'c':'pPhnBg0','i': (40*0)+17},{'c':'pPhnBg0','i': (40*0)+18},{'c':'pPhnBg0','i': (40*1)+1},{'c':'pPhnBg1','i': (40*1)+2},{'c':'pPhnBg1','i': (40*1)+3},{'c':'pPhnBg1','i': (40*1)+4},{'c':'pPhnBg1','i': (40*1)+5},{'c':'pPhnBg1','i': (40*1)+6},{'c':'pPhnBg1','i': (40*1)+7},{'c':'pPhnBg1','i': (40*1)+8},{'c':'pPhnBg1','i': (40*1)+9},{'c':'pPhnBg1','i': (40*1)+10},{'c':'pPhnBg1','i': (40*1)+11},{'c':'pPhnBg1','i': (40*1)+12},{'c':'pPhnBg1','i': (40*1)+13},{'c':'pPhnBg1','i': (40*1)+14},{'c':'pPhnBg1','i': (40*1)+15},{'c':'pPhnBg1','i': (40*1)+16},{'c':'pPhnBg1','i': (40*1)+17},{'c':'pPhnBg1','i': (40*1)+18},{'c':'pPhnBg2','i': (40*1)+19},{'c':'pPhnBg0','i': (40*2)+0},{'c':'pPhnBg1','i': (40*2)+1},{'c':'pPhnBg1','i': (40*2)+2},{'c':'pPhnBg1','i': (40*2)+3},{'c':'pPhnBg1','i': (40*2)+4},{'c':'pPhnBg1','i': (40*2)+5},{'c':'pPhnBg1','i': (40*2)+6},{'c':'pPhnBg1','i': (40*2)+7},{'c':'pPhnBg1','i': (40*2)+8},{'c':'pPhnBg1','i': (40*2)+9},{'c':'pPhnBg1','i': (40*2)+10},{'c':'pPhnBg1','i': (40*2)+11},{'c':'pPhnBg1','i': (40*2)+12},{'c':'pPhnBg1','i': (40*2)+13},{'c':'pPhnBg1','i': (40*2)+14},{'c':'pPhnBg1','i': (40*2)+15},{'c':'pPhnBg1','i': (40*2)+16},{'c':'pPhnBg1','i': (40*2)+17},{'c':'pPhnBg1','i': (40*2)+18},{'c':'pPhnBg1','i': (40*2)+19},{'c':'pPhnBg3','i': (40*2)+20},{'c':'pPhnBg0','i': (40*3)+0},{'c':'pPhnBg1','i': (40*3)+1},{'c':'pPhnBg1','i': (40*3)+2},{'c':'pPhnBg1','i': (40*3)+3},{'c':'pPhnBg1','i': (40*3)+4},{'c':'pPhnBg1','i': (40*3)+5},{'c':'pPhnBg1','i': (40*3)+6},{'c':'pPhnBg1','i': (40*3)+7},{'c':'pPhnBg1','i': (40*3)+8},{'c':'pPhnBg3','i': (40*3)+9},{'c':'pPhnBg3','i': (40*3)+10},{'c':'pPhnBg3','i': (40*3)+11},{'c':'pPhnBg1','i': (40*3)+12},{'c':'pPhnBg1','i': (40*3)+13},{'c':'pPhnBg1','i': (40*3)+14},{'c':'pPhnBg1','i': (40*3)+15},{'c':'pPhnBg1','i': (40*3)+16},{'c':'pPhnBg1','i': (40*3)+17},{'c':'pPhnBg1','i': (40*3)+18},{'c':'pPhnBg1','i': (40*3)+19},{'c':'pPhnBg3','i': (40*3)+20},{'c':'pPhnBg0','i': (40*4)+0},{'c':'pPhnBg1','i': (40*4)+1},{'c':'pPhnBg1','i': (40*4)+2},{'c':'pPhnBg1','i': (40*4)+3},{'c':'pPhnBg1','i': (40*4)+4},{'c':'pPhnBg1','i': (40*4)+5},{'c':'pPhnBg1','i': (40*4)+6},{'c':'pPhnBg1','i': (40*4)+7},{'c':'pPhnBg1','i': (40*4)+8},{'c':'pPhnBg1','i': (40*4)+9},{'c':'pPhnBg1','i': (40*4)+10},{'c':'pPhnBg1','i': (40*4)+11},{'c':'pPhnBg1','i': (40*4)+12},{'c':'pPhnBg1','i': (40*4)+13},{'c':'pPhnBg1','i': (40*4)+14},{'c':'pPhnBg1','i': (40*4)+15},{'c':'pPhnBg1','i': (40*4)+16},{'c':'pPhnBg1','i': (40*4)+17},{'c':'pPhnBg1','i': (40*4)+18},{'c':'pPhnBg1','i': (40*4)+19},{'c':'pPhnBg3','i': (40*4)+20},{'c':'pPhnBg0','i': (40*5)+0},{'c':'pPhnBg1','i': (40*5)+1},{'c':'pPhnBg1','i': (40*5)+2},{'c':'pPhnBg1','i': (40*5)+3},{'c':'pPhnBg1','i': (40*5)+4},{'c':'pPhnBg1','i': (40*5)+5},{'c':'pPhnBg1','i': (40*5)+6},{'c':'pPhnBg1','i': (40*5)+7},{'c':'pPhnBg1','i': (40*5)+8},{'c':'pPhnBg1','i': (40*5)+9},{'c':'pPhnBg1','i': (40*5)+10},{'c':'pPhnBg1','i': (40*5)+11},{'c':'pPhnBg1','i': (40*5)+12},{'c':'pPhnBg1','i': (40*5)+13},{'c':'pPhnBg1','i': (40*5)+14},{'c':'pPhnBg1','i': (40*5)+15},{'c':'pPhnBg1','i': (40*5)+16},{'c':'pPhnBg1','i': (40*5)+17},{'c':'pPhnBg1','i': (40*5)+18},{'c':'pPhnBg1','i': (40*5)+19},{'c':'pPhnBg3','i': (40*5)+20},{'c':'pPhnBg0','i': (40*6)+0},{'c':'pPhnBg1','i': (40*6)+1},{'c':'pPhnBg4','i': (40*6)+2},{'c':'pPhnBg4','i': (40*6)+3},{'c':'pPhnBg4','i': (40*6)+4},{'c':'pPhnBg4','i': (40*6)+5},{'c':'pPhnBg4','i': (40*6)+6},{'c':'pPhnBg4','i': (40*6)+7},{'c':'pPhnBg4','i': (40*6)+8},{'c':'pPhnBg4','i': (40*6)+9},{'c':'pPhnBg4','i': (40*6)+10},{'c':'pPhnBg4','i': (40*6)+11},{'c':'pPhnBg4','i': (40*6)+12},{'c':'pPhnBg4','i': (40*6)+13},{'c':'pPhnBg4','i': (40*6)+14},{'c':'pPhnBg4','i': (40*6)+15},{'c':'pPhnBg4','i': (40*6)+16},{'c':'pPhnBg4','i': (40*6)+17},{'c':'pPhnBg4','i': (40*6)+18},{'c':'pPhnBg1','i': (40*6)+19},{'c':'pPhnBg3','i': (40*6)+20},{'c':'pPhnBg0','i': (40*7)+0},{'c':'pPhnBg1','i': (40*7)+1},{'c':'pPhnBg5','i': (40*7)+2},{'c':'pPhnBg5','i': (40*7)+3},{'c':'pPhnBg5','i': (40*7)+4},{'c':'pPhnBg5','i': (40*7)+5},{'c':'pPhnBg5','i': (40*7)+6},{'c':'pPhnBg5','i': (40*7)+7},{'c':'pPhnBg5','i': (40*7)+8},{'c':'pPhnBg5','i': (40*7)+9},{'c':'pPhnBg5','i': (40*7)+10},{'c':'pPhnBg5','i': (40*7)+11},{'c':'pPhnBg5','i': (40*7)+12},{'c':'pPhnBg5','i': (40*7)+13},{'c':'pPhnBg5','i': (40*7)+14},{'c':'pPhnBg5','i': (40*7)+15},{'c':'pPhnBg5','i': (40*7)+16},{'c':'pPhnBg5','i': (40*7)+17},{'c':'pPhnBg5','i': (40*7)+18},{'c':'pPhnBg1','i': (40*7)+19},{'c':'pPhnBg3','i': (40*7)+20},{'c':'pPhnBg0','i': (40*8)+0},{'c':'pPhnBg1','i': (40*8)+1},{'c':'pPhnBg5','i': (40*8)+2},{'c':'pPhnBg5','i': (40*8)+3},{'c':'pPhnBg6','i': (40*8)+4},{'c':'pPhnBg6','i': (40*8)+5},{'c':'pPhnBg6','i': (40*8)+6},{'c':'pPhnBg6','i': (40*8)+7},{'c':'pPhnBg6','i': (40*8)+8},{'c':'pPhnBg6','i': (40*8)+9},{'c':'pPhnBg6','i': (40*8)+10},{'c':'pPhnBg6','i': (40*8)+11},{'c':'pPhnBg6','i': (40*8)+12},{'c':'pPhnBg6','i': (40*8)+13},{'c':'pPhnBg6','i': (40*8)+14},{'c':'pPhnBg6','i': (40*8)+15},{'c':'pPhnBg6','i': (40*8)+16},{'c':'pPhnBg5','i': (40*8)+17},{'c':'pPhnBg5','i': (40*8)+18},{'c':'pPhnBg1','i': (40*8)+19},{'c':'pPhnBg3','i': (40*8)+20},{'c':'pPhnBg0','i': (40*9)+0},{'c':'pPhnBg1','i': (40*9)+1},{'c':'pPhnBg5','i': (40*9)+2},{'c':'pPhnBg5','i': (40*9)+3},{'c':'pPhnBg6','i': (40*9)+4},{'c':'pPhnBg6','i': (40*9)+5},{'c':'pPhnBg6','i': (40*9)+6},{'c':'pPhnBg6','i': (40*9)+7},{'c':'pPhnBg6','i': (40*9)+8},{'c':'pPhnBg6','i': (40*9)+9},{'c':'pPhnBg6','i': (40*9)+10},{'c':'pPhnBg6','i': (40*9)+11},{'c':'pPhnBg6','i': (40*9)+12},{'c':'pPhnBg6','i': (40*9)+13},{'c':'pPhnBg6','i': (40*9)+14},{'c':'pPhnBg6','i': (40*9)+15},{'c':'pPhnBg6','i': (40*9)+16},{'c':'pPhnBg5','i': (40*9)+17},{'c':'pPhnBg5','i': (40*9)+18},{'c':'pPhnBg1','i': (40*9)+19},{'c':'pPhnBg3','i': (40*9)+20},{'c':'pPhnBg0','i': (40*10)+0},{'c':'pPhnBg1','i': (40*10)+1},{'c':'pPhnBg5','i': (40*10)+2},{'c':'pPhnBg5','i': (40*10)+3},{'c':'pPhnBg5','i': (40*10)+4},{'c':'pPhnBg5','i': (40*10)+5},{'c':'pPhnBg5','i': (40*10)+6},{'c':'pPhnBg5','i': (40*10)+7},{'c':'pPhnBg5','i': (40*10)+8},{'c':'pPhnBg5','i': (40*10)+9},{'c':'pPhnBg5','i': (40*10)+10},{'c':'pPhnBg5','i': (40*10)+11},{'c':'pPhnBg5','i': (40*10)+12},{'c':'pPhnBg5','i': (40*10)+13},{'c':'pPhnBg5','i': (40*10)+14},{'c':'pPhnBg5','i': (40*10)+15},{'c':'pPhnBg5','i': (40*10)+16},{'c':'pPhnBg5','i': (40*10)+17},{'c':'pPhnBg5','i': (40*10)+18},{'c':'pPhnBg1','i': (40*10)+19},{'c':'pPhnBg3','i': (40*10)+20},{'c':'pPhnBg0','i': (40*11)+0},{'c':'pPhnBg1','i': (40*11)+1},{'c':'pPhnBg7','i': (40*11)+2},{'c':'pPhnBg7','i': (40*11)+3},{'c':'pPhnBg7','i': (40*11)+4},{'c':'pPhnBg7','i': (40*11)+5},{'c':'pPhnBg7','i': (40*11)+6},{'c':'pPhnBg7','i': (40*11)+7},{'c':'pPhnBg7','i': (40*11)+8},{'c':'pPhnBg7','i': (40*11)+9},{'c':'pPhnBg7','i': (40*11)+10},{'c':'pPhnBg7','i': (40*11)+11},{'c':'pPhnBg7','i': (40*11)+12},{'c':'pPhnBg7','i': (40*11)+13},{'c':'pPhnBg7','i': (40*11)+14},{'c':'pPhnBg7','i': (40*11)+15},{'c':'pPhnBg7','i': (40*11)+16},{'c':'pPhnBg7','i': (40*11)+17},{'c':'pPhnBg7','i': (40*11)+18},{'c':'pPhnBg1','i': (40*11)+19},{'c':'pPhnBg3','i': (40*11)+20},{'c':'pPhnBg0','i': (40*12)+0},{'c':'pPhnBg1','i': (40*12)+1},{'c':'pPhnBg7','i': (40*12)+2},{'c':'pPhnBg7','i': (40*12)+3},{'c':'pPhnBg7','i': (40*12)+4},{'c':'pPhnBg7','i': (40*12)+5},{'c':'pPhnBg7','i': (40*12)+6},{'c':'pPhnBg7','i': (40*12)+7},{'c':'pPhnBg7','i': (40*12)+8},{'c':'pPhnBg7','i': (40*12)+9},{'c':'pPhnBg7','i': (40*12)+10},{'c':'pPhnBg7','i': (40*12)+11},{'c':'pPhnBg7','i': (40*12)+12},{'c':'pPhnBg7','i': (40*12)+13},{'c':'pPhnBg7','i': (40*12)+14},{'c':'pPhnBg7','i': (40*12)+15},{'c':'pPhnBg7','i': (40*12)+16},{'c':'pPhnBg7','i': (40*12)+17},{'c':'pPhnBg7','i': (40*12)+18},{'c':'pPhnBg1','i': (40*12)+19},{'c':'pPhnBg3','i': (40*12)+20},{'c':'pPhnBg0','i': (40*13)+0},{'c':'pPhnBg1','i': (40*13)+1},{'c':'pPhnBg7','i': (40*13)+2},{'c':'pPhnBg7','i': (40*13)+3},{'c':'pPhnBg7','i': (40*13)+4},{'c':'pPhnBg7','i': (40*13)+5},{'c':'pPhnBg7','i': (40*13)+6},{'c':'pPhnBg7','i': (40*13)+7},{'c':'pPhnBg7','i': (40*13)+8},{'c':'pPhnBg7','i': (40*13)+9},{'c':'pPhnBg7','i': (40*13)+10},{'c':'pPhnBg7','i': (40*13)+11},{'c':'pPhnBg7','i': (40*13)+12},{'c':'pPhnBg7','i': (40*13)+13},{'c':'pPhnBg7','i': (40*13)+14},{'c':'pPhnBg7','i': (40*13)+15},{'c':'pPhnBg7','i': (40*13)+16},{'c':'pPhnBg7','i': (40*13)+17},{'c':'pPhnBg7','i': (40*13)+18},{'c':'pPhnBg1','i': (40*13)+19},{'c':'pPhnBg3','i': (40*13)+20},{'c':'pPhnBg0','i': (40*14)+0},{'c':'pPhnBg1','i': (40*14)+1},{'c':'pPhnBg7','i': (40*14)+2},{'c':'pPhnBg7','i': (40*14)+3},{'c':'pPhnBg7','i': (40*14)+4},{'c':'pPhnBg7','i': (40*14)+5},{'c':'pPhnBg7','i': (40*14)+6},{'c':'pPhnBg7','i': (40*14)+7},{'c':'pPhnBg7','i': (40*14)+8},{'c':'pPhnBg7','i': (40*14)+9},{'c':'pPhnBg7','i': (40*14)+10},{'c':'pPhnBg7','i': (40*14)+11},{'c':'pPhnBg7','i': (40*14)+12},{'c':'pPhnBg7','i': (40*14)+13},{'c':'pPhnBg7','i': (40*14)+14},{'c':'pPhnBg7','i': (40*14)+15},{'c':'pPhnBg7','i': (40*14)+16},{'c':'pPhnBg7','i': (40*14)+17},{'c':'pPhnBg7','i': (40*14)+18},{'c':'pPhnBg1','i': (40*14)+19},{'c':'pPhnBg3','i': (40*14)+20},{'c':'pPhnBg0','i': (40*15)+0},{'c':'pPhnBg1','i': (40*15)+1},{'c':'pPhnBg7','i': (40*15)+2},{'c':'pPhnBg7','i': (40*15)+3},{'c':'pPhnBg7','i': (40*15)+4},{'c':'pPhnBg7','i': (40*15)+5},{'c':'pPhnBg7','i': (40*15)+6},{'c':'pPhnBg7','i': (40*15)+7},{'c':'pPhnBg7','i': (40*15)+8},{'c':'pPhnBg7','i': (40*15)+9},{'c':'pPhnBg7','i': (40*15)+10},{'c':'pPhnBg7','i': (40*15)+11},{'c':'pPhnBg7','i': (40*15)+12},{'c':'pPhnBg7','i': (40*15)+13},{'c':'pPhnBg7','i': (40*15)+14},{'c':'pPhnBg7','i': (40*15)+15},{'c':'pPhnBg7','i': (40*15)+16},{'c':'pPhnBg7','i': (40*15)+17},{'c':'pPhnBg7','i': (40*15)+18},{'c':'pPhnBg1','i': (40*15)+19},{'c':'pPhnBg3','i': (40*15)+20},{'c':'pPhnBg0','i': (40*16)+0},{'c':'pPhnBg1','i': (40*16)+1},{'c':'pPhnBg7','i': (40*16)+2},{'c':'pPhnBg7','i': (40*16)+3},{'c':'pPhnBg7','i': (40*16)+4},{'c':'pPhnBg7','i': (40*16)+5},{'c':'pPhnBg7','i': (40*16)+6},{'c':'pPhnBg7','i': (40*16)+7},{'c':'pPhnBg7','i': (40*16)+8},{'c':'pPhnBg7','i': (40*16)+9},{'c':'pPhnBg7','i': (40*16)+10},{'c':'pPhnBg7','i': (40*16)+11},{'c':'pPhnBg7','i': (40*16)+12},{'c':'pPhnBg7','i': (40*16)+13},{'c':'pPhnBg7','i': (40*16)+14},{'c':'pPhnBg7','i': (40*16)+15},{'c':'pPhnBg7','i': (40*16)+16},{'c':'pPhnBg7','i': (40*16)+17},{'c':'pPhnBg7','i': (40*16)+18},{'c':'pPhnBg1','i': (40*16)+19},{'c':'pPhnBg3','i': (40*16)+20},{'c':'pPhnBg0','i': (40*17)+0},{'c':'pPhnBg1','i': (40*17)+1},{'c':'pPhnBg7','i': (40*17)+2},{'c':'pPhnBg7','i': (40*17)+3},{'c':'pPhnBg7','i': (40*17)+4},{'c':'pPhnBg7','i': (40*17)+5},{'c':'pPhnBg7','i': (40*17)+6},{'c':'pPhnBg7','i': (40*17)+7},{'c':'pPhnBg7','i': (40*17)+8},{'c':'pPhnBg7','i': (40*17)+9},{'c':'pPhnBg7','i': (40*17)+10},{'c':'pPhnBg7','i': (40*17)+11},{'c':'pPhnBg7','i': (40*17)+12},{'c':'pPhnBg7','i': (40*17)+13},{'c':'pPhnBg7','i': (40*17)+14},{'c':'pPhnBg7','i': (40*17)+15},{'c':'pPhnBg7','i': (40*17)+16},{'c':'pPhnBg7','i': (40*17)+17},{'c':'pPhnBg7','i': (40*17)+18},{'c':'pPhnBg1','i': (40*17)+19},{'c':'pPhnBg3','i': (40*17)+20},{'c':'pPhnBg0','i': (40*18)+0},{'c':'pPhnBg1','i': (40*18)+1},{'c':'pPhnBg7','i': (40*18)+2},{'c':'pPhnBg7','i': (40*18)+3},{'c':'pPhnBg7','i': (40*18)+4},{'c':'pPhnBg7','i': (40*18)+5},{'c':'pPhnBg7','i': (40*18)+6},{'c':'pPhnBg7','i': (40*18)+7},{'c':'pPhnBg7','i': (40*18)+8},{'c':'pPhnBg7','i': (40*18)+9},{'c':'pPhnBg7','i': (40*18)+10},{'c':'pPhnBg7','i': (40*18)+11},{'c':'pPhnBg7','i': (40*18)+12},{'c':'pPhnBg7','i': (40*18)+13},{'c':'pPhnBg7','i': (40*18)+14},{'c':'pPhnBg7','i': (40*18)+15},{'c':'pPhnBg7','i': (40*18)+16},{'c':'pPhnBg7','i': (40*18)+17},{'c':'pPhnBg7','i': (40*18)+18},{'c':'pPhnBg1','i': (40*18)+19},{'c':'pPhnBg3','i': (40*18)+20},{'c':'pPhnBg0','i': (40*19)+0},{'c':'pPhnBg1','i': (40*19)+1},{'c':'pPhnBg7','i': (40*19)+2},{'c':'pPhnBg7','i': (40*19)+3},{'c':'pPhnBg7','i': (40*19)+4},{'c':'pPhnBg7','i': (40*19)+5},{'c':'pPhnBg7','i': (40*19)+6},{'c':'pPhnBg7','i': (40*19)+7},{'c':'pPhnBg7','i': (40*19)+8},{'c':'pPhnBg7','i': (40*19)+9},{'c':'pPhnBg7','i': (40*19)+10},{'c':'pPhnBg7','i': (40*19)+11},{'c':'pPhnBg7','i': (40*19)+12},{'c':'pPhnBg7','i': (40*19)+13},{'c':'pPhnBg7','i': (40*19)+14},{'c':'pPhnBg7','i': (40*19)+15},{'c':'pPhnBg7','i': (40*19)+16},{'c':'pPhnBg7','i': (40*19)+17},{'c':'pPhnBg7','i': (40*19)+18},{'c':'pPhnBg1','i': (40*19)+19},{'c':'pPhnBg3','i': (40*19)+20},{'c':'pPhnBg0','i': (40*20)+0},{'c':'pPhnBg1','i': (40*20)+1},{'c':'pPhnBg7','i': (40*20)+2},{'c':'pPhnBg7','i': (40*20)+3},{'c':'pPhnBg7','i': (40*20)+4},{'c':'pPhnBg7','i': (40*20)+5},{'c':'pPhnBg7','i': (40*20)+6},{'c':'pPhnBg7','i': (40*20)+7},{'c':'pPhnBg7','i': (40*20)+8},{'c':'pPhnBg7','i': (40*20)+9},{'c':'pPhnBg7','i': (40*20)+10},{'c':'pPhnBg7','i': (40*20)+11},{'c':'pPhnBg7','i': (40*20)+12},{'c':'pPhnBg7','i': (40*20)+13},{'c':'pPhnBg7','i': (40*20)+14},{'c':'pPhnBg7','i': (40*20)+15},{'c':'pPhnBg7','i': (40*20)+16},{'c':'pPhnBg7','i': (40*20)+17},{'c':'pPhnBg7','i': (40*20)+18},{'c':'pPhnBg1','i': (40*20)+19},{'c':'pPhnBg3','i': (40*20)+20},{'c':'pPhnBg0','i': (40*21)+0},{'c':'pPhnBg1','i': (40*21)+1},{'c':'pPhnBg7','i': (40*21)+2},{'c':'pPhnBg7','i': (40*21)+3},{'c':'pPhnBg7','i': (40*21)+4},{'c':'pPhnBg7','i': (40*21)+5},{'c':'pPhnBg7','i': (40*21)+6},{'c':'pPhnBg7','i': (40*21)+7},{'c':'pPhnBg7','i': (40*21)+8},{'c':'pPhnBg7','i': (40*21)+9},{'c':'pPhnBg7','i': (40*21)+10},{'c':'pPhnBg7','i': (40*21)+11},{'c':'pPhnBg7','i': (40*21)+12},{'c':'pPhnBg7','i': (40*21)+13},{'c':'pPhnBg7','i': (40*21)+14},{'c':'pPhnBg7','i': (40*21)+15},{'c':'pPhnBg7','i': (40*21)+16},{'c':'pPhnBg7','i': (40*21)+17},{'c':'pPhnBg7','i': (40*21)+18},{'c':'pPhnBg1','i': (40*21)+19},{'c':'pPhnBg3','i': (40*21)+20},{'c':'pPhnBg0','i': (40*22)+0},{'c':'pPhnBg1','i': (40*22)+1},{'c':'pPhnBg7','i': (40*22)+2},{'c':'pPhnBg7','i': (40*22)+3},{'c':'pPhnBg7','i': (40*22)+4},{'c':'pPhnBg7','i': (40*22)+5},{'c':'pPhnBg7','i': (40*22)+6},{'c':'pPhnBg7','i': (40*22)+7},{'c':'pPhnBg7','i': (40*22)+8},{'c':'pPhnBg7','i': (40*22)+9},{'c':'pPhnBg7','i': (40*22)+10},{'c':'pPhnBg7','i': (40*22)+11},{'c':'pPhnBg7','i': (40*22)+12},{'c':'pPhnBg7','i': (40*22)+13},{'c':'pPhnBg7','i': (40*22)+14},{'c':'pPhnBg7','i': (40*22)+15},{'c':'pPhnBg7','i': (40*22)+16},{'c':'pPhnBg7','i': (40*22)+17},{'c':'pPhnBg7','i': (40*22)+18},{'c':'pPhnBg1','i': (40*22)+19},{'c':'pPhnBg3','i': (40*22)+20},{'c':'pPhnBg0','i': (40*23)+0},{'c':'pPhnBg1','i': (40*23)+1},{'c':'pPhnBg7','i': (40*23)+2},{'c':'pPhnBg7','i': (40*23)+3},{'c':'pPhnBg7','i': (40*23)+4},{'c':'pPhnBg7','i': (40*23)+5},{'c':'pPhnBg7','i': (40*23)+6},{'c':'pPhnBg7','i': (40*23)+7},{'c':'pPhnBg7','i': (40*23)+8},{'c':'pPhnBg7','i': (40*23)+9},{'c':'pPhnBg7','i': (40*23)+10},{'c':'pPhnBg7','i': (40*23)+11},{'c':'pPhnBg7','i': (40*23)+12},{'c':'pPhnBg7','i': (40*23)+13},{'c':'pPhnBg7','i': (40*23)+14},{'c':'pPhnBg7','i': (40*23)+15},{'c':'pPhnBg7','i': (40*23)+16},{'c':'pPhnBg7','i': (40*23)+17},{'c':'pPhnBg7','i': (40*23)+18},{'c':'pPhnBg1','i': (40*23)+19},{'c':'pPhnBg3','i': (40*23)+20},{'c':'pPhnBg0','i': (40*24)+0},{'c':'pPhnBg1','i': (40*24)+1},{'c':'pPhnBg7','i': (40*24)+2},{'c':'pPhnBg7','i': (40*24)+3},{'c':'pPhnBg7','i': (40*24)+4},{'c':'pPhnBg7','i': (40*24)+5},{'c':'pPhnBg7','i': (40*24)+6},{'c':'pPhnBg7','i': (40*24)+7},{'c':'pPhnBg7','i': (40*24)+8},{'c':'pPhnBg7','i': (40*24)+9},{'c':'pPhnBg7','i': (40*24)+10},{'c':'pPhnBg7','i': (40*24)+11},{'c':'pPhnBg7','i': (40*24)+12},{'c':'pPhnBg7','i': (40*24)+13},{'c':'pPhnBg7','i': (40*24)+14},{'c':'pPhnBg7','i': (40*24)+15},{'c':'pPhnBg7','i': (40*24)+16},{'c':'pPhnBg7','i': (40*24)+17},{'c':'pPhnBg7','i': (40*24)+18},{'c':'pPhnBg1','i': (40*24)+19},{'c':'pPhnBg3','i': (40*24)+20},{'c':'pPhnBg0','i': (40*25)+0},{'c':'pPhnBg1','i': (40*25)+1},{'c':'pPhnBg7','i': (40*25)+2},{'c':'pPhnBg7','i': (40*25)+3},{'c':'pPhnBg7','i': (40*25)+4},{'c':'pPhnBg7','i': (40*25)+5},{'c':'pPhnBg7','i': (40*25)+6},{'c':'pPhnBg7','i': (40*25)+7},{'c':'pPhnBg7','i': (40*25)+8},{'c':'pPhnBg7','i': (40*25)+9},{'c':'pPhnBg7','i': (40*25)+10},{'c':'pPhnBg7','i': (40*25)+11},{'c':'pPhnBg7','i': (40*25)+12},{'c':'pPhnBg7','i': (40*25)+13},{'c':'pPhnBg7','i': (40*25)+14},{'c':'pPhnBg7','i': (40*25)+15},{'c':'pPhnBg7','i': (40*25)+16},{'c':'pPhnBg7','i': (40*25)+17},{'c':'pPhnBg7','i': (40*25)+18},{'c':'pPhnBg1','i': (40*25)+19},{'c':'pPhnBg3','i': (40*25)+20},{'c':'pPhnBg0','i': (40*26)+0},{'c':'pPhnBg1','i': (40*26)+1},{'c':'pPhnBg7','i': (40*26)+2},{'c':'pPhnBg7','i': (40*26)+3},{'c':'pPhnBg7','i': (40*26)+4},{'c':'pPhnBg7','i': (40*26)+5},{'c':'pPhnBg7','i': (40*26)+6},{'c':'pPhnBg7','i': (40*26)+7},{'c':'pPhnBg7','i': (40*26)+8},{'c':'pPhnBg7','i': (40*26)+9},{'c':'pPhnBg7','i': (40*26)+10},{'c':'pPhnBg7','i': (40*26)+11},{'c':'pPhnBg7','i': (40*26)+12},{'c':'pPhnBg7','i': (40*26)+13},{'c':'pPhnBg7','i': (40*26)+14},{'c':'pPhnBg7','i': (40*26)+15},{'c':'pPhnBg7','i': (40*26)+16},{'c':'pPhnBg7','i': (40*26)+17},{'c':'pPhnBg7','i': (40*26)+18},{'c':'pPhnBg1','i': (40*26)+19},{'c':'pPhnBg3','i': (40*26)+20},{'c':'pPhnBg0','i': (40*27)+0},{'c':'pPhnBg1','i': (40*27)+1},{'c':'pPhnBg7','i': (40*27)+2},{'c':'pPhnBg7','i': (40*27)+3},{'c':'pPhnBg7','i': (40*27)+4},{'c':'pPhnBg7','i': (40*27)+5},{'c':'pPhnBg7','i': (40*27)+6},{'c':'pPhnBg7','i': (40*27)+7},{'c':'pPhnBg7','i': (40*27)+8},{'c':'pPhnBg7','i': (40*27)+9},{'c':'pPhnBg7','i': (40*27)+10},{'c':'pPhnBg7','i': (40*27)+11},{'c':'pPhnBg7','i': (40*27)+12},{'c':'pPhnBg7','i': (40*27)+13},{'c':'pPhnBg7','i': (40*27)+14},{'c':'pPhnBg7','i': (40*27)+15},{'c':'pPhnBg7','i': (40*27)+16},{'c':'pPhnBg7','i': (40*27)+17},{'c':'pPhnBg7','i': (40*27)+18},{'c':'pPhnBg1','i': (40*27)+19},{'c':'pPhnBg3','i': (40*27)+20},{'c':'pPhnBg0','i': (40*28)+0},{'c':'pPhnBg1','i': (40*28)+1},{'c':'pPhnBg7','i': (40*28)+2},{'c':'pPhnBg7','i': (40*28)+3},{'c':'pPhnBg7','i': (40*28)+4},{'c':'pPhnBg7','i': (40*28)+5},{'c':'pPhnBg7','i': (40*28)+6},{'c':'pPhnBg7','i': (40*28)+7},{'c':'pPhnBg7','i': (40*28)+8},{'c':'pPhnBg7','i': (40*28)+9},{'c':'pPhnBg7','i': (40*28)+10},{'c':'pPhnBg7','i': (40*28)+11},{'c':'pPhnBg7','i': (40*28)+12},{'c':'pPhnBg7','i': (40*28)+13},{'c':'pPhnBg7','i': (40*28)+14},{'c':'pPhnBg7','i': (40*28)+15},{'c':'pPhnBg7','i': (40*28)+16},{'c':'pPhnBg7','i': (40*28)+17},{'c':'pPhnBg7','i': (40*28)+18},{'c':'pPhnBg1','i': (40*28)+19},{'c':'pPhnBg3','i': (40*28)+20},{'c':'pPhnBg0','i': (40*29)+0},{'c':'pPhnBg1','i': (40*29)+1},{'c':'pPhnBg5','i': (40*29)+2},{'c':'pPhnBg5','i': (40*29)+3},{'c':'pPhnBg5','i': (40*29)+4},{'c':'pPhnBg5','i': (40*29)+5},{'c':'pPhnBg5','i': (40*29)+6},{'c':'pPhnBg5','i': (40*29)+7},{'c':'pPhnBg5','i': (40*29)+8},{'c':'pPhnBg5','i': (40*29)+9},{'c':'pPhnBg5','i': (40*29)+10},{'c':'pPhnBg5','i': (40*29)+11},{'c':'pPhnBg5','i': (40*29)+12},{'c':'pPhnBg5','i': (40*29)+13},{'c':'pPhnBg5','i': (40*29)+14},{'c':'pPhnBg5','i': (40*29)+15},{'c':'pPhnBg5','i': (40*29)+16},{'c':'pPhnBg5','i': (40*29)+17},{'c':'pPhnBg5','i': (40*29)+18},{'c':'pPhnBg1','i': (40*29)+19},{'c':'pPhnBg3','i': (40*29)+20},{'c':'pPhnBg0','i': (40*30)+0},{'c':'pPhnBg1','i': (40*30)+1},{'c':'pPhnBg5','i': (40*30)+2},{'c':'pPhnBg5','i': (40*30)+3},{'c':'pPhnBg5','i': (40*30)+4},{'c':'pPhnBg5','i': (40*30)+5},{'c':'pPhnBg5','i': (40*30)+6},{'c':'pPhnBg5','i': (40*30)+7},{'c':'pPhnBg5','i': (40*30)+8},{'c':'pPhnBg5','i': (40*30)+9},{'c':'pPhnBg5','i': (40*30)+10},{'c':'pPhnBg5','i': (40*30)+11},{'c':'pPhnBg5','i': (40*30)+12},{'c':'pPhnBg5','i': (40*30)+13},{'c':'pPhnBg5','i': (40*30)+14},{'c':'pPhnBg5','i': (40*30)+15},{'c':'pPhnBg5','i': (40*30)+16},{'c':'pPhnBg5','i': (40*30)+17},{'c':'pPhnBg5','i': (40*30)+18},{'c':'pPhnBg1','i': (40*30)+19},{'c':'pPhnBg3','i': (40*30)+20},{'c':'pPhnBg0','i': (40*31)+0},{'c':'pPhnBg1','i': (40*31)+1},{'c':'pPhnBg1','i': (40*31)+2},{'c':'pPhnBg1','i': (40*31)+3},{'c':'pPhnBg1','i': (40*31)+4},{'c':'pPhnBg1','i': (40*31)+5},{'c':'pPhnBg1','i': (40*31)+6},{'c':'pPhnBg1','i': (40*31)+7},{'c':'pPhnBg1','i': (40*31)+8},{'c':'pPhnBg1','i': (40*31)+9},{'c':'pPhnBg1','i': (40*31)+10},{'c':'pPhnBg1','i': (40*31)+11},{'c':'pPhnBg1','i': (40*31)+12},{'c':'pPhnBg1','i': (40*31)+13},{'c':'pPhnBg1','i': (40*31)+14},{'c':'pPhnBg1','i': (40*31)+15},{'c':'pPhnBg1','i': (40*31)+16},{'c':'pPhnBg1','i': (40*31)+17},{'c':'pPhnBg1','i': (40*31)+18},{'c':'pPhnBg1','i': (40*31)+19},{'c':'pPhnBg3','i': (40*31)+20},{'c':'pPhnBg0','i': (40*32)+0},{'c':'pPhnBg1','i': (40*32)+1},{'c':'pPhnBg1','i': (40*32)+2},{'c':'pPhnBg1','i': (40*32)+3},{'c':'pPhnBg1','i': (40*32)+4},{'c':'pPhnBg1','i': (40*32)+5},{'c':'pPhnBg1','i': (40*32)+6},{'c':'pPhnBg1','i': (40*32)+7},{'c':'pPhnBg1','i': (40*32)+8},{'c':'pPhnBg1','i': (40*32)+9},{'c':'pPhnBg1','i': (40*32)+10},{'c':'pPhnBg1','i': (40*32)+11},{'c':'pPhnBg1','i': (40*32)+12},{'c':'pPhnBg1','i': (40*32)+13},{'c':'pPhnBg1','i': (40*32)+14},{'c':'pPhnBg1','i': (40*32)+15},{'c':'pPhnBg1','i': (40*32)+16},{'c':'pPhnBg1','i': (40*32)+17},{'c':'pPhnBg1','i': (40*32)+18},{'c':'pPhnBg1','i': (40*32)+19},{'c':'pPhnBg3','i': (40*32)+20},{'c':'pPhnBg0','i': (40*33)+0},{'c':'pPhnBg1','i': (40*33)+1},{'c':'pPhnBg1','i': (40*33)+2},{'c':'pPhnBg1','i': (40*33)+3},{'c':'pPhnBg1','i': (40*33)+4},{'c':'pPhnBg1','i': (40*33)+5},{'c':'pPhnBg1','i': (40*33)+6},{'c':'pPhnBg1','i': (40*33)+7},{'c':'pPhnBg1','i': (40*33)+8},{'c':'pPhnBg1','i': (40*33)+9},{'c':'pPhnBg4','i': (40*33)+10},{'c':'pPhnBg1','i': (40*33)+11},{'c':'pPhnBg1','i': (40*33)+12},{'c':'pPhnBg1','i': (40*33)+13},{'c':'pPhnBg1','i': (40*33)+14},{'c':'pPhnBg1','i': (40*33)+15},{'c':'pPhnBg1','i': (40*33)+16},{'c':'pPhnBg1','i': (40*33)+17},{'c':'pPhnBg1','i': (40*33)+18},{'c':'pPhnBg1','i': (40*33)+19},{'c':'pPhnBg3','i': (40*33)+20},{'c':'pPhnBg0','i': (40*34)+0},{'c':'pPhnBg1','i': (40*34)+1},{'c':'pPhnBg1','i': (40*34)+2},{'c':'pPhnBg1','i': (40*34)+3},{'c':'pPhnBg1','i': (40*34)+4},{'c':'pPhnBg1','i': (40*34)+5},{'c':'pPhnBg1','i': (40*34)+6},{'c':'pPhnBg1','i': (40*34)+7},{'c':'pPhnBg1','i': (40*34)+8},{'c':'pPhnBg3','i': (40*34)+9},{'c':'pPhnBg3','i': (40*34)+10},{'c':'pPhnBg3','i': (40*34)+11},{'c':'pPhnBg1','i': (40*34)+12},{'c':'pPhnBg1','i': (40*34)+13},{'c':'pPhnBg1','i': (40*34)+14},{'c':'pPhnBg1','i': (40*34)+15},{'c':'pPhnBg1','i': (40*34)+16},{'c':'pPhnBg1','i': (40*34)+17},{'c':'pPhnBg1','i': (40*34)+18},{'c':'pPhnBg1','i': (40*34)+19},{'c':'pPhnBg3','i': (40*34)+20},{'c':'pPhnBg2','i': (40*35)+1},{'c':'pPhnBg1','i': (40*35)+2},{'c':'pPhnBg1','i': (40*35)+3},{'c':'pPhnBg1','i': (40*35)+4},{'c':'pPhnBg1','i': (40*35)+5},{'c':'pPhnBg1','i': (40*35)+6},{'c':'pPhnBg1','i': (40*35)+7},{'c':'pPhnBg1','i': (40*35)+8},{'c':'pPhnBg1','i': (40*35)+9},{'c':'pPhnBg1','i': (40*35)+10},{'c':'pPhnBg1','i': (40*35)+11},{'c':'pPhnBg1','i': (40*35)+12},{'c':'pPhnBg1','i': (40*35)+13},{'c':'pPhnBg1','i': (40*35)+14},{'c':'pPhnBg1','i': (40*35)+15},{'c':'pPhnBg1','i': (40*35)+16},{'c':'pPhnBg1','i': (40*35)+17},{'c':'pPhnBg1','i': (40*35)+18},{'c':'pPhnBg3','i': (40*35)+19},{'c':'pPhnBg3','i': (40*36)+2},{'c':'pPhnBg3','i': (40*36)+3},{'c':'pPhnBg3','i': (40*36)+4},{'c':'pPhnBg3','i': (40*36)+5},{'c':'pPhnBg3','i': (40*36)+6},{'c':'pPhnBg3','i': (40*36)+7},{'c':'pPhnBg3','i': (40*36)+8},{'c':'pPhnBg3','i': (40*36)+9},{'c':'pPhnBg3','i': (40*36)+10},{'c':'pPhnBg3','i': (40*36)+11},{'c':'pPhnBg3','i': (40*36)+12},{'c':'pPhnBg3','i': (40*36)+13},{'c':'pPhnBg3','i': (40*36)+14},{'c':'pPhnBg3','i': (40*36)+15},{'c':'pPhnBg3','i': (40*36)+16},{'c':'pPhnBg3','i': (40*36)+17},{'c':'pPhnBg3','i': (40*36)+18}						
									],
									'label' : '1'	
								}								
							}
						];
		
						break;
						
					case 'pTxtLogo':
					
						img = [
							{'frm':
								{
									'duration' : 1,
									'pix' : [
										{'c':'pTxtLogo0','i': (40*0)+0},{'c':'pTxtLogo0','i': (40*0)+1},{'c':'pTxtLogo0','i': (40*0)+2},{'c':'pTxtLogo0','i': (40*0)+3},{'c':'pTxtLogo0','i': (40*0)+4},{'c':'pTxtLogo0','i': (40*0)+5},{'c':'pTxtLogo0','i': (40*0)+6},{'c':'pTxtLogo0','i': (40*0)+7},{'c':'pTxtLogo0','i': (40*0)+8},{'c':'pTxtLogo0','i': (40*0)+9},{'c':'pTxtLogo0','i': (40*0)+10},{'c':'pTxtLogo0','i': (40*0)+11},{'c':'pTxtLogo0','i': (40*0)+12},{'c':'pTxtLogo0','i': (40*0)+13},{'c':'pTxtLogo0','i': (40*0)+14},{'c':'pTxtLogo0','i': (40*0)+15},{'c':'pTxtLogo0','i': (40*0)+16},{'c':'pTxtLogo0','i': (40*1)+0},{'c':'pTxtLogo1','i': (40*1)+1},{'c':'pTxtLogo1','i': (40*1)+2},{'c':'pTxtLogo1','i': (40*1)+3},{'c':'pTxtLogo1','i': (40*1)+4},{'c':'pTxtLogo1','i': (40*1)+5},{'c':'pTxtLogo1','i': (40*1)+6},{'c':'pTxtLogo1','i': (40*1)+7},{'c':'pTxtLogo1','i': (40*1)+8},{'c':'pTxtLogo1','i': (40*1)+9},{'c':'pTxtLogo1','i': (40*1)+10},{'c':'pTxtLogo1','i': (40*1)+11},{'c':'pTxtLogo1','i': (40*1)+12},{'c':'pTxtLogo1','i': (40*1)+13},{'c':'pTxtLogo1','i': (40*1)+14},{'c':'pTxtLogo1','i': (40*1)+15},{'c':'pTxtLogo0','i': (40*1)+16},{'c':'pTxtLogo0','i': (40*2)+0},{'c':'pTxtLogo1','i': (40*2)+1},{'c':'pTxtLogo0','i': (40*2)+2},{'c':'pTxtLogo1','i': (40*2)+3},{'c':'pTxtLogo0','i': (40*2)+4},{'c':'pTxtLogo0','i': (40*2)+5},{'c':'pTxtLogo0','i': (40*2)+6},{'c':'pTxtLogo1','i': (40*2)+7},{'c':'pTxtLogo0','i': (40*2)+8},{'c':'pTxtLogo0','i': (40*2)+9},{'c':'pTxtLogo0','i': (40*2)+10},{'c':'pTxtLogo1','i': (40*2)+11},{'c':'pTxtLogo0','i': (40*2)+12},{'c':'pTxtLogo1','i': (40*2)+13},{'c':'pTxtLogo0','i': (40*2)+14},{'c':'pTxtLogo1','i': (40*2)+15},{'c':'pTxtLogo0','i': (40*2)+16},{'c':'pTxtLogo0','i': (40*3)+0},{'c':'pTxtLogo1','i': (40*3)+1},{'c':'pTxtLogo0','i': (40*3)+2},{'c':'pTxtLogo1','i': (40*3)+3},{'c':'pTxtLogo1','i': (40*3)+4},{'c':'pTxtLogo0','i': (40*3)+5},{'c':'pTxtLogo1','i': (40*3)+6},{'c':'pTxtLogo1','i': (40*3)+7},{'c':'pTxtLogo1','i': (40*3)+8},{'c':'pTxtLogo0','i': (40*3)+9},{'c':'pTxtLogo1','i': (40*3)+10},{'c':'pTxtLogo1','i': (40*3)+11},{'c':'pTxtLogo0','i': (40*3)+12},{'c':'pTxtLogo1','i': (40*3)+13},{'c':'pTxtLogo0','i': (40*3)+14},{'c':'pTxtLogo1','i': (40*3)+15},{'c':'pTxtLogo0','i': (40*3)+16},{'c':'pTxtLogo2','i': (40*4)+0},{'c':'pTxtLogo1','i': (40*4)+1},{'c':'pTxtLogo2','i': (40*4)+2},{'c':'pTxtLogo1','i': (40*4)+3},{'c':'pTxtLogo1','i': (40*4)+4},{'c':'pTxtLogo2','i': (40*4)+5},{'c':'pTxtLogo1','i': (40*4)+6},{'c':'pTxtLogo1','i': (40*4)+7},{'c':'pTxtLogo1','i': (40*4)+8},{'c':'pTxtLogo2','i': (40*4)+9},{'c':'pTxtLogo1','i': (40*4)+10},{'c':'pTxtLogo1','i': (40*4)+11},{'c':'pTxtLogo1','i': (40*4)+12},{'c':'pTxtLogo2','i': (40*4)+13},{'c':'pTxtLogo1','i': (40*4)+14},{'c':'pTxtLogo1','i': (40*4)+15},{'c':'pTxtLogo2','i': (40*4)+16},{'c':'pTxtLogo2','i': (40*5)+0},{'c':'pTxtLogo1','i': (40*5)+1},{'c':'pTxtLogo2','i': (40*5)+2},{'c':'pTxtLogo1','i': (40*5)+3},{'c':'pTxtLogo1','i': (40*5)+4},{'c':'pTxtLogo2','i': (40*5)+5},{'c':'pTxtLogo1','i': (40*5)+6},{'c':'pTxtLogo1','i': (40*5)+7},{'c':'pTxtLogo1','i': (40*5)+8},{'c':'pTxtLogo2','i': (40*5)+9},{'c':'pTxtLogo1','i': (40*5)+10},{'c':'pTxtLogo1','i': (40*5)+11},{'c':'pTxtLogo1','i': (40*5)+12},{'c':'pTxtLogo2','i': (40*5)+13},{'c':'pTxtLogo1','i': (40*5)+14},{'c':'pTxtLogo1','i': (40*5)+15},{'c':'pTxtLogo2','i': (40*5)+16},{'c':'pTxtLogo2','i': (40*6)+0},{'c':'pTxtLogo1','i': (40*6)+1},{'c':'pTxtLogo1','i': (40*6)+2},{'c':'pTxtLogo1','i': (40*6)+3},{'c':'pTxtLogo1','i': (40*6)+4},{'c':'pTxtLogo1','i': (40*6)+5},{'c':'pTxtLogo1','i': (40*6)+6},{'c':'pTxtLogo1','i': (40*6)+7},{'c':'pTxtLogo1','i': (40*6)+8},{'c':'pTxtLogo1','i': (40*6)+9},{'c':'pTxtLogo1','i': (40*6)+10},{'c':'pTxtLogo1','i': (40*6)+11},{'c':'pTxtLogo1','i': (40*6)+12},{'c':'pTxtLogo1','i': (40*6)+13},{'c':'pTxtLogo1','i': (40*6)+14},{'c':'pTxtLogo1','i': (40*6)+15},{'c':'pTxtLogo2','i': (40*6)+16},{'c':'pTxtLogo2','i': (40*7)+0},{'c':'pTxtLogo2','i': (40*7)+1},{'c':'pTxtLogo2','i': (40*7)+2},{'c':'pTxtLogo2','i': (40*7)+3},{'c':'pTxtLogo2','i': (40*7)+4},{'c':'pTxtLogo2','i': (40*7)+5},{'c':'pTxtLogo2','i': (40*7)+6},{'c':'pTxtLogo2','i': (40*7)+7},{'c':'pTxtLogo2','i': (40*7)+8},{'c':'pTxtLogo2','i': (40*7)+9},{'c':'pTxtLogo2','i': (40*7)+10},{'c':'pTxtLogo2','i': (40*7)+11},{'c':'pTxtLogo2','i': (40*7)+12},{'c':'pTxtLogo2','i': (40*7)+13},{'c':'pTxtLogo2','i': (40*7)+14},{'c':'pTxtLogo2','i': (40*7)+15},{'c':'pTxtLogo2','i': (40*7)+16},{'c':'pTxtLogo2','i': (40*8)+12},{'c':'pTxtLogo2','i': (40*8)+13},{'c':'pTxtLogo2','i': (40*8)+14},{'c':'pTxtLogo0','i': (40*8)+15},{'c':'pTxtLogo0','i': (40*8)+16},{'c':'pTxtLogo0','i': (40*8)+17},{'c':'pTxtLogo0','i': (40*8)+18},{'c':'pTxtLogo0','i': (40*8)+19},{'c':'pTxtLogo0','i': (40*8)+20},{'c':'pTxtLogo0','i': (40*8)+21},{'c':'pTxtLogo0','i': (40*8)+22},{'c':'pTxtLogo0','i': (40*8)+23},{'c':'pTxtLogo0','i': (40*8)+24},{'c':'pTxtLogo0','i': (40*8)+25},{'c':'pTxtLogo0','i': (40*8)+26},{'c':'pTxtLogo0','i': (40*8)+27},{'c':'pTxtLogo0','i': (40*8)+28},{'c':'pTxtLogo0','i': (40*8)+29},{'c':'pTxtLogo0','i': (40*8)+30},{'c':'pTxtLogo0','i': (40*8)+31},{'c':'pTxtLogo0','i': (40*8)+32},{'c':'pTxtLogo0','i': (40*8)+33},{'c':'pTxtLogo0','i': (40*8)+34},{'c':'pTxtLogo0','i': (40*8)+35},{'c':'pTxtLogo2','i': (40*9)+14},{'c':'pTxtLogo0','i': (40*9)+15},{'c':'pTxtLogo1','i': (40*9)+16},{'c':'pTxtLogo1','i': (40*9)+17},{'c':'pTxtLogo1','i': (40*9)+18},{'c':'pTxtLogo1','i': (40*9)+19},{'c':'pTxtLogo1','i': (40*9)+20},{'c':'pTxtLogo1','i': (40*9)+21},{'c':'pTxtLogo1','i': (40*9)+22},{'c':'pTxtLogo1','i': (40*9)+23},{'c':'pTxtLogo1','i': (40*9)+24},{'c':'pTxtLogo1','i': (40*9)+25},{'c':'pTxtLogo1','i': (40*9)+26},{'c':'pTxtLogo1','i': (40*9)+27},{'c':'pTxtLogo1','i': (40*9)+28},{'c':'pTxtLogo1','i': (40*9)+29},{'c':'pTxtLogo1','i': (40*9)+30},{'c':'pTxtLogo1','i': (40*9)+31},{'c':'pTxtLogo1','i': (40*9)+32},{'c':'pTxtLogo1','i': (40*9)+33},{'c':'pTxtLogo1','i': (40*9)+34},{'c':'pTxtLogo0','i': (40*9)+35},{'c':'pTxtLogo0','i': (40*10)+15},{'c':'pTxtLogo1','i': (40*10)+16},{'c':'pTxtLogo0','i': (40*10)+17},{'c':'pTxtLogo1','i': (40*10)+18},{'c':'pTxtLogo1','i': (40*10)+19},{'c':'pTxtLogo1','i': (40*10)+20},{'c':'pTxtLogo0','i': (40*10)+21},{'c':'pTxtLogo1','i': (40*10)+22},{'c':'pTxtLogo0','i': (40*10)+23},{'c':'pTxtLogo0','i': (40*10)+24},{'c':'pTxtLogo0','i': (40*10)+25},{'c':'pTxtLogo1','i': (40*10)+26},{'c':'pTxtLogo0','i': (40*10)+27},{'c':'pTxtLogo0','i': (40*10)+28},{'c':'pTxtLogo0','i': (40*10)+29},{'c':'pTxtLogo1','i': (40*10)+30},{'c':'pTxtLogo0','i': (40*10)+31},{'c':'pTxtLogo1','i': (40*10)+32},{'c':'pTxtLogo0','i': (40*10)+33},{'c':'pTxtLogo1','i': (40*10)+34},{'c':'pTxtLogo0','i': (40*10)+35},{'c':'pTxtLogo0','i': (40*11)+15},{'c':'pTxtLogo1','i': (40*11)+16},{'c':'pTxtLogo0','i': (40*11)+17},{'c':'pTxtLogo0','i': (40*11)+18},{'c':'pTxtLogo0','i': (40*11)+19},{'c':'pTxtLogo1','i': (40*11)+20},{'c':'pTxtLogo0','i': (40*11)+21},{'c':'pTxtLogo1','i': (40*11)+22},{'c':'pTxtLogo1','i': (40*11)+23},{'c':'pTxtLogo0','i': (40*11)+24},{'c':'pTxtLogo1','i': (40*11)+25},{'c':'pTxtLogo1','i': (40*11)+26},{'c':'pTxtLogo1','i': (40*11)+27},{'c':'pTxtLogo0','i': (40*11)+28},{'c':'pTxtLogo1','i': (40*11)+29},{'c':'pTxtLogo1','i': (40*11)+30},{'c':'pTxtLogo0','i': (40*11)+31},{'c':'pTxtLogo1','i': (40*11)+32},{'c':'pTxtLogo0','i': (40*11)+33},{'c':'pTxtLogo1','i': (40*11)+34},{'c':'pTxtLogo0','i': (40*11)+35},{'c':'pTxtLogo2','i': (40*12)+15},{'c':'pTxtLogo1','i': (40*12)+16},{'c':'pTxtLogo2','i': (40*12)+17},{'c':'pTxtLogo1','i': (40*12)+18},{'c':'pTxtLogo2','i': (40*12)+19},{'c':'pTxtLogo1','i': (40*12)+20},{'c':'pTxtLogo2','i': (40*12)+21},{'c':'pTxtLogo1','i': (40*12)+22},{'c':'pTxtLogo1','i': (40*12)+23},{'c':'pTxtLogo2','i': (40*12)+24},{'c':'pTxtLogo1','i': (40*12)+25},{'c':'pTxtLogo1','i': (40*12)+26},{'c':'pTxtLogo1','i': (40*12)+27},{'c':'pTxtLogo2','i': (40*12)+28},{'c':'pTxtLogo1','i': (40*12)+29},{'c':'pTxtLogo1','i': (40*12)+30},{'c':'pTxtLogo1','i': (40*12)+31},{'c':'pTxtLogo2','i': (40*12)+32},{'c':'pTxtLogo1','i': (40*12)+33},{'c':'pTxtLogo1','i': (40*12)+34},{'c':'pTxtLogo2','i': (40*12)+35},{'c':'pTxtLogo2','i': (40*13)+15},{'c':'pTxtLogo1','i': (40*13)+16},{'c':'pTxtLogo2','i': (40*13)+17},{'c':'pTxtLogo2','i': (40*13)+18},{'c':'pTxtLogo2','i': (40*13)+19},{'c':'pTxtLogo1','i': (40*13)+20},{'c':'pTxtLogo2','i': (40*13)+21},{'c':'pTxtLogo1','i': (40*13)+22},{'c':'pTxtLogo1','i': (40*13)+23},{'c':'pTxtLogo2','i': (40*13)+24},{'c':'pTxtLogo1','i': (40*13)+25},{'c':'pTxtLogo1','i': (40*13)+26},{'c':'pTxtLogo1','i': (40*13)+27},{'c':'pTxtLogo2','i': (40*13)+28},{'c':'pTxtLogo1','i': (40*13)+29},{'c':'pTxtLogo1','i': (40*13)+30},{'c':'pTxtLogo1','i': (40*13)+31},{'c':'pTxtLogo2','i': (40*13)+32},{'c':'pTxtLogo1','i': (40*13)+33},{'c':'pTxtLogo1','i': (40*13)+34},{'c':'pTxtLogo2','i': (40*13)+35},{'c':'pTxtLogo2','i': (40*14)+15},{'c':'pTxtLogo1','i': (40*14)+16},{'c':'pTxtLogo1','i': (40*14)+17},{'c':'pTxtLogo1','i': (40*14)+18},{'c':'pTxtLogo1','i': (40*14)+19},{'c':'pTxtLogo1','i': (40*14)+20},{'c':'pTxtLogo1','i': (40*14)+21},{'c':'pTxtLogo1','i': (40*14)+22},{'c':'pTxtLogo1','i': (40*14)+23},{'c':'pTxtLogo1','i': (40*14)+24},{'c':'pTxtLogo1','i': (40*14)+25},{'c':'pTxtLogo1','i': (40*14)+26},{'c':'pTxtLogo1','i': (40*14)+27},{'c':'pTxtLogo1','i': (40*14)+28},{'c':'pTxtLogo1','i': (40*14)+29},{'c':'pTxtLogo1','i': (40*14)+30},{'c':'pTxtLogo1','i': (40*14)+31},{'c':'pTxtLogo1','i': (40*14)+32},{'c':'pTxtLogo1','i': (40*14)+33},{'c':'pTxtLogo1','i': (40*14)+34},{'c':'pTxtLogo2','i': (40*14)+35},{'c':'pTxtLogo2','i': (40*15)+15},{'c':'pTxtLogo2','i': (40*15)+16},{'c':'pTxtLogo2','i': (40*15)+17},{'c':'pTxtLogo2','i': (40*15)+18},{'c':'pTxtLogo2','i': (40*15)+19},{'c':'pTxtLogo2','i': (40*15)+20},{'c':'pTxtLogo2','i': (40*15)+21},{'c':'pTxtLogo2','i': (40*15)+22},{'c':'pTxtLogo2','i': (40*15)+23},{'c':'pTxtLogo2','i': (40*15)+24},{'c':'pTxtLogo2','i': (40*15)+25},{'c':'pTxtLogo2','i': (40*15)+26},{'c':'pTxtLogo2','i': (40*15)+27},{'c':'pTxtLogo2','i': (40*15)+28},{'c':'pTxtLogo2','i': (40*15)+29},{'c':'pTxtLogo2','i': (40*15)+30},{'c':'pTxtLogo2','i': (40*15)+31},{'c':'pTxtLogo2','i': (40*15)+32},{'c':'pTxtLogo2','i': (40*15)+33},{'c':'pTxtLogo2','i': (40*15)+34},{'c':'pTxtLogo2','i': (40*15)+35},{'c':'pTxtLogo0','i': (40*16)+2},{'c':'pTxtLogo0','i': (40*16)+3},{'c':'pTxtLogo0','i': (40*16)+4},{'c':'pTxtLogo0','i': (40*16)+5},{'c':'pTxtLogo0','i': (40*16)+6},{'c':'pTxtLogo0','i': (40*16)+7},{'c':'pTxtLogo0','i': (40*16)+8},{'c':'pTxtLogo0','i': (40*16)+9},{'c':'pTxtLogo0','i': (40*16)+10},{'c':'pTxtLogo0','i': (40*16)+11},{'c':'pTxtLogo0','i': (40*16)+12},{'c':'pTxtLogo0','i': (40*16)+13},{'c':'pTxtLogo0','i': (40*16)+14},{'c':'pTxtLogo0','i': (40*16)+15},{'c':'pTxtLogo0','i': (40*16)+16},{'c':'pTxtLogo0','i': (40*16)+17},{'c':'pTxtLogo0','i': (40*16)+18},{'c':'pTxtLogo2','i': (40*16)+19},{'c':'pTxtLogo2','i': (40*16)+20},{'c':'pTxtLogo2','i': (40*16)+21},{'c':'pTxtLogo0','i': (40*17)+2},{'c':'pTxtLogo1','i': (40*17)+3},{'c':'pTxtLogo1','i': (40*17)+4},{'c':'pTxtLogo1','i': (40*17)+5},{'c':'pTxtLogo1','i': (40*17)+6},{'c':'pTxtLogo1','i': (40*17)+7},{'c':'pTxtLogo1','i': (40*17)+8},{'c':'pTxtLogo1','i': (40*17)+9},{'c':'pTxtLogo1','i': (40*17)+10},{'c':'pTxtLogo1','i': (40*17)+11},{'c':'pTxtLogo1','i': (40*17)+12},{'c':'pTxtLogo1','i': (40*17)+13},{'c':'pTxtLogo1','i': (40*17)+14},{'c':'pTxtLogo1','i': (40*17)+15},{'c':'pTxtLogo1','i': (40*17)+16},{'c':'pTxtLogo1','i': (40*17)+17},{'c':'pTxtLogo0','i': (40*17)+18},{'c':'pTxtLogo2','i': (40*17)+19},{'c':'pTxtLogo0','i': (40*18)+2},{'c':'pTxtLogo1','i': (40*18)+3},{'c':'pTxtLogo0','i': (40*18)+4},{'c':'pTxtLogo0','i': (40*18)+5},{'c':'pTxtLogo0','i': (40*18)+6},{'c':'pTxtLogo1','i': (40*18)+7},{'c':'pTxtLogo0','i': (40*18)+8},{'c':'pTxtLogo1','i': (40*18)+9},{'c':'pTxtLogo1','i': (40*18)+10},{'c':'pTxtLogo1','i': (40*18)+11},{'c':'pTxtLogo0','i': (40*18)+12},{'c':'pTxtLogo1','i': (40*18)+13},{'c':'pTxtLogo0','i': (40*18)+14},{'c':'pTxtLogo0','i': (40*18)+15},{'c':'pTxtLogo0','i': (40*18)+16},{'c':'pTxtLogo1','i': (40*18)+17},{'c':'pTxtLogo0','i': (40*18)+18},{'c':'pTxtLogo0','i': (40*19)+2},{'c':'pTxtLogo1','i': (40*19)+3},{'c':'pTxtLogo0','i': (40*19)+4},{'c':'pTxtLogo1','i': (40*19)+5},{'c':'pTxtLogo0','i': (40*19)+6},{'c':'pTxtLogo1','i': (40*19)+7},{'c':'pTxtLogo0','i': (40*19)+8},{'c':'pTxtLogo0','i': (40*19)+9},{'c':'pTxtLogo0','i': (40*19)+10},{'c':'pTxtLogo1','i': (40*19)+11},{'c':'pTxtLogo0','i': (40*19)+12},{'c':'pTxtLogo1','i': (40*19)+13},{'c':'pTxtLogo1','i': (40*19)+14},{'c':'pTxtLogo0','i': (40*19)+15},{'c':'pTxtLogo1','i': (40*19)+16},{'c':'pTxtLogo1','i': (40*19)+17},{'c':'pTxtLogo0','i': (40*19)+18},{'c':'pTxtLogo2','i': (40*20)+2},{'c':'pTxtLogo1','i': (40*20)+3},{'c':'pTxtLogo2','i': (40*20)+4},{'c':'pTxtLogo2','i': (40*20)+5},{'c':'pTxtLogo2','i': (40*20)+6},{'c':'pTxtLogo1','i': (40*20)+7},{'c':'pTxtLogo2','i': (40*20)+8},{'c':'pTxtLogo1','i': (40*20)+9},{'c':'pTxtLogo2','i': (40*20)+10},{'c':'pTxtLogo1','i': (40*20)+11},{'c':'pTxtLogo2','i': (40*20)+12},{'c':'pTxtLogo1','i': (40*20)+13},{'c':'pTxtLogo1','i': (40*20)+14},{'c':'pTxtLogo2','i': (40*20)+15},{'c':'pTxtLogo1','i': (40*20)+16},{'c':'pTxtLogo1','i': (40*20)+17},{'c':'pTxtLogo2','i': (40*20)+18},{'c':'pTxtLogo2','i': (40*21)+2},{'c':'pTxtLogo1','i': (40*21)+3},{'c':'pTxtLogo2','i': (40*21)+4},{'c':'pTxtLogo2','i': (40*21)+5},{'c':'pTxtLogo2','i': (40*21)+6},{'c':'pTxtLogo1','i': (40*21)+7},{'c':'pTxtLogo2','i': (40*21)+8},{'c':'pTxtLogo2','i': (40*21)+9},{'c':'pTxtLogo2','i': (40*21)+10},{'c':'pTxtLogo1','i': (40*21)+11},{'c':'pTxtLogo2','i': (40*21)+12},{'c':'pTxtLogo1','i': (40*21)+13},{'c':'pTxtLogo1','i': (40*21)+14},{'c':'pTxtLogo2','i': (40*21)+15},{'c':'pTxtLogo1','i': (40*21)+16},{'c':'pTxtLogo1','i': (40*21)+17},{'c':'pTxtLogo2','i': (40*21)+18},{'c':'pTxtLogo2','i': (40*22)+2},{'c':'pTxtLogo1','i': (40*22)+3},{'c':'pTxtLogo1','i': (40*22)+4},{'c':'pTxtLogo1','i': (40*22)+5},{'c':'pTxtLogo1','i': (40*22)+6},{'c':'pTxtLogo1','i': (40*22)+7},{'c':'pTxtLogo1','i': (40*22)+8},{'c':'pTxtLogo1','i': (40*22)+9},{'c':'pTxtLogo1','i': (40*22)+10},{'c':'pTxtLogo1','i': (40*22)+11},{'c':'pTxtLogo1','i': (40*22)+12},{'c':'pTxtLogo1','i': (40*22)+13},{'c':'pTxtLogo1','i': (40*22)+14},{'c':'pTxtLogo1','i': (40*22)+15},{'c':'pTxtLogo1','i': (40*22)+16},{'c':'pTxtLogo1','i': (40*22)+17},{'c':'pTxtLogo2','i': (40*22)+18},{'c':'pTxtLogo2','i': (40*23)+2},{'c':'pTxtLogo2','i': (40*23)+3},{'c':'pTxtLogo2','i': (40*23)+4},{'c':'pTxtLogo2','i': (40*23)+5},{'c':'pTxtLogo2','i': (40*23)+6},{'c':'pTxtLogo2','i': (40*23)+7},{'c':'pTxtLogo2','i': (40*23)+8},{'c':'pTxtLogo2','i': (40*23)+9},{'c':'pTxtLogo2','i': (40*23)+10},{'c':'pTxtLogo2','i': (40*23)+11},{'c':'pTxtLogo2','i': (40*23)+12},{'c':'pTxtLogo2','i': (40*23)+13},{'c':'pTxtLogo2','i': (40*23)+14},{'c':'pTxtLogo2','i': (40*23)+15},{'c':'pTxtLogo2','i': (40*23)+16},{'c':'pTxtLogo2','i': (40*23)+17},{'c':'pTxtLogo2','i': (40*23)+18},{'c':'pTxtLogo2','i': (40*24)+14},{'c':'pTxtLogo2','i': (40*24)+15},{'c':'pTxtLogo2','i': (40*24)+16},{'c':'pTxtLogo2','i': (40*25)+16}					
									],
									'label' : '1'	
								}								
							}
						];
						
						break;
						
					case 'pTxtPanel1': 
						
						img = [
							{'frm':
								{
									'duration' : 1,
									'pix' : [
										{'c':'pTxtPanel0','i': (40*0)+0},{'c':'pTxtPanel0','i': (40*0)+1},{'c':'pTxtPanel0','i': (40*0)+2},{'c':'pTxtPanel0','i': (40*0)+3},{'c':'pTxtPanel0','i': (40*0)+4},{'c':'pTxtPanel0','i': (40*0)+5},{'c':'pTxtPanel0','i': (40*0)+6},{'c':'pTxtPanel0','i': (40*0)+7},{'c':'pTxtPanel0','i': (40*0)+8},{'c':'pTxtPanel0','i': (40*0)+9},{'c':'pTxtPanel0','i': (40*0)+10},{'c':'pTxtPanel0','i': (40*0)+11},{'c':'pTxtPanel0','i': (40*0)+12},{'c':'pTxtPanel0','i': (40*0)+13},{'c':'pTxtPanel0','i': (40*0)+14},{'c':'pTxtPanel0','i': (40*0)+15},{'c':'pTxtPanel0','i': (40*0)+16},{'c':'pTxtPanel0','i': (40*1)+0},{'c':'pTxtPanel1','i': (40*1)+1},{'c':'pTxtPanel1','i': (40*1)+2},{'c':'pTxtPanel1','i': (40*1)+3},{'c':'pTxtPanel1','i': (40*1)+4},{'c':'pTxtPanel1','i': (40*1)+5},{'c':'pTxtPanel1','i': (40*1)+6},{'c':'pTxtPanel1','i': (40*1)+7},{'c':'pTxtPanel1','i': (40*1)+8},{'c':'pTxtPanel1','i': (40*1)+9},{'c':'pTxtPanel1','i': (40*1)+10},{'c':'pTxtPanel1','i': (40*1)+11},{'c':'pTxtPanel1','i': (40*1)+12},{'c':'pTxtPanel1','i': (40*1)+13},{'c':'pTxtPanel1','i': (40*1)+14},{'c':'pTxtPanel1','i': (40*1)+15},{'c':'pTxtPanel0','i': (40*1)+16},{'c':'pTxtPanel0','i': (40*2)+0},{'c':'pTxtPanel1','i': (40*2)+1},{'c':'pTxtPanel1','i': (40*2)+2},{'c':'pTxtPanel1','i': (40*2)+3},{'c':'pTxtPanel1','i': (40*2)+4},{'c':'pTxtPanel1','i': (40*2)+5},{'c':'pTxtPanel1','i': (40*2)+6},{'c':'pTxtPanel1','i': (40*2)+7},{'c':'pTxtPanel1','i': (40*2)+8},{'c':'pTxtPanel1','i': (40*2)+9},{'c':'pTxtPanel1','i': (40*2)+10},{'c':'pTxtPanel1','i': (40*2)+11},{'c':'pTxtPanel1','i': (40*2)+12},{'c':'pTxtPanel1','i': (40*2)+13},{'c':'pTxtPanel1','i': (40*2)+14},{'c':'pTxtPanel1','i': (40*2)+15},{'c':'pTxtPanel0','i': (40*2)+16},{'c':'pTxtPanel2','i': (40*3)+0},{'c':'pTxtPanel1','i': (40*3)+1},{'c':'pTxtPanel1','i': (40*3)+2},{'c':'pTxtPanel1','i': (40*3)+3},{'c':'pTxtPanel1','i': (40*3)+4},{'c':'pTxtPanel1','i': (40*3)+5},{'c':'pTxtPanel1','i': (40*3)+6},{'c':'pTxtPanel1','i': (40*3)+7},{'c':'pTxtPanel1','i': (40*3)+8},{'c':'pTxtPanel1','i': (40*3)+9},{'c':'pTxtPanel1','i': (40*3)+10},{'c':'pTxtPanel1','i': (40*3)+11},{'c':'pTxtPanel1','i': (40*3)+12},{'c':'pTxtPanel1','i': (40*3)+13},{'c':'pTxtPanel1','i': (40*3)+14},{'c':'pTxtPanel1','i': (40*3)+15},{'c':'pTxtPanel2','i': (40*3)+16},{'c':'pTxtPanel2','i': (40*4)+0},{'c':'pTxtPanel1','i': (40*4)+1},{'c':'pTxtPanel1','i': (40*4)+2},{'c':'pTxtPanel1','i': (40*4)+3},{'c':'pTxtPanel1','i': (40*4)+4},{'c':'pTxtPanel1','i': (40*4)+5},{'c':'pTxtPanel1','i': (40*4)+6},{'c':'pTxtPanel1','i': (40*4)+7},{'c':'pTxtPanel1','i': (40*4)+8},{'c':'pTxtPanel1','i': (40*4)+9},{'c':'pTxtPanel1','i': (40*4)+10},{'c':'pTxtPanel1','i': (40*4)+11},{'c':'pTxtPanel1','i': (40*4)+12},{'c':'pTxtPanel1','i': (40*4)+13},{'c':'pTxtPanel1','i': (40*4)+14},{'c':'pTxtPanel1','i': (40*4)+15},{'c':'pTxtPanel2','i': (40*4)+16},{'c':'pTxtPanel2','i': (40*5)+0},{'c':'pTxtPanel1','i': (40*5)+1},{'c':'pTxtPanel1','i': (40*5)+2},{'c':'pTxtPanel1','i': (40*5)+3},{'c':'pTxtPanel1','i': (40*5)+4},{'c':'pTxtPanel1','i': (40*5)+5},{'c':'pTxtPanel1','i': (40*5)+6},{'c':'pTxtPanel1','i': (40*5)+7},{'c':'pTxtPanel1','i': (40*5)+8},{'c':'pTxtPanel1','i': (40*5)+9},{'c':'pTxtPanel1','i': (40*5)+10},{'c':'pTxtPanel1','i': (40*5)+11},{'c':'pTxtPanel1','i': (40*5)+12},{'c':'pTxtPanel1','i': (40*5)+13},{'c':'pTxtPanel1','i': (40*5)+14},{'c':'pTxtPanel1','i': (40*5)+15},{'c':'pTxtPanel2','i': (40*5)+16},{'c':'pTxtPanel2','i': (40*6)+0},{'c':'pTxtPanel2','i': (40*6)+1},{'c':'pTxtPanel2','i': (40*6)+2},{'c':'pTxtPanel2','i': (40*6)+3},{'c':'pTxtPanel2','i': (40*6)+4},{'c':'pTxtPanel2','i': (40*6)+5},{'c':'pTxtPanel2','i': (40*6)+6},{'c':'pTxtPanel2','i': (40*6)+7},{'c':'pTxtPanel2','i': (40*6)+8},{'c':'pTxtPanel2','i': (40*6)+9},{'c':'pTxtPanel2','i': (40*6)+10},{'c':'pTxtPanel2','i': (40*6)+11},{'c':'pTxtPanel2','i': (40*6)+12},{'c':'pTxtPanel2','i': (40*6)+13},{'c':'pTxtPanel2','i': (40*6)+14},{'c':'pTxtPanel2','i': (40*6)+15},{'c':'pTxtPanel2','i': (40*6)+16},{'c':'pTxtPanel2','i': (40*7)+2},{'c':'pTxtPanel2','i': (40*7)+3},{'c':'pTxtPanel2','i': (40*7)+4},{'c':'pTxtPanel2','i': (40*8)+2}					
									],
									'label' : '1'	
								}								
							}
						];
						
						break;
						
					case 'pTxtPanel2': 
					
						img = [
							{'frm':
								{
									'duration' : 1,
									'pix' : [
										{'c':'pTxtPanel0','i': (40*0)+0},{'c':'pTxtPanel0','i': (40*0)+1},{'c':'pTxtPanel0','i': (40*0)+2},{'c':'pTxtPanel0','i': (40*0)+3},{'c':'pTxtPanel0','i': (40*0)+4},{'c':'pTxtPanel0','i': (40*0)+5},{'c':'pTxtPanel0','i': (40*0)+6},{'c':'pTxtPanel0','i': (40*0)+7},{'c':'pTxtPanel0','i': (40*0)+8},{'c':'pTxtPanel0','i': (40*0)+9},{'c':'pTxtPanel0','i': (40*0)+10},{'c':'pTxtPanel0','i': (40*0)+11},{'c':'pTxtPanel0','i': (40*0)+12},{'c':'pTxtPanel0','i': (40*0)+13},{'c':'pTxtPanel0','i': (40*0)+14},{'c':'pTxtPanel0','i': (40*0)+15},{'c':'pTxtPanel0','i': (40*0)+16},{'c':'pTxtPanel0','i': (40*0)+17},{'c':'pTxtPanel0','i': (40*0)+18},{'c':'pTxtPanel0','i': (40*0)+19},{'c':'pTxtPanel0','i': (40*0)+20},{'c':'pTxtPanel0','i': (40*0)+21},{'c':'pTxtPanel0','i': (40*0)+22},{'c':'pTxtPanel0','i': (40*0)+23},{'c':'pTxtPanel0','i': (40*0)+24},{'c':'pTxtPanel0','i': (40*0)+25},{'c':'pTxtPanel0','i': (40*0)+26},{'c':'pTxtPanel0','i': (40*0)+27},{'c':'pTxtPanel0','i': (40*0)+28},{'c':'pTxtPanel0','i': (40*1)+0},{'c':'pTxtPanel1','i': (40*1)+1},{'c':'pTxtPanel1','i': (40*1)+2},{'c':'pTxtPanel1','i': (40*1)+3},{'c':'pTxtPanel1','i': (40*1)+4},{'c':'pTxtPanel1','i': (40*1)+5},{'c':'pTxtPanel1','i': (40*1)+6},{'c':'pTxtPanel1','i': (40*1)+7},{'c':'pTxtPanel1','i': (40*1)+8},{'c':'pTxtPanel1','i': (40*1)+9},{'c':'pTxtPanel1','i': (40*1)+10},{'c':'pTxtPanel1','i': (40*1)+11},{'c':'pTxtPanel1','i': (40*1)+12},{'c':'pTxtPanel1','i': (40*1)+13},{'c':'pTxtPanel1','i': (40*1)+14},{'c':'pTxtPanel1','i': (40*1)+15},{'c':'pTxtPanel1','i': (40*1)+16},{'c':'pTxtPanel1','i': (40*1)+17},{'c':'pTxtPanel1','i': (40*1)+18},{'c':'pTxtPanel1','i': (40*1)+19},{'c':'pTxtPanel1','i': (40*1)+20},{'c':'pTxtPanel1','i': (40*1)+21},{'c':'pTxtPanel1','i': (40*1)+22},{'c':'pTxtPanel1','i': (40*1)+23},{'c':'pTxtPanel1','i': (40*1)+24},{'c':'pTxtPanel1','i': (40*1)+25},{'c':'pTxtPanel1','i': (40*1)+26},{'c':'pTxtPanel1','i': (40*1)+27},{'c':'pTxtPanel0','i': (40*1)+28},{'c':'pTxtPanel2','i': (40*2)+0},{'c':'pTxtPanel1','i': (40*2)+1},{'c':'pTxtPanel1','i': (40*2)+2},{'c':'pTxtPanel1','i': (40*2)+3},{'c':'pTxtPanel1','i': (40*2)+4},{'c':'pTxtPanel1','i': (40*2)+5},{'c':'pTxtPanel1','i': (40*2)+6},{'c':'pTxtPanel1','i': (40*2)+7},{'c':'pTxtPanel1','i': (40*2)+8},{'c':'pTxtPanel1','i': (40*2)+9},{'c':'pTxtPanel1','i': (40*2)+10},{'c':'pTxtPanel1','i': (40*2)+11},{'c':'pTxtPanel1','i': (40*2)+12},{'c':'pTxtPanel1','i': (40*2)+13},{'c':'pTxtPanel1','i': (40*2)+14},{'c':'pTxtPanel1','i': (40*2)+15},{'c':'pTxtPanel1','i': (40*2)+16},{'c':'pTxtPanel1','i': (40*2)+17},{'c':'pTxtPanel1','i': (40*2)+18},{'c':'pTxtPanel1','i': (40*2)+19},{'c':'pTxtPanel1','i': (40*2)+20},{'c':'pTxtPanel1','i': (40*2)+21},{'c':'pTxtPanel1','i': (40*2)+22},{'c':'pTxtPanel1','i': (40*2)+23},{'c':'pTxtPanel1','i': (40*2)+24},{'c':'pTxtPanel1','i': (40*2)+25},{'c':'pTxtPanel1','i': (40*2)+26},{'c':'pTxtPanel1','i': (40*2)+27},{'c':'pTxtPanel2','i': (40*2)+28},{'c':'pTxtPanel2','i': (40*3)+0},{'c':'pTxtPanel1','i': (40*3)+1},{'c':'pTxtPanel1','i': (40*3)+2},{'c':'pTxtPanel1','i': (40*3)+3},{'c':'pTxtPanel1','i': (40*3)+4},{'c':'pTxtPanel1','i': (40*3)+5},{'c':'pTxtPanel1','i': (40*3)+6},{'c':'pTxtPanel1','i': (40*3)+7},{'c':'pTxtPanel1','i': (40*3)+8},{'c':'pTxtPanel1','i': (40*3)+9},{'c':'pTxtPanel1','i': (40*3)+10},{'c':'pTxtPanel1','i': (40*3)+11},{'c':'pTxtPanel1','i': (40*3)+12},{'c':'pTxtPanel1','i': (40*3)+13},{'c':'pTxtPanel1','i': (40*3)+14},{'c':'pTxtPanel1','i': (40*3)+15},{'c':'pTxtPanel1','i': (40*3)+16},{'c':'pTxtPanel1','i': (40*3)+17},{'c':'pTxtPanel1','i': (40*3)+18},{'c':'pTxtPanel1','i': (40*3)+19},{'c':'pTxtPanel1','i': (40*3)+20},{'c':'pTxtPanel1','i': (40*3)+21},{'c':'pTxtPanel1','i': (40*3)+22},{'c':'pTxtPanel1','i': (40*3)+23},{'c':'pTxtPanel1','i': (40*3)+24},{'c':'pTxtPanel1','i': (40*3)+25},{'c':'pTxtPanel1','i': (40*3)+26},{'c':'pTxtPanel1','i': (40*3)+27},{'c':'pTxtPanel2','i': (40*3)+28},{'c':'pTxtPanel2','i': (40*4)+0},{'c':'pTxtPanel2','i': (40*4)+1},{'c':'pTxtPanel2','i': (40*4)+2},{'c':'pTxtPanel2','i': (40*4)+3},{'c':'pTxtPanel2','i': (40*4)+4},{'c':'pTxtPanel2','i': (40*4)+5},{'c':'pTxtPanel2','i': (40*4)+6},{'c':'pTxtPanel2','i': (40*4)+7},{'c':'pTxtPanel2','i': (40*4)+8},{'c':'pTxtPanel2','i': (40*4)+9},{'c':'pTxtPanel2','i': (40*4)+10},{'c':'pTxtPanel2','i': (40*4)+11},{'c':'pTxtPanel2','i': (40*4)+12},{'c':'pTxtPanel2','i': (40*4)+13},{'c':'pTxtPanel2','i': (40*4)+14},{'c':'pTxtPanel2','i': (40*4)+15},{'c':'pTxtPanel2','i': (40*4)+16},{'c':'pTxtPanel2','i': (40*4)+17},{'c':'pTxtPanel2','i': (40*4)+18},{'c':'pTxtPanel2','i': (40*4)+19},{'c':'pTxtPanel2','i': (40*4)+20},{'c':'pTxtPanel2','i': (40*4)+21},{'c':'pTxtPanel2','i': (40*4)+22},{'c':'pTxtPanel2','i': (40*4)+23},{'c':'pTxtPanel2','i': (40*4)+24},{'c':'pTxtPanel2','i': (40*4)+25},{'c':'pTxtPanel2','i': (40*4)+26},{'c':'pTxtPanel2','i': (40*4)+27},{'c':'pTxtPanel2','i': (40*4)+28},{'c':'pTxtPanel2','i': (40*5)+20},{'c':'pTxtPanel2','i': (40*5)+21},{'c':'pTxtPanel2','i': (40*5)+22},{'c':'pTxtPanel2','i': (40*6)+22}					
									],
									'label' : '1'	
								}								
							}
						];
						
						break;
						
					case 'pTxtPanel3':
						
						img = [
							{'frm':
								{
									'duration' : 1,
									'pix' : [
										{'c':'pTxtPanel0','i': (40*0)+4},{'c':'pTxtPanel0','i': (40*1)+4},{'c':'pTxtPanel0','i': (40*1)+5},{'c':'pTxtPanel0','i': (40*1)+6},{'c':'pTxtPanel0','i': (40*2)+0},{'c':'pTxtPanel0','i': (40*2)+1},{'c':'pTxtPanel0','i': (40*2)+2},{'c':'pTxtPanel0','i': (40*2)+3},{'c':'pTxtPanel0','i': (40*2)+4},{'c':'pTxtPanel0','i': (40*2)+5},{'c':'pTxtPanel0','i': (40*2)+6},{'c':'pTxtPanel0','i': (40*2)+7},{'c':'pTxtPanel0','i': (40*2)+8},{'c':'pTxtPanel0','i': (40*2)+9},{'c':'pTxtPanel0','i': (40*2)+10},{'c':'pTxtPanel0','i': (40*2)+11},{'c':'pTxtPanel0','i': (40*2)+12},{'c':'pTxtPanel0','i': (40*2)+13},{'c':'pTxtPanel0','i': (40*2)+14},{'c':'pTxtPanel0','i': (40*2)+15},{'c':'pTxtPanel0','i': (40*2)+16},{'c':'pTxtPanel0','i': (40*2)+17},{'c':'pTxtPanel0','i': (40*2)+18},{'c':'pTxtPanel0','i': (40*2)+19},{'c':'pTxtPanel0','i': (40*2)+20},{'c':'pTxtPanel0','i': (40*2)+21},{'c':'pTxtPanel0','i': (40*2)+22},{'c':'pTxtPanel0','i': (40*2)+23},{'c':'pTxtPanel0','i': (40*2)+24},{'c':'pTxtPanel0','i': (40*3)+0},{'c':'pTxtPanel1','i': (40*3)+1},{'c':'pTxtPanel1','i': (40*3)+2},{'c':'pTxtPanel1','i': (40*3)+3},{'c':'pTxtPanel1','i': (40*3)+4},{'c':'pTxtPanel1','i': (40*3)+5},{'c':'pTxtPanel1','i': (40*3)+6},{'c':'pTxtPanel1','i': (40*3)+7},{'c':'pTxtPanel1','i': (40*3)+8},{'c':'pTxtPanel1','i': (40*3)+9},{'c':'pTxtPanel1','i': (40*3)+10},{'c':'pTxtPanel1','i': (40*3)+11},{'c':'pTxtPanel1','i': (40*3)+12},{'c':'pTxtPanel1','i': (40*3)+13},{'c':'pTxtPanel1','i': (40*3)+14},{'c':'pTxtPanel1','i': (40*3)+15},{'c':'pTxtPanel1','i': (40*3)+16},{'c':'pTxtPanel1','i': (40*3)+17},{'c':'pTxtPanel1','i': (40*3)+18},{'c':'pTxtPanel1','i': (40*3)+19},{'c':'pTxtPanel1','i': (40*3)+20},{'c':'pTxtPanel1','i': (40*3)+21},{'c':'pTxtPanel1','i': (40*3)+22},{'c':'pTxtPanel1','i': (40*3)+23},{'c':'pTxtPanel0','i': (40*3)+24},{'c':'pTxtPanel0','i': (40*4)+0},{'c':'pTxtPanel1','i': (40*4)+1},{'c':'pTxtPanel1','i': (40*4)+2},{'c':'pTxtPanel1','i': (40*4)+3},{'c':'pTxtPanel1','i': (40*4)+4},{'c':'pTxtPanel1','i': (40*4)+5},{'c':'pTxtPanel1','i': (40*4)+6},{'c':'pTxtPanel1','i': (40*4)+7},{'c':'pTxtPanel1','i': (40*4)+8},{'c':'pTxtPanel1','i': (40*4)+9},{'c':'pTxtPanel1','i': (40*4)+10},{'c':'pTxtPanel1','i': (40*4)+11},{'c':'pTxtPanel1','i': (40*4)+12},{'c':'pTxtPanel1','i': (40*4)+13},{'c':'pTxtPanel1','i': (40*4)+14},{'c':'pTxtPanel1','i': (40*4)+15},{'c':'pTxtPanel1','i': (40*4)+16},{'c':'pTxtPanel1','i': (40*4)+17},{'c':'pTxtPanel1','i': (40*4)+18},{'c':'pTxtPanel1','i': (40*4)+19},{'c':'pTxtPanel1','i': (40*4)+20},{'c':'pTxtPanel1','i': (40*4)+21},{'c':'pTxtPanel1','i': (40*4)+22},{'c':'pTxtPanel1','i': (40*4)+23},{'c':'pTxtPanel0','i': (40*4)+24},{'c':'pTxtPanel0','i': (40*5)+0},{'c':'pTxtPanel1','i': (40*5)+1},{'c':'pTxtPanel1','i': (40*5)+2},{'c':'pTxtPanel1','i': (40*5)+3},{'c':'pTxtPanel1','i': (40*5)+4},{'c':'pTxtPanel1','i': (40*5)+5},{'c':'pTxtPanel1','i': (40*5)+6},{'c':'pTxtPanel1','i': (40*5)+7},{'c':'pTxtPanel1','i': (40*5)+8},{'c':'pTxtPanel1','i': (40*5)+9},{'c':'pTxtPanel1','i': (40*5)+10},{'c':'pTxtPanel1','i': (40*5)+11},{'c':'pTxtPanel1','i': (40*5)+12},{'c':'pTxtPanel1','i': (40*5)+13},{'c':'pTxtPanel1','i': (40*5)+14},{'c':'pTxtPanel1','i': (40*5)+15},{'c':'pTxtPanel1','i': (40*5)+16},{'c':'pTxtPanel1','i': (40*5)+17},{'c':'pTxtPanel1','i': (40*5)+18},{'c':'pTxtPanel1','i': (40*5)+19},{'c':'pTxtPanel1','i': (40*5)+20},{'c':'pTxtPanel1','i': (40*5)+21},{'c':'pTxtPanel1','i': (40*5)+22},{'c':'pTxtPanel1','i': (40*5)+23},{'c':'pTxtPanel0','i': (40*5)+24},{'c':'pTxtPanel2','i': (40*6)+0},{'c':'pTxtPanel1','i': (40*6)+1},{'c':'pTxtPanel1','i': (40*6)+2},{'c':'pTxtPanel1','i': (40*6)+3},{'c':'pTxtPanel1','i': (40*6)+4},{'c':'pTxtPanel1','i': (40*6)+5},{'c':'pTxtPanel1','i': (40*6)+6},{'c':'pTxtPanel1','i': (40*6)+7},{'c':'pTxtPanel1','i': (40*6)+8},{'c':'pTxtPanel1','i': (40*6)+9},{'c':'pTxtPanel1','i': (40*6)+10},{'c':'pTxtPanel1','i': (40*6)+11},{'c':'pTxtPanel1','i': (40*6)+12},{'c':'pTxtPanel1','i': (40*6)+13},{'c':'pTxtPanel1','i': (40*6)+14},{'c':'pTxtPanel1','i': (40*6)+15},{'c':'pTxtPanel1','i': (40*6)+16},{'c':'pTxtPanel1','i': (40*6)+17},{'c':'pTxtPanel1','i': (40*6)+18},{'c':'pTxtPanel1','i': (40*6)+19},{'c':'pTxtPanel1','i': (40*6)+20},{'c':'pTxtPanel1','i': (40*6)+21},{'c':'pTxtPanel1','i': (40*6)+22},{'c':'pTxtPanel1','i': (40*6)+23},{'c':'pTxtPanel2','i': (40*6)+24},{'c':'pTxtPanel2','i': (40*7)+0},{'c':'pTxtPanel1','i': (40*7)+1},{'c':'pTxtPanel1','i': (40*7)+2},{'c':'pTxtPanel1','i': (40*7)+3},{'c':'pTxtPanel1','i': (40*7)+4},{'c':'pTxtPanel1','i': (40*7)+5},{'c':'pTxtPanel1','i': (40*7)+6},{'c':'pTxtPanel1','i': (40*7)+7},{'c':'pTxtPanel1','i': (40*7)+8},{'c':'pTxtPanel1','i': (40*7)+9},{'c':'pTxtPanel1','i': (40*7)+10},{'c':'pTxtPanel1','i': (40*7)+11},{'c':'pTxtPanel1','i': (40*7)+12},{'c':'pTxtPanel1','i': (40*7)+13},{'c':'pTxtPanel1','i': (40*7)+14},{'c':'pTxtPanel1','i': (40*7)+15},{'c':'pTxtPanel1','i': (40*7)+16},{'c':'pTxtPanel1','i': (40*7)+17},{'c':'pTxtPanel1','i': (40*7)+18},{'c':'pTxtPanel1','i': (40*7)+19},{'c':'pTxtPanel1','i': (40*7)+20},{'c':'pTxtPanel1','i': (40*7)+21},{'c':'pTxtPanel1','i': (40*7)+22},{'c':'pTxtPanel1','i': (40*7)+23},{'c':'pTxtPanel2','i': (40*7)+24},{'c':'pTxtPanel2','i': (40*8)+0},{'c':'pTxtPanel1','i': (40*8)+1},{'c':'pTxtPanel1','i': (40*8)+2},{'c':'pTxtPanel1','i': (40*8)+3},{'c':'pTxtPanel1','i': (40*8)+4},{'c':'pTxtPanel1','i': (40*8)+5},{'c':'pTxtPanel1','i': (40*8)+6},{'c':'pTxtPanel1','i': (40*8)+7},{'c':'pTxtPanel1','i': (40*8)+8},{'c':'pTxtPanel1','i': (40*8)+9},{'c':'pTxtPanel1','i': (40*8)+10},{'c':'pTxtPanel1','i': (40*8)+11},{'c':'pTxtPanel1','i': (40*8)+12},{'c':'pTxtPanel1','i': (40*8)+13},{'c':'pTxtPanel1','i': (40*8)+14},{'c':'pTxtPanel1','i': (40*8)+15},{'c':'pTxtPanel1','i': (40*8)+16},{'c':'pTxtPanel1','i': (40*8)+17},{'c':'pTxtPanel1','i': (40*8)+18},{'c':'pTxtPanel1','i': (40*8)+19},{'c':'pTxtPanel1','i': (40*8)+20},{'c':'pTxtPanel1','i': (40*8)+21},{'c':'pTxtPanel1','i': (40*8)+22},{'c':'pTxtPanel1','i': (40*8)+23},{'c':'pTxtPanel2','i': (40*8)+24},{'c':'pTxtPanel2','i': (40*9)+0},{'c':'pTxtPanel1','i': (40*9)+1},{'c':'pTxtPanel1','i': (40*9)+2},{'c':'pTxtPanel1','i': (40*9)+3},{'c':'pTxtPanel1','i': (40*9)+4},{'c':'pTxtPanel1','i': (40*9)+5},{'c':'pTxtPanel1','i': (40*9)+6},{'c':'pTxtPanel1','i': (40*9)+7},{'c':'pTxtPanel1','i': (40*9)+8},{'c':'pTxtPanel1','i': (40*9)+9},{'c':'pTxtPanel1','i': (40*9)+10},{'c':'pTxtPanel1','i': (40*9)+11},{'c':'pTxtPanel1','i': (40*9)+12},{'c':'pTxtPanel1','i': (40*9)+13},{'c':'pTxtPanel1','i': (40*9)+14},{'c':'pTxtPanel1','i': (40*9)+15},{'c':'pTxtPanel1','i': (40*9)+16},{'c':'pTxtPanel1','i': (40*9)+17},{'c':'pTxtPanel1','i': (40*9)+18},{'c':'pTxtPanel1','i': (40*9)+19},{'c':'pTxtPanel1','i': (40*9)+20},{'c':'pTxtPanel1','i': (40*9)+21},{'c':'pTxtPanel1','i': (40*9)+22},{'c':'pTxtPanel1','i': (40*9)+23},{'c':'pTxtPanel2','i': (40*9)+24},{'c':'pTxtPanel2','i': (40*10)+0},{'c':'pTxtPanel2','i': (40*10)+1},{'c':'pTxtPanel2','i': (40*10)+2},{'c':'pTxtPanel2','i': (40*10)+3},{'c':'pTxtPanel2','i': (40*10)+4},{'c':'pTxtPanel2','i': (40*10)+5},{'c':'pTxtPanel2','i': (40*10)+6},{'c':'pTxtPanel2','i': (40*10)+7},{'c':'pTxtPanel2','i': (40*10)+8},{'c':'pTxtPanel2','i': (40*10)+9},{'c':'pTxtPanel2','i': (40*10)+10},{'c':'pTxtPanel2','i': (40*10)+11},{'c':'pTxtPanel2','i': (40*10)+12},{'c':'pTxtPanel2','i': (40*10)+13},{'c':'pTxtPanel2','i': (40*10)+14},{'c':'pTxtPanel2','i': (40*10)+15},{'c':'pTxtPanel2','i': (40*10)+16},{'c':'pTxtPanel2','i': (40*10)+17},{'c':'pTxtPanel2','i': (40*10)+18},{'c':'pTxtPanel2','i': (40*10)+19},{'c':'pTxtPanel2','i': (40*10)+20},{'c':'pTxtPanel2','i': (40*10)+21},{'c':'pTxtPanel2','i': (40*10)+22},{'c':'pTxtPanel2','i': (40*10)+23},{'c':'pTxtPanel2','i': (40*10)+24}					
									],
									'label' : '1'	
								}								
							}
						];
						
						break;
						
					case 'pTxtPanel4': 
					
						img = [
							{'frm':
								{
									'duration' : 1,
									'pix' : [
										{'c':'pTxtPanel0','i': (40*0)+10},{'c':'pTxtPanel0','i': (40*1)+8},{'c':'pTxtPanel0','i': (40*1)+9},{'c':'pTxtPanel0','i': (40*1)+10},{'c':'pTxtPanel0','i': (40*2)+0},{'c':'pTxtPanel0','i': (40*2)+1},{'c':'pTxtPanel0','i': (40*2)+2},{'c':'pTxtPanel0','i': (40*2)+3},{'c':'pTxtPanel0','i': (40*2)+4},{'c':'pTxtPanel0','i': (40*2)+5},{'c':'pTxtPanel0','i': (40*2)+6},{'c':'pTxtPanel0','i': (40*2)+7},{'c':'pTxtPanel0','i': (40*2)+8},{'c':'pTxtPanel0','i': (40*2)+9},{'c':'pTxtPanel0','i': (40*2)+10},{'c':'pTxtPanel0','i': (40*2)+11},{'c':'pTxtPanel0','i': (40*2)+12},{'c':'pTxtPanel0','i': (40*2)+13},{'c':'pTxtPanel0','i': (40*2)+14},{'c':'pTxtPanel0','i': (40*2)+15},{'c':'pTxtPanel0','i': (40*2)+16},{'c':'pTxtPanel0','i': (40*2)+17},{'c':'pTxtPanel0','i': (40*2)+18},{'c':'pTxtPanel0','i': (40*2)+19},{'c':'pTxtPanel0','i': (40*2)+20},{'c':'pTxtPanel0','i': (40*2)+21},{'c':'pTxtPanel0','i': (40*2)+22},{'c':'pTxtPanel0','i': (40*2)+23},{'c':'pTxtPanel0','i': (40*3)+0},{'c':'pTxtPanel1','i': (40*3)+1},{'c':'pTxtPanel1','i': (40*3)+2},{'c':'pTxtPanel1','i': (40*3)+3},{'c':'pTxtPanel1','i': (40*3)+4},{'c':'pTxtPanel1','i': (40*3)+5},{'c':'pTxtPanel1','i': (40*3)+6},{'c':'pTxtPanel1','i': (40*3)+7},{'c':'pTxtPanel1','i': (40*3)+8},{'c':'pTxtPanel1','i': (40*3)+9},{'c':'pTxtPanel1','i': (40*3)+10},{'c':'pTxtPanel1','i': (40*3)+11},{'c':'pTxtPanel1','i': (40*3)+12},{'c':'pTxtPanel1','i': (40*3)+13},{'c':'pTxtPanel1','i': (40*3)+14},{'c':'pTxtPanel1','i': (40*3)+15},{'c':'pTxtPanel1','i': (40*3)+16},{'c':'pTxtPanel1','i': (40*3)+17},{'c':'pTxtPanel1','i': (40*3)+18},{'c':'pTxtPanel1','i': (40*3)+19},{'c':'pTxtPanel1','i': (40*3)+20},{'c':'pTxtPanel1','i': (40*3)+21},{'c':'pTxtPanel1','i': (40*3)+22},{'c':'pTxtPanel0','i': (40*3)+23},{'c':'pTxtPanel2','i': (40*4)+0},{'c':'pTxtPanel1','i': (40*4)+1},{'c':'pTxtPanel1','i': (40*4)+2},{'c':'pTxtPanel1','i': (40*4)+3},{'c':'pTxtPanel1','i': (40*4)+4},{'c':'pTxtPanel1','i': (40*4)+5},{'c':'pTxtPanel1','i': (40*4)+6},{'c':'pTxtPanel1','i': (40*4)+7},{'c':'pTxtPanel1','i': (40*4)+8},{'c':'pTxtPanel1','i': (40*4)+9},{'c':'pTxtPanel1','i': (40*4)+10},{'c':'pTxtPanel1','i': (40*4)+11},{'c':'pTxtPanel1','i': (40*4)+12},{'c':'pTxtPanel1','i': (40*4)+13},{'c':'pTxtPanel1','i': (40*4)+14},{'c':'pTxtPanel1','i': (40*4)+15},{'c':'pTxtPanel1','i': (40*4)+16},{'c':'pTxtPanel1','i': (40*4)+17},{'c':'pTxtPanel1','i': (40*4)+18},{'c':'pTxtPanel1','i': (40*4)+19},{'c':'pTxtPanel1','i': (40*4)+20},{'c':'pTxtPanel1','i': (40*4)+21},{'c':'pTxtPanel1','i': (40*4)+22},{'c':'pTxtPanel2','i': (40*4)+23},{'c':'pTxtPanel2','i': (40*5)+0},{'c':'pTxtPanel1','i': (40*5)+1},{'c':'pTxtPanel1','i': (40*5)+2},{'c':'pTxtPanel1','i': (40*5)+3},{'c':'pTxtPanel1','i': (40*5)+4},{'c':'pTxtPanel1','i': (40*5)+5},{'c':'pTxtPanel1','i': (40*5)+6},{'c':'pTxtPanel1','i': (40*5)+7},{'c':'pTxtPanel1','i': (40*5)+8},{'c':'pTxtPanel1','i': (40*5)+9},{'c':'pTxtPanel1','i': (40*5)+10},{'c':'pTxtPanel1','i': (40*5)+11},{'c':'pTxtPanel1','i': (40*5)+12},{'c':'pTxtPanel1','i': (40*5)+13},{'c':'pTxtPanel1','i': (40*5)+14},{'c':'pTxtPanel1','i': (40*5)+15},{'c':'pTxtPanel1','i': (40*5)+16},{'c':'pTxtPanel1','i': (40*5)+17},{'c':'pTxtPanel1','i': (40*5)+18},{'c':'pTxtPanel1','i': (40*5)+19},{'c':'pTxtPanel1','i': (40*5)+20},{'c':'pTxtPanel1','i': (40*5)+21},{'c':'pTxtPanel1','i': (40*5)+22},{'c':'pTxtPanel2','i': (40*5)+23},{'c':'pTxtPanel2','i': (40*6)+0},{'c':'pTxtPanel2','i': (40*6)+1},{'c':'pTxtPanel2','i': (40*6)+2},{'c':'pTxtPanel2','i': (40*6)+3},{'c':'pTxtPanel2','i': (40*6)+4},{'c':'pTxtPanel2','i': (40*6)+5},{'c':'pTxtPanel2','i': (40*6)+6},{'c':'pTxtPanel2','i': (40*6)+7},{'c':'pTxtPanel2','i': (40*6)+8},{'c':'pTxtPanel2','i': (40*6)+9},{'c':'pTxtPanel2','i': (40*6)+10},{'c':'pTxtPanel2','i': (40*6)+11},{'c':'pTxtPanel2','i': (40*6)+12},{'c':'pTxtPanel2','i': (40*6)+13},{'c':'pTxtPanel2','i': (40*6)+14},{'c':'pTxtPanel2','i': (40*6)+15},{'c':'pTxtPanel2','i': (40*6)+16},{'c':'pTxtPanel2','i': (40*6)+17},{'c':'pTxtPanel2','i': (40*6)+18},{'c':'pTxtPanel2','i': (40*6)+19},{'c':'pTxtPanel2','i': (40*6)+20},{'c':'pTxtPanel2','i': (40*6)+21},{'c':'pTxtPanel2','i': (40*6)+22},{'c':'pTxtPanel2','i': (40*6)+23}					
									],
									'label' : '1'	
								}								
							}
						];
						
						break;					
				}
						
				return img;				
			}
		};
			
	}

	return {
		install: function() {
			return cnstr();
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
														
			var b = document.getElementsByTagName('body').item(0);
			b.appendChild(lc); // add loader container to body

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
 * PanelInfo object
 * Builds an overlay panel for ittybitty8bit.
 * 
 * @author Vince Allen 08-02-2010
 */
BigBlock.PanelInfo = (function() { // uses lazy instantiation; 
  
	function cnstr(type, before, after) { // All of the normal singleton code goes here.
		return {
			type : type,
			panel_timeout: false,
			before : before,
			after : after,
			restoreProps : {
				Sprites : [],
				GridStaticStyles : {},
				GridActiveStyles : {},
				GridTextStyles : {},
				StaticDivs : {
					'qS_tl' : [],
					'qS_tr' : [],
					'qS_bl' : [],
					'qS_br' : []
				},
				TextDivs : {
					'qT_tl' : [],
					'qT_tr' : [],
					'qT_bl' : [],
					'qT_br' : []
				}
			},
			evtListner : [],
			logoScreen: function() {
				
				
				if (typeof(this.before) == 'function') {
					this.before();
				}

				var quads = BigBlock.GridStatic.quads;
				
				for (var i = 0; i < quads.length; i++) { // make a copy of all static divs
					var q = document.getElementById(quads[i].id);
						
					if (q.hasChildNodes()) {
						var nodes = q.childNodes; // get a collection of all children in quad;						
						var tmp = [];
						
						// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
						 
						for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
							tmp[tmp.length] = nodes[x]; 
						}						
						
						for (var j = 0; j < tmp.length; j++) { // add child to array
							this.restoreProps.StaticDivs[quads[i].id].push(tmp[j]);	
						}
						
						nodes = null;
						tmp = null;
					}							
				}
				
				quads = BigBlock.GridText.quads;
				
				for (i = 0; i < quads.length; i++) { // make a copy of all text divs
					q = document.getElementById(quads[i].id);
						
					if (q.hasChildNodes()) {
						var nodes = q.childNodes; // get a collection of all children in quad;						
						var tmp = [];
						
						// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
						 
						for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
							tmp[tmp.length] = nodes[x]; 
						}						
						
						for (var j = 0; j < tmp.length; j++) { // add child to array
							this.restoreProps.TextDivs[quads[i].id].push(tmp[j]);	
						}
						
						nodes = null;
						tmp = null;
					}						
				}							
								
				// adds event listener for any sprites carrying input actions 									
				quads = BigBlock.GridActive.quads;
				var dm = BigBlock.Grid.pix_dim;
				var inputAction = function (evt_x, evt_y, event) {
					for (var i = 0; i < BigBlock.Sprites.length; i++) { // check to fire any active sprite events 
						if (BigBlock.Sprites[i].input_action !== false && typeof(BigBlock.Sprites[i].input_action) == 'function') {
							var x = BigBlock.Sprites[i].x;
							var y = BigBlock.Sprites[i].y;
							if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
								BigBlock.Sprites[i].input_action(event);								
							}
						}
					}						
				};
				var mouseup_event = function (event) {
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}
					if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
						BigBlock.InputFeedback.display(event.clientX, event.clientY);
					}									
					if (typeof(BigBlock.GridActive) != 'undefined') {
						inputAction((event.clientX - BigBlock.GridActive.x), (event.clientY - BigBlock.GridActive.y), event);
					}				
				};
				var click_event = function (event) { // for wii only
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}
					if (typeof(opera) != 'undefined' && typeof(opera.wiiremote) != 'undefined') { // detect wii
						if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
							BigBlock.InputFeedback.display(event.clientX, event.clientY);
						}									
						if (typeof(BigBlock.GridActive) != 'undefined') {
							inputAction((event.clientX - BigBlock.GridActive.x), (event.clientY - BigBlock.GridActive.y), event);
						}
					}			
				};					
				var touchstart_event = function (event) {
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}				
					if (typeof(event.touches) != 'undefined') { 					
						var touch = event.touches[0];
						if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
							BigBlock.InputFeedback.display(touch.clientX, touch.clientY);
						}							
						if (typeof(BigBlock.GridActive) != 'undefined') {
							inputAction((touch.clientX - BigBlock.GridActive.x), (touch.clientY - BigBlock.GridActive.y), event);
						}
					}				
				};								
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('mouseup', mouseup_event, false); // add mouseup event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('onmouseup', mouseup_event)
					}
					this.evtListner[this.evtListner.length] = mouseup_event;		
				}
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('click', click_event, false); // add mouseup event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('onclick', click_event)
					}
					this.evtListner[this.evtListner.length] = click_event;		
				}				
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('touchstart', touchstart_event, false); // add touchstart event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('ontouchstart', touchstart_event)
					}
					this.evtListner[this.evtListner.length] = touchstart_event;		
				}				
				//
																		
				this.restoreProps.Sprites = BigBlock.Sprites; // make a copy of the Sprite array

				for (var key in BigBlock.GridStatic.styles) { // copy of the GridStatic styles
					if (BigBlock.GridStatic.styles.hasOwnProperty(key)) {
						this.restoreProps.GridStaticStyles[key] = BigBlock.GridStatic.styles[key];
					}
				}

				for (var key in BigBlock.GridActive.styles) { // copy of the GridActive styles
					if (BigBlock.GridActive.styles.hasOwnProperty(key)) {
						this.restoreProps.GridActiveStyles[key] = BigBlock.GridActive.styles[key];
					}
				}
				
				for (var key in BigBlock.GridText.styles) { // copy of the GridText styles
					if (BigBlock.GridText.styles.hasOwnProperty(key)) {
						this.restoreProps.GridTextStyles[key] = BigBlock.GridText.styles[key];
					}
				}				

				BigBlock.RenderMgr.clearScene(); // clear the scene
				BigBlock.GridStatic.setStyle('backgroundColor', '#fff'); // set GridStatic backgroundColor = white
				BigBlock.inputBlock = true; // block user input
				BigBlock.TapTimeout.stop(); // stop tap timeout
				
				// graphics

				if (typeof(BigBlock.CharPresets.getChar) != 'function') { // if not already installed
					BigBlock.CharPresets = BigBlock.CharPresets.install(); // needed for timeout chars
				}
									
				this.panel_info_grahics = null;
				this.panel_info_grahics = BigBlock.PanelInfoGraphics.install();
			
				BigBlock.SpriteAdvanced.create({
					alias : 'logo',
					x : (BigBlock.Grid.width - 168)/2,
					y : (BigBlock.Grid.height - 296)/2,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pPhnBg')
				});
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtLogo',
					x : 24,
					y : 120,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: false,								
					anim : this.panel_info_grahics.getImg('pTxtLogo')
				});				
				
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text1()
				}, 2000); // pause for info screen	
								
			},
			infoScreen_text1 : function () {
				
				if (typeof(BigBlock.Sprites[BigBlock.getObjIdByAlias('pTxtLogo')]) != 'undefined') {
					BigBlock.Sprites[BigBlock.getObjIdByAlias('pTxtLogo')].die();
				}
				
				//
				
				if (this.type == 'inline') {				
					BigBlock.WordSimple.create({
						word_id: 'btn_link1',
						x: 256,
						y : 88,
						value: " play ",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});
					BigBlock.WordSimple.create({
						word_id: 'btn_link2',
						x: 304,
						y : 88,
						value: "arrow_right",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});					
					BigBlock.WordSimple.create({
						word_id: 'btn_link3',
						x: 256,
						y : 96,
						value: " again ",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});					
				} else {
					BigBlock.WordSimple.create({
						word_id: 'btn_link',
						x: 256,
						y : 88,
						value: " close ",
						className: "white",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#333"
					});					
				}
						
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text2()
				}, 500); // pause for info screen												
												
			},
			infoScreen_text2 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel1',
					x : 160,
					y : 128,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel1')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln1',
					x : 176,
					y : 144,
					value : "view this app",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln2',
					x : 176,
					y : 160,
					value : "on your phone",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});				
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text3()
				}, 1000); // pause for info screen												
												
			},
			infoScreen_text3 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel2',
					x : 16,
					y : 208,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel2')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln3',
					x : 32,
					y : 224,
					value : "visit",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln4',
					x : 80,
					y : 224,
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});				
				
				BigBlock.WordSimple.create({
					word_id : 'ln5',
					x : 96,
					y : 224,
					value : "ittybitty8bit.com",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_ittybitty8bit,
					link_color : '#000'
				});			
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text4()
				}, 1000); // pause for info screen												
												
			},
			infoScreen_text4 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel3',
					x : 104,
					y : 280,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel3')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln6',
					x : 120,
					y : 312,
					value : "ittybitty8bit creates",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	
				
				BigBlock.WordSimple.create({
					word_id : 'ln7',
					x : 120,
					y : 328,
					value : "interactive pixel art",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln8',
					x : 120,
					y : 344,
					value : "for mobile devices.",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});										
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text5()
				}, 1000); // pause for info screen											
												
			},
			infoScreen_text5 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel4',
					x : 16,
					y : 352,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel4')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln10',
					x : 32,
					y : 384,
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	

				BigBlock.WordSimple.create({
					word_id : 'ln11',
					x : 48,
					y : 384,
					value : "facebook",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_Facebook,
					link_color : '#000'
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln12',
					x : 120,
					y : 384,
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	

				BigBlock.WordSimple.create({
					word_id : 'ln13',
					x : 136,
					y : 384,
					value : "twitter",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_Twitter,
					link_color : '#000'
				});														
																					
												
			},
			removeAndRestore : function (event) {
				
				if (event.preventDefault) {
					event.preventDefault();
				} else {
					event.returnValue = false;
				}
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
				
				this.panel_info_grahics = null; // remove info panel graphics
										
				clearTimeout(this.panel_timeout);
				
				var quads = BigBlock.GridActive.quads; // remove event listeners
				for (var i = 0; i < quads.length; i++) {
					var q = document.getElementById(quads[i].id);
					if (q.removeEventListener) { // mozilla
						q.removeEventListener('mouseup', this.evtListner[i], false);
					} else if (q.attachEvent) { // IE
						q.detachEvent('onmouseup', this.evtListner[i])
					}					
					
				}
				
				if (this.type == 'inline') {
					BigBlock.scene_current = 0;
					BigBlock.createScene(BigBlock.scene_current);
					BigBlock.current_frame = 0;					
				} else {
					
				BigBlock.RenderMgr.clearScene(); // clear the scene
				
					for (var key in this.restoreProps.GridStaticStyles) { // restore styles
						if (this.restoreProps.GridStaticStyles.hasOwnProperty(key)) {
							BigBlock.GridStatic.setStyle(key, this.restoreProps.GridStaticStyles[key]); 
						}
					}
					
					for (var key in this.restoreProps.GridActiveStyles) {
						if (this.restoreProps.GridActiveStyles.hasOwnProperty(key)) {
							BigBlock.GridActive.setStyle(key, this.restoreProps.GridActiveStyles[key]); 
						}
					}
					
					for (var key in this.restoreProps.GridTextStyles) {
						if (this.restoreProps.GridTextStyles.hasOwnProperty(key)) {
							BigBlock.GridText.setStyle(key, this.restoreProps.GridTextStyles[key]); 
						}
					}				
					
					BigBlock.Sprites = this.restoreProps.Sprites; // restore the Sprite array
					
	
					for (var key in this.restoreProps.StaticDivs) { // replace all Static Divs
						if (this.restoreProps.StaticDivs.hasOwnProperty(key)) {
							var q = document.getElementById(key);						
							for (var d in this.restoreProps.StaticDivs[key]) {
								q.appendChild(this.restoreProps.StaticDivs[key][d]);
							}
						}		
					}
					
					for (key in this.restoreProps.TextDivs) { // replace all Text Divs
						if (this.restoreProps.TextDivs.hasOwnProperty(key)) {
							q = document.getElementById(key);						
							for (d in this.restoreProps.TextDivs[key]) {
								q.appendChild(this.restoreProps.TextDivs[key][d]);
							}
						}		
					}
				
				}							
							
				BigBlock.inputBlock = false; // release input block
				BigBlock.TapTimeout.start(); // start tap timeout
								
				delete BigBlock.PanelInfoInst; // delete instance		
				
				if (typeof(this.after) == 'function') {
					this.after();
				}					
				
			}				
		};
	}

	return {
		add: function(type, before, after) {
			if (typeof(BigBlock.PanelInfoInst) == 'undefined') { // Instantiate only if the instance doesn't exist.
				BigBlock.PanelInfoInst = cnstr(type, before, after);
				BigBlock.PanelInfoInst.logoScreen();				
			}
			
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

	var getTransform = function (vel, angle, x, y, gravity, clock, life, className, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {
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

			BigBlock.Sprites[BigBlock.Sprites.length] = particle;
			
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
		
		renderTime : [],				 				 
		renderPix : function (start) {
						
			/*
			 * CLEAN UP
			 * Resets the class of all divs in GridActive div
			 */
			
			var quads = BigBlock.GridActive.quads;
			
			for (var i = 0; i < quads.length; i++) {
				
				var q = document.getElementById(quads[i].id);
				
				if (q.hasChildNodes()) {
					
					var nodes = q.childNodes; // get a DOM collection of all children in quad;
					var tmp = [];
					
					/* DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 * After testing saw a 6.6% performance increase w iPhone 4; 7.1% w iPhone 3GS; 5.7% w iPad 3.2
					 */
					for(var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}
					
					for (x = 0; x < tmp.length; x++) { // reset classes in all children
						tmp[x].setAttribute('class', 'pix color');
						if (!document.addEventListener) { // test for IE
							tmp[x].setAttribute('className', 'pix color'); // IE6
						}
						tmp[x].onmouseup = null; // remove events
						tmp[x].ontouchstart = null;
					}			
					
					tmp = null;
				}				
				
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
				
				
				if (BigBlock.Sprites[i].render !== 0 && BigBlock.Sprites[i].state != 'dead' && typeof(BigBlock.Sprites[i].img) != 'undefined' && typeof(BigBlock.Sprites[i].img.pix) != 'undefined') {
										
					for (y = 0; y < BigBlock.Sprites[i].img.pix.length; y++) { // loop thru blocks attached to this Sprite
							
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
											
											for (var k = 0; k < char_pos.length; k++) {
												var char_div = document.createElement("div");
												
												var gl_limit = BigBlock.Grid.pix_dim * 4;													
												
												if (char_pos[k].p < gl_limit && BigBlock.Sprites[i].glass === true) {
													char_div.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color + '_glass0');													
													if (typeof document.addEventListener != 'function') { // test for IE
														char_div.setAttribute('className', 'char char_pos' + char_pos[k].p + ' color' + color + '_glass0'); // IE6
														char_div.innerHTML = '.'; // IE6
													}														
												} else {
													char_div.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color);													
													if (typeof document.addEventListener != 'function') { // test for IE
														char_div.setAttribute('className', 'char char_pos' + char_pos[k].p + ' color' + color); // IE6
														char_div.innerHTML = '.'; // IE6
													}														
												}

												
												child.appendChild(char_div); // add the character div to the Sprite's div							
											}
											child.setAttribute('name', BigBlock.Sprites[i].word_id);
											child.setAttribute('id', BigBlock.getUniqueId());
											
											if (BigBlock.Sprites[i].url !== false) { // if a url is attached to the char, add an event listener
												child.style['backgroundColor'] = BigBlock.Sprites[i].link_color;
											}
											
											document.getElementById(BigBlock.RenderMgr.getQuad('text', pix_x, pix_y)).appendChild(child); // add character to dom
																	
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
											child.setAttribute('name', BigBlock.Sprites[i].alias);	
											
											
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
									
					BigBlock.Sprites[i].render--; // decrement the render counter
				}
				if (BigBlock.Sprites[i].render_static && typeof(BigBlock.Sprites[i].img) != 'undefined') { // if this is a static object and the object has its img property
					BigBlock.Sprites[i].render_static = false; // MUST set the static property = 0; static sprites will not be deleted
					BigBlock.Sprites[i].die(); // kill the sprite
				}				
			}
			
			if (BigBlock.Timer.report_fr === true) {
				var end = new Date().getTime(); // mark the end of the run
				var time = end - start; // calculate how long the run took in milliseconds
				var testInterval = BigBlock.Timer.fr_rate_test_interval;
				var total = 0;
				
				this.renderTime[this.renderTime.length] = time;
				if (BigBlock.Timer.clock%testInterval == 0) {
					for (var t = 0; t < testInterval; t++) {
						total += this.renderTime[t];
						
					}
					BigBlock.Log.display(total/testInterval);
					this.renderTime = [];
				}
			}
					
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
		clearScene: function(before, after) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof(before) != 'undefined' && before != null) {
						if (typeof(before) != 'function') {
							throw new Error('Err: RMCS001');
						} else {
							before();
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
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridStatic.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridText) != 'undefined') {
					quads = BigBlock.GridText.quads;
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
				
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridText.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridActive) != 'undefined') {
					quads = BigBlock.GridActive.quads;
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridActive.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.Sprites) != 'undefined') {
					BigBlock.Sprites = [];
				}
				
				try {	
					if (typeof(after) != 'undefined' && after != null) {
						if (typeof(after) != 'function') {
							throw new Error('Err: RMCS002');
						} else {
							after();
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
			
			this.evtListener = [];
			
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
 
 							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}
							
							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
										
							BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
							BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
							
							//
							
							// remove listeners from quads
							for (var i = 0; i < BigBlock.GridActive.quads.length; i++) {
								var q = document.getElementById(BigBlock.GridActive.quads[i].id);					 		
								if (q.removeEventListener) { // mozilla
									q.removeEventListener('touchstart', BigBlock.ScreenEvent.touch_event, false);
								} // IE does not have an equivalent event; 07-22-2010						
							}

								
								
							if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {

								if (typeof(BigBlock.GridActive) != 'undefined') {
									var evt_x = event.clientX - BigBlock.GridActive.x;
									var evt_y = event.clientY - BigBlock.GridActive.y;
								}
								
								var ia_check = false;
								for (var i = 0; i < BigBlock.Sprites.length; i++) { // check to fire any active sprite events 
									if (BigBlock.Sprites[i].input_action !== false && typeof(BigBlock.Sprites[i].input_action) == 'function') {
										var x = BigBlock.Sprites[i].x;
										var y = BigBlock.Sprites[i].y;
										var dm = BigBlock.Grid.pix_dim;
										if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
											BigBlock.Sprites[i].input_action(event);
											ia_check = true;
										}
									}
								}
								
								if (typeof(BigBlock.TapTimeout) != 'undefined') {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
																
								if (ia_check === true) { // if triggering an input_action on an active sprite, do not advance the frame
									return false;
								}
																					
								BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
								
								if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
									BigBlock.InputFeedback.display(event.clientX, event.clientY);
								}
															
								BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
								
							}
							
						};
						
					}
										
					
					// MOUSEMOVE
		
					if (typeof(params.mousemove) != 'undefined') {
						this.mousemove_event = params.mousemove;
					} else {
						this.mousemove_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
														
							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}
							
						};
						
					}
					
					
					// MOUSEDOWN
		
					if (typeof(params.mousedown) != 'undefined') {
						this.mousedown_event = params.mousedown;
					} else {
						this.mousedown_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}
							
						};
						
					}
								
					
					// TOUCH START
		
					if (typeof(params.touchstart) != 'undefined') {
						this.touchstart_event = params.touchstart;
					} else {
						this.touchstart_event = function(event){

							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}
							
							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
									
							BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
							BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
							
							//
																			
							this.touch = event.touches[0];
							
							// remove listeners from quads
							for (var i = 0; i < BigBlock.GridActive.quads.length; i++) {
								var q = document.getElementById(BigBlock.GridActive.quads[i].id);
								q.removeEventListener('click', BigBlock.ScreenEvent.click_event, false);
								q.removeEventListener('mouseup', BigBlock.ScreenEvent.mouseup_event, false);
							}
							
							if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {

								if (typeof(BigBlock.GridActive) != 'undefined') {
									var evt_x = this.touch.clientX - BigBlock.GridActive.x;
									var evt_y = this.touch.clientY - BigBlock.GridActive.y;
								}
								
								var ia_check = false;
								for (var i = 0; i < BigBlock.Sprites.length; i++) { // check to fire any active sprite events 
									if (BigBlock.Sprites[i].input_action !== false && typeof(BigBlock.Sprites[i].input_action) == 'function') {
										var x = BigBlock.Sprites[i].x;
										var y = BigBlock.Sprites[i].y;
										var dm = BigBlock.Grid.pix_dim;
										if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
											BigBlock.Sprites[i].input_action(event);
										}
									}
								}								

								if (typeof(BigBlock.TapTimeout) != 'undefined') {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
								
								if (ia_check === true) { // if triggering an input_action on an active sprite, do not advance the frame
									return false;
								}
																							
								BigBlock.ScreenEvent.frameAdvance(event, this.touch.clientX, this.touch.clientY);
								
								if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
									BigBlock.InputFeedback.display(this.touch.clientX, this.touch.clientY);
								}
																
								BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
								
							}
							
						};
					
					}
					

					
					// TOUCH MOVE
		
					if (typeof(params.touchmove) != 'undefined') {
						this.touchmove_event = params.touchmove;
					} else {
						this.touchmove_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}

						};
						
					}
					

										
					// TOUCH END
		
					if (typeof(params.touchend) != 'undefined') {
						this.touchend_event = params.touchend;
					} else {
						this.touchend_event = function(event){

							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
											
							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}				
							
						};
						
					}
					

					// CLICK - for Wii ONLY
					
					if (typeof(params.click) != 'undefined') {
						this.click_event = params.click;
					} else {
						
						this.click_event = function(event) {
 
 							if (event.preventDefault) {
								event.preventDefault();
							} else {
								event.returnValue = false;
							}
							if (event.stopPropagation) {
								event.stopPropagation();
							} else {
								event.cancelBubble = true;
							}
							
							if (BigBlock.inputBlock === true) { // check to block user input
								return false;
							}
							
							if (typeof(opera) != 'undefined' && typeof(opera.wiiremote) != 'undefined') { // detect wii
										
								BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
								BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
								
								// remove listeners from quads
								for (var i = 0; i < BigBlock.GridActive.quads.length; i++) {
									var q = document.getElementById(BigBlock.GridActive.quads[i].id);
									q.removeEventListener('touchstart', BigBlock.ScreenEvent.touch_event, false);
								}	
									
								if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer) {
									
									if (typeof(BigBlock.GridActive) != 'undefined') {
										var evt_x = event.clientX - BigBlock.GridActive.x;
										var evt_y = event.clientY - BigBlock.GridActive.y;
									}
									
									var ia_check = false;
									for (var i = 0; i < BigBlock.Sprites.length; i++) { // check to fire any active sprite events 
										if (BigBlock.Sprites[i].input_action !== false && typeof(BigBlock.Sprites[i].input_action) == 'function') {
											var x = BigBlock.Sprites[i].x;
											var y = BigBlock.Sprites[i].y;
											var dm = BigBlock.Grid.pix_dim;
											if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
												BigBlock.Sprites[i].input_action(event);
												ia_check = true;
											}
										}
									}
									
									if (typeof(BigBlock.TapTimeout) != 'undefined') {
										BigBlock.TapTimeout.stop();
										BigBlock.TapTimeout.start();
									}
																	
									if (ia_check === true) { // if triggering an input_action on an active sprite, do not advance the frame
										return false;
									}
																						
									BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
									
									if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
										BigBlock.InputFeedback.display(event.clientX, event.clientY);
									}
																
									BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
									
								}
							
							}
							
						};
						
					}
					
					
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
 * IMPORTANT: Advanced Sprites should not carry input_actions; if they do, only the top left block of the sprite will trigger the action.
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
			this.input_action = false; // called by the mouseup and touchstart methods of ScreenEvent; use for links on Words or to trigger actions on Simple Sprites; do not use on Advanced Sprites	
			
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
 * IMPORTANT: Advanced Sprites should not carry input_actions; if they do, only the top left block of the sprite will trigger the action.
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
			for (i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
				if (palette.classes[i].name == sprite.className) {
					sprite.color_max = palette.classes[i].val.length-1;
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
							if (typeof(a) != 'undefined' && typeof(a.frm.enterFrame) == 'function') {
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

			BigBlock.Sprites[BigBlock.Sprites.length] = sprite;
			
		}
	};

})();


/**
 * Simple Sprite object
 * A single pixel object w no animation.
 * 
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
			for (i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
				if (palette.classes[i].name == sprite.className) {
					sprite.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			sprite.color_index = sprite.className + '0'; // overwrite color_index w passed className
			
			sprite.anim = sprite.getAnim(sprite.color_index); // get new anim w overwritten color_index
			
			BigBlock.Sprites[BigBlock.Sprites.length] = sprite;
			
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
		
		timeout_length : 1000,
		timeout_obj : false,
		arrow_direction : 'up',
		x : BigBlock.Grid.width/2 - (BigBlock.Grid.pix_dim),
		y : BigBlock.Grid.height - (BigBlock.Grid.pix_dim * 2),
		className : 'grey',
		font : 'bigblock_bold',
		glass : false,
		
		start: function (params) {
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
			
			this.timeout_obj = setTimeout(function () {
					BigBlock.TapTimeout.display();
				}, this.timeout_length);
			
		},
		
		display : function () {
			
			BigBlock.WordSimple.create({
				word_id : 'tap_timeout_word_tap',
				x : this.x,
				y : this.y,
				value : "tap",
				className : this.className,
				font : this.font,
				glass : this.glass
			});
			
			switch (this.arrow_direction) {

				case 'left':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x - (BigBlock.Grid.pix_dim * 1),
						y : this.y,
						value : "arrow_left",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;
				
				case 'right':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + (BigBlock.Grid.pix_dim * 2),
						y : this.y,
						value : "arrow_right",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;

				case 'down':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x,
						y : this.y + (BigBlock.Grid.pix_dim * 2),
						value : "arrow_down",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;
																
				default:
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + BigBlock.Grid.pix_dim,
						y : this.y - (BigBlock.Grid.pix_dim * 1),
						value : "arrow_up",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;	
				

			}
		},

		stop : function () {
			
			clearTimeout(this.timeout_obj);
						
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')]) != 'undefined') {
				if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')].remove) != 'undefined') {
					BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')].remove();
				}
			}
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')]) != 'undefined') {
				if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')].remove) != 'undefined') {
					BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')].remove();
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
		report_fr : false,
		fr_rate_msg : 'console',
		fr_rate_test_interval : 100,
		run_interval : '',		
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
			var b = document.getElementsByTagName('body').item(0);
			for (var key in this.document_body_style) { // loop thru styles and apply to <body>
				if (this.document_body_style.hasOwnProperty(key)) {				
					b.style[key] = this.document_body_style[key];
				}
			}

			// CORE STYLES
			
			var el = document.createElement('style'); // add core style sheet
			el.setAttribute('type', 'text/css');

			var h = document.getElementsByTagName('head').item(0);
			h.appendChild(el);
				
			var s = document.styleSheets[document.styleSheets.length - 1];

			if (s.insertRule) { // Mozilla
				s.insertRule(BigBlock.CSSid_core+"{}", 0);			
			} else if (s.addRule) { // IE
				s.addRule(BigBlock.CSSid_core, "display : block;");
			}
									
			var css = {
				'body' : 'margin: 0;padding: 0;background-color:#ccc;',
				'div.color' : 'background-color : transparent;',
				'div.pix' : 'float:left;width:' + BigBlock.Grid.pix_dim + 'px;height:' + BigBlock.Grid.pix_dim + 'px;position:absolute;line-height:0px;font-size:1%;'
			};
			
			try {
				if (s.insertRule) { // Mozilla
					for (var i in css) {
						if (css.hasOwnProperty(i)) {
							s.insertRule(i + " {" + css[i] + "}", 0);
						}
					}
				} else if (s.addRule) { // IE
					for (var i in css) {
						if (css.hasOwnProperty(i)) {
							s.addRule(i, css[i], 0);
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
						{'id' : 'qI_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : -100}, 
						{'id' : 'qI_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : -100}, 
						{'id' : 'qI_br', 'left' : 0, 'top' : 0, 'zIndex' : -100}
					]
			});
												
			// Create GridActive
				
			BigBlock.GridActive = BigBlock.clone(BigBlock.Grid); // CLONE Grid
			/*
			 * IE Divs will not detect mouse up if there's no background color or image.
			 * However, image reference does NOT need to be valid. IE just needs to think there's an image.
			 * 
			 */
			var qA_styles;
			if (document.attachEvent) { // IE
				qA_styles = {
					backgroundImage : "url('trans.gif')" // this do not need to be a valid reference
				}
			} else {
				qA_styles = this.grid_active_styles;
			}
					
			BigBlock.GridActive.configure({
					'quads': [
						{'id' : 'qA_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : 10}, 
						{'id' : 'qA_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : 10}, 
						{'id' : 'qA_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : 10}, 
						{'id' : 'qA_br', 'left' : 0, 'top' : 0, 'zIndex' : 10}
					],
					'styles' : qA_styles
			});

			// Create GridStatic
			
			BigBlock.GridStatic = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridStatic.configure({
					'quads': [
						{'id' : 'qS_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : -10}, 
						{'id' : 'qS_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : -10}, 
						{'id' : 'qS_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : -10}, 
						{'id' : 'qS_br', 'left' : 0, 'top' : 0, 'zIndex' : -10}
					],
					'styles' : this.grid_static_styles		
			});

			
			
			// Create GridText
			
			BigBlock.GridText = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridText.configure({
					'quads': [
						{'id' : 'qT_tl', 'left' : BigBlock.Grid.width/2, 'top' : BigBlock.Grid.height/2, 'zIndex' : 1}, 
						{'id' : 'qT_tr', 'left' : 0, 'top' : BigBlock.Grid.height/2, 'zIndex' : 1}, 
						{'id' : 'qT_bl', 'left' : BigBlock.Grid.width/2, 'top' : 0, 'zIndex' : 1}, 
						{'id' : 'qT_br', 'left' : 0, 'top' : 0, 'zIndex' : 1}
					],
					'styles' : this.grid_text_styles					
			});
												
			// Input Feedback
			
			if (this.input_feedback === true) {
				if (this.input_feedback_grad !== false) {
					BigBlock.input_feedback = this.input_feedback_grad;
				} else {
					BigBlock.input_feedback = "rgb(255, 255, 255);rgb(239, 239, 239);rgb(216, 216, 216);rgb(189, 189, 189);rgb(159, 159, 159);rgb(127, 127, 127);rgb(96, 96, 96);rgb(66, 66, 66);rgb(39, 39, 39);rgb(16, 16, 16)";					
				}
				BigBlock.my_palette = {
					'classes': [{
						name: 'input_feedback',
						val: BigBlock.input_feedback.split(";")
					}]
				};
				
				BigBlock.Color.add(BigBlock.my_palette);
				delete BigBlock.my_palette;
				
				BigBlock.InputFeedback.configure({
					className: 'input_feedback'
				});
				
			}
			
			//
			
			this.add_char_loader();
						
		},

		add_char_loader : function () {

			BigBlock.Loader.add(); // add loader to DOM
			
			BigBlock.Loader.update();

			var el = document.createElement('style'); // add color style sheet
			el.setAttribute('type', 'text/css');
			
			var h = document.getElementsByTagName('head').item(0);
			h.appendChild(el); 

			var s = document.styleSheets[document.styleSheets.length - 1];

			if (s.insertRule) { // Mozilla
				s.insertRule(BigBlock.CSSid_char_pos+"{}", 0);			
			} else if (s.addRule) { // IE
				s.addRule(BigBlock.CSSid_char_pos, "display : block;");
			}
						
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

			var el = document.createElement('style'); // add color style sheet
			el.setAttribute('type', 'text/css');
			
			var h = document.getElementsByTagName('head').item(0);
			h.appendChild(el); 

			var s = document.styleSheets[document.styleSheets.length - 1];

			if (s.insertRule) { // Mozilla
				s.insertRule(BigBlock.CSSid_color+"{}", 0);			
			} else if (s.addRule) { // IE
				s.addRule(BigBlock.CSSid_color, "display : block;");
			}
						
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

			var el = document.createElement('style'); // add a style sheet node to the head element to hold grid styles
			el.setAttribute('type', 'text/css');
			
			var h = document.getElementsByTagName('head').item(0);
			h.appendChild(el);			

			var s = document.styleSheets[document.styleSheets.length - 1];

			if (s.insertRule) { // Mozilla
				s.insertRule(BigBlock.CSSid_grid_pos+"{}", 0);			
			} else if (s.addRule) { // IE
				s.addRule(BigBlock.CSSid_grid_pos, "display : block;");
			}
			
			BigBlock.Timer.build_grid();
									
					
		},
		build_grid : function(){
			
			if (BigBlock.GridActive.build()) {
				
				var b = document.getElementsByTagName('body').item(0);
				while (document.getElementById('loader')) {
					var l = document.getElementById('loader');
					b.removeChild(l);
				}
				
				BigBlock.GridInit.add(); // add grid to DOM								
				BigBlock.GridActive.add(); // add grid to DOM
				BigBlock.GridStatic.add(); // add grid_static to DOM
				BigBlock.GridText.add(); // add grid_static to DOM
				for (var i = 0; i < BigBlock.Sprites.length; i++) { // loop thru Sprites and set state = start
					BigBlock.Sprites[i].state = 'start';					
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
				
				// Screen Event
				
				if (typeof(BigBlock.ScreenEvent.alias) == 'undefined') {
					BigBlock.ScreenEvent.create({});
				}
				
				// add all screen events to GridActive
					
				for (var i = 0; i < BigBlock.GridActive.quads.length; i++) {
					var q = document.getElementById(BigBlock.GridActive.quads[i].id);
					
					BigBlock.ScreenEvent.evtListener[i] = {}; // collect all events here then loop thru to add
					
					BigBlock.ScreenEvent.evtListener[i].click = BigBlock.ScreenEvent.click_event; // for wii
					
					//
					
					BigBlock.ScreenEvent.evtListener[i].mouseup = BigBlock.ScreenEvent.mouseup_event;
					BigBlock.ScreenEvent.evtListener[i].mousemove = BigBlock.ScreenEvent.mousemove_event;
					BigBlock.ScreenEvent.evtListener[i].mousedown = BigBlock.ScreenEvent.mousedown_event;
					
					//
					
					BigBlock.ScreenEvent.evtListener[i].touchstart = BigBlock.ScreenEvent.touchstart_event;
					BigBlock.ScreenEvent.evtListener[i].touchmove = BigBlock.ScreenEvent.touchmove_event;
					BigBlock.ScreenEvent.evtListener[i].touchend = BigBlock.ScreenEvent.touchend_event;
					
					//
					
					for (var e in BigBlock.ScreenEvent.evtListener[i]) {
						if (BigBlock.ScreenEvent.evtListener[i].hasOwnProperty(e)) {	
							if (q.addEventListener) { // mozilla
								q.addEventListener(e, BigBlock.ScreenEvent.evtListener[i][e], false); // add mouseup event listener
							} else if (q.attachEvent) { // IE
								q.attachEvent('on'+e, BigBlock.ScreenEvent.evtListener[i][e])
							}
						}					
					}
														
				}
			
				// before_play function

				if (BigBlock.Timer.before_play !== false) {
					if (typeof(BigBlock.Timer.before_play) == 'function') {
						BigBlock.Timer.before_play();
					}
				}
				
				// reveals and positions ittybitty8bit info panel link; override w PHP in the host page

				if (typeof(PanelInfoTrigger) != 'undefined') {
					if (PanelInfoTrigger.set) {
						PanelInfoTrigger.set();
					}
				}
				
				// reveals and positions Facebook 'Like' button; override w PHP in the host page
				
				if (typeof(BtnLike) != 'undefined') {
					if (BtnLike.fb_like) {
						setTimeout(function () {
							BtnLike.fb_like();
						}, 500);
					}
				}
												
				BigBlock.Timer.run_interval = setInterval(function () {
					BigBlock.Timer.run();
				},BigBlock.Timer.frame_rate);
				
			} else {
				var t = setTimeout(BigBlock.Timer.build_grid, 1); // if not finishing building the grid, call again
			}
		
		},
		run : function () {
			
			BigBlock.Timer.start = new Date().getTime(); // mark the beginning of the run
			
			var run = [];
			
			for (var i=0;i<BigBlock.Sprites.length;i++) {
				if (typeof(BigBlock.Sprites[i]) == "object" && typeof(BigBlock.Sprites[i].run) == "function" && this.pause == -1) { // check pause value
					BigBlock.Sprites[i].run();
				}
			}
			
			BigBlock.Timer.cleanUpSprites();

			this.clock++;
			BigBlock.RenderMgr.renderPix(BigBlock.Timer.start);
			
			
		},
		cleanUpSprites : function () {
			
			/* seems wrong; but looping thru sprites_to_kill array and setting state = dead
			 * and then looping the Sprites and removing Sprites with state = dead is faster
			 * than setting state = dead from killObject() and not using a sprites_to_kill array.
			 */
			
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
		pause: -1, // pause value; 1 = paused; -1 = not paused
		pauseToggle: function () {
			this.pause *= -1;
		},
		/**
		 * killObject is called by an object's die() function when it should be removed from the Sprites array.
		 * 
		 * @param {Object} obj
		 */
		killObject : function (obj) {			
			if (typeof(obj) != 'undefined' && typeof(BigBlock.Sprites[obj.index]) == "object") {
				//BigBlock.Sprites[obj.index].state = 'dead';
				this.sprites_to_kill[this.sprites_to_kill.length] = obj.index; // copy object to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
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
			this.url = false;
			this.link_color = false;
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
			
			for (var i = 0; i < quads.length; i++) {

				var q = document.getElementById(quads[i].id);
				
				if (q.hasChildNodes()) {
					
					var nodes = q.childNodes; // get a collection of all children in BigBlock.GridText.id;

					var tmp = [];
					
					// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 
					for(var x = 0; x < nodes.length; x++) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}

					for (var j = 0; j < tmp.length; j++) { // loop thru children
						var id = tmp[j].getAttribute('name');
						if (id == word_id) {
							q.removeChild(tmp[j]);
						}
					}
					
				}
							
			}
			
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			
			// remove the word
			this.render_static = false;
			BigBlock.Timer.killObject(this);
			
			// remove the click target divs
			// these are Sprites in the GridActive
			for (i = 0; i < BigBlock.Sprites.length; i++) {
				if (BigBlock.Sprites[i].word_id == word_id) {
					BigBlock.Timer.killObject(BigBlock.Sprites[i]);
				}
 			}
						
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
			for (var i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
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

			/* IMPORTANT: 
			 * Need to keep word in Sprites array so we have a reference to its characters when we need to remove them.
			 */
			BigBlock.Sprites[BigBlock.Sprites.length] = obj;
			
			try {
				if (typeof(BigBlock.CharPresets.getChar) == 'undefined') {
					throw new Error('Err: WSC001');
				} else {
										
					if (BigBlock.CharPresets.getChar(obj.value)) { // if the value of this word matches a preset in the character library, use a predefined character like 'arrow_up'
		
						BigBlock.CharSimple.create({
							word_id : obj.word_id, // pass the word id to the characters
							value: obj.value,
							x : obj.x,
							y : obj.y,
							className : obj.className,
							url : obj.url,
							link_color : obj.link_color,
							font : obj.font,
							glass : obj.glass
						});
						
						if (obj.url !== false) {
							BigBlock.SpriteSimple.create({
								x : obj.x + (i * BigBlock.Grid.pix_dim),
								y : obj.y,
								className : false,
								input_action : function (event) {
									if (typeof(obj.url) == 'function') {
										obj.url(event);
									} else if (typeof(obj.url) == 'string') {
										window.open(obj.url, '');
									}										
								}
							});
						}						
										
					} else {
						
						var s = new String(obj.value); // convert Literal (obj.value) into Object; faster than iterating over the Literal
						
						for (i=0;i<s.length;i++) { // use a standard for loop to iterate over a string; Opera does not like using for..in
							BigBlock.CharSimple.create({
								word_id : obj.word_id, // pass the word id to the characters
								value: s.substr(i,1),
								x : obj.x + (i * BigBlock.Grid.pix_dim),
								y : obj.y,
								className : obj.className,
								url : obj.url,
								link_color : obj.link_color,
								font : obj.font,
								glass : obj.glass
							});
							
							if (obj.url !== false) {
								BigBlock.SpriteSimple.create({
									word_id : obj.word_id,
									x : obj.x + (i * BigBlock.Grid.pix_dim),
									y : obj.y,
									className : false,
									input_action : function (event) {
										if (typeof(obj.url) == 'function') {
											obj.url(event);
										} else if (typeof(obj.url) == 'string') {
											window.open(obj.url, '');
										}									
									}
								});
							}										
						}										
					}
						
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
					

			
		}
	};
	
})();