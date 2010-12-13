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
				this.anim_frame_duration = 0;
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