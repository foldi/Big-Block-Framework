/**
 * ScreenEvent object
 * Defines all events.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.ScreenEvent = (function () {
	
	var event_buffer, inputFeedback, removeListensers, getEventLocation, checkButtonAction, checkBlockAction, checkInputBlock, preventDefault, stopPropagation;
	
	// use may NOT configure these options

	event_buffer = 200; // default event buffer in milliseconds
		
	inputFeedback = function (evt_x, evt_y) {
		if (BigBlock.Timer.input_feedback === true) { // INPUT FEEDBACK
			BigBlock.BlockSmall.create({
				x: evt_x,
				y: evt_y,
				life: 10,
				color: "white_black"
			});
		}			
	};
	
	removeListensers = function (event_name, event) {
		var i, q;
		for (i = 0; i < BigBlock.GridActive.quads.length; i++) { // remove listeners from quads
			q = document.getElementById(BigBlock.GridActive.quads[i].id);
			if (q.removeEventListener) {
				q.removeEventListener(event_name, event, false);
			} // IE does not have an equivalent event; 07-22-2010						
		}		
	};
	
	getEventLocation = function (event) {
		var evt_loc = {
			x: false,
			y: false
		};
		if (typeof(BigBlock.GridActive) !== 'undefined') {
			evt_loc.x = event.clientX - BigBlock.GridActive.x;
			evt_loc.y = event.clientY - BigBlock.GridActive.y;
		}
		return evt_loc;
	};
	
	checkButtonAction = function (evt_x, evt_y, event) {
		
		var i, x1, y1, x2, y2;
				
		// Check the Button object to see if any objects exist 
		// and if the event location is within any rects contained in Button.map								
		if (typeof(BigBlock.Button) !== "undefined" && typeof(BigBlock.Button.map) !== "undefined") {
			for (i = 0; i < BigBlock.Button.map.length; i++) {
				x1 = BigBlock.Button.map[i].x;
				y1 = BigBlock.Button.map[i].y;
				x2 = x1 + BigBlock.Button.map[i].width;	
				y2 = y1 + BigBlock.Button.map[i].height;										
				if (BigBlock.ptInsideRect(evt_x, evt_y, x1, x2, y1, y2) && BigBlock.Button.map[i].action_input !== false) {
					BigBlock.Button.map[i].action_input(event);
					return false; // do not fire any more events; only one button at any time
				}
			}
		}							
		return true;
	};
	
	checkBlockAction = function (evt_x, evt_y, event) {
		
		var i, x, y, width, height;
		
		// loops thru Block and looks for action_inputs
		for (i = 0; i < BigBlock.BlocksKeys.length; i++) {
			if (typeof(BigBlock.Blocks[BigBlock.BlocksKeys[i]]) !== "undefined" && typeof(BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input) !== 'undefined' && BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input !== false && typeof(BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input) === "function") {
				x = BigBlock.Blocks[BigBlock.BlocksKeys[i]].x;
				y = BigBlock.Blocks[BigBlock.BlocksKeys[i]].y;
				width = BigBlock.Blocks[BigBlock.BlocksKeys[i]].width;
				height = BigBlock.Blocks[BigBlock.BlocksKeys[i]].height;	
				if (typeof(width) === "undefined") {
					width = BigBlock.Grid.blk_dim;
				}
				if (typeof(height) == "undefined") {
					height = BigBlock.Grid.blk_dim;
				}												
				if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + width), y, (y + height))) {
					
					BigBlock.Blocks[BigBlock.BlocksKeys[i]].action_input(event);
					return false; // do not fire any more events; only one button at any time
				}											
			}
		}
		return true;							
	};	
	
	checkInputBlock = function () {
		if (BigBlock.inputBlock === true) {
			return false; // check to block user input
		}
		return true;		
	};
	
	preventDefault = function (event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}		
	};
	
	stopPropagation = function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}		
	};
	
	return {

		current_frame : 0,
		resetCurrentFrame : function () {
			this.current_frame = 0;
		},
		screen_mouseup : false,	
		screen_mousedown : false,	
		screen_mousemove : false,	
		screen_touchstart : false,	
		screen_touchmove : false,	
		screen_touchend : false,
		screen_click : false,
		frameAdvance : function (event, x, y) {
					
		},			
		create: function (params) {
			
			this.alias = "ScreenEvent"; // DO NOT REMOVE; Timer checks BigBlock.ScreenEvent.alias to determine if BigBlock.ScreenEvent has been created in the html file
			
			this.evtListener = [];
			
			this.screen_mouseup = BigBlock.ScreenEvent.screen_mouseup;			
			this.screen_mousedown = BigBlock.ScreenEvent.screen_mousedown;			
			this.screen_mousemove = BigBlock.ScreenEvent.screen_mousemove;			
			this.screen_touchstart = BigBlock.ScreenEvent.screen_touchstart;			
			this.screen_touchmove = BigBlock.ScreenEvent.screen_touchmove;			
			this.screen_touchend = BigBlock.ScreenEvent.screen_touchend;			
			this.screen_click = BigBlock.ScreenEvent.screen_click;
			this.frameAdvance = BigBlock.ScreenEvent.frameAdvance;
			this.inputFeedback = inputFeedback;
			this.removeListensers = removeListensers;
			this.getEventLocation = getEventLocation;
			this.checkButtonAction = checkButtonAction;
			this.checkBlockAction = checkBlockAction;
			this.checkInputBlock = checkInputBlock;
			this.preventDefault = preventDefault;
			this.stopPropagation = stopPropagation;
			
			/*
			 * The following properties are used to prevent the user from clicking/tapping to fast.
			 */
			
			this.event_start = new Date().getTime(); 
			this.event_end = 0; 
			this.event_time = 0;
			if (params.event_buffer) { // can pass in an event_buffer
				this.event_buffer = params.event_buffer;
			} else {
				this.event_buffer = event_buffer;
			}
		
			// MOUSEUP
				
			this.mouseup_event = function (event) {
				
				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
							
				BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
				BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
				
				BigBlock.ScreenEvent.removeListensers('touchstart', BigBlock.ScreenEvent.touchstart_event);

				if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer && !BigBlock.Timer.is_paused) {
					
					var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
										
					if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}
					
					if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}																																				
						
					if (typeof(BigBlock.ScreenEvent.screen_mouseup) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_mouseup) === "function") {
						BigBlock.ScreenEvent.screen_mouseup(evt_loc.x, evt_loc.y, event);
					}
					
					BigBlock.ScreenEvent.current_frame++;
					
					BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
					
					BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
												
					BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
					
				}
				
			};
		
			
			// MOUSEMOVE

			this.mousemove_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
				
				if (typeof(BigBlock.ScreenEvent.screen_mousemove) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_mousemove) === "function") {
					BigBlock.ScreenEvent.screen_mousemove(evt_loc.x, evt_loc.y, event);
				}
					
			};

			
			// MOUSEDOWN

			this.mousedown_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);
				
				if (typeof(BigBlock.ScreenEvent.screen_mousedown) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_mousedown) === "function") {
					BigBlock.ScreenEvent.screen_mousedown(evt_loc.x, evt_loc.y, event);
				}
											
			};
								
					
			// TOUCH START

			this.touchstart_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
						
				BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
				BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds

				this.touch = event.touches[0];
				
				BigBlock.ScreenEvent.removeListensers('mouseup', BigBlock.ScreenEvent.mouseup_event);
				
				if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer && !BigBlock.Timer.is_paused) {

					var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
																	
					if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
						return false;
					}

					if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
						return false;									
					}
						
					if (typeof(BigBlock.ScreenEvent.screen_touchstart) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_touchstart) === "function") {
						BigBlock.ScreenEvent.screen_touchstart(evt_loc.x, evt_loc.y, event);
					}
					
					BigBlock.ScreenEvent.current_frame++;
						
					BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);

					BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
												
					BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
					
				}
				
			};
			

			
			// TOUCH MOVE
			
			this.touchmove_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
				
				if (typeof(BigBlock.ScreenEvent.screen_touchmove) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_touchmove) === "function") {
					BigBlock.ScreenEvent.screen_touchmove(evt_loc.x, evt_loc.y, event);
				}
			};


								
			// TOUCH END

			this.touchend_event = function(event){

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}			
				
				var evt_loc = BigBlock.ScreenEvent.getEventLocation(this.touch);
				
				if (typeof(BigBlock.ScreenEvent.screen_touchend) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_touchend) === "function") {
					BigBlock.ScreenEvent.screen_touchend(evt_loc.x, evt_loc.y, event);
				}							
			};

					

			// CLICK - for Wii ONLY
						
			this.click_event = function(event) {

				BigBlock.ScreenEvent.preventDefault(event);
				BigBlock.ScreenEvent.stopPropagation(event);
				
				if (!BigBlock.ScreenEvent.checkInputBlock()) {
					return false; // check if input is blocked
				}
				
				if (typeof(opera) !== "undefined" && typeof(opera.wiiremote) !== "undefined") { // detect wii
							
					BigBlock.ScreenEvent.event_end = new Date().getTime(); // time now
					BigBlock.ScreenEvent.event_time = BigBlock.ScreenEvent.event_end - BigBlock.ScreenEvent.event_start; // calculate how long bw last event in milliseconds
					
					BigBlock.ScreenEvent.removeListensers('touchstart', BigBlock.ScreenEvent.touch_event);
						
					if (BigBlock.ScreenEvent.event_time > BigBlock.ScreenEvent.event_buffer && !BigBlock.Timer.is_paused) {

						var evt_loc = BigBlock.ScreenEvent.getEventLocation(event);

						BigBlock.ScreenEvent.inputFeedback(evt_loc.x, evt_loc.y);
																							
						if (!BigBlock.ScreenEvent.checkButtonAction(evt_loc.x, evt_loc.y, event)) {
							return false;
						}

						if (!BigBlock.ScreenEvent.checkBlockAction(evt_loc.x, evt_loc.y, event)) {
							return false;									
						}
						
						if (typeof(BigBlock.ScreenEvent.screen_touchstart) !== "undefined" && typeof(BigBlock.ScreenEvent.screen_touchstart) === "function") {
							BigBlock.ScreenEvent.screen_click();
						}
						
						BigBlock.ScreenEvent.current_frame++;
																	
						BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
													
						BigBlock.ScreenEvent.event_start = new Date().getTime(); // mark the end of the event
						
					}
				}
			};
		}		
	};
})();