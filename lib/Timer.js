/**
 * Timer object
 * Sets up a render loop based on the Javascript timer object.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Timer = (function () {
	
	var build_start = new Date().getTime();
	
	function getBuildStart () {
		return build_start;
	}
	
	return {
		
		// for debugging
		
		frame_rate_test_array: [],
		frame_rate_test_start : false,
		frame_rate_test_end : false,
		run_rate_test_array : [],		
		run_interval : false, // holds the run interval
		
		// end debugging
		
		// user configurable

		app_footer : false,
		app_footer_styles : false,	
		app_header : false,
		app_header_styles : false,
		before_play : false,
		debug_frame_rate : false, // debugging	
		document_body_style : { backgroundColor : '#000'},
		event_buffer : false,
		force_max_frame_rate : true,						
		frame_rate : 33, // set the frame rate in milliseconds
		frame_rate_test_interval : 100, // debugging
		grid_active_styles : false,
		grid_text_styles : false,
		grid_static_styles : { backgroundColor : '#333' },	
		input_feedback : true,	
		is_paused: false,
				
		// end user configurable
		
		// non-configurable
		
		alias : "Timer",
		F: false, // holds the cloned Grid object; use later to delete unnecesarry methods from Grid objects
		build_timeout: false, // holds timeout obj for buildChars and buildColors
		time : 0,
		clock : 0,
		errors : [],
		build_start : new Date().getTime(),
		blocks_to_destroy : [],
		play : function(params) { // called after all objects are ready
			
			var i, s, key, css, grid_top_offset, qA_styles;
					
			// Timer
			
			if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
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
			
			s = document.createElement('style'); // add core style sheet
			s.setAttribute('type', 'text/css');

			i = document.getElementsByTagName('head').item(0);
			i.appendChild(s);
				
			s = document.styleSheets[document.styleSheets.length - 1];
									
			css = {
				'body' : 'margin: 0;padding: 0;background-color:#ccc;',
				'div.color' : 'background-color : transparent;',
				'div.pix' : 'float:left;width:' + BigBlock.Grid.blk_dim + 'px;height:' + BigBlock.Grid.blk_dim + 'px;position:absolute;line-height:0px;font-size:1%;'
			};
			
			try {
				if (s.insertRule) { // Mozilla
					for (i in css) {
						if (css.hasOwnProperty(i)) {
							s.insertRule(i + " {" + css[i] + "}", 0);
						}
					}
				} else if (s.addRule) { // IE
					for (i in css) {
						if (css.hasOwnProperty(i)) {
							s.addRule(i, css[i], 0);
						}
					}
				} else {
					throw new Error("BigBlock.Timer.play(): document.styleSheets insertion failed. Browser does not support insertRule() or addRule().");
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
			// GRIDS
			grid_top_offset = 0;
			//if (!window.navigator.standalone) { // iPhones remove 18 pixels for the status bar when NOT running in full-screen app mode
				//grid_top_offset = 18;
			//}
			
			/**
			 * Create GridInit
			 * 
			 * The GridInit is added to the DOM before other Grids. It will trigger any scrollbars if app
			 * is viewed in a frame (Facebook). Subsequent Grids will calculate width and height accurately. 
			 */

			this.F = BigBlock.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridInit = new this.F;
			
			BigBlock.GridInit.configure({
					'quads': [
						{'id' : 'qI_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : -100}
					]
			});
															
			// Create GridActive

			this.F = BigBlock.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridActive = new this.F;

			/*
			 * IE Divs will not detect mouse up if there's no background color or image.
			 * However, image reference does NOT need to be valid. IE just needs to think there's an image.
			 * 
			 */
			// qA_styles;
			if (document.attachEvent) { // IE
				qA_styles = {
					backgroundImage : "url('trans.gif')" // this does not need to be a valid reference
				};
			} else {
				qA_styles = this.grid_active_styles;
			}
					
			BigBlock.GridActive.configure({
					'quads': [
						{'id' : 'qA_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 10}, 
						{'id' : 'qA_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 10}, 
						{'id' : 'qA_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : 10}, 
						{'id' : 'qA_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : 10}
					],
					'styles' : qA_styles
			});

			// Create GridStatic

			this.F = BigBlock.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridStatic = new this.F;

			BigBlock.GridStatic.configure({
					'quads': [
						{'id' : 'qS_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -10}, 
						{'id' : 'qS_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -10}, 
						{'id' : 'qS_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : -10}, 
						{'id' : 'qS_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : -10}
					],
					'styles' : this.grid_static_styles		
			});

			
			
			// Create GridText

			this.F = BigBlock.clone(BigBlock.Grid);  // CLONE Grid
			BigBlock.GridText = new this.F;

			BigBlock.GridText.configure({
					'quads': [
						{'id' : 'qT_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : 1}
					],
					'styles' : this.grid_text_styles					
			});
			
			BigBlock.Grid.total_global_cols = Math.round(BigBlock.Grid.width/BigBlock.Grid.blk_dim);
			BigBlock.Grid.total_quad_cols = Math.round((BigBlock.Grid.width/2)/BigBlock.Grid.blk_dim);
			
			delete this.F.prototype.configure; // delete configure from the Block prototype
															
			//
			
			this.add_char_loader();
						
		},

		add_char_loader : function () {
			
			var i, s;
			
			BigBlock.Loader.add(); // add loader to DOM
			BigBlock.Loader.update();

			s = document.createElement('style'); // add color style sheet
			s.setAttribute('type', 'text/css');
			
			i = document.getElementsByTagName('head').item(0);
			i.appendChild(s);
									
			this.build_char();

		},
		
		build_char : function () {
			
			if (BigBlock.GridActive.buildCharStyles()) {
				clearTimeout(this.build_timeout);
				this.add_color_loader();
			} else {
				this.build_timeout = setTimeout(this.build_char, 1); // if not finishing building the colors, call again
			}
									
		},
				
		add_color_loader : function () {
			
			var i, s;
			
			BigBlock.Loader.add(); // add loader to DOM
			BigBlock.Loader.update();

			s = document.createElement('style'); // add color style sheet
			s.setAttribute('type', 'text/css');
			
			i = document.getElementsByTagName('head').item(0);
			i.appendChild(s);
						
			this.build_color();
	
		},
		
		build_color : function () {

			if (BigBlock.Color.build()) {
				clearTimeout(this.build_timeout);
				BigBlock.Timer.add_grid_loader();
			} else {
				this.build_timeout = setTimeout(BigBlock.Timer.build_color, 1); // if not finishing building the colors, call again
			}
									
		},
		
		add_grid_loader : function () {
			
			var i, s;
			
			BigBlock.Loader.add(); // add loader to DOM
			BigBlock.Loader.update();

			s = document.createElement('style'); // add a style sheet node to the head element to hold grid styles
			s.setAttribute('type', 'text/css');
			
			i = document.getElementsByTagName('head').item(0);
			i.appendChild(s);
			
			BigBlock.Timer.build_grid();
									
					
		},
		build_grid : function(){
			
			var b, l, i, q, e, header_x, header_y, header_bgColor, footer_x, footer_y, footer_bgColor;
			
			if (BigBlock.GridActive.build()) {
				
				b = document.getElementsByTagName('body').item(0);
				while (document.getElementById('loader')) {
					l = document.getElementById('loader');
					b.removeChild(l);
				}
				
				BigBlock.GridInit.add(); // add grid to DOM								
				BigBlock.GridActive.add(); // add grid to DOM
				BigBlock.GridStatic.add(); // add grid_static to DOM
				BigBlock.GridText.add(); // add grid_static to DOM
				
				BigBlock.Log.display(new Date().getTime() - getBuildStart() + 'ms'); // log the build time		
				
				delete BigBlock.Loader; // remove Loader object		
				delete BigBlock.Timer.add_color_loader; // remove build methods
				delete BigBlock.Timer.build_color; 
				delete BigBlock.Timer.add_grid_loader; 
				delete BigBlock.Timer.build_grid; 
				delete BigBlock.Timer.play; 
				
				delete BigBlock.Timer.F.prototype.add;
				delete BigBlock.Timer.F.prototype.build;
				delete BigBlock.Timer.F.prototype.buildCharStyles;
				delete BigBlock.Timer.F; // remove the prototype
										
				// app_header
				if (BigBlock.Timer.app_header !== false) {

					header_x = BigBlock.GridActive.x;
					header_y = BigBlock.GridActive.y;
					
					// header_bgColor;
					if (typeof(BigBlock.Timer.app_header_styles.backgroundColor) === "undefined") {
						header_bgColor = BigBlock.Timer.document_body_style.backgroundColor;
					} else {
						header_bgColor = BigBlock.Timer.app_header_styles.backgroundColor;
					}
					
					BigBlock.Header.add(header_x, header_y, header_bgColor);						
				}
				
				// app_footer
				if (BigBlock.Timer.app_footer !== false) {

					footer_x = BigBlock.GridActive.x;
					footer_y = BigBlock.GridActive.y + BigBlock.GridActive.height;
					
					// footer_bgColor;
					if (typeof(BigBlock.Timer.app_footer_styles.backgroundColor) === "undefined") {
						footer_bgColor = BigBlock.Timer.document_body_style.backgroundColor;
					} else {
						footer_bgColor = BigBlock.Timer.app_footer_styles.backgroundColor;
					}
					
					BigBlock.Footer.add(footer_x, footer_y, footer_bgColor);						
				}
				
				// Screen Event
				
				if (typeof(BigBlock.ScreenEvent.alias) === "undefined") {
					BigBlock.ScreenEvent.create({
						event_buffer : BigBlock.Timer.event_buffer
					});
				}
				
				// add all screen events to GridActive
					
				for (i = 0; i < BigBlock.GridActive.quads.length; i++) {
					q = document.getElementById(BigBlock.GridActive.quads[i].id);
					
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
					
					for (e in BigBlock.ScreenEvent.evtListener[i]) {
						if (BigBlock.ScreenEvent.evtListener[i].hasOwnProperty(e)) {	
							if (q.addEventListener) { // mozilla
								q.addEventListener(e, BigBlock.ScreenEvent.evtListener[i][e], false); 
							} else if (q.attachEvent) { // IE
								q.attachEvent('on'+e, BigBlock.ScreenEvent.evtListener[i][e]);
							}
						}					
					}
														
				}
			
				// before_play function

				if (BigBlock.Timer.before_play !== false) {
					if (typeof(BigBlock.Timer.before_play) === "function") {
						BigBlock.Timer.before_play();
					}
				}
				
				
				// reveals and positions Facebook 'Like' button; override w PHP in the host page
				
				if (typeof(BtnLike) !== "undefined") {
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
												
				BigBlock.Timer.run_interval = setInterval(function () { // call run using interval and BigBlock.Timer.frame_rate 
					BigBlock.Timer.run();
				},10); 
				
			} else {
				this.build_timeout = setTimeout(BigBlock.Timer.build_grid, 1); // if not finishing building the grid, call again
			}
		
		},
		run : function () {
			
			var i;
			
			if (!this.is_paused) {
				
				this.frame_rate_test_end = new Date().getTime(); // mark the end of the frame render
				var time_to_render = this.frame_rate_test_end - this.frame_rate_test_start; // calculate time to render frame
				
				if (this.force_max_frame_rate) {
					if (this.frame_rate_test_start !== false && this.frame_rate_test_end !== false) { // enforce the maximum frame rate; if rate is faster, this script pauses the function.
						var ms_to_wait = this.frame_rate - time_to_render;
						
						while (new Date().getTime() < this.frame_rate_test_end + ms_to_wait) {
							// wait to match intended frame rate
						}
					}
				}

				if (this.debug_frame_rate) { // log average overall FRAME RATE					
					this.frameRateTest();			
				}
				
				this.frame_rate_test_start = new Date().getTime(); // mark the beginning of the run loop
					
				var blocksToRender = []; // RUN LOOP
				for (i = 0; i < BigBlock.BlocksKeys.length; i++) {
					if (typeof(BigBlock.Blocks[BigBlock.BlocksKeys[i]]) !== "undefined") {
						var obj = BigBlock.Blocks[BigBlock.BlocksKeys[i]];
						obj.run();
						if (typeof(obj.img) !== "undefined" && obj.render !== 0) { // if render or life has expired, do not add to render array
							blocksToRender[blocksToRender.length] = obj;							
							obj.render--; // decrement the render counter of this object
						}
					}			
				}										
				
				if (this.debug_frame_rate) { // log average RUN RATE
					this.runRateTest();
				}
					
				BigBlock.RenderMgr.is_cleaned = false;
				
				BigBlock.RenderMgr.renderCleanUp();
				
				if (this.blocks_to_destroy.length > 0) { // CLEAN UP LOOP; only run clean up if blocks need to be destroyed
					this.cleanUpBlocks();
				}
				
				if (BigBlock.BlocksKeys.length > 0) { // RENDER LOOP; only run render if Blocks exist
					BigBlock.RenderMgr.renderBlocks(blocksToRender);					
				}
				
				this.clock++;
				
				/*
				 * Frame render time = RenderMgr + Block.run + cleanUpBlocks
				 */

			}
			
		},
		cleanUpBlocks : function () {
			
			var i, y;
			
			for (i = 0; i < this.blocks_to_destroy.length; i++) { // loop thru Timer.blocks_to_destroy and remove Blocks

				if (typeof(BigBlock.Blocks[this.blocks_to_destroy[i]]) !== "undefined" && typeof(BigBlock.Blocks[this.blocks_to_destroy[i]].after_destroy) === "function") {
					BigBlock.Blocks[this.blocks_to_destroy[i]].after_destroy(); // call after_destroy function
				}
									
				delete BigBlock.Blocks[this.blocks_to_destroy[i]]; // DELETE obj from BigBlock.Blocks

				for (y = 0; y < BigBlock.BlocksKeys.length; y++) { // delete the Block obj's key
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
			if (typeof(obj) !== "undefined") {
				this.blocks_to_destroy[this.blocks_to_destroy.length] = obj.alias; // copy object alias to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
			}
		},
		frameRateTest : function () {
			
			var total_time, ms_per_frame, frame_per_sec, t;
			
			this.frame_rate_test_array[this.frame_rate_test_array.length] = new Date().getTime() - this.frame_rate_test_start; // calculate time to render frame
			
			if (this.clock%this.frame_rate_test_interval === 0) {
				total_time = 0;
				for (t = 0; t < this.frame_rate_test_interval; t++) {
					total_time += this.frame_rate_test_array[t];							
				}
				ms_per_frame = total_time/this.frame_rate_test_interval;
				frame_per_sec = 1000/(total_time/this.frame_rate_test_interval);
				if (this.frame_rate_test_start !== 0) {
					BigBlock.Log.display("/////");
					BigBlock.Log.display("Avg frame rate: " + ms_per_frame.toFixed(2) + "ms (" + frame_per_sec.toFixed(2) + " frm/sec)");
				}
				this.frame_rate_test_array = [];
			}			
		},
		runRateTest : function () {
			
			var total_time, ms_per_frame, frame_per_sec, t;
			
			this.run_rate_test_array[this.run_rate_test_array.length] = new Date().getTime() - this.frame_rate_test_start; // calculate time to complete run loop
			
			if (this.clock%this.frame_rate_test_interval === 0) {
				total_time = 0;
				for (t = 0; t < this.run_rate_test_array.length; t++) {
					total_time += this.run_rate_test_array[t];							
				}
				ms_per_frame = total_time/this.run_rate_test_array.length;
				if (this.frame_rate_test_start !== 0) {
					BigBlock.Log.display("Run rate: " + ms_per_frame.toFixed(2) + "ms Total blocks: " + BigBlock.BlocksKeys.length);
				}					
				this.run_rate_test_array = [];
			}			
		}
	};
	
})();