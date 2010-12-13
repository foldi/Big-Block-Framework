/**
 * PanelInfo object
 * Builds an overlay panel for ittybitty8bit.
 * 
 * @author Vince Allen 08-02-2010
 */
BigBlock.PanelInfo = (function() { // uses lazy instantiation; 
  
	function cnstr(type, before, after) { // All of the normal singleton code goes here.
		return {
			type : type,
			panel_timeout: false,
			before : before,
			after : after,
			restoreProps : {
				Sprites : [],
				GridStaticStyles : {},
				GridActiveStyles : {},
				GridTextStyles : {},
				StaticDivs : {
					'qS_tl' : [],
					'qS_tr' : [],
					'qS_bl' : [],
					'qS_br' : []
				},
				TextDivs : {
					'qT_tl' : [],
					'qT_tr' : [],
					'qT_bl' : [],
					'qT_br' : []
				}
			},
			evtListner : [],
			grid_top_offset : 0,
			logoScreen: function() {
				
				
				if (typeof(this.before) == 'function') {
					this.before();
				}
				
				var grid_top_offset = 0;
				if (!window.navigator.standalone) { // iPhones remove 18 pixels for the status bar when NOT running in full-screen app mode
					this.grid_top_offset = 18;
				}
			
				var quads = BigBlock.GridStatic.quads;
				
				for (var i = 0; i < quads.length; i++) { // make a copy of all static divs
					var q = document.getElementById(quads[i].id);
						
					if (q.hasChildNodes()) {
						var nodes = q.childNodes; // get a collection of all children in quad;						
						var tmp = [];
						
						// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
						 
						for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
							tmp[tmp.length] = nodes[x]; 
						}						
						
						for (var j = 0; j < tmp.length; j++) { // add child to array
							this.restoreProps.StaticDivs[quads[i].id].push(tmp[j]);	
						}
						
						nodes = null;
						tmp = null;
					}							
				}
				
				quads = BigBlock.GridText.quads;
				
				for (i = 0; i < quads.length; i++) { // make a copy of all text divs
					q = document.getElementById(quads[i].id);
						
					if (q.hasChildNodes()) {
						var nodes = q.childNodes; // get a collection of all children in quad;						
						var tmp = [];
						
						// DOM collections are live; iterating over a static array is faster than iterating over a live DOM collection
						 
						for( var x = 0; x < nodes.length; x++ ) { // make copy of DOM collection
							tmp[tmp.length] = nodes[x]; 
						}						
						
						for (var j = 0; j < tmp.length; j++) { // add child to array
							this.restoreProps.TextDivs[quads[i].id].push(tmp[j]);	
						}
						
						nodes = null;
						tmp = null;
					}						
				}							
								
				// adds event listener for any sprites carrying input actions 									
				quads = BigBlock.GridActive.quads;
				var dm = BigBlock.Grid.pix_dim;
				var inputAction = function (evt_x, evt_y, event) {
					for (var i = 0; i < BigBlock.Sprites.length; i++) { // check to fire any active sprite events 
						if (BigBlock.Sprites[i].input_action !== false && typeof(BigBlock.Sprites[i].input_action) == 'function') {
							var x = BigBlock.Sprites[i].x;
							var y = BigBlock.Sprites[i].y;
							if (BigBlock.ptInsideRect(evt_x, evt_y, x, (x + dm), y, (y + dm))) {
								BigBlock.Sprites[i].input_action(event);								
							}
						}
					}						
				};
				var mouseup_event = function (event) {
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}
					if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
						BigBlock.InputFeedback.display(event.clientX, event.clientY);
					}									
					if (typeof(BigBlock.GridActive) != 'undefined') {
						inputAction((event.clientX - BigBlock.GridActive.x), (event.clientY - BigBlock.GridActive.y), event);
					}				
				};
				var click_event = function (event) { // for wii only
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}
					if (typeof(opera) != 'undefined' && typeof(opera.wiiremote) != 'undefined') { // detect wii
						if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
							BigBlock.InputFeedback.display(event.clientX, event.clientY);
						}									
						if (typeof(BigBlock.GridActive) != 'undefined') {
							inputAction((event.clientX - BigBlock.GridActive.x), (event.clientY - BigBlock.GridActive.y), event);
						}
					}			
				};					
				var touchstart_event = function (event) {
					if (event.preventDefault) { // prevent default event behavior
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					if (event.stopPropagation) {
						event.stopPropagation();
					} else {
						event.cancelBubble = true;
					}				
					if (typeof(event.touches) != 'undefined') { 					
						var touch = event.touches[0];
						if (typeof(BigBlock.InputFeedback) != 'undefined' && BigBlock.Timer.input_feedback === true) { // input feedback
							BigBlock.InputFeedback.display(touch.clientX, touch.clientY);
						}							
						if (typeof(BigBlock.GridActive) != 'undefined') {
							inputAction((touch.clientX - BigBlock.GridActive.x), (touch.clientY - BigBlock.GridActive.y), event);
						}
					}				
				};								
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('mouseup', mouseup_event, false); // add mouseup event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('onmouseup', mouseup_event)
					}
					this.evtListner[this.evtListner.length] = mouseup_event;		
				}
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('click', click_event, false); // add mouseup event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('onclick', click_event)
					}
					this.evtListner[this.evtListner.length] = click_event;		
				}				
				for (i = 0; i < quads.length; i++) {
					q = document.getElementById(quads[i].id);

					if (q.addEventListener) { // mozilla
						q.addEventListener('touchstart', touchstart_event, false); // add touchstart event listener
					} else if (q.attachEvent) { // IE
						q.attachEvent('ontouchstart', touchstart_event)
					}
					this.evtListner[this.evtListner.length] = touchstart_event;		
				}				
				//
																		
				this.restoreProps.Sprites = BigBlock.Sprites; // make a copy of the Sprite array

				for (var key in BigBlock.GridStatic.styles) { // copy of the GridStatic styles
					if (BigBlock.GridStatic.styles.hasOwnProperty(key)) {
						this.restoreProps.GridStaticStyles[key] = BigBlock.GridStatic.styles[key];
					}
				}

				for (var key in BigBlock.GridActive.styles) { // copy of the GridActive styles
					if (BigBlock.GridActive.styles.hasOwnProperty(key)) {
						this.restoreProps.GridActiveStyles[key] = BigBlock.GridActive.styles[key];
					}
				}
				
				for (var key in BigBlock.GridText.styles) { // copy of the GridText styles
					if (BigBlock.GridText.styles.hasOwnProperty(key)) {
						this.restoreProps.GridTextStyles[key] = BigBlock.GridText.styles[key];
					}
				}				

				BigBlock.RenderMgr.clearScene(); // clear the scene
				BigBlock.GridStatic.setStyle('backgroundColor', '#fff'); // set GridStatic backgroundColor = white
				BigBlock.inputBlock = true; // block user input
				BigBlock.TapTimeout.stop(); // stop tap timeout
				
				// graphics

				if (typeof(BigBlock.CharPresets.getChar) != 'function') { // if not already installed
					BigBlock.CharPresets = BigBlock.CharPresets.install(); // needed for timeout chars
				}
									
				this.panel_info_grahics = null;
				this.panel_info_grahics = BigBlock.PanelInfoGraphics.install();
			
				BigBlock.SpriteAdvanced.create({
					alias : 'logo',
					x : (BigBlock.Grid.width - 168)/2,
					y : ((BigBlock.Grid.height - 296)/2) + this.grid_top_offset,
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pPhnBg')
				});
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtLogo',
					x : 24,
					y : (104  + this.grid_top_offset),
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: false,								
					anim : this.panel_info_grahics.getImg('pTxtLogo')
				});				
				
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text1()
				}, 2000); // pause for info screen	
								
			},
			infoScreen_text1 : function () {
				console.log(this.grid_top_offset);
				if (typeof(BigBlock.Sprites[BigBlock.getObjIdByAlias('pTxtLogo')]) != 'undefined') {
					BigBlock.Sprites[BigBlock.getObjIdByAlias('pTxtLogo')].die();
				}
				
				//
				
				if (this.type == 'inline') {				
					BigBlock.WordSimple.create({
						word_id: 'btn_link1',
						x: 256,
						y : (88 + this.grid_top_offset),
						value: " play ",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});
					BigBlock.WordSimple.create({
						word_id: 'btn_link2',
						x: 304,
						y : (88 + this.grid_top_offset),
						value: "arrow_right",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});					
					BigBlock.WordSimple.create({
						word_id: 'btn_link3',
						x: 256,
						y : (96 + this.grid_top_offset),
						value: " again ",
						className: "black",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#c0efff"
					});					
				} else {
					BigBlock.WordSimple.create({
						word_id: 'btn_link',
						x: 256,
						y : (88 + this.grid_top_offset),
						value: " close ",
						className: "white",
						url : function (event) {
							BigBlock.PanelInfoInst.removeAndRestore(event);
						},
						link_color : "#333"
					});					
				}
						
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text2()
				}, 500); // pause for info screen												
												
			},
			infoScreen_text2 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel1',
					x : 160,
					y : (112 + this.grid_top_offset),
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel1')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln1',
					x : 176,
					y : (128 + this.grid_top_offset),
					value : "view this app",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln2',
					x : 176,
					y : (144 + this.grid_top_offset),
					value : "on your phone",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});				
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text3()
				}, 1000); // pause for info screen												
												
			},
			infoScreen_text3 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel2',
					x : 16,
					y : (192 + this.grid_top_offset),
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel2')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln3',
					x : 32,
					y : (208 + this.grid_top_offset),
					value : "visit",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln4',
					x : 80,
					y : (208 + this.grid_top_offset),
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});				
				
				BigBlock.WordSimple.create({
					word_id : 'ln5',
					x : 96,
					y : (208 + this.grid_top_offset),
					value : "ittybitty8bit.com",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_ittybitty8bit,
					link_color : '#000'
				});			
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text4()
				}, 1000); // pause for info screen												
												
			},
			infoScreen_text4 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel3',
					x : 104,
					y : (264 + this.grid_top_offset),
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel3')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln6',
					x : 120,
					y : (296 + this.grid_top_offset),
					value : "ittybitty8bit creates",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	
				
				BigBlock.WordSimple.create({
					word_id : 'ln7',
					x : 120,
					y : (312 + this.grid_top_offset),
					value : "interactive pixel art",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln8',
					x : 120,
					y : (328 + this.grid_top_offset),
					value : "for mobile devices.",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});										
											
				this.panel_timeout = setTimeout(function () {
					BigBlock.PanelInfoInst.infoScreen_text5()
				}, 1000); // pause for info screen											
												
			},
			infoScreen_text5 : function () {
				
				BigBlock.SpriteAdvanced.create({
					alias : 'pTxtPanel4',
					x : 16,
					y : (336 + this.grid_top_offset),
					life : 0,
					anim_state: 'stop',
					anim_loop: 1,
					render_static: true,								
					anim : this.panel_info_grahics.getImg('pTxtPanel4')
				});				

				BigBlock.WordSimple.create({
					word_id : 'ln10',
					x : 32,
					y : (368 + this.grid_top_offset),
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	

				BigBlock.WordSimple.create({
					word_id : 'ln11',
					x : 48,
					y : (368 + this.grid_top_offset),
					value : "facebook",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_Facebook,
					link_color : '#000'
				});
				
				BigBlock.WordSimple.create({
					word_id : 'ln12',
					x : 120,
					y : (368 + this.grid_top_offset),
					value : "arrow_right",
					className : 'black',
					font : 'bigblock_bold',
					glass : true
				});	

				BigBlock.WordSimple.create({
					word_id : 'ln13',
					x : 136,
					y : (368 + this.grid_top_offset),
					value : "twitter",
					className : 'white',
					font : 'bigblock_bold',
					glass : false,
					url : BigBlock.URL_Twitter,
					link_color : '#000'
				});														
																					
												
			},
			removeAndRestore : function (event) {
				
				if (event.preventDefault) {
					event.preventDefault();
				} else {
					event.returnValue = false;
				}
				if (event.stopPropagation) {
					event.stopPropagation();
				} else {
					event.cancelBubble = true;
				}
				
				this.panel_info_grahics = null; // remove info panel graphics
										
				clearTimeout(this.panel_timeout);
				
				var quads = BigBlock.GridActive.quads; // remove event listeners
				for (var i = 0; i < quads.length; i++) {
					var q = document.getElementById(quads[i].id);
					if (q.removeEventListener) { // mozilla
						q.removeEventListener('mouseup', this.evtListner[i], false);
					} else if (q.attachEvent) { // IE
						q.detachEvent('onmouseup', this.evtListner[i])
					}					
					
				}
				
				if (this.type == 'inline') {
					BigBlock.scene_current = 0;
					BigBlock.createScene(BigBlock.scene_current);
					BigBlock.current_frame = 0;					
				} else {
					
				BigBlock.RenderMgr.clearScene(); // clear the scene
				
					for (var key in this.restoreProps.GridStaticStyles) { // restore styles
						if (this.restoreProps.GridStaticStyles.hasOwnProperty(key)) {
							BigBlock.GridStatic.setStyle(key, this.restoreProps.GridStaticStyles[key]); 
						}
					}
					
					for (var key in this.restoreProps.GridActiveStyles) {
						if (this.restoreProps.GridActiveStyles.hasOwnProperty(key)) {
							BigBlock.GridActive.setStyle(key, this.restoreProps.GridActiveStyles[key]); 
						}
					}
					
					for (var key in this.restoreProps.GridTextStyles) {
						if (this.restoreProps.GridTextStyles.hasOwnProperty(key)) {
							BigBlock.GridText.setStyle(key, this.restoreProps.GridTextStyles[key]); 
						}
					}				
					
					BigBlock.Sprites = this.restoreProps.Sprites; // restore the Sprite array
					
	
					for (var key in this.restoreProps.StaticDivs) { // replace all Static Divs
						if (this.restoreProps.StaticDivs.hasOwnProperty(key)) {
							var q = document.getElementById(key);						
							for (var d in this.restoreProps.StaticDivs[key]) {
								q.appendChild(this.restoreProps.StaticDivs[key][d]);
							}
						}		
					}
					
					for (key in this.restoreProps.TextDivs) { // replace all Text Divs
						if (this.restoreProps.TextDivs.hasOwnProperty(key)) {
							q = document.getElementById(key);						
							for (d in this.restoreProps.TextDivs[key]) {
								q.appendChild(this.restoreProps.TextDivs[key][d]);
							}
						}		
					}
				
				}							
							
				BigBlock.inputBlock = false; // release input block
				BigBlock.TapTimeout.start(); // start tap timeout
								
				delete BigBlock.PanelInfoInst; // delete instance		
				
				if (typeof(this.after) == 'function') {
					this.after();
				}					
				
			}				
		};
	}

	return {
		add: function(type, before, after) {
			if (typeof(BigBlock.PanelInfoInst) == 'undefined') { // Instantiate only if the instance doesn't exist.
				BigBlock.PanelInfoInst = cnstr(type, before, after);
				BigBlock.PanelInfoInst.logoScreen();				
			}
			
		}
	};
})();