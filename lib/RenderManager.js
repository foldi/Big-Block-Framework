/**
 * RenderManager object
 * Renders pixels to the grid.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.RenderMgr = (function () {
																		
	return {
		
		render_rate_test_array : [],
		is_cleaned: false, // if true, renderCleanUp has run; render functions should update the class of all divs they render
		renderCleanUp : function () {
			
			var start, quads, i, q, nodes, tmp, x;
			
			if (BigBlock.Timer.debug_frame_rate) {
				start = new Date().getTime();
			}
			
			/*
			 * CLEAN UP
			 * Resets the class of all divs in GridActive div
			 */
			
			quads = BigBlock.GridActive.quads;
			
			for (i = 0; i < quads.length; i++) {
				
				q = document.getElementById(quads[i].id);
				
				//q.innerHTML = ""; // uncomment to remove divs rather than reset their classes; for testing
				
				if (q.hasChildNodes()) {
					
					nodes = q.childNodes; // get a DOM collection of all children in quad;
					tmp = [];
				
					for(x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
						tmp[tmp.length] = nodes[x]; 
					}
					
					for (x = 0; x < tmp.length; x++) { // reset classes in all children
						tmp[x].setAttribute('class', 'pix ' + BigBlock.CSSid_color);
						if (!document.addEventListener) { // test for IE
							tmp[x].setAttribute('className', 'pix ' + BigBlock.CSSid_color); // IE6
						}
						tmp[x].onmouseup = null; // remove events
						tmp[x].ontouchstart = null;
					}			
					
					tmp = null;
				}			
				
			}
			
			this.is_cleaned = true; // set is_cleaned so render functions update the classes of the divs they render
			
			if (BigBlock.Timer.debug_frame_rate) {
				this.runRateTest(start);
			}
		},				 
		renderBlocks : function (blocksToRender) {		
			
			var i, start, div_id, obj, blk;
			
			if (BigBlock.Timer.debug_frame_rate) {
				start = new Date().getTime();
			}
			
			/*
			 * BLOCKS LOOP
			 */
			
			// loop thru all existing non-text objects
			div_id = 0;
						
			for (i = 0; i < blocksToRender.length; i++) {
							
				obj = blocksToRender[i];
				
				if (obj.img === false) { // if BlockSmall; 
					
					if (obj.pix_index !== false) { // if BlockSmall is on screen
					
						if (obj.render_static) {
							
							switch (obj.className) {
								case 'Char':
									this.renderChar(div_id, obj, obj.color_index, 0);
									
								break;
									
								default:
									this.renderStaticBlock(obj, obj.color_index, 0);
								break;
							}
														
						} else {
							this.renderActiveBlock(div_id, obj, obj.color_index, 0);
							div_id++; // increment the div_id															
						}
					
					}						
					
				} else { // BlockAnim or BlockBig
					
					for (y = 0; y < obj.img.pix.length; y++) { // loop thru blocks attached to this Object							
						
						blk = obj.img.pix[y];
						
						if (obj.render_static) {
							this.renderStaticBlock(obj, blk.c, blk.i);
						} else {
							this.renderActiveBlock(div_id, obj, blk.c, blk.i);
							div_id++; // increment the div_id
						}

					}					
					
				}
										
				if (obj.render_static && typeof(obj.img) !== "undefined") { // if this is a static object and the object has its img property
					obj.render_static = false; // MUST set the static property = 0; static Blocks will not be deleted
					obj.destroy(); // destroy the Block
				}			
			}
			
			
			if (BigBlock.Timer.debug_frame_rate) {
				this.runRateTest(start);
			}
					
		},
		renderActiveBlock: function (id, obj, color, offset) {
			
			var x, y, index, d, child, parent, target;

			if ((obj.img !== false && obj.is_position_updated) !== false || obj.is_anim_updated !== false || this.is_cleaned) { // only Block Anim should call getPixLoc
				x = BigBlock.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
				y = BigBlock.getPixLoc('y', obj.y, offset);
				index = BigBlock.getPixIndex(x, y);
			} else {
				x = obj.x;
				y = obj.y;
				index = obj.pix_index;
			}
			
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
				
				d = document.getElementById(id); // dom method
										
				if (!d) { // if this div does not exist, create it
					
					child = document.createElement("div"); // dom method; create a div element
					
					this.setBlockAttribute(child, 'id', id);
					this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);

					document.getElementById(BigBlock.RenderMgr.getQuad('active', x, y)).appendChild(child);										
																														
				} else {								
					
					/*
					 * If renderCleanUp function has run, must update this div's class.
					 * Otherwise, otherwise do NOT call setBlockAttribute or other DOM methods.
					 * 
					 */
					
					if (this.is_cleaned || obj.is_position_updated || obj.is_anim_updated || obj.is_color_updated) { // 
						
						this.setBlockAttribute(d, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);					
																													
						parent = d.parentNode.getAttribute("id");
	
						target = BigBlock.RenderMgr.getQuad('active', x, y);									
							
						if (parent !== target) { // div switched quadrants
							document.getElementById(target).appendChild(d); // append div to new quad
						}	
					
					}																														
				}
			} else {
				return false;
			}		
		},
		renderStaticBlock: function (obj, color, offset) {
			
			var x, y, index, child;
			
			x = BigBlock.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.getPixLoc('y', obj.y, offset);
	
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height)) { // check that block is on screen
				
				index = BigBlock.getPixIndex(x, y);
				
				child = document.createElement("div"); // dom method; create a div element
				
				this.setBlockAttribute(child, 'id', '_static'); // all static blocks have the same id
				this.setBlockAttribute(child, 'name', obj.alias); // set the block name to alias of the object; used to remove static blocks
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_color + color + ' ' + BigBlock.CSSid_position + index);

				document.getElementById(BigBlock.RenderMgr.getQuad('static', x, y)).appendChild(child); // append the static block to the Static Grid
				
			} else {
				return false;
			}	
		},
		renderChar: function (id, obj, color, offset) {
			
			var x, y, index, child, char_pos, k, char_div, gl_limit;
			
			x = BigBlock.getPixLoc('x', obj.x, offset); // get global x, y coords based on parent Block's coords
			y = BigBlock.getPixLoc('y', obj.y, offset);
			
			if (BigBlock.ptInsideRect(x, y, 0, BigBlock.Grid.width, 0, BigBlock.Grid.height) && y < BigBlock.GridStatic.height) { // check that block is on screen
			
				index = BigBlock.getPixIndex(x, y);
				
				child = document.createElement("div"); // dom method; create a div element		
				this.setBlockAttribute(child, 'id', BigBlock.getUniqueId());
				this.setBlockAttribute(child, 'name', obj.word_id);	
				this.setBlockAttribute(child, 'class', 'pix ' + BigBlock.CSSid_text_bg + ' ' + BigBlock.CSSid_position + index);
				
				char_pos = obj.char_pos; // get positions of all divs in the character
				
				for (k = 0; k < char_pos.length; k++) {
					char_div = document.createElement("div"); // dom method; create a div for each block in the letter
					
					gl_limit = BigBlock.Grid.blk_dim * 4; // check for glass													
					
					if (char_pos[k].p < gl_limit && obj.glass === true) {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color + '_glass0');														
					} else {
						this.setBlockAttribute(char_div, 'class', BigBlock.CSSid_char + ' ' + BigBlock.CSSid_char_pos + char_pos[k].p + ' ' + BigBlock.CSSid_color + color);																										
					}
					child.appendChild(char_div); // add the character div to the Block's div							
				}

				document.getElementById(BigBlock.RenderMgr.getQuad('text', x, y)).appendChild(child); // add character to dom
										
			}			
		},
		setBlockAttribute: function (obj, key, val) {
			if (typeof(obj) === "undefined") {
				return false;
			} else {
				obj.setAttribute(key, val);
				if (typeof(document.addEventListener) !== "function" && key === "class") { // test for IE					
					obj.setAttribute("className", val); // IE6
					obj.innerHTML = "."; // IE6
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
		 * clearScene() will clear all divs from all quads, empty the Blocks array, and empty the Button.map property
		 * 
		 * @param {Function} beforeClear
		 * @param {Function} afterClear
		 */
		clearScene: function(before, after) {
				
				BigBlock.inputBlock = true; // block user input when clearing scene
				
				try {	
					if (typeof(before) !== "undefined" && before !== null) {
						if (typeof(before) !== "function") {
							throw new Error("BigBlock.RenderMgr.clearScene(beforeClear, afterClear): beforeClear must be a function");
						} else {
							before();
						}
					}
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				var quads, i, q;
				
				if (typeof(BigBlock.GridStatic) !== "undefined") {
					quads = BigBlock.GridStatic.quads;
					
					for (i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridStatic.setStyle("backgroundColor", "transparent");
				}
				
				if (typeof(BigBlock.GridText) !== "undefined") {
					quads = BigBlock.GridText.quads;
					
					for (i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
				
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridText.setStyle("backgroundColor", "transparent");
				}
				
				if (typeof(BigBlock.GridActive) !== "undefined") {
					quads = BigBlock.GridActive.quads;
					
					for (i = 0; i < quads.length; i++) {
						
						q = document.getElementById(quads[i].id);
						
						if (q.hasChildNodes()) {
							while (q.firstChild) {
								q.removeChild(q.firstChild);
							}
						}
						
					}
					BigBlock.GridActive.setStyle("backgroundColor", "transparent");
				}
				
				if (typeof(BigBlock.Blocks) !== "undefined") { // clear Block array
					BigBlock.Blocks = {};
				}
				
				if (typeof(BigBlock.BlocksKeys) !== "undefined") { // clear Block Keys array
					BigBlock.BlocksKeys = [];
				}				
				
				if (typeof(BigBlock.Button.map) !== "undefined") { // clear Button.map array
					BigBlock.Button.map = [];
				}
					
				try {	
					if (typeof(after) !== "undefined" && after !== null) {
						if (typeof(after) !== "function") {
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
				for (t = 0; t < test_interval; t++) {
					total += this.render_rate_test_array[t];
					
				}
				ms = total/test_interval;
				BigBlock.Log.display("Avg render: " + ms.toFixed(2) + "ms");
				this.render_rate_test_array = [];
			}
		}		
					
	};
	
})();