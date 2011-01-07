/**
 * Tap Timeout object
 * Use to trigger a visual cue after a specified time interval.
 * 
 * @author Vince Allen 05-29-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.TapTimeout = (function () {
	
	return {
		
		timeout_length : 1000,
		timeout_obj : false,
		arrow_direction : 'up',
		x : BigBlock.Grid.width/2 - (BigBlock.Grid.blk_dim),
		y : BigBlock.Grid.height - (BigBlock.Grid.blk_dim * 2),
		className : 'grey',
		font : 'bigblock_bold',
		glass : false,
		
		start: function (params) {
			
			if (typeof(BigBlock.CharPresets.getChar) != "undefined") { // do not create timeout if fonts have not been installed
			
				if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
					for (var i in params) {
						if (params.hasOwnProperty(i)) {
							this[i] = params[i];
						}
					}
				}
				
				this.timeout_obj = setTimeout(function () {
						BigBlock.TapTimeout.display();
				}, this.timeout_length);
				
			}
			
		},
		
		display : function () {
			
			BigBlock.WordSimple.create({
				word_id : 'tap_timeout_word_tap',
				x : this.x,
				y : this.y,
				value : "tap",
				className : this.className,
				font : this.font,
				glass : this.glass
			});
			
			switch (this.arrow_direction) {

				case 'left':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x - (BigBlock.Grid.blk_dim * 1),
						y : this.y,
						value : "arrow_left",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;
				
				case 'right':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + (BigBlock.Grid.blk_dim * 3),
						y : this.y,
						value : "arrow_right",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;

				case 'down':
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + BigBlock.Grid.blk_dim,
						y : this.y + (BigBlock.Grid.blk_dim * 1),
						value : "arrow_down",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;
																
				default:
					BigBlock.WordSimple.create({
						word_id : 'tap_timeout_arrow',
						x : this.x + BigBlock.Grid.blk_dim,
						y : this.y - (BigBlock.Grid.blk_dim * 1),
						value : "arrow_up",
						className : this.className,
						font : this.font,
						glass : this.glass
					});
				break;	
				

			}
		},

		stop : function () {
			
			clearTimeout(this.timeout_obj);
						
			if (typeof(BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_word_tap')]) != 'undefined') {
				if (typeof(BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_word_tap')].remove) != 'undefined') {
					BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_word_tap')].remove();
				}
			}
			if (typeof(BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_arrow')]) != 'undefined') {
				if (typeof(BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_arrow')].remove) != 'undefined') {
					BigBlock.Blocks[BigBlock.getBlkIndexByWordId('tap_timeout_arrow')].remove();
				}
			}
		},

		setProps : function (params) {
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
		},
				
		destroy : function () {
			this.stop();
			delete BigBlock.TapTimeout;
		}
			
	};
	
})();