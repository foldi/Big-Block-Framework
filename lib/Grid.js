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