/**
 * LocalStorage object
 * Provides an interface to read/write values to the browser's local storage area. Browser must be HTML 5 compliant.
 * 
 * @author Vince Allen 12-27-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.LocalStorage = (function () {

	var supported = true;

	if (typeof(window.localStorage) == 'undefined') {
		supported = false;
		BigBlock.Log.display('This browser does not support localStorage.');
	}
		
	return {
		
		supported: supported,
		alias: 'local_storage',
		/**
		 * Returns a value in the localStorage.
		 * 
		 * @param {String} key
		 */				
		getItem: function(key) {
			if (this.supported === true) {
				try {
					return localStorage.getItem(key);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		},
		/**
		 * Sets a value in the localStorage.
		 * 
		 * @param {String} key
		 * @param {String, Number} value
		 * 
		 */				
		setItem: function(key, value) {
			if (this.supported === true) {
				try {
					return localStorage.setItem(key, value);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		},
		/**
		 * Removes a key/value pair in the localStorage.
		 * 
		 * @param {String} key
		 * 
		 */				
		removeItem: function(key) {
			if (this.supported === true) {
				try {
					return localStorage.removeItem(key);
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		}
,
		/**
		 * Clears the entire localStorage.
		 * 
		 * 
		 */				
		clear: function() {
			if (this.supported === true) {
				try {
					return localStorage.clear();
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			}
		}		
		
	};
	
})();