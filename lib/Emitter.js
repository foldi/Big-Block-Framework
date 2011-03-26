/*global BigBlock */
/**
 Emitter
 The Emitter object creates new Particle objects based on properites passed on Block.add().
 Particles are single pixels with no animation.
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.Emitter = (function () {
	
	var getTransformVariants = function (x, y, p_life, p_life_spread, p_velocity, p_velocity_spread, p_angle_spread, p_init_pos_spread_x, p_life_offset_x, p_init_pos_spread_y, p_life_offset_y) {
		
		var vars = {};
		
		var val = Math.ceil(Math.random() * ((100 - (p_life_spread * 100)) + 1)); // life spread
		vars.life = Math.ceil(p_life * ((100 - val) / 100));
							
		val = Math.ceil(Math.random() * ((100 - (p_velocity_spread * 100)) + 1)); // velocity spread
		vars.vel = p_velocity * ((100 - val) / 100);
																
		var dir = [1, -1];
		
		var d = dir[Math.getRandomNumber(0,1)];
		vars.angle_var = Math.ceil(Math.random() * (p_angle_spread + 1)) * d; // angle spread
		
		var x_d = dir[Math.getRandomNumber(0,1)];
		var adjusted_x = 0;
		if (p_init_pos_spread_x !== 0) {
			adjusted_x = Math.ceil(Math.random() * (p_init_pos_spread_x * BigBlock.Grid.blk_dim)) * x_d; // init pos spread_x	
		}
		
		var per;
		if (p_life_offset_x === 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_x)/(p_init_pos_spread_x * BigBlock.Grid.blk_dim);
			
			if (Math.ceil(vars.life * (1-per)) > 0) {
				vars.life = Math.ceil(vars.life * (1-per));
			} else {
				vars.life = 1;
			}
		}
		
		var y_d = dir[Math.getRandomNumber(0,1)];
		var adjusted_y = Math.floor(Math.random() * (p_init_pos_spread_y * BigBlock.Grid.blk_dim)) * y_d; // init pos spread_y
		
		if (p_life_offset_y === 1) { // reduce life based on distance from Emitter location
			per = Math.abs(adjusted_y)/(p_init_pos_spread_y * BigBlock.Grid.blk_dim);
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
			var i,
				max,
				F = BigBlock.clone(BigBlock.Block),  // CLONE Word
				obj = new F;
			
			obj.configure(); // run configure() to inherit Word properties

			//delete F.prototype.configure; // delete configure from the protoype

			// Default emitter properties
			
			obj.x = BigBlock.Grid.width/2;
			obj.y = BigBlock.Grid.height/2 + BigBlock.Grid.height/3;
			
			obj.state = "start";
				
			obj.render = 0;
			
			obj.emission_rate = 3; // values closer to 1 equal more frequent emissions
			
			obj.p_count = 0; // tracks total particles created
			
			obj.p_burst = 3;

			obj.p_velocity = 3;
			obj.p_velocity_spread = 1; // values closer to zero create more variability
			obj.p_angle = 270;
			obj.p_angle_spread = 20;
			obj.p_life = 100;
			obj.p_life_spread = 0.5; // values closer to zero create more variability
			obj.p_life_offset_x = 0; // boolean 0 = no offset; 1 = offset
			obj.p_life_offset_y = 0;	 // boolean 0 = no offset; 1 = offset		
			obj.p_gravity = 0;
			obj.p_init_pos_spread_x = 0;
			obj.p_init_pos_spread_y = 0;
			obj.p_spiral_vel_x = 0;
			obj.p_spiral_vel_y = 0;
			
			obj.action_render = function () {};
																
			if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = palette.classes.length; i < max; i++) { // get length of color palette for this color
				if (palette.classes[i].name === obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
							
			obj.action_render = function () {
				var i;
				switch (this.state) {
					case 'stop':
					break;
					case 'start':
						if (this.clock % this.emission_rate === 0) {
							this.state = 'emit';
						}						
					break;
					case 'emit':
						
						var vars, action_render;
						
						action_render = function () {
							
							var trans = BigBlock.getParticleTransform(this.vel, this.angle, this.x, this.y, this.gravity, this.clock, this.life, this.color, this.color_max, this.p_spiral_vel_x, this.p_spiral_vel_y);
							
							this.x = trans.x;
							this.y = trans.y;
							this.color_index = trans.color_index;
							this.gravity *= 1.08;									
																
						};
						
						for (i = 0; i < this.p_burst; i++) {
							
							vars = getTransformVariants(this.x, this.y, this.p_life, this.p_life_spread, this.p_velocity, this.p_velocity_spread, this.p_angle_spread, this.p_init_pos_spread_x, this.p_life_offset_x, this.p_init_pos_spread_y, this.p_life_offset_y);
							
							BigBlock.BlockSmall.create({
								color : this.color, // particles inherit the emitter's color
								x: vars.x,
								y: vars.y,
								life : vars.life,
								gravity: this.p_gravity,
								angle: Math.degreesToRadians(this.p_angle + vars.angle_var),
								vel: vars.vel,
								color_max : this.color_max,
								p_spiral_vel_x : this.p_spiral_vel_x,
								p_spiral_vel_y : this.p_spiral_vel_y,
								action_render : action_render								
							});

							this.p_count++;

						}
						this.state = 'start';
					break;			
				}						
				
			};
			obj.start = function () {
				this.state = 'start';
			};
			obj.stop = function () {
				this.state = 'stop';
			};						
			
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;

		}
	};
	
}());