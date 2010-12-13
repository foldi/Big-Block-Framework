/**
 * RenderManager object
 * Renders pixels to the grid.
 * 
 * @author Vince Allen 12-05-2009
 */

BigBlock.RenderMgr = (function () {
																		
	return {
		
		renderTime : [],				 				 
		renderPix : function (start) {
						
			/*
			 * CLEAN UP
			 * Resets the class of all divs in GridActive div
			 */
			
			var quads = BigBlock.GridActive.quads;
			
			for (var i = 0; i < quads.length; i++) {
				
				var q = document.getElementById(quads[i].id);
				
				if (q.hasChildNodes()) {
					
					var nodes = q.childNodes; // get a DOM collection of all children in quad;
					var tmp = [];
					
					/* DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
					 * After testing saw a 6.6% performance increase w iPhone 4; 7.1% w iPhone 3GS; 5.7% w iPad 3.2
					 */
					for(var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}
					
					for (x = 0; x < tmp.length; x++) { // reset classes in all children
						tmp[x].setAttribute('class', 'pix color');
						if (!document.addEventListener) { // test for IE
							tmp[x].setAttribute('className', 'pix color'); // IE6
						}
						tmp[x].onmouseup = null; // remove events
						tmp[x].ontouchstart = null;
					}			
					
					tmp = null;
				}				
				
			}
			
		
			
			/*
			 * SPRITE LOOP
			 */
			
			// loop thru all existing non-text objects
			var parent_div;
			var pix_x;
			var pix_y;
			var div_id = 0;
			var d;
			for (i = 0; i < BigBlock.Sprites.length; i++) {
				
				/*
				 * RENDER CONDITIONS
				 * Do not render pixel or increment render counter if:
				 * Render property has timed out.
				 * State = 'dead'.
				 * 
				 * Do not render pixel but increment render counter if:
				 * Img property is undefined.
				 * Img.pix property is undefined.
				 * 
				 * Img.pix carries the properties of the pixel.
				 * c = the color class
				 * i = the position index in the grid
				 * 
				 * Do not render pixel but increment render and div_id if:
				 * Pixel position is off screen.
				 * 
				 * Static sprites are appended to the 'pix_grid_static' div and
				 * immediately deleted from the Sprite array. You cannot kill
				 * static sprites.
				 * 
				 */
				
				
				if (BigBlock.Sprites[i].render !== 0 && BigBlock.Sprites[i].state != 'dead' && typeof(BigBlock.Sprites[i].img) != 'undefined' && typeof(BigBlock.Sprites[i].img.pix) != 'undefined') {
										
					for (y = 0; y < BigBlock.Sprites[i].img.pix.length; y++) { // loop thru blocks attached to this Sprite
							
						// render pixel
						var pix_index_offset = BigBlock.Sprites[i].img.pix[y].i;
						var pix_index = pix_index_offset + BigBlock.Sprites[i].pix_index; 
						
						if (pix_index !== false) { // check that block is on screen; index should correspond to a location in the grid
							var color = BigBlock.Sprites[i].img.pix[y].c;
							
							var child = document.createElement("div");
							
							if (BigBlock.Sprites[i].render_static) {
							
								switch (BigBlock.Sprites[i].alias) {
									case 'Char':
										
										pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
										pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
										
										if (pix_x >= 0 && pix_x < BigBlock.GridStatic.width && pix_y >= 0 && pix_y < BigBlock.GridStatic.height) { // check that block is on screen
											pix_index = BigBlock.getPixIndex(pix_x, pix_y);
											child.setAttribute('class', 'pix text_bg pos' + pix_index); // overwrite class set above
																							
											if (typeof document.addEventListener != 'function') { // test for IE
												child.setAttribute('className', 'pix text_bg pos' + pix_index); // IE6
												child.innerHTML = '.'; // IE6								
											}

											var char_pos = BigBlock.Sprites[i].char_pos; // get positions of all divs in the character
											
											for (var k = 0; k < char_pos.length; k++) {
												var char_div = document.createElement("div");
												
												var gl_limit = BigBlock.Grid.pix_dim * 4;													
												
												if (char_pos[k].p < gl_limit && BigBlock.Sprites[i].glass === true) {
													char_div.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color + '_glass0');													
													if (typeof document.addEventListener != 'function') { // test for IE
														char_div.setAttribute('className', 'char char_pos' + char_pos[k].p + ' color' + color + '_glass0'); // IE6
														char_div.innerHTML = '.'; // IE6
													}														
												} else {
													char_div.setAttribute('class', 'char char_pos' + char_pos[k].p + ' color' + color);													
													if (typeof document.addEventListener != 'function') { // test for IE
														char_div.setAttribute('className', 'char char_pos' + char_pos[k].p + ' color' + color); // IE6
														char_div.innerHTML = '.'; // IE6
													}														
												}

												
												child.appendChild(char_div); // add the character div to the Sprite's div							
											}
											child.setAttribute('name', BigBlock.Sprites[i].word_id);
											child.setAttribute('id', BigBlock.getUniqueId());
											
											if (BigBlock.Sprites[i].url !== false) { // if a url is attached to the char, add an event listener
												child.style['backgroundColor'] = BigBlock.Sprites[i].link_color;
											}
											
											document.getElementById(BigBlock.RenderMgr.getQuad('text', pix_x, pix_y)).appendChild(child); // add character to dom
																	
										}
									
										
									break;
										
									default:

										pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
										pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
								
										if (pix_x >= 0 && pix_x < BigBlock.GridStatic.width && pix_y >= 0 && pix_y < BigBlock.GridStatic.height) { // check that block is on screen
											pix_index = BigBlock.getPixIndex(pix_x, pix_y);
											child.setAttribute('class', 'pix color' + color + ' pos' + pix_index);
											if (typeof document.addEventListener != 'function') { // test for IE
												child.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
												child.innerHTML = '.'; // IE6
											}
											child.setAttribute('id', '_static');
											child.setAttribute('name', BigBlock.Sprites[i].alias);	
											
											
											document.getElementById(BigBlock.RenderMgr.getQuad('static', pix_x, pix_y)).appendChild(child);
										}

									break;
								}
							
							} else {
																				
								d = document.getElementById(div_id);
								
								pix_x = BigBlock.getPixLoc('x', BigBlock.Sprites[i].x, pix_index_offset); // get global x, y coords based on parent sprite's coords
								pix_y = BigBlock.getPixLoc('y', BigBlock.Sprites[i].y, pix_index_offset);
								
								if (pix_x >= 0 && pix_x < BigBlock.GridActive.width && pix_y >= 0 && pix_y < BigBlock.GridActive.height) { // check that block is on screen
									
									pix_index = BigBlock.getPixIndex(pix_x, pix_y);
									
									if (!d) { // if this div does not exist, create it
										
										child.setAttribute('id', div_id);
										child.setAttribute('class', 'pix color' + color + ' pos' + pix_index); // update its class
										if (typeof document.addEventListener != 'function') { // test for IE
											child.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
											child.innerHTML = '.'; // IE6
										}
										
										document.getElementById(BigBlock.RenderMgr.getQuad('active', pix_x, pix_y)).appendChild(child);										
																																			
									} else {								
																													
										d.setAttribute('class', 'pix color' + color + ' pos' + pix_index); // update its class
										if (typeof document.addEventListener != 'function') { // test for IE
											d.setAttribute('className', 'pix color' + color + ' pos' + pix_index); // IE6
										}
										
										parent_div = d.parentNode.getAttribute("id");

										var target_div = BigBlock.RenderMgr.getQuad('active', pix_x, pix_y);												 											
											
										if (parent_div != target_div) { // div does not switch quadrants
											document.getElementById(parent_div).removeChild(d); // remove div from old quad
											document.getElementById(target_div).appendChild(d); // append div to new quad
										}
										
																																
									}
											
																		
								}

							}
							
						} else { // block is off screen
							d = document.getElementById(div_id);
							if (d) { // if div exists; remove it
								parent_div = d.parentNode.getAttribute("id");
								document.getElementById(parent_div).removeChild(d);
							}
						}
						div_id++; // increment the div_id; important for cycling thru static divs				
					}
									
					BigBlock.Sprites[i].render--; // decrement the render counter
				}
				if (BigBlock.Sprites[i].render_static && typeof(BigBlock.Sprites[i].img) != 'undefined') { // if this is a static object and the object has its img property
					BigBlock.Sprites[i].render_static = false; // MUST set the static property = 0; static sprites will not be deleted
					BigBlock.Sprites[i].die(); // kill the sprite
				}				
			}
			
			if (BigBlock.Timer.report_fr === true) {
				var end = new Date().getTime(); // mark the end of the run
				var time = end - start; // calculate how long the run took in milliseconds
				var testInterval = BigBlock.Timer.fr_rate_test_interval;
				var total = 0;
				
				this.renderTime[this.renderTime.length] = time;
				if (BigBlock.Timer.clock%testInterval == 0) {
					for (var t = 0; t < testInterval; t++) {
						total += this.renderTime[t];
						
					}
					BigBlock.Log.display(total/testInterval);
					this.renderTime = [];
				}
			}
					
		},
		
		/**
		 * Returns the correct quad grid based on passed x, y coords
		 * @param x
		 * @param y
		 * 
		 */		
		getQuad: function (quad_name, x, y) {
			
			var quad_obj;
			switch (quad_name) {
				case 'active':
					quad_obj = BigBlock.GridActive;
				break;
				case 'static':
					quad_obj = BigBlock.GridStatic;
				break;
				case 'text':
					quad_obj = BigBlock.GridText;
				break;								
			}
			
			if (x < BigBlock.Grid.width / 2 && y < BigBlock.Grid.height / 2) {
				return quad_obj.quads[0].id;
			}							
			if (x >= BigBlock.Grid.width/2 && y < BigBlock.Grid.height/2) {
				return quad_obj.quads[1].id;
			}
			if (x < BigBlock.Grid.width/2 && y >= BigBlock.Grid.height/2) {
				return quad_obj.quads[2].id;
			}
			if (x >= BigBlock.Grid.width/2 && y >= BigBlock.Grid.height/2) {
				return quad_obj.quads[3].id;
			}			
		},
		/**
		 * clearScene() will clear all divs from all quads as well as empty the Sprites array.
		 * 
		 * @param {Function} beforeClear
		 * @param {Function} afterClear
		 */
		clearScene: function(before, after) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof(before) != 'undefined' && before != null) {
						if (typeof(before) != 'function') {
							throw new Error('Err: RMCS001');
						} else {
							before();
						}
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
				var quads;
				var i;
				var q;
				
				if (typeof(BigBlock.GridStatic) != 'undefined') {
					quads = BigBlock.GridStatic.quads;
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridStatic.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridText) != 'undefined') {
					quads = BigBlock.GridText.quads;
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
				
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridText.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.GridActive) != 'undefined') {
					quads = BigBlock.GridActive.quads;
					
					for (var i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridActive.setStyle('backgroundColor', 'transparent');
				}
				
				if (typeof(BigBlock.Sprites) != 'undefined') {
					BigBlock.Sprites = [];
				}
				
				try {	
					if (typeof(after) != 'undefined' && after != null) {
						if (typeof(after) != 'function') {
							throw new Error('Err: RMCS002');
						} else {
							after();
						}
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ': ' + er.message);
				}
				
				//
				
				BigBlock.inputBlock = false; // release user input block		
			
		}		
					
	};
	
})();