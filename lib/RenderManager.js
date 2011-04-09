/*global BigBlock, document */
/**
 RenderManager object
 Renders pixels to the grid.
  
 @author Vince Allen 12-05-2009
  
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC
  
 */

BigBlock.RenderMgr = (function () {
																		
	return {
		last_rendered_div: null,
		grid_static_fragment: null,
		grid_text_fragment: null,
		render_rate_test_array : [],		 
		renderBlocks : function (blocksToRender) {		
			
			var i, i_max, start, div_id, obj, blk, y, y_max;
			
			if (BigBlock.Timer.debug_frame_rate) {
				start = new Date().getTime();
			}
			
			// BLOCKS LOOP
			
			this.grid_static_fragment = document.createDocumentFragment();
			this.grid_text_fragment = document.createDocumentFragment();
			
			
			// loop thru all existing non-text objects
			div_id = 0;
						
			for (i = 0, i_max = blocksToRender.length; i < i_max; i += 1) {
							
				obj = blocksToRender[i];
				
				if (obj.img === false) { // if BlockSmall; 
					
					if (obj.pix_index !== false) { // if BlockSmall is on screen
					
						if (obj.render_static) {
							
							switch (obj.className) {
								case 'Character':
									this.renderChar(div_id, obj, obj.color_index, 0);
									
								break;
									
								default:
									this.renderStaticBlock(obj, obj.color_index, 0);
								break;
							}
														
						} else {
							this.renderActiveBlock(div_id, obj, obj.color_index, 0);
							div_id += 1; // increment the div_id															
						}
					
					}						
					
				} else { // BlockAnim or BlockBig
					
					for (y = 0, y_max = obj.img.pix.length; y < y_max; y += 1) { // loop thru blocks attached to this Object							
						
						blk = obj.img.pix[y];
						
						if (obj.render_static) {
							this.renderStaticBlock(obj, blk.c, blk.i);
						} else {
							this.renderActiveBlock(div_id, obj, blk.c, blk.i);
							div_id += 1; // increment the div_id
						}

					}					
					
				}
										
				if (obj.render_static && typeof obj.img !== "undefined") { // if this is a static object and the object has its img property
					obj.render_static = false; // MUST set the static property = 0; static Blocks will not be deleted
					obj.destroy(); // destroy the Block
				}			
			}
			
			document.getElementById(BigBlock.GridStatic.viewport.id).appendChild(this.grid_static_fragment); // append the static block to the Static Grid
			document.getElementById(BigBlock.GridText.viewport.id).appendChild(this.grid_text_fragment); // add character to dom
			
			this.last_rendered_div = BigBlock.GridActive.viewport.last_el; // store the last rendered id; will use for cleanup							
			BigBlock.GridActive.viewport.last_el = false; // reset viewport's last element
			
			
			//  reset the remaining live divs 
			if (this.last_rendered_div) {
				while (this.last_rendered_div.nextSibling !== null) { // while the last rendered div has a sibling
					i = this.last_rendered_div.nextSibling; // get the sibling
					this.setBlockAttribute(i, "class", "pix color i0"); // reset its class
					this.last_rendered_div = i; // set this.last_rendered_div equal to the div we just reset; this.last_rendered_div should eventually run out of siblings
				}
			}
			
			if (BigBlock.Timer.debug_frame_rate) {
				this.runRateTest(start);
			}
					
		},
		renderActiveBlock: function (id, obj, color, offset) {
			
			var x, y, index, d;

			if ((obj.img !== false && obj.is_position_updated) !== false || obj.is_anim_updated !== false) { // only Block Anim should call getPixLoc
				x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
				y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
				index = BigBlock.Utils.getPixIndex(x, y);
			} else {
				x = obj.x;
				y = obj.y;
				index = obj.pix_index;
			}
			
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
					
				if (obj.is_position_updated || obj.is_anim_updated || obj.is_color_updated) {	// always redrawing active blocks even if they do not move or change color; uncomment to check for is_ properties			
										
					if (BigBlock.GridActive.viewport.last_el) {
						d = BigBlock.GridActive.viewport.last_el.nextSibling;
					} else {
						d = BigBlock.GridActive.viewport.dom_ref.firstChild;
					}
					BigBlock.GridActive.viewport.last_el = d;							

					this.setBlockAttribute(d, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);				
				}																														
			
			} else {
				return false;
			}		
		},
		renderStaticBlock: function (obj, color, offset) {
			
			var x, y, index, child;
			
			x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
	
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
				
				index = BigBlock.Utils.getPixIndex(x, y);
				
				child = BigBlock.GridStatic.div.cloneNode(false); // dom method; clone a div element
				
				this.setBlockAttribute(child, 'id', '_static'); // all static blocks have the same id
				this.setBlockAttribute(child, 'name', obj.alias); // set the block name to alias of the object; used to remove static blocks
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);
				
				this.grid_static_fragment.appendChild(child); // append the static block to the Static Grid doc fragment
				
			} else {
				return false;
			}	
		},
		renderChar: function (id, obj, color, offset) {
			
			var x, y, index, child, char_pos, k, k_max, char_div, gl_limit;
			
			x = BigBlock.Utils.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.Utils.getPixLoc('y', obj.y, offset);
			
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height) && y < BigBlock.GridStatic.height) { // check that block is on screen
			
				index = BigBlock.Utils.getPixIndex(x, y);
				
				child = BigBlock.GridText.div.cloneNode(false); // dom method; clone a div element	
				//this.setBlockAttribute(child, 'id', BigBlock.Utils.getUniqueId()); // uncomment to give each text div a unique id
				this.setBlockAttribute(child, 'name', obj.word_id);	
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_text_bg + ' ' + BigBlock.CSSid_position + index);
				
				char_pos = obj.char_pos; // get positions of all divs in the character
				
				for (k = 0, k_max = char_pos.length; k < k_max; k += 1) {
					char_div = BigBlock.GridText.div.cloneNode(false); // dom method; create a div for each block in the letter
					
					gl_limit = BigBlock.Grid.blk_dim * 4; // check for glass													
					
					if (char_pos[k].p < gl_limit && obj.glass === true) {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color + '_glass0');														
					} else {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color);																										
					}
					child.appendChild(char_div); // add the character div to the Block's div							
				}
				
				this.grid_text_fragment.appendChild(child); // add character to text doc fragment
										
			}			
		},
		setBlockAttribute: function (obj, key, val) {
			if (typeof obj !== "object" || obj === null) {
				return false;
			} else {
				obj.setAttribute(key, val);
				if (typeof document.addEventListener !== "function" && key === "class") { // test for IE					
					obj.setAttribute("className", val); // IE
					obj.innerHTML = "."; // IE6
				}				
			}
		},
		/**
		 * clearScene() will clear all divs from all viewports, empty the Blocks array, and empty the Button.map property
		 * 
		 * @param {Function} beforeClear
		 * @param {Function} afterClear
		 */
		clearScene: function(before, after) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof before !== "undefined" && before !== null) {
						if (typeof before !== "function") {
							throw new Error("BigBlock.RenderMgr.clearScene(beforeClear, afterClear): beforeClear must be a function");
						} else {
							before();
						}
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				if (typeof BigBlock.GridStatic !== "undefined") {

					document.getElementById(BigBlock.GridStatic.viewport.id).innerHTML = "";
					/*if (v.hasChildNodes()) {
						while (v.firstChild) {
							v.removeChild(v.firstChild);
						}
					}*/
						
					BigBlock.GridStatic.setStyle("backgroundColor", "transparent");
				}
				
				if (typeof BigBlock.GridText !== "undefined") {

					document.getElementById(BigBlock.GridText.viewport.id).innerHTML = "";
					/*if (v.hasChildNodes()) {
						while (v.firstChild) {
							v.removeChild(v.firstChild);
						}
					}*/

					BigBlock.GridText.setStyle("backgroundColor", "transparent");
				}
				
				// never remove divs from GridActive
				
				if (typeof BigBlock.Blocks !== "undefined") { // clear Block array
					BigBlock.Blocks = {};
				}
				
				if (typeof BigBlock.BlocksKeys !== "undefined") { // clear Block Keys array
					BigBlock.BlocksKeys = [];
				}				
				
				if (typeof BigBlock.Button.map !== "undefined") { // clear Button.map array
					BigBlock.Button.map = [];
				}
					
				try {	
					if (typeof after !== "undefined" && after !== null) {
						if (typeof after !== "function") {
							throw new Error("BigBlock.RenderMgr.clearScene(beforeClear, afterClear): afterClear must be a function.");
						} else {
							after();
						}
					}
				} catch(er) {
					BigBlock.Log.display(er.name + ": " + er.message);
				}
				
				//
				
				BigBlock.inputBlock = false; // release user input block		
			
		},
		runRateTest : function (start) {
			
			var time, test_interval, total, ms, t;
			
			time = new Date().getTime() - start; // calculate how long the run took in milliseconds
			test_interval = BigBlock.Timer.frame_rate_test_interval;
			
			this.render_rate_test_array[this.render_rate_test_array.length] = time;
			
			if (BigBlock.Timer.clock%test_interval === 0) {
				total = 0;
				for (t = 0; t < test_interval; t += 1) {
					total += this.render_rate_test_array[t];
					
				}
				ms = total/test_interval;
				BigBlock.Log.display("Avg render: " + ms.toFixed(2) + "ms");
				this.render_rate_test_array = [];
			}
		}		
					
	};
	
}());