/**
 * Behavior Library
 * Returns preset behaviors
 * 
 * @author Vince Allen 12-21-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.BehaviorPresets = (function() { // uses lazy instantiation; only instantiate if using a preset
  
	var u; // Private attribute that holds the single instance.

	function cnstr() { // All of the normal singleton code goes here.
		return {
			getPreset: function(name){

				switch (name) {

					case 'getRandomGraphic':
						
						/*
						 * Use to switch randomly bw an array of graphics saved as this.poses. Object must also have an idleTimeout property set to 0.
						 */
					
						return function () {
													
							if (this.idleTimeout == 0) {
								var alias = this.alias;
								this.idleTimeout = setTimeout(function(){
									var a = BigBlock.Blocks[BigBlock.getBlock(alias)];
									if (typeof(a) != 'undefined' && typeof(a.poses) != 'undefined') {
										a.goToAndStop(a.poses[Math.getRandomNumber(0, a.poses.length-1)]);
										a.idleTimeout = 0;
									}
								}, Math.getRandomNumber(500, 1000));
							}
							
						}

					
					case 'move_wallCollide':
					
						/*
						 * Block will rebound off walls defined by Grid. 
						 */
						
						return function(){
							
							var vx = (this.vel * BigBlock.Grid.blk_dim) * Math.cos(this.angle);
							var vy = (this.vel * BigBlock.Grid.blk_dim) * Math.sin(this.angle);
							if (this.x + vx > 0 && this.x + vx < BigBlock.Grid.width) {
								this.x = this.x + vx;
							}
							else {
								this.vel *= 1.5;
								this.angle += Math.degreesToRadians(180);
							}
							
							if (this.y + vy > 0 && this.y + vy < BigBlock.Grid.height) {
								this.y = this.y + vy;
							}
							else {
								this.vel *= 1.5;
								this.angle += Math.degreesToRadians(180);
							}
							
							if (Math.floor(this.vel--) > 0) { // decelerate
								this.vel--;
							}
							else {
								this.vel = 0;
							}
						};
					
					
					case 'move':
						return function(){
							this.x += BigBlock.Grid.blk_dim;
						};
						
						

					
				}				
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