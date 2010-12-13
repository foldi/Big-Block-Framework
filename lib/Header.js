/**
 * Header object
 * Adds a div above the active area that's visible in iPhone full screen mode and Android default mode.
 * 
 * @author Vince Allen 07-21-2010
 */
BigBlock.Header = (function () {
	
	return {
		
		alias : 'app_header',
		width : 320,
		height : 56,
		styles : {
			'zIndex' : -1,
			'position' : 'absolute'	
		},
		/**
		 * Adds the Header to the dom.
		 * 
		 * @param {Number} x
		 * @param {Number} y
		 * @param {String} backgroundColor
		 */				
		add: function(x, y, backgroundColor){

			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('Err: HA001');
				} else {
					var d = document.createElement('div');
					d.setAttribute('id', this.alias);
					
					this.styles.width = this.width + 'px';
					this.styles.height = this.height + 'px';
					this.styles.left = x + 'px';		
					this.styles.top = (y - this.height) + 'px';	
					
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
		 * Removes the Header. Pass a function to run after removal.
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
		 * Sets an individual style after Header has been created.
		 * 
		 * @param {String} key
		 * @param {String} value
		 */
		setStyle : function (key, value) { 
			try {
				if (typeof(key) == 'undefined') {
					throw new Error('Err: HSS001');
				}
				if (typeof(value) == 'undefined') {
					throw new Error('Err: HSS002');
				}				
			} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
			}
			var d = document.getElementById(this.alias);						
			d.style[key] = value;			
		}
		
	};
	
})();