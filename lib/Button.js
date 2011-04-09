/*global BigBlock */
/**
 Button object
 Creates clickable groups of blocks that carry functions to execute on events. Buttons must be static.
 Creates a BlockAnim (render_static = true) while also populating a "map" property with x, y, width, height, and a function to run when clicked/touched.
 Width and Height of the button graphic must be supplied.
 Can also create hot spots without a graphic as long as x, y, width, height are passed and anim = 
 Rollovers currently not supported; 
  
 @author Vince Allen 01-06-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */

BigBlock.Button = (function () {
		
	return {
		
		alias: 'button',
		map: [],
		/**
		 * Creates a BlockAnim (render_static = true) while also populating a "map" property with x, y, width, height, and a function to run when clicked/touched.
		 * 
		 * @param {Object} key
		 */				
		create: function (params) {
			
			try {
				if (typeof params === "undefined") {
					throw new Error("Button.create(): params argument required");
				}
				if (typeof params.x === "undefined") {
					throw new Error("Button.create(): params.x argument required");
				}
				if (typeof params.y === "undefined") {
					throw new Error("Button.create(): params.y argument required");
				}
				if (typeof params.width === "undefined") {
					throw new Error("Button.create(): params.width argument required");
				}
				if (typeof params.height === "undefined") {
					throw new Error("Button.create(): params.height argument required");
				}				
				if (typeof params.alias === "undefined") {
					params.alias = "button"+BigBlock.Utils.getUniqueId(); // assign unique id if alias is not passed
				}
				if (typeof params.action_input === "undefined") {
					params.action_input = false; // force an empty function if action_input is not passed
				}																																		
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
			this.map[this.map.length] = { // add coords to map
				alias: params.alias,
				x: params.x,
				y: params.y,
				width: params.width,
				height: params.height,
				url: params.url,
				action_input: params.action_input
			};
			
			params.render_static = true; // force static
			params.className = "Button"; // force className
			params.after_destroy = false;
			
			/*
			 * This version of the Button class forces buttons to be static.
			 * Future versions will allow active buttons with rollovers, active states, etc. Uncomment the following for use with active buttons.
			 */
			
			/*params.destroy = function () {
				if (typeof(callback) == 'function') { this.after_destroy = callback; }
				this.render = 0; // prevents render manager from rendering this object's blocks
				BigBlock.Timer.destroyObject(this);					
				BigBlock.removeStaticBlock(this.alias);	// remove static blocks associated with this object			
			};*/
			
			
			// if anim = "undefined", use width/height to draw button
			
			if (typeof params.anim === "undefined") {
				BigBlock.BlockBig.create(params); // create a BlockBig
			} else {				
				BigBlock.BlockAnim.create(params); // create a BlockAnim
			}
			
		},
		/**
		 * Removes an entry from Button.map. Typically used when removing buttons but not changing scenes.
		 * 
		 * @param {String} alias
		 */
		deleteFromMap: function (alias) {
			var i, max;
			for (i = 0, max = BigBlock.Button.map.length; i < max; i++) {
				if (BigBlock.Button.map[i].alias === alias) {
					BigBlock.Button.map.splice(i,1);
					return true;
				}
			}
			return false;			
		},
		destroy: function (alias) {
			this.deleteFromMap(alias);
			BigBlock.removeStaticBlock(alias);
		}
	};
	
}());