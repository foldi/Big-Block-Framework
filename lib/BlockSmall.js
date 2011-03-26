/*global BigBlock */
/**
 BlockSmall object
 A single block w no animation.
  
 revisions:
 01-07-2011 - changed name from SpriteSimple to BlockSmall
   
 @author Vince Allen 01-16-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.BlockSmall = (function () {
	
	return {
		
		create: function (params) {
			
			var i,
				F = BigBlock.clone(BigBlock.Block),  // CLONE Block
				obj = new F,
				max;
			
			obj.configure(); // run configure() to inherit Block properties
						
			if (typeof params !== 'undefined') { // loop thru passed params to override above defaults
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
			
			obj.color_index = obj.color + '0'; // overwrite color_index w passed color

			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
		}
	};
	
}());