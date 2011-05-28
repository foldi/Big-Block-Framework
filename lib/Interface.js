/*global BigBlock */
/**
 Interface
 Provides methods to run when passing params from one object to another.
 
 @author Vince Allen 05-28-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */			
BigBlock.Interface = (function () {
	/** @lends BigBlock.Interface.prototype */
	return {
		/**
			@description Checks the passed params match the required params. 
			@param {Object} params_passed
			@param {Object} params_required
			@param {Boolean} debug
			@returns {Boolean} True if all params match; False if any params do not match.
		 */
		checkRequiredParams : function (params_passed, params_required, debug, name) {
			var i, msg;
			for (i in params_required) { // loop thru required params
				if (params_required.hasOwnProperty(i)) {
					try {
						if (typeof params_passed[i] !== params_required[i] || params_passed[i] === "") { // if there is not a corresponding key in the passed params; or params passed value is blank 
							if (params_passed[i] === "") {
								msg = "BigBlock.Interface.checkRequiredParams: required param '" + i + "' is empty.";
							} else if (typeof params_passed[i] === "undefined") {
								msg = "BigBlock.Interface.checkRequiredParams: required param '" + i + "' is missing from passed params.";
							} else {
								msg = "BigBlock.Interface.checkRequiredParams: passed param '" + i + "' must be type " + params_required[i] + ". Passed as " + typeof params_passed[i] + ".";
							}
							if (name) {
								msg = msg + " from: " + name;
							}
							throw new Error(msg);
						}
					} catch (e) {
						if (debug) {
							BigBlock.Log.error(e);
						}
						return false;
					}
				}
			}
			return true;
		}
	};

}());
