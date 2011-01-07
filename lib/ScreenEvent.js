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
																
								// Check the Button object to see if any objects exist 
								// and if the event location is within any rects contained in Button.map								
								if (typeof(BigBlock.Button) != "undefined" && typeof(BigBlock.Button.map) != "undefined") {
									for (var i = 0; i < BigBlock.Button.map.length; i++) {
										var x1 = BigBlock.Button.map[i].x;
										var y1 = BigBlock.Button.map[i].y;
										var x2 = x1 + BigBlock.Button.map[i].width;	
										var y2 = y1 + BigBlock.Button.map[i].height;										
										if (BigBlock.ptInsideRect(evt_x, evt_y, x1, x2, y1, y2)) {
											BigBlock.Button.map[i].action_input(event);
											return false; // do not fire any more events; only one button at any time
										}
									}
								}
								
								// loops thru Block and looks for action_inputs
								for (var i = 0; i < BigBlock.Blocks.length; i++) { // check to fire any active sprite events 
									if (BigBlock.Blocks[i].action_input !== false && typeof(BigBlock.Blocks[i].action_input) == 'function') {
										var x = BigBlock.Blocks[i].x;
										var y = BigBlock.Blocks[i].y;
										var dm = BigBlock.Grid.blk_dim;
										if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
											BigBlock.Blocks[i].action_input(event);
											return false; // do not fire any more events; only one button at any time
										}
									}
								}
								
								if (typeof(BigBlock.TapTimeout) != 'undefined' && typeof(BigBlock.CharPresets.getChar != "undefined")) {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
																
								if (ia_check === true) { // if triggering an action_input on an active sprite, do not advance the frame
									return false;
								}
								
								if (!BigBlock.Timer.is_paused) {
																						
									BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
									
									if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
										BigBlock.InputFeedback.display(event.clientX, event.clientY);
									}
								
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
								
								// Check the Button object to see if any objects exist 
								// and if the event location is within any rects contained in Button.map								
								if (typeof(BigBlock.Button) != "undefined" && typeof(BigBlock.Button.map) != "undefined") {
									for (var i = 0; i < BigBlock.Button.map.length; i++) {
										var x1 = BigBlock.Button.map[i].x;
										var y1 = BigBlock.Button.map[i].y;
										var x2 = x1 + BigBlock.Button.map[i].width;	
										var y2 = y1 + BigBlock.Button.map[i].height;										
										if (BigBlock.ptInsideRect(evt_x, evt_y, x1, x2, y1, y2)) {
											BigBlock.Button.map[i].action_input(event);
											return false; // do not fire any more events; only one button at any time
										}
									}
								}								
								
								for (var i = 0; i < BigBlock.Blocks.length; i++) { // check to fire any active sprite events 
									if (BigBlock.Blocks[i].action_input !== false && typeof(BigBlock.Blocks[i].action_input) == 'function') {
										var x = BigBlock.Blocks[i].x;
										var y = BigBlock.Blocks[i].y;
										var dm = BigBlock.Grid.blk_dim;
										if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
											BigBlock.Blocks[i].action_input(event);
										}
									}
								}								

								if (typeof(BigBlock.TapTimeout) != 'undefined' && typeof(BigBlock.CharPresets.getChar != "undefined")) {
									BigBlock.TapTimeout.stop();
									BigBlock.TapTimeout.start();
								}
								
								if (ia_check === true) { // if triggering an action_input on an active sprite, do not advance the frame
									return false;
								}
								
								if (!BigBlock.Timer.is_paused) {
																								
									BigBlock.ScreenEvent.frameAdvance(event, this.touch.clientX, this.touch.clientY);
									
									if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
										BigBlock.InputFeedback.display(this.touch.clientX, this.touch.clientY);
									}
								
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
									for (var i = 0; i < BigBlock.Blocks.length; i++) { // check to fire any active sprite events 
										if (BigBlock.Blocks[i].action_input !== false && typeof(BigBlock.Blocks[i].action_input) == 'function') {
											var x = BigBlock.Blocks[i].x;
											var y = BigBlock.Blocks[i].y;
											var dm = BigBlock.Grid.blk_dim;
											if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
												BigBlock.Blocks[i].action_input(event);
												ia_check = true;
											}
										}
									}
									
									if (typeof(BigBlock.TapTimeout) != 'undefined') {
										BigBlock.TapTimeout.stop();
										BigBlock.TapTimeout.start();
									}
																	
									if (ia_check === true) { // if triggering an action_input on an active sprite, do not advance the frame
										return false;
									}
									
									if (!BigBlock.Timer.is_paused) {
																							
										BigBlock.ScreenEvent.frameAdvance(event, event.clientX, event.clientY);
										
										if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) {
											BigBlock.InputFeedback.display(event.clientX, event.clientY);
										}
									
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
										BigBlock.TapTimeout.destroy();
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