/**
 * Word
 * A generic object that carries core word properties. All words appearing in a scene should inherit from the Word object.
 * 
 * @author Vince Allen 05-11-2010
 */

BigBlock.Word = (function () {
						
	return {
		configure: function(){
			this.alias = 'Word';
			this.word_id = 'word1';
			this.x = BigBlock.Grid.width/2;
			this.y = BigBlock.Grid.height/2;
			this.state = 'run';
			this.value = 'BIG BLOCK'; // the default character to render
			this.url = false;
			this.link_color = false;
			this.center = false; // set = true to center text			
			this.className = 'white'; // color
			this.afterDie = null;
			this.render = 0;
			this.render_static = true;
			this.index = BigBlock.Sprites.length; // the position of this object in the Sprite array
		},
		die : function (callback) { // use remove() to kill Words; !! need to change back to using this function
										
			
			
		},
		remove : function (callback) { // removes div from dom; the corresponding character objects have already been removed from the Sprites array
	
			var word_id = this.word_id;
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
			
			if (typeof(callback) == 'function') { this.afterDie = callback; }
			
			// remove the word
			this.render_static = false;
			BigBlock.Timer.killObject(this);
			
			// remove the click target divs
			// these are Sprites in the GridActive
			for (i = 0; i < BigBlock.Sprites.length; i++) {
				if (BigBlock.Sprites[i].word_id == word_id) {
					BigBlock.Timer.killObject(BigBlock.Sprites[i]);
				}
 			}
						
		}
	};
	
})();