/**
 * Emitter
 * The Emitter object creates new Particle objects based on properites passed on Sprite.add().
 * Particles are single pixels with no animation.
 * 
 * @author Vince Allen 12-05-2009
 */
/*global BigBlock, document */
BigBlock.Emitter = (function () {
	
	var getTransformVariants = function (x, y, p_life, p_life_spread, p_velocity, p_velocity_spread, p_angle_spread, p_init_pos_spread_x, p_life_offset_x, p_init_pos_spread_y, p_life_offset_y) {
		
		var vars = {};
		
		var val = Math.ceil(Math.random() * ((100 - (p_life_spread * 100)) + 1)); // life spread
		vars.life = Math.ceil(p_life * ((100 - val) / 100));
							
		val = Math.ceil(Math.random() * ((100 - (p_velocity_spread * 100)) + 1)); // velocity spread
		vars.vel = p_velocity * ((100 - val) / 100);
																
		var dir = [1, -1];
		
		var d = dir[Math.getRamdomNumber(0,1)];
		vars.angle_var = Math.ceil(Math.random() * (p_angle_spread + 1)) * d; // angle spread
		
		var x_d = dir[Math.getRamdomNumber(0,1)];
		var adjusted_x = 0;
		if (p_init_pos_spread_x !== 0) {
			adjusted_x = Math.ceil(Math.random() * (p_init_pos_spread_x * BigBlock.Grid.pix_dim)) * x_d; // init pos spread_x	
		}
		
		var per;
		if (p_life_offset_x == 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_x)/(p_init_pos_spread_x * BigBlock.Grid.pix_dim);
			
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}
		
		var y_d = dir[Math.getRamdomNumber(0,1)];
		var adjusted_y = Math.floor(Math.random() * (p_init_pos_spread_y * BigBlock.Grid.pix_dim)) * y_d; // init pos spread_y
		
		if (p_life_offset_y == 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_y)/(p_init_pos_spread_y * BigBlock.Grid.pix_dim);
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}					
		
		vars.x = x + adjusted_x;
		vars.y = y + adjusted_y;					
		
		return vars;
	};
			
	return {
		
		create: function (params) {
			var emitter = BigBlock.clone(BigBlock.Sprite);  // CLONE Sprite
			emitter.configure(); // run configure() to inherit Sprite properties

			// Default emitter properties
			
			emitter.x = BigBlock.Grid.width/2;
			emitter.y = BigBlock.Grid.height/2 + BigBlock.Grid.height/3;
				
			emitter.alias = 'emitter';
			
			emitter.emission_rate = 3; // values closer to 1 equal more frequent emissions
			
			emitter.p_count = 0; // tracks total particles created
			
			emitter.p_burst = 3;

			emitter.p_velocity = 3;
			emitter.p_velocity_spread = 1; // values closer to zero create more variability
			emitter.p_angle = 270;
			emitter.p_angle_spread = 20;
			emitter.p_life = 100;
			emitter.p_life_spread = 0.5; // values closer to zero create more variability
			emitter.p_life_offset_x = 0; // boolean 0 = no offset; 1 = offset
			emitter.p_life_offset_y = 0;	 // boolean 0 = no offset; 1 = offset		
			emitter.p_gravity = 0;
			emitter.p_init_pos_spread_x = 0;
			emitter.p_init_pos_spread_y = 0;
			emitter.p_spiral_vel_x = 0;
			emitter.p_spiral_vel_y = 0;
			
			emitter.action = function () {};
																
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						emitter[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
				if (palette.classes[i].name == emitter.className) {
					emitter.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
							
			emitter.anim = [
				{'frm':
					{
						'duration' : 1,
						'pix' : []	
					}
				}		
			];
							
				
			
			emitter.run = function () {

				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						if (this.clock % this.emission_rate === 0) {
							this.state = 'emit';
						}
						this.action.call(this);
					break;
					case 'emit':
						
						for (var i = 0; i < this.p_burst; i++) {
							
							var vars = getTransformVariants(this.x, this.y, this.p_life, this.p_life_spread, this.p_velocity, this.p_velocity_spread, this.p_angle_spread, this.p_init_pos_spread_x, this.p_life_offset_x, this.p_init_pos_spread_y, this.p_life_offset_y);
									
							var p_params = {
								alias: 'particle',
								className : this.className, // particles inherit the emitter's class name
								x: vars.x,
								y: vars.y,
								life : vars.life,
								gravity: this.p_gravity,
								angle: Math.degreesToRadians(this.p_angle + vars.angle_var),
								vel: vars.vel,
								color_max : this.color_max,
								p_spiral_vel_x : this.p_spiral_vel_x,
								p_spiral_vel_y : this.p_spiral_vel_y										
							};
							
							BigBlock.Particle.create(p_params);

							this.p_count++;

						}
						this.state = 'start';
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
			emitter.getPix = function (anim) {
				return [
						{'frm':
							{
								'duration' : 1,
								'pix' : [
											{'c':'particle','i':0}
								]	
							}								
						}
					];
			};
			emitter.start = function () {
				this.state = 'start';
			};
			emitter.stop = function () {
				this.state = 'stop';
			};						
			
			BigBlock.Sprites[BigBlock.Sprites.length] = emitter;

		}
	};
	
})();