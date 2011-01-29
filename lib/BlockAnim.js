/**
 * BlockAnim object
 * An extension of the simple Block object. Supports animation and multi-color. 
 * Anim is passed via Block.anim() as a json object. Colors are set in anim json.
 * 
 * IMPORTANT: BlockAnims should not carry action_inputs; if they do, only the top left block of the Block will trigger the action.
 * Instead, use the Button class.
 * 
 * revisions:
 * 01-07-2001: changed name from SpriteAdvanced to BlockAnim
 * 
 * @author Vince Allen 01-16-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.BlockAnim = (function () { 
	
	return {
		
		create: function (params) {
			var F = BigBlock.clone(BigBlock.Block);  // CLONE Block
			var obj = new F;
			
			obj.configure(); // run configure() to inherit Word properties

			//delete F.prototype.configure; // delete configure from the protoype
			obj.anim_frame_duration = 0;	
			obj.anim_loop = false;
			obj.anim_state = 'stop';
			
			obj.anim = [ // will provide a single pixel if no anim param is supplied
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
						obj[i] = params[i];
					}
				}
			}

			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0; i < palette.classes.length; i++) { // get length of color palette for this color
				if (palette.classes[i].name == obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
									
			obj.getBlocks = function () { // overwrite the getPix function
			
				try {
					if (typeof(this.anim) == "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.getPix(): getPix() requires an anim json object.");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				switch (this.anim_state) {
					
					case "stop":
						var a = this.anim[this.anim_frame];
					break;
					
					case "play":

						if (typeof(this.anim[this.anim_frame]) != 'undefined') {
							
							a = this.anim[this.anim_frame];
									
							var duration = a.frm.duration; // get this frame's duration
														
							if (this.anim_frame_duration < duration) { // check if the frame's current duration is less than the total duration
								
								if (this.anim_frame_duration === 0) { // if this
									a = this.anim[this.anim_frame];
									if (typeof(a.frm.enter_frame) == "function") {
										a.frm.enter_frame.call(this);
									} // call enter frame
								} 
								
								this.anim_frame_duration++; // if yes, increment
								
							} else { // if no, call exitFrame() and advance frame	
	
							
								//a = this.anim[this.anim_frame];
								
								if (typeof(a.frm.exit_frame) == 'function') {
									a.frm.exit_frame.call(this);
								} // call exit frame
								
								this.anim_frame_duration = 0;
								this.anim_frame++;
								
								if (typeof(this.anim[this.anim_frame]) == 'undefined') { // if anim is complete 
									if (this.anim_loop) { // if anim should loop, reset anim_frame
										this.anim_frame = 0;
									} else {
										this.anim_frame--;
									}
								}
									
								a = this.anim[this.anim_frame];
			
							}
						
						}
						
					break;
			
				}

				if (typeof(a) != "undefined") { // always return frm regardless of state
					return a.frm;
				}
			};
			obj.start = function () {
				this.anim_state = "start";
			};
			obj.stop = function () {
				this.anim_state = "stop";
			};
			obj.goToAndPlay = function (arg) {
				try {
					if (typeof(arg) == "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.goToAndPlay(): goToAndPlay(arg) requires a frame number, label or keyword(nextFrame, lastFrame).");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				this.anim_frame_duration = 0;
				this.anim_frame = this.goToFrame(arg);
				this.anim_state = "play";
			};
			obj.goToAndStop = function (arg) {
				try {
					if (typeof(arg) == "undefined") {
						throw new Error("BigBlock.SpriteAdvanced.goToAndStop(): goToAndStop(arg) requires a frame number, label or keyword(nextFrame, lastFrame)");
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				this.anim_frame = this.goToFrame(arg);
				
				if (typeof(arg) == "number") {
					this.anim_frame_duration = 0;
				}

				this.anim_state = "stop";
			};	
								
			obj.goToFrame = function (arg) {
				try {
					if (typeof(arg) == "undefined") {
						throw new Error("BigBlock.Sprite.goToFrame(): goToFrame(arg, anim_frame, anim) requires a frame number, label or keyword(nextFrame, lastFrame)");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				var current_frame = this.anim_frame;
					
				switch (typeof(arg)) {
					case "number":
						try {
							if (arg - 1 < 0 || arg - 1 >= this.anim.length) {
								throw new Error("BigBlock.Sprite.goToFrame(): Frame number does not exist.");
							}
						} catch(er) {
							BigBlock.Log.display(er.name + ': ' + er.message);
						}
						this.anim_frame = arg-1;
						
						break;
						
					case "string":
					
						switch (arg) {
							case "next_frame":
								
								var frame = this.anim_frame;
								
								if (this.anim_loop === true) {								
									frame++;										
								} else {
									if (this.anim_frame + 1 < this.anim.length) {
										frame++;
									} else {
										// do not change frame
									}
								}
								this.anim_frame = frame;
								
								break;
							
							case "previous_frame":
							
								var frame = this.anim_frame;
							
								if (this.anim_loop === true) {
									frame--;
								} else {
									if (this.anim_frame - 1 >= 0) {
										frame--;
									} else {
										// do not change frame
									}
								}
								this.anim_frame = frame;
								
								break;
							
							default: // search for index of frame label
								this.anim_frame = this.getFrameIndexByLabel(arg);
								break;
						}
					
					break;			
				}
				
				if (typeof(this.anim[this.anim_frame]) == "undefined") { // allows animation to loop using next/previous if anim_loop = true
					if (this.anim_frame > 0) {
						this.anim_frame = 0;
					} else {
						this.anim_frame = this.anim.length - 1;
					}
				}
				
				// check for exit frame
				if (current_frame != this.anim_frame) {
					
					// check for exit frame
					if (typeof(this.anim[current_frame].frm.exit_frame) != "undefined" && typeof(this.anim[current_frame].frm.exit_frame) == "function") {
						this.anim[current_frame].frm.exit_frame.call(this);
					}				
				
					// check for enter frame
					if (typeof(this.anim[this.anim_frame].frm.enter_frame) != "undefined" && typeof(this.anim[this.anim_frame].frm.enter_frame) == "function") {
						this.anim[this.anim_frame].frm.enter_frame.call(this);
					}
				
				}
				
				return this.anim_frame;
			};
			
			obj.getFrameIndexByLabel = function (arg) {
				try {
					if (typeof(arg) == "undefined") {
						throw new Error("BigBlock.Sprite.getFrameIndexByLabel(): getFrameIndexByLabel(arg) requires a label");
					}			
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
						
				var error = 0;
				for (var i in this.anim) {
					if (this.anim.hasOwnProperty(i)) {
						if (arg == this.anim[i].frm.label) {
							return i;
						}
						error++;
					}
				}
				
				try {
					if (error !== 0) {
						throw new Error("BigBlock.Sprite.getFrameIndexByLabel(): Frame label does not exist.");
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
				}
		
			};			

			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
		}
	};

})();