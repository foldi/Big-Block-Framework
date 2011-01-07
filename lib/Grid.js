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
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Grid = (function () {

				
	return {
		
		alias : 'Grid',
		
		blk_dim : 8, // the pixel dimensions; width & height; pixels are square
		width : 320, // global grid width
		height : 368, // global grid height
		
		x : 0, // will be set when grid divs are added to the dom
		y : 0,
		
		//cols : Math.round(320/8), // number of GLOBAL grid columns // replaced w Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim)
		//rows : Math.round(368/8), // number of GLOBAL grid rows // replaced w Math.round(BigBlock.Grid.height/BigBlock.Grid.blk_dim)
		
		//quad_width : 160, // replaced w BigBlock.Grid.width/2
		//quad_height : 184, // replaced w BigBlock.Grid.height/2
		//quad_cols : Math.round(160/8), // number of QUAD grid columns // replaced w Math.round((BigBlock.Grid.width/2)/BigBlock.Grid.blk_dim)
		//quad_rows : Math.round(184/8), // number of QUAD grid rows // replaced w Math.round((BigBlock.Grid.height/2)/BigBlock.Grid.blk_dim)		
				
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
			var build_section_total = Math.round((quad_height/BigBlock.Grid.blk_dim))/2;

			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_grid_pos);	
			
			for (var i = 0; i < ((Math.round(quad_width/BigBlock.Grid.blk_dim) * Math.round(quad_height/BigBlock.Grid.blk_dim)) / build_section_total); i++) {
				if (colNum < Math.round(quad_width/BigBlock.Grid.blk_dim)) {
					colNum++;
				} else {
					colNum = 1;
				}
				
				if (i % Math.round(quad_width/BigBlock.Grid.blk_dim) === 0) {
					this.build_rowNum++;
				}


				if (s.insertRule) { // Mozilla
					s.insertRule(".pos" + (i + this.build_offset) + " {left:" + ((colNum - 1) * this.blk_dim) + "px;top:" + ((this.build_rowNum - 1) * this.blk_dim) + "px;}", 0); // setup pos rules
				} else if (s.addRule) { // IE
					s.addRule(".pos" + (i + this.build_offset), " left:" + ((colNum - 1) * this.blk_dim) + "px;top:" + ((this.build_rowNum - 1) * this.blk_dim) + "px"); // setup pos rules
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
				'total' : Math.round((total_rules / (Math.round(quad_width/BigBlock.Grid.blk_dim) * Math.round(quad_height/BigBlock.Grid.blk_dim))) * 100)
			});
					
			if (total_rules < (Math.round(quad_width/BigBlock.Grid.blk_dim) * Math.round(quad_height/BigBlock.Grid.blk_dim))) { // if all styles are not complete, send false back to Timer; Timer will call build again
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