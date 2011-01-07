/**
 * Simple Word object
 * Loops thru passed word and creates characters.
 * All words on on the same horizontal line.
 * 
 * @author Vince Allen 05-11-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.WordSimple = (function () {
	
	return {
		create: function (params) {
			var obj = BigBlock.clone(BigBlock.Word);  // CLONE Word
			
			obj.configure(); // run configure() to inherit Word properties
										
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var j in params) {
					if (params.hasOwnProperty(j)) {
						obj[j] = params[j];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var i = 0; i < palette.classes.length; i++) { // get length of color palette for this className
				if (palette.classes[i].name == obj.className) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			// check to center text
			if (obj.center) {
				var word_width = obj.value.length * BigBlock.Grid.blk_dim;
				obj.x = BigBlock.Grid.width/2 - word_width/2;
			}

			/* IMPORTANT: 
			 * Need to keep word in Blocks array so we have a reference to its characters when we need to remove them.
			 */
			BigBlock.Blocks[BigBlock.Blocks.length] = obj;
			
			try {
				if (typeof(BigBlock.CharPresets.getChar) == 'undefined') {
					throw new Error('Err: WSC001');
				} else {
										
					if (BigBlock.CharPresets.getChar(obj.value)) { // if the value of this word matches a preset in the character library, use a predefined character like 'arrow_up'
		
						BigBlock.CharSimple.create({
							word_id : obj.word_id, // pass the word id to the characters
							value: obj.value,
							x : obj.x,
							y : obj.y,
							life : obj.life,
							className : obj.className,
							url : obj.url,
							link_color : obj.link_color,
							font : obj.font,
							glass : obj.glass
						});
						
						if (obj.url !== false) {
							BigBlock.BlockSmall.create({
								x : obj.x + (i * BigBlock.Grid.blk_dim),
								y : obj.y,
								life : obj.life,
								className : false,
								action_input : function (event) {
									if (typeof(obj.url) == 'function') {
										obj.url(event);
									} else if (typeof(obj.url) == 'string') {
										window.open(obj.url, '');
									}										
								}
							});
						}						
										
					} else {
						
						var s = new String(obj.value); // convert Literal (obj.value) into Object; faster than iterating over the Literal
						
						for (i=0;i<s.length;i++) { // use a standard for loop to iterate over a string; Opera does not like using for..in
							BigBlock.CharSimple.create({
								word_id : obj.word_id, // pass the word id to the characters
								value: s.substr(i,1),
								x : obj.x + (i * BigBlock.Grid.blk_dim),
								y : obj.y,
								life : obj.life,
								className : obj.className,
								url : obj.url,
								link_color : obj.link_color,
								font : obj.font,
								glass : obj.glass
							});
							
							if (obj.url !== false) {
								BigBlock.BlockSmall.create({
									word_id : obj.word_id,
									x : obj.x + (i * BigBlock.Grid.blk_dim),
									y : obj.y,
									life : obj.life,
									className : false,
									action_input : function (event) {
										if (typeof(obj.url) == 'function') {
											obj.url(event);
										} else if (typeof(obj.url) == 'string') {
											window.open(obj.url, '');
										}									
									}
								});
							}										
						}										
					}
						
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
		}
	};
	
})();