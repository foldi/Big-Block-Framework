/**
 * Footer object
 * Adds a div below the active area that's visible in iPhone full screen mode and Android default mode.
 * 
 * @author Vince Allen 07-21-2010
 */
BigBlock.Footer = (function () {
	
	return {
		
		alias : 'app_footer',
		width : 320,
		height : 56,
		styles : {
			'zIndex' : -1,
			'position' : 'absolute'	
		},
		/**
		 * Adds the Footer to the dom.
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 * @param {String} backgroundColor
		 */				
		add: function(x, y, backgroundColor){

			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('FA001');
				} else {
					var d = document.createElement('div');
					d.setAttribute('id', this.alias);					
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = y + 'px';	
					
					if (typeof(backgroundColor) != 'undefined') {
						this.styles.backgroundColor = backgroundColor;
					}
										
					for (key in this.styles) {
						if (this.styles.hasOwnProperty(key)) {
							d.style[key] = this.styles[key];
						}
					}
					
					document.body.appendChild(d);
														
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Removes the Footer. Pass a function to run after removal.
		 * 
		 * @param {Function} callback
		 */
		remove : function (callback) {
			var d = document.getElementById(this.alias);
			document.body.removeChild(d);		
			if (typeof(callback) == 'function') { 
				callback();
			}			
		},
		/**
		 * Overrides defaults properties before Footer is created.
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
		 * Sets an individual style after Footer has been created.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: FSS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: FSS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var d = document.getElementById(this.alias);						
			d.style[key] = value;			
		}
		
	};
	
})();