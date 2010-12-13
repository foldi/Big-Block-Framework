/**
 * Particle
 * Created by Emitters; the Emitter sets the intial properties and passes them to particles. They also inherit Sprite props.
 * 
 * @author Vince Allen 12-05-2009
 */

/*global Sprite, Grid, killObject */
BigBlock.Particle = (function () {

	var getTransform = function (vel, angle, x, y, gravity, clock, life, className, color_max, particle_spiral_vel_x, particle_spiral_vel_y) {
		var trans = {};									
		
		var spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_x * BigBlock.Grid.pix_dim));	
		var vx = (vel*BigBlock.Grid.pix_dim) * Math.cos(angle) + spiral_offset; // calculate how far obj should move on x,y axis

		spiral_offset = Math.round(Math.cos(clock) * (particle_spiral_vel_y * BigBlock.Grid.pix_dim));
		var vy = (vel*BigBlock.Grid.pix_dim) * Math.sin(angle) + spiral_offset;
		
		// uncomment to disregard spiral offset
		//var vx = (vel*BigBlock.Grid.pix_dim) * Math.cos(angle);
		//var vy = (vel*BigBlock.Grid.pix_dim) * Math.sin(angle);
		
		if (x + vx >= BigBlock.Grid.width) {
			//killObject(this); // !! 'this' is problematic here; created from a function invoked by call(); kills the obj invoking call()
		} else {
			trans.x = x + vx;
			trans.y = y + vy + (gravity*BigBlock.Grid.pix_dim);
		}
		
		var p = clock/life;
		trans.color_index = className + Math.round(color_max*p);
		return trans;
	};
			
	return {
		create: function(params){
			var particle = BigBlock.clone(BigBlock.Sprite); // CLONE Sprite
			particle.configure(); // run configure() to inherit Sprite properties
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						particle[i] = params[i];
					}
				}
			}
			
			particle.color_index = particle.className + '0'; // overwrite color_index w passed className
			
			particle.anim = [
					{'frm':
						{
							'duration' : 1,
							'pix' : [
										{'c':this.color_index,'i':0}
									]	
						}
					}		
				];
									
			particle.run = function () {

				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						
						var trans = getTransform(this.vel, this.angle, this.x, this.y, this.gravity, this.clock, this.life, this.className, this.color_max, this.p_spiral_vel_x, this.p_spiral_vel_y);
						this.x = trans.x;
						this.y = trans.y;
						this.color_index = trans.color_index;
						this.gravity *= 1.08;
															
					break;
					case 'dead':
					break;			
				}						
				this.pix_index = BigBlock.getPixIndex(this.x, this.y); // get new pixel index to render
						
				this.img = this.getPix(this.anim, this.color_index); // get pixels
					
				if (this.clock++ >= this.life && this.life !== 0 && this.state != 'dead') {
					BigBlock.Timer.killObject(this);
				} else {
					this.clock++; // increment lifecycle clock
				}
				
			};
			particle.stop = function () {
				this.state = 'stop';
			};						

			BigBlock.Sprites[BigBlock.Sprites.length] = particle;
			
		}
		
		
	};
	
})();