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