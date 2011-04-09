/*global BigBlock */
/**
 Character
 A single character object w no animation.
  
 @author Vince Allen 05-10-2010
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC 
  
 */

BigBlock.Character = (function () {
	
	return {
		
		/**
		 * Clones the Character objects. Runs configure(). Overrides any Character properties with passed properties. Adds this object to the Blocks array.
		 * 
		 * @param {Object} params
		 */
		create: function (params) {
			var i,
				max,
				pal,
				F = BigBlock.Utils.clone(BigBlock.Block),  // CLONE Block
				obj = new F;
			
			obj.configure(); // run configure() to inherit Block properties
									
			if (typeof(params) !== "undefined") { // loop thru passed params to override above defaults
				for (i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			obj.className = "Character"; // force the className
						
			pal = BigBlock.Color.getPalette(); // Color
			for (i = 0, max = pal.classes.length; i < max; i++) { // get length of color palette for this color
				if (pal.classes[i].name === obj.color) {
					obj.color_max = pal.classes[i].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.color + "0"; // overwrite color_index w passed color

			obj.char_pos = BigBlock.CharPresets.getChar(obj.character, obj.font);
			
			obj.render_static = true;
			
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;

		}
	};
	
}());