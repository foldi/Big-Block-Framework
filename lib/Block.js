/**
 * Block
 * A generic object that carries core Block properties. All sprites appearing in a scene should inherit from the Block object.
 * 
 * IMPORTANT: BlockAnim's should not carry action_inputs; if they do, only the top left block of the Block will trigger the action.
 * Instead, use Button class.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Block = (function () {	
					
	return {
		configure: function(){

			this.last_x = false;
			this.last_y = false;
			this.pix_index = false; // the grid index for this block based on this.x, this.y;
			this.clock = 0;
			this.color_index = this.color + '0';
			this.color_max = 0;
			this.anim = false; // BlockSmall has no anim property; other Block types set their anim property after running configure();
			this.anim_frame = 0;
			this.last_anim_frame = false;
			this.is_position_updated = true;
			this.is_anim_updated = false;
			this.className = "Block";
															
			// user configurable
			
			this.alias = BigBlock.getUniqueId();
			this.color = 'white'; // color
			this.x = 0;
			this.y = 0;
			
			this.render = -1; // set to positive number to eventually not render this object; value decrements in render()
			
			this.angle = Math.degreesToRadians(0);
			this.vel = 0;
			
			this.life = 0; // 0 = forever
			this.pulse_rate = 0; // controls the pulse speed
			
			this.after_destroy = false;
			
			/*
			 * STATIC Block
			 * if Block never moves, set = 1 to prevents unnecessary cleanup and increase performance
			 * to kill the Block, first set = 0, then call destroy()
			 * 
			 */
			
			this.render_static = false;  
			
			//
			
			this.action_render = false;
			this.action_input = false; // called by the mouseup and touchstart methods of ScreenEvent; use for links on Words or to trigger actions on BlockSmalls; do not use on BlockAnims, instead, use Button	
			
		},
		getAnim_delete : function (color_index) {
			
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
		getBlocks : function () {
			
			var a = this.anim[0];
			if (typeof(a.frm.pix[0]) !== "undefined") {
				a.frm.pix[0].c = this.color_index; // change to this.color_index
			}
			return a.frm;
		},					
		run : function () {
				
			if (typeof(this.action_render) === "function") { // call action_render if it exists
				this.action_render(this); 
			}
			
			// GET POSITION
			
			if (this.last_x === this.x && this.last_y === this.y) { // compare last position to current; if they are equal do not run BigBlock.getPixIndex();
				this.is_position_updated = false;
			} else {
				
				this.pix_index = false;
				if (BigBlock.ptInsideRect(this.x, this.y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) {
					this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
				}
				
				this.last_x = this.x;
				this.last_y = this.y;
				
				this.is_position_updated = true;
			
			}
					
			// GET BLOCKS TO RENDER
			/*
			 * RenderMgr loops thru the img property to render blocks.
			 */
			if (this.anim === false) { // BlockSmall does not have an anim property
				this.img = false;
			} else {
				this.img = this.getBlocks(); // get pixels
			}
			
			if (this.last_anim_frame === this.anim_frame) { // check if animation frame has changed; if so, render functions will update divs
				this.is_anim_updated = false;
			} else {
				this.last_anim_frame = this.anim_frame;
				this.is_anim_updated = true;
			}
			
			this.is_color_updated = false;			
			if (this.life !== 0) {
				var p = this.clock / this.life;
				this.color_index = this.color + Math.round(this.color_max * p); // life adjusts color
				if (this.color_max > 0) {
					this.is_color_updated = true;
				}
			} else {
				if (this.pulse_rate !== 0) {
					this.color_index = this.color + (this.color_max - Math.round(this.color_max * (Math.abs(Math.cos(this.clock / this.pulse_rate))))); // will pulse thru the available colors in the class; pulse_rate controls the pulse speed
					if (this.color_max > 0) {
						this.is_color_updated = true;
					}
				} else {
					this.color_index = this.color + '0';
				}
				
			}
			
			this.clock++;
				
			if (this.clock >= this.life && this.life !== 0) { // destroy this Block if its clock is greater than its life property
				this.destroy();			
			}
			
		},
		destroy : function (callback) {
			if (typeof(callback) === 'function') { this.after_destroy = callback; }
			this.render = 0; // prevents render manager from receiving this object's blocks
			BigBlock.Timer.destroyObject(this);		
		}			
	};
	
})();