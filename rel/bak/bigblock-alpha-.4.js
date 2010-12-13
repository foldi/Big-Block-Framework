var BigBlock = {};
BigBlock.Sprites = [];

// initial props

BigBlock.curentFrame = 1;
BigBlock.clickBlock = 0; // set = 1 to block user input

/**
 * Char
 * A generic object that carries core text charcter properties. All text characters appearing in a scene should inherit from the Char object.
 * Chars make Words.
 * 
 * @author Vince Allen 05-10-2010
 */

BigBlock.Char = (function () {
						
	return {
		configure: function(){
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
			
			this.afterDie = null;					
			
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
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
					
			this.img = this.getPix(this.anim, this.color_index); // get pixels
			
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
 * Simple Char object
 * A single character object w no animation.
 * 
 * @author Vince Allen 05-10-2010
 */
BigBlock.CharSimple = (function () {
	
	return {
		
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

BigBlock.Color = (function () {
	
	var palette = {'classes' : [ // default colors
		{name : 'white',val: ['rgb(255,255,255)']},	
		{name : 'black',val: ['rgb(0,0,0)']},
		{name : 'grey',val: ['rgb(90,90,90)']},
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
			
			for (var i in p.classes[this.current_class].val) {
				if (p.classes[this.current_class].val.hasOwnProperty(i)) {
					document.styleSheets[document.styleSheets.length - 1].insertRule("div.color" + p.classes[this.current_class].name + i + " {background-color:" + p.classes[this.current_class].val[i] + ";}", 0);
				}
			}
			
			this.current_class++;
			
			BigBlock.Loader.update({
				'total' : Math.round((document.styleSheets[document.styleSheets.length-1].cssRules.length / (getTotalColors())) * 100)
			});						
			
			if (document.styleSheets[document.styleSheets.length - 1].cssRules.length < getTotalColors()) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		add : function (params) {
			try {
				if (typeof(params) == 'undefined') {
					throw new Error(console.log('Color.add: params are required'));
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
		if (p_init_pos_spread_x != 0) {
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
 * Grid object
 * Defines the grid of divs rendered in the body of the document.
 * iphone viewport dimensions = 320 x 356
 * 
 * @author Vince Allen 12-05-2009
 */
BigBlock.Grid = (function () {
	
	return {
		
		alias : "Grid",
		id : 'pix_grid',
		class_name : 'pix_grid_container',
		style : {
			left : 'center',
			top : 'center',
			position : 'absolute',
			backgroundColor: 'transparent',
			backgroundImage : "",
			width : '320px',
			height : '356px',
			borderTopWidth : '0px',
			borderRightWidth : '0px',
			borderBottomWidth : '0px',
			borderLeftWidth : '0px',
			borderColor : '#333',
			borderStyle : 'solid',
			paddingLeft : '0px',
			paddingTop : '0px',
			paddingRight : '0px',
			paddingBottom : '0px',
			marginLeft : '0px',
			marginTop : '0px',
			marginRight : '0px',
			marginBottom : '0px'
		},
		body_backgroundColor : '#000',
		width : 320,
		height : 356,
		pix_dim : 8, // the pixel dimensions; width & height; pixels are square
		cols : 320/8, // number of grid columns
		rows : 356/8, // number of grid rows
		build_start_time : new Date().getTime(),
		build_end_time : new Date().getTime(),
		build_offset : 0,
		build_section_count : 0,
		build_section_total : (356/8)/2,
		build_rowNum : 0,
		char_width : 8,
		char_height : 8,
		
		build : function () {
			var colNum = 0;
			for (var i = 0; i < ((this.cols * this.rows) / this.build_section_total); i++) { // insert a css rule for every position in the grid
				if (colNum < this.cols) {
					colNum++;
				} else {
					colNum = 1;
				}
				if (i % this.cols === 0) {
					this.build_rowNum++;
				}
				document.styleSheets[document.styleSheets.length-1].insertRule(".pos" + (i + this.build_offset) + " {left:" + ((colNum - 1) * this.pix_dim) + "px;top:" + ((this.build_rowNum - 1) * this.pix_dim) + "px;}", 0); // setup pos rules
			}
			
			this.build_offset = document.styleSheets[document.styleSheets.length-1].cssRules.length;
			
			BigBlock.Loader.update({
				'total' : Math.round((document.styleSheets[document.styleSheets.length-1].cssRules.length / (this.cols * this.rows)) * 100)
			});
			
			end_time = new Date().getTime();
			
			if (document.styleSheets[document.styleSheets.length - 1].cssRules.length < (this.cols * this.rows)) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		add: function(){
		
			this.build_start_time = new Date().getTime();
			
			document.body.innerHTML = "<div id='" + this.id + "' class='" + this.className + "' style=''></div>"; // insert the Grid container into the body
			for (var key in this.style) { // loop thru styles and apply
				if (this.style.hasOwnProperty(key)) {
					var the_style = this.style[key];
					switch (key) {
						case 'top':
							switch (the_style) {
								case 'top':
									the_style = '0px';
									this.style.top = the_style;
									break;
								case 'center':
									the_style = ((window.innerHeight / 2) - (this.height / 2) - (this.style.borderTopWidth.replace('px', '') / 2) - (this.style.borderBottomWidth.replace('px', '') / 2)) + 'px';
									this.style.top = the_style;
									break;
								case 'bottom':
									the_style = (window.innerHeight - this.height - this.style.borderTopWidth.replace('px', '') - this.style.borderBottomWidth.replace('px', '')) + 'px';
									this.style.top = the_style;
									break;
							}
							break;
						case 'left':
							switch (the_style) {
								case 'left':
									the_style = '0px';
									this.style.left = the_style;
									break;
								case 'center':
									the_style = ((window.innerWidth / 2) - (this.width / 2) - (this.style.borderLeftWidth.replace('px', '') / 2) - (this.style.borderRightWidth.replace('px', '') / 2)) + 'px';
									this.style.left = the_style;
									break;
								case 'right':
									the_style = (window.innerWidth - this.width - this.style.borderLeftWidth.replace('px', '') - this.style.borderRightWidth.replace('px', '')) + 'px';
									this.style.left = the_style;
									break;
							}
							break;
					}
					document.getElementById(this.id).style[key] = the_style;
				}
			}
			
			this.x = this.style.left.replace('px', ''); // need numeric values for x, y
			this.y = this.style.top.replace('px', '');
			
			// CORE STYLES
			
			var core_styles = document.createElement('style'); // add core style sheet
			core_styles.setAttribute('type', 'text/css');
			var head = document.getElementsByTagName('head');
			head[0].appendChild(core_styles);
			
			document.styleSheets[document.styleSheets.length - 1].insertRule("body {margin: 0;padding: 0;background-color: "+this.body_backgroundColor+";}", 0); // setup transparent pix rule
			document.styleSheets[document.styleSheets.length - 1].insertRule("div.color {background-color : transparent;}", 0); // setup transparent pix rule
			document.styleSheets[document.styleSheets.length - 1].insertRule("div.pix {float:left;width:" + this.pix_dim + "px;height:" + this.pix_dim + "px;position:absolute;}", 0);
			
			// CHARCTER STYLES go here
			
			
			for (var j = 0; j < (this.cols / 4) * (this.rows / 4); j++) { // pre-populate container with some divs
				var child = document.createElement("div");
				child.setAttribute('id', j);
				document.getElementById(this.id).appendChild(child); // add the div to the grid	
				document.getElementById(j).setAttribute('class', 'pix color pos' + j);
			}
		},
		setStyles : function (params) {
			if (typeof(params) != 'undefined') {
				if (typeof(params.style) != 'undefined') {
					for (var key in params.style) {
						if (params.style.hasOwnProperty(key)) {
							this.style[key] = params.style[key];
						}
					}
				}
			}
		},
		setAttributes : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		build_char_styles : function () {
			
			// .text_bg			
			document.styleSheets[document.styleSheets.length - 1].insertRule(".text_bg{background-color: transparent;}", 0);
			
			// .char
			document.styleSheets[document.styleSheets.length - 1].insertRule(".char{width : 1px;height : 1px;position: absolute;float: left;}", 0);
			
			var col_count = 1;
			for (var i=0; i < this.char_width*this.char_height; i++) {
				document.styleSheets[document.styleSheets.length - 1].insertRule(".char_pos" + (i + 1) + "{left:" + col_count + "px;top:" + (Math.floor((i/8))+1) + "px;}", 0);
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
					throw new Error('BigBlock.InputFeedback.display(x, y) requires valid x and y locations');
				} else {
					BigBlock.SpriteSimple.create({
						alias : 'input_feedback',
						className : this.className,
						x : x - BigBlock.Grid.x,
						y : y - BigBlock.Grid.y,
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
						}
					break;
					
					case 'move':
						return function(){
							this.x += 8;
						}
					break;
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
				var character = {};
				
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
																																																																																																														
					default:
						try {
							throw new Error('BigBlock.CharPresets: ' + name + ' preset does not exist.');
						} catch (e) {
							BigBlock.Log.display(e);
						}
					break;					
				}
				
				// Params
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
						if (params.hasOwnProperty(i)) em[i] = params[i];
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
			
						}
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
			
						}
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
						}
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
						}
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
						}
					break;
							
					default:
						try {		
							throw new Error('BigBlock.EmitterPresets: preset does not exist.');
						} catch(e) {
						 	BigBlock.Log.display(e.name + ': ' + e.message);
						}
					break;					
				}
				
				// Params
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
						if (params.hasOwnProperty(i)) em[i] = params[i];
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
			left : (window.innerWidth / 2 - (100 / 2)) + 'px',
			top : (window.innerHeight / 2 - (10 / 2)) + 'px',
			position : 'absolute',
			backgroundColor : 'transparent',
			width : '100px',
			height : '10px',
			border : '1px solid #aaa',
			padding : '2px',
			textAlign : 'center',
			color: '#fff',
			fontStyle : 'normal',
			fontFamily : 'Verdana, sans-serif',
			fontSize : '1em',
			fontVariant : 'normal',
			fontWeight : 'normal'
		},
		width : 100,
		height : 10,
		format : 'percentage',
		total : 0,
		msg : '&nbsp;',
		bar_color : '#999',
		
		add: function(){					
			document.body.innerHTML = "<div id='" + this.id + "' class='" + this.class_name + "'><div id='" + this.id + "_bar' class='" + this.class_name + "_bar' style='background-color:" + this.bar_color + ";height:" + this.height + "px;'></div></div>"; // insert the Loader container into the body
			for (var key in this.style) { // loop thru styles and apply
				if (this.style.hasOwnProperty(key)) {
					var the_style = this.style[key];
					document.getElementById(this.id).style[key] = the_style;
				}
			}
			
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
		
			pixNodes = document.getElementById(BigBlock.Grid.id).childNodes; // get a collection of all children in 'pix_grid_container';
	
			for (var i = 0;i < pixNodes.length;i++) { // reset classes in all children
				
				pixNodes[i].setAttribute('class', 'pix color');
				
				while (pixNodes[i].childNodes.length >= 1) { // remove any character nodes within pixel nodes
					pixNodes[i].removeChild(pixNodes[i].firstChild);
				}
				
			}
		
			// loop thru all existing objects
			var div_id = 0;
			for (i = BigBlock.Sprites.length-1; i > -1; i--) {
				
				// only render pixel if render property has not timed out
				if (BigBlock.Sprites[i].render !== 0 && BigBlock.Sprites[i].state != 'dead') {
				
					var y = 0;
					if (typeof(BigBlock.Sprites[i].img) != 'undefined' && typeof(BigBlock.Sprites[i].img.pix) != 'undefined') {
						
						for (y in BigBlock.Sprites[i].img.pix) {
							
							// render pixel
							
							var pix_index = BigBlock.Sprites[i].img.pix[y].i + BigBlock.Sprites[i].pix_index; 
							
							if (pix_index > -1 && pix_index < (BigBlock.Grid.cols * BigBlock.Grid.rows)) { // check that pixel is on screen; index should correspond to a location in the grid
								
								var color = BigBlock.Sprites[i].img.pix[y].c;
								
								if (document.getElementById(div_id)) { // if the div w the corresponding id exists
																		
									if (BigBlock.Sprites[i].alias == 'Char') { // this is a character pixel
										
										document.getElementById(div_id).setAttribute('class', 'pix text_bg pos' + pix_index);
										
										if (document.getElementById(div_id).hasChildNodes) { // remove all char nodes
											while (document.getElementById(div_id).childNodes.length >= 1) {
												document.getElementById(div_id).removeChild(document.getElementById(div_id).firstChild);
											}
										}
										
										var char_pos = BigBlock.Sprites[i].char_pos; // get positions of all divs in the character
										for (k = 0; k < char_pos.length; k++) {
											var child = document.createElement("div");
											child.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color);
											document.getElementById(div_id).appendChild(child); // add the div to the grid										
										}

									} else { // this is a normal pixel
										document.getElementById(div_id).setAttribute('class', 'pix color'+color+' pos'+pix_index);										
									}
									
								} else { // if the div does not exist, create it
									var child = document.createElement("div");
									child.setAttribute('id', div_id);
									document.getElementById(BigBlock.Grid.id).appendChild(child); // add the div to the grid	
									document.getElementById(div_id).setAttribute('class', 'pix color' + color + ' pos' + pix_index);
								}
							}
							div_id++;
						}
					}
					BigBlock.Sprites[i].render--; // decrement the render counter
				}
			}

		},
		getGridCenterX: function () {
			return this.grid_width/2;
		},
		getGridCenterY: function () {
			return this.grid_height/2;
		}							
	}
	
})();

/**
 * ScreenEvent object
 * Defines all events.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.ScreenEvent = (function () {
	return {
		create: function (params) {
			
			this.alias = "ScreenEvent";
			this.click_event = params.click;
			this.touch_event = params.touchstart;
			if (typeof(params) != 'undefined') {
				if (typeof(params.click) != 'undefined') {
					document.addEventListener('click', params.click, false); // add click event listener
				}
				if (typeof(params.touchstart) != 'undefined') {
					document.addEventListener('touchstart', params.touchstart, false); // add click event listener
				}		
			}
			this.frameAdvance = params.frameAdvance;	
			this.inputFeedback = params.inputFeedback;						
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
				throw new Error('goToAndPlay(arg, anim_frame, anim) requires a frame number, label or keyword(nextFrame, lastFrame)');
			}
		} catch(e) {
 			BigBlock.Log.display(e.name + ': ' + e.message);
		}
		try {		
			if (typeof(anim_frame) == 'undefined') {
				throw new Error('goToAndPlay(arg, anim_frame, anim) requires an anim_frame');
			}
		} catch(e) {
 			BigBlock.Log.display(e.name + ': ' + e.message);
		}
		try {	
			if (typeof(anim) == 'undefined') {
				throw new Error('goToAndPlay(arg, anim_frame, anim) requires an anim');
			}
		} catch(e) {
 			BigBlock.Log.display(e.name + ': ' + e.message);
		}
				
		switch (typeof(arg)) {
			case 'number':
				try {
					if (arg - 1 < 0 || arg - 1 >= anim.length) {
						throw new Error('Frame number does not exist.');
					}
				} catch(e) {
		 			BigBlock.Log.display(e.name + ': ' + e.message);
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
				throw new Error('getFrameIndexByLabel(arg, anim) requires a label');
			}
		} catch(e) {
		 	BigBlock.Log.display(e.name + ': ' + e.message);
		}
		try {		
			if (typeof(anim) == 'undefined') {
				throw new Error('getFrameIndexByLabel(arg, anim) requires an anim');
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
				throw new Error('Frame label does not exist.');
			}
		} catch(e) {
		 	BigBlock.Log.display(e.name + ': ' + e.message);
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
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
					
			this.img = this.getPix(this.anim, this.color_index); // get pixels
			
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
						throw new Error('getPix(anim) requires an anim json object');
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
						throw new Error(console.log('goToAndPlay(arg) requires a frame number, label or keyword(nextFrame, lastFrame)'));
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
						throw new Error(console.log('goToAndStop(arg) requires a frame number, label or keyword(nextFrame, lastFrame)'));
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
		timeout_obj : null,
		arrow_direction : 'up',
		x : 152,
		y : 336,
		
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
				className : "white"
			});
			
			switch (this.arrow_direction) {

				case 'left':
					BigBlock.CharSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x - 8,
						y : this.y,
						value : "arrow_left",
						className : "white"
					});
				break;
				
				case 'right':
					BigBlock.CharSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + 24,
						y : this.y,
						value : "arrow_right",
						className : "white"
					});
				break;

				case 'down':
					BigBlock.CharSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + 8,
						y : this.y + 8,
						value : "arrow_down",
						className : "white"
					});
				break;
																
				default:
					BigBlock.CharSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + 8,
						y : this.y - 8,
						value : "arrow_up",
						className : "white"
					});
				break;	
				

			}
		},
		stop : function () {
			clearTimeout(this.timeout_obj);
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')]) != 'undefined') {
				BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_word_tap')].die();
			}
			if (typeof(BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')]) != 'undefined') {
				BigBlock.Sprites[BigBlock.getObjIdByWordId('tap_timeout_arrow')].die();
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
	
		play : function(params) { // called after all objects are ready
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
			
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

			if (BigBlock.Grid.build_char_styles()) {
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

			var ext_css = 0;
			for (var i = 0; i < document.styleSheets.length; i++) { // check if an external grid css sheet has been found
				if (document.styleSheets[i].cssRules.length > 0) {
					if (document.styleSheets[i].cssRules[0].selectorText.search('extGrid') != -1) {
						ext_css = 1;
						break;
					} 
				}
			}
			
			if (ext_css !== 0) { // if an external grid css sheet exists, skip auto-generating the grid css
				BigBlock.Grid.add(); // add grid to DOM
				for (i in BigBlock.Sprites) { // loop thru Sprites and set state = start
					if (BigBlock.Sprites.hasOwnProperty(i)) {
						BigBlock.Sprites[i].state = 'start';
					}
				}
				if (BigBlock.Timer.tap_timeout) {
					BigBlock.TapTimeout.start(); // setup tap timeout
				}
				BigBlock.Timer.run();	
			} else {
				BigBlock.Timer.build_grid();
			}						
					
		},
		build_grid : function(){
		
			if (BigBlock.Grid.build()) {
				BigBlock.Grid.add(); // add grid to DOM
				for (var i in BigBlock.Sprites) { // loop thru Sprites and set state = start
					if (BigBlock.Sprites.hasOwnProperty(i)) {
						BigBlock.Sprites[i].state = 'start';
					}
				}
				
				BigBlock.Log.display(new Date().getTime() - getBuildStart() + 'ms'); // log the build time
				
				delete BigBlock.Grid.build; // remove Grid methods
				delete BigBlock.Grid.add;
				delete BigBlock.Loader; // remove Loader object
				delete BigBlock.Timer.add_color_loader; // remove build methods
				delete BigBlock.Timer.build_color; 
				delete BigBlock.Timer.add_grid_loader; 
				delete BigBlock.Timer.build_grid; 
				delete BigBlock.Timer.play; 
				
				if (BigBlock.Timer.tap_timeout) {
					BigBlock.TapTimeout.start(); // setup tap timeout
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
				
			this.end = new Date().getTime(); // mark the end of the run
			this.time = this.end - this.start; // calculate how long the run took in milliseconds
			
			if (this.time <= this.frame_rate+1) {
				this.buffer = setTimeout('BigBlock.Timer.render()',this.frame_rate-this.time);
			} else {
				BigBlock.Timer.render();
			}

			// end object run cycles
			
			for (i = 0; i < this.sprites_to_kill.length; i++) { // loop thru BigBlock.Grid.sprites_to_kill and tag Sprites to remove
				BigBlock.Sprites[this.sprites_to_kill[i]].state = 'dead'; // cannot remove sprites here bc indexes will be out of synch
			}
			
			for (var y = 0; y < BigBlock.Sprites.length; y++) {
				if (BigBlock.Sprites[y].state == 'dead') { // remove Sprite
					if (typeof(BigBlock.Sprites[y].afterDie) == 'function') {
						BigBlock.Sprites[y].afterDie(); // call afterDie function
					}
					BigBlock.Sprites.splice(y, 1);
				}
			}
			
			for (var x = 0; x < BigBlock.Sprites.length; x++) { // loop thru the Sprites and reset their index
				BigBlock.Sprites[x].index = x;
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
					this.sprites_to_kill.push(obj.index); // copy object to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
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
			
			
Math.degreesToRadians = function (degrees) {	
	return (Math.PI / 180.0) * degrees;
};
	
Math.radiansToDegrees = function (radians) {	
	return (180.0 / Math.PI) * radians;
};

Math.getRamdomNumber = function (floor, ceiling) {
	return Math.floor(Math.random()*(ceiling+1)) + floor;
};

BigBlock.clone = function(object) {
    function F() {}
    F.prototype = object;
    return new F;
};

BigBlock.getPixIndex = function (x,y) {
	if (BigBlock.Grid.pix_dim !== 0) {
		var target_x = Math.floor(x / BigBlock.Grid.pix_dim);
		var target_y = Math.floor(y / BigBlock.Grid.pix_dim);
		return target_x + (BigBlock.Grid.cols * target_y);
	} else {
		return 1;
	}				
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
			  	//alert(str); // other browsers will alert
			  }
			} catch(e) {
			  // do nothing
			}
		}
	}

})(); 

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
			this.word_id = 'word1'
			this.x = BigBlock.Grid.width/2;
			this.y = BigBlock.Grid.height/2;
			this.value = 'BIG BLOCK'; // the default character to render
			this.center = false; // set = true to center text			
			this.className = 'white'; // color
			this.afterDie = null;
			this.render = 0;
		},
		die : function (callback) {
			// remove the characters of this word
			for (var i in BigBlock.Sprites) {
				if (BigBlock.Sprites[i].word_id == this.word_id + '_char') {
					BigBlock.Timer.killObject(BigBlock.Sprites[i]);
				}

			}
			
			if (typeof(callback) == 'function') { this.afterDie = callback; }
						
			// remove the word
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
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (i in palette.classes) { // get length of color palette for this className
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
			
			for (i in obj.value) {
				BigBlock.CharSimple.create({
					word_id : obj.word_id + '_char', // pass the word id to the characters
					value: obj.value[i],
					x : obj.x + (i * BigBlock.Grid.pix_dim),
					y : obj.y,
					className : obj.className
				});
			}
			
			BigBlock.Sprites.push(obj);
		}
	};
	
})();
