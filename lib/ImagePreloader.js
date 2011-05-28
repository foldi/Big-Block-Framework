/*global BigBlock, Image */
/**
 Interface
 Provides methods to run when passing params from one object to another.
 
 @author Vince Allen 05-28-2011
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
 
 */
BigBlock.ImagePreloader = (function () {
	/** @lends BigBlock.ImagePreloader.prototype */
	var state = "static",
		images = {};

	return {
		state: state,
		images: images,
		/**
			@description Creates a new Image object, adds it to the 'images' property, sets the image's initial properties and adds event handlers to detect when load is complete or if an error occurs. Check the status of the entire collection of images at BigBlock.ImagePreloader.state. Check the status of specific images at BigBlock.ImagePreloader.images[name].state.
			@param {Array} params An array of images to preload formatted like: 
			[
				{
					path : "/images/", 
					name : "btn_sprite_default",
					extension: ".png"
				}
			]
		*/			
		fetch : function (params) {

			var i, max, img_name, params_required, onload, onerror, onabort;

			params_required = {name: "string", extension: "string"};

			onload = function () {
				BigBlock.ImagePreloader.images[this.name].state = "loaded";
				BigBlock.ImagePreloader.images[this.name].loaded = true;
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			onerror = function () {
				BigBlock.ImagePreloader.images[this.name].state = "error";
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			onabort = function () {
				BigBlock.ImagePreloader.images[this.name].state = "aborted";
				BigBlock.ImagePreloader.checkPreloaderState();
			};

			for (i = 0, max = params.length; i < max; i += 1) {

				if (BigBlock.Interface.checkRequiredParams(params[i], params_required, true, "BigBlock.ImagePreloader")) { // interface

					img_name = params[i].name;
					this.images[img_name] = {};
					this.images[img_name].my_image = new Image();
					this.images[img_name].my_image.name = params[i].name;				
					this.images[img_name].state = "loading";
					this.images[img_name].loaded = false;

					this.images[img_name].my_image.onload = onload;
					this.images[img_name].my_image.onerror = onerror;
					this.images[img_name].my_image.onabort = onabort;
					this.images[img_name].my_image.src = params[i].path + params[i].name + params[i].extension; // IMPORTANT: Must set the image.src AFTER onload has been assigned to the new image object

				} else {
					this.state = "error";
				}

			}

		},
		/**
			@description Checks all image objects to see if they've loaded. If all have loaded, sets the state of BigBlock.ImagePreloader to "loaded". Each event attached to an Image object runs checkPreloaderState().
		*/
		checkPreloaderState : function () {
			var i;
			for (i in this.images) {
				if (this.images.hasOwnProperty(i)) {
					if (this.images[i].state !== "loaded") {
						return false;
					}
				}
			}
			this.state = "loaded";
		}
	};

}());
