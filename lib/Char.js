/**
 * Char
 * A generic object that carries core text charcter properties. All text characters appearing in a scene should inherit from the Char object.
 * Chars make Words.
 * 
 * @author Vince Allen 05-10-2010
 */

BigBlock.Char = (function () {
						
	return {
		/**
		 * Sets all properties.
		 */
		configure: function() {
			this.alias = 'Char';
			this.x = 80;
			this.y = 1;
			this.state = 'start';
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render; depends on this.x, this.y;
			
			this.value = 'B'; // the default character to render
			this.word_id = 'B'; // the id of the parent word; used to delete chars
			
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
			
			this.action = function () {};
			
			this.render_static = true;  
			
			this.afterDie = null;
			
			this.url = false;
			this.link_color = false;								
			
		},
		/**
		 * Returns the anim property.
		 *  
		 * @param {String} color_index
		 */
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
		/**
		 * Returns the current frame from the anim property. Sets the color to this.color_index.
		 * 
		 * @param {Object} anim
		 */
		getPix : function (anim) {
			
			var a = anim[0];
			if (typeof(a.frm.pix[0]) != 'undefined') {
				a.frm.pix[0].c = this.color_index; // change to this.color_index
			}
			return a.frm;
		},
		/**
		 * Called by Timer every each time screen is rendered.
		 */				
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
			this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
					
			this.img = this.getPix(this.anim); // get pixels
			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.className + Math.round(this.color_max * p); // life adjusts color
			} else {
				this.color_index = this.className + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock/this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
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
		/**
		 * Removes the Char from the Sprites array.
		 * 
		 * @param {Function} callback
		 */
		die : function (callback) {
			this.render_static = false;
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			BigBlock.Timer.killObject(this);
		},
		goToFrame : function (arg, anim_frame, anim) {
			return goToFrame(arg, anim_frame, anim);
		}							
	};
	
})();