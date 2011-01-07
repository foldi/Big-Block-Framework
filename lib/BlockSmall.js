/**
 * BlockSmall object
 * A single block w no animation.
 * 
 * revisions:
 * 01-07-2011 - changed name from SpriteSimple to BlockSmall
 *  
 * @author Vince Allen 01-16-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.BlockSmall = (function () {
	
	return {
		
		create: function (params) {
			var sprite = BigBlock.clone(BigBlock.Block);  // CLONE Block
			sprite.configure(); // run configure() to inherit Block properties
										
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
			
			sprite.color_index = sprite.className + '0'; // overwrite color_index w passed className
			
			sprite.anim = sprite.getAnim(sprite.color_index); // get new anim w overwritten color_index
			
			BigBlock.Blocks[BigBlock.Blocks.length] = sprite;
			
		}
	};
	
})();