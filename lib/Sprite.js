/**
 * Sprite
 * A generic object that carries core sprite properties. All sprites appearing in a scene should inherit from the Sprite object.
 * 
 * IMPORTANT: Advanced Sprites should not carry input_actions; if they do, only the top left block of the sprite will trigger the action.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.Sprite = (function () {
	
	function goToFrame (arg, anim_frame, anim) {
		try {
			if (typeof(arg) == 'undefined') {
				throw new Error('Err: SGTF001');
			}
			if (typeof(anim_frame) == 'undefined') {
				throw new Error('Err: SGTF002');
			}
			if (typeof(anim) == 'undefined') {
				throw new Error('Err: SGTF003');
			}						
		} catch(e) {
			BigBlock.Log.display(e.name + ': ' + e.message);
		}
				
		switch (typeof(arg)) {
			case 'number':
				try {
					if (arg - 1 < 0 || arg - 1 >= anim.length) {
						throw new Error('Err: SGTF004');
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
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
				throw new Error('Err: SGFIBL001');
			}
			if (typeof(anim) == 'undefined') {
				throw new Error('Err: SGFIBL002');
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
				throw new Error('Err: SGFIBL003');
			}
		} catch(er) {
			BigBlock.Log.display(er.name + ': ' + er.message);
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
			
			/*
			 * STATIC SPRITES
			 * if sprite never moves, set = 1 to prevents unneccessary cleanup and increase performance
			 * to kill the sprite, first set = 0, then call die()
			 * 
			 */
			
			this.render_static = false;  
			
			//
			
			this.action = function () {};
			this.input_action = false; // called by the mouseup and touchstart methods of ScreenEvent; use for links on Words or to trigger actions on Simple Sprites; do not use on Advanced Sprites	
			
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

			if (this.x >= 0 && this.x < BigBlock.Grid.width && this.y >= 0 && this.y < BigBlock.Grid.height) {
				this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
			} else {
				this.pix_index = false;
			}
					
			this.img = this.getPix(this.anim, this.color_index); // get pixels
			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.className + Math.round(this.color_max * p); // life adjusts color
			} else {
				if (this.pulse_rate !== 0) {
					this.color_index = this.className + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock / this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
				} else {
					this.color_index = this.className + '0';
				}
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