/**
 * Simple Char object
 * A single character object w no animation.
 * 
 * @author Vince Allen 05-10-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC 
 * 
 */

BigBlock.CharSimple = (function () {
	
	return {
		
		/**
		 * Clones the Char objects. Runs configure(). Overrides any Char properties with passed properties. Adds this object to the Blocks array.
		 * 
		 * @param {Object} params
		 */
		create: function (params) {
			var obj = BigBlock.clone(BigBlock.Char);  // CLONE Char
			obj.configure(); // run configure() to inherit Char properties
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						obj[i] = params[i];
					}
				}
			}
			
			var pal = BigBlock.Color.getPalette(); // Color
			for (i = 0; i < pal.classes.length; i++) { // get length of color palette for this className
				if (pal.classes[i].name == obj.className) {
					obj.color_max = pal.classes[i].val.length-1;
					break;
				}
			}
			
			obj.color_index = obj.className + '0'; // overwrite color_index w passed className
			
			obj.anim = obj.getAnim(obj.color_index); // get new anim w overwritten color_index
		
			obj.char_pos = BigBlock.CharPresets.getChar(obj.value, obj.font);
			
			obj.render_static = true;
			
			BigBlock.Blocks[BigBlock.Blocks.length] = obj;

		}
	};
	
})();