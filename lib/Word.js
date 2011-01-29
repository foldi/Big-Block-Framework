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
BigBlock.Word = (function () {
	
	return {
		create: function (params) {
			var F = BigBlock.clone(BigBlock.Block);  // CLONE Block
			var obj = new F;
			
			obj.configure(); // run configure() to inherit Block properties
						
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var j in params) {
					if (params.hasOwnProperty(j)) {
						obj[j] = params[j];
					}
				}
			}
			
			var palette = BigBlock.Color.getPalette(); // Color
			for (var i = 0; i < palette.classes.length; i++) { // get length of color palette for this color
				if (palette.classes[i].name == obj.color) {
					obj.color_max = palette.classes[i].val.length-1;
					break;
				}
			}
			
			obj.className = "Word"; // force the className
			obj.render = 0; // force render = 0; Words are references to Chars; they should not be rendered
			
			// check to center text
			if (obj.center) {
				var word_width = obj.word.length * BigBlock.Grid.blk_dim;
				obj.x = BigBlock.Grid.width/2 - word_width/2;
			}
			
			obj.destroy = function (callback) {// overwrite the Block's destroy function; include function to remove associated Chars from the Text Grid
				
				// check if this obj is a Word; if so, destroy the associated Chars				
				var word_id = this.alias;
				var quads = BigBlock.GridText.quads;
			
				for (var i = 0; i < quads.length; i++) {

					var q = document.getElementById(quads[i].id);
					
					if (q.hasChildNodes()) {
						
						var nodes = q.childNodes; // get a collection of all children in BigBlock.GridText.id;
	
						var tmp = [];
						
						// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
						 
						for(var x = 0; x < nodes.length; x++) { // make copy of DOM collection
							tmp[tmp.length] = nodes[x]; 
						}
	
						for (var j = 0; j < tmp.length; j++) { // loop thru children
							var id = tmp[j].getAttribute('name');
							if (id == word_id) {
								q.removeChild(tmp[j]);
							}
						}
						
					}
			
				}
				
				if (typeof(callback) == 'function') { this.after_destroy = callback; }
				this.render = 0; // prevents render manager from receiving this object's blocks
				BigBlock.Timer.destroyObject(this);	
			
			};
							
			/* IMPORTANT: 
			 * Need to add word to Blocks object so we have a reference to its characters when we need to remove them.
			 */
			BigBlock.Blocks[obj.alias] = obj;
			BigBlock.BlocksKeys[BigBlock.BlocksKeys.length] = obj.alias;
			
			try {
				if (typeof(BigBlock.CharPresets.getChar) == 'undefined') {
					throw new Error("BigBlock.Word.create(): BigBlock.CharPresets = BigBlock.CharPresets.install() must be run before creating Words.");
				} else {
								
					if (BigBlock.CharPresets.getChar(obj.word)) { // if the value of this word matches a preset in the character library, use a predefined character like 'arrow_up'
		
						BigBlock.Char.create({
							word_id : obj.alias, // pass the word's alias to the characters
							char: obj.word,
							x : obj.x,
							y : obj.y,
							color : obj.color,
							font : obj.font,
							glass : obj.glass
						});			
										
					} else {
						
						var s = new String(obj.word); // convert property (obj.word) into Object; faster than iterating over the property
						
						for (i=0;i<s.length;i++) { // use a standard for loop to iterate over a string
						
							BigBlock.Char.create({
								word_id : obj.alias, // pass the word's alias to the characters
								char: s.substr(i,1),
								x : obj.x + (i * BigBlock.Grid.blk_dim),
								y : obj.y,
								color : obj.color,
								font : obj.font,
								glass : obj.glass
							});									
						}										
					}
						
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
		}
	};
	
})();