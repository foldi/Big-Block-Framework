/**
 * Background object
 * Builds a background image out of divs described in a passed array of json objects.
 * 
 * @author Vince Allen 07-12-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
 
BigBlock.Background = (function () {
	
	return {
		
		alias : 'bg',
		busy : false,
		/**
		 * Adds the Background image to the scene.
		 * 
		 * @param {Object} bg_pix
		 */		
		add: function(bg_pix, beforeAdd, afterAdd){
			
			try{
				if (typeof(bg_pix) != 'object') {
					throw new Error("Err: BA001");
				} else {
					
					this.busy = true;
					
					if (typeof(beforeAdd) == 'function') { 
						beforeAdd();
					}
										
					for (var i = 0; i < bg_pix.length; i++) {
						BigBlock.BlockAnim.create({
							alias: this.alias,
							x: 0,
							y: 0,
							life: 0,
							render_static: true,
							anim_state: 'stop',
							anim_loop: false,
							anim: [{
								'frm': {
									'duration': 3,
									'pix': [bg_pix[i]],
									'label': '1'
								}
							}]
						
						});
					}	
					
					this.busy = false;
					
					if (typeof(afterAdd) == 'function') { 
						afterAdd();
					}				
					
				}
				

			
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Replaces the Background image. Pass a function to run after replacement.
		 * 
		 * @param {Object} bg_pix
		 * @param {Object} callback
		 */		
		replace: function (bg_pix, callback) {
			BigBlock.Background.remove();
			BigBlock.Background.add(bg_pix);
			
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Removes the Background. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */		
		remove : function (callback) {
			
			for (var i = 0; i < BigBlock.GridStatic.quads.length; i++) {

				var gs = document.getElementById(BigBlock.GridStatic.quads[i].id);
				
				if (gs.hasChildNodes()) {
					
					var nodes = gs.childNodes; // get a collection of all children in BigBlock.GridStatic.id;
				
					var tmp = [];
					
					// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 
					for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}					
					
					for (var j = 0; j < tmp.length; j++) { // loop thru children
						if (this.alias == tmp[j].getAttribute('alias')) {
							gs.removeChild(tmp[j]); // remove from DOM
						}
					}
					
					tmp = null;
					
				}
	
			}
			
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Overrides defaults properties before Header is created.
		 * 
		 * @param {Object} params
		 */		
		setProps : function (params) {
			if (typeof(params) != 'undefined') {
				for (var key in params) {
					if (params.hasOwnProperty(key)) {
						this[key] = params[key];
					}
				}
			}
		},
		/**
		 * Allows setting specific styles after Background has been created and body styles have been set.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setBodyStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: BSBS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: BSBS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var b = document.getElementsByTagName('body').item(0);						
			b.style[key] = value;			
		}
		
	};
	
})();