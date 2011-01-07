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
		
		// public defaults
		report_fr : false,
		fr_rate_msg : 'console',
		fr_rate_test_interval : 100,
		run_interval : '',		
		alias : "Timer",
		frame_rate : 33, // set the frame rate in milliseconds
		start : new Date().getTime(),
		end : new Date().getTime(),
		is_paused: false,
		time : 0,
		clock : 0,
		errors : [],
		build_start : new Date().getTime(),
		blocks_to_destroy : [],
		tap_timeout : false,
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
				'div.pix' : 'float:left;width:' + BigBlock.Grid.blk_dim + 'px;height:' + BigBlock.Grid.blk_dim + 'px;position:absolute;line-height:0px;font-size:1%;'
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
							
			// GRIDS
			var grid_top_offset = 0;
			if (!window.navigator.standalone) { // iPhones remove 18 pixels for the status bar when NOT running in full-screen app mode
				grid_top_offset = 18;
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
						{'id' : 'qI_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : -100}, 
						{'id' : 'qI_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : -100}
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
					backgroundImage : "url('trans.gif')" // this does not need to be a valid reference
				}
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
			
			BigBlock.GridStatic = BigBlock.clone(BigBlock.Grid); // CLONE Grid

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
			
			BigBlock.GridText = BigBlock.clone(BigBlock.Grid); // CLONE Grid

			BigBlock.GridText.configure({
					'quads': [
						{'id' : 'qT_tl', 'left' : BigBlock.Grid.width/2, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_tr', 'left' : 0, 'top' : ((BigBlock.Grid.height/2) + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_bl', 'left' : BigBlock.Grid.width/2, 'top' : (0 + grid_top_offset), 'zIndex' : 1}, 
						{'id' : 'qT_br', 'left' : 0, 'top' : (0 + grid_top_offset), 'zIndex' : 1}
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
				for (var i = 0; i < BigBlock.Blocks.length; i++) { // loop thru Blocks and set state = start
					BigBlock.Blocks[i].state = 'start';					
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
				} else {
					BigBlock.TapTimeout.destroy(); // if TapTimeout has not been configured, destroy it;
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
			
			if (this.is_paused === false) {
				BigBlock.Timer.start = new Date().getTime(); // mark the beginning of the run
				
				var run = [];
				
				for (var i=0;i<BigBlock.Blocks.length;i++) {
					if (typeof(BigBlock.Blocks[i]) == "object" && typeof(BigBlock.Blocks[i].run) == "function" && this.pause == -1) { // check pause value
						BigBlock.Blocks[i].run();
					}
				}
				
				BigBlock.Timer.cleanUpBlocks();
	
				this.clock++;
				BigBlock.RenderMgr.renderPix(BigBlock.Timer.start);
			}
			
		},
		cleanUpBlocks : function () {
			
			/* seems wrong; but looping thru blocks_to_destroy array and setting state = dead
			 * and then looping the Blocks and removing Blocks with state = dead is faster
			 * than setting state = dead from destroyObject() and not using a blocks_to_destroy array.
			 */
			
			for (var i = 0; i < this.blocks_to_destroy.length; i++) { // loop thru Timer.blocks_to_destroy and tag Blocks to remove
				if (typeof(this.blocks_to_destroy[i]) != 'undefined' && typeof(BigBlock.Blocks[this.blocks_to_destroy[i]]) != 'undefined') {
					BigBlock.Blocks[this.blocks_to_destroy[i]].state = 'dead'; // cannot remove blocks here bc indexes will be out of synch
					
				}
			}
			
			var reset_index = false;
			for (var y = 0; y < BigBlock.Blocks.length; y++) {
				if (BigBlock.Blocks[y].state == 'dead') { 
					
					if (typeof(BigBlock.Blocks[y].afterDie) == 'function') {
						BigBlock.Blocks[y].afterDie(); // call afterDie function
					}
					BigBlock.Blocks.splice(y, 1); // remove Block
					reset_index = true;		
				}
			}
			
			if (reset_index) { // only loop thru Blocks to reset index if a Block was removed from the array
				for (var x = 0; x < BigBlock.Blocks.length; x++) { // loop thru the Blocks and reset their index
					BigBlock.Blocks[x].index = x;
				}
			}	
			this.blocks_to_destroy = [];			
		},
		pause: -1, // pause value; 1 = paused; -1 = not paused
		pauseToggle: function () {
			this.pause *= -1;
		},
		/**
		 * destroyObject is called by an object's destroy() function when it should be removed from the Blocks array.
		 * 
		 * @param {Object} obj
		 */
		destroyObject : function (obj) {			
			if (typeof(obj) != 'undefined' && typeof(BigBlock.Blocks[obj.index]) == "object") {
				//BigBlock.Blocks[obj.index].state = 'dead';
				this.blocks_to_destroy[this.blocks_to_destroy.length] = obj.index; // copy object to an array; cannot remove object here bc indexes will be out of synch for the remainder of the Run cycle
			}
		}												
		
		
	};
	
})();