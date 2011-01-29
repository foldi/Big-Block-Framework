/**
 * Emitter Library
 * Returns preset Emitters
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.EmitterPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name, params){
				var grid = BigBlock.Grid;
				var em = {};
				
				switch (name) {
				
					case 'fire':
						em = {
							color : 'fire',
							x: grid.width / 2,
							y: grid.height / 1.25,
							life: 0,
							emission_rate: 1,
							//
							p_burst: 16,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 270,
							p_angle_spread: 0,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0
			
						};
					break;
					
					case 'spark':
						em = {
							color : 'fire',
							x: grid.width / 2,
							y: grid.height / 1.25,
							life: 0,
							emission_rate: 50,
							//
							p_burst: 1,
							p_velocity: 1.5,
							p_velocity_spread: 1, // values closer to zero create more variability
							p_angle: 270,
							p_angle_spread: 0,
							p_life: 25,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 1,
							p_spiral_vel_y : 0
			
						};
					break;

					case 'speak':
						em = {
							color : 'speak',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .75, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 15,
							p_life: 12,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 0, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 0,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0	
						};
					break;		
					
					case 'trail_red':
						em = {
							color : 'red_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0						
						};
					break;
					
					case 'trail_white':
						em = {
							color : 'white_black',
							x: grid.width / 2,
							y: grid.height / 2,
							life: 10,
							emission_rate: 10,
							//
							p_burst: 3,
							p_velocity: 1.5,
							p_velocity_spread: .1, // values closer to zero create more variability
							p_angle: 0,
							p_angle_spread: 10,
							p_life: 17,
							p_life_spread: 1, // values closer to zero create more variability
							p_life_offset_x : 1, // boolean 0 = no offset; 1 = offset
							p_life_offset_y : 0,	// boolean 0 = no offset; 1 = offset
							p_gravity: 0,
							p_init_pos_spread_x: 4,
							p_init_pos_spread_y: 0,
							p_spiral_vel_x : 0,
							p_spiral_vel_y : 0						
						};
					break;
							
					default:
						try {		
							throw new Error("BigBlock.EmitterPresets.getPreset(): BigBlock.EmitterPresets: preset does not exist.");
						} catch(e) {
							BigBlock.Log.display(e.name + ': ' + e.message);
						}
					break;					
				}
				
				// Params
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
						if (params.hasOwnProperty(i)) {
							em[i] = params[i];
						}
					}
				}
				
				return em;				
			}
		};
	}

	return {
		install: function() {
			if(!u) { // Instantiate only if the instance doesn't exist.
				u = cnstr();
			}
			return u;
		}
	};
})();