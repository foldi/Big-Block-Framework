/**
 * Color object
 * Defines the color palette available to pixels.
 * 
 * @author Vince Allen 12-05-2009
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Color = (function () {
	
	var pInfoLogo = "rgb(191, 192, 194);rgb(0, 0, 0);rgb(153, 153, 153);rgb(238, 137, 151);rgb(102, 102, 102);rgb(255, 255, 255);rgb(240, 78, 99);rgb(204, 204, 204);rgb(128, 145, 173);rgb(192, 239, 255)";
	var pPhnBg = "rgb(191, 192, 194);rgb(0, 0, 0);rgb(153, 153, 153);rgb(102, 102, 102);rgb(204, 204, 204);rgb(128, 145, 173);rgb(255, 255, 255);rgb(192, 239, 255)";
	var pTxtLogo = "rgb(238, 137, 151);rgb(255, 255, 255);rgb(240, 78, 99)";
	var pTxtPanel = "rgb(238, 137, 151);rgb(255, 255, 255);rgb(240, 78, 99)";
	
	var palette = {'classes' : [ // default colors
		{name: 'pInfoLogo',val: pInfoLogo.split(";")},
		{name: 'pPhnBg',val: pPhnBg.split(";")},
		{name: 'pTxtLogo',val: pTxtLogo.split(";")},
		{name: 'pTxtPanel',val: pTxtPanel.split(";")},
		{name : 'white',val: ['rgb(255,255,255)']},
		{name : 'black',val: ['rgb(0,0,0)']},
		{name : 'black0_glass',val: ['rgb(102,102,102)']},
		{name : 'grey_dark',val: ['rgb(90,90,90)']},
		{name : 'grey_dark0_glass',val: ['rgb(140,140,140)']},
		{name : 'grey',val: ['rgb(150,150,150)']},
		{name : 'grey0_glass',val: ['rgb(200,200,200)']},		
		{name : 'grey_light',val: ['rgb(200,200,200)']},
		{name : 'grey_light0_glass',val: ['rgb(255,255,255)']},
		{name: 'red',val : ['rgb(255,0,0)']},	
		{name: 'magenta',val : ['rgb(255,0,255)']},	
		{name: 'blue',val: ['rgb(0,0,255)']},	
		{name: 'cyan',val: ['rgb(0,255,255)']},	
		{name: 'green',val: ['rgb(0,255,0)']},	
		{name: 'yellow',val: ['rgb(255,255,0)']},	
		{name: 'orange',val: ['rgb(255,126,0)']},	
		{name: 'brown',val: ['rgb(160,82,45)']},	
		{name: 'pink',val: ['rgb(238,130,238)']}									
	]};
	
	// default gradients
	var className = 'white_black';
	palette.classes[palette.classes.length] = {'name' : {},'val' : []};
	var s = "";
	for (var i = 255; i > -1; i -= 50) {
		if (i - 50 > -1) {
			s += "rgb(" + i + ", " + i + ", " + i + ");";
		} else {
			s += "rgb(" + i + ", " + i + ", " + i + ")";
		}
	}
	var colors = s.split(";");				
	
	palette.classes[palette.classes.length-1].name = className;
	palette.classes[palette.classes.length-1].val = [];
	
	for (i in colors) { // insert a css rule for every color
		if (colors.hasOwnProperty(i)) {
			palette.classes[palette.classes.length - 1].val[i] = colors[i];
		}
	}
		
	function getPalette () {
		return palette;
	}
	function getTotalColors () {
		var total = 0;
		for (var i = 0; i < palette.classes.length; i++) {
			total += palette.classes[i].val.length;
			
		}
		return total;
	}				
	function addToPalette (class_name) {
		palette.classes[palette.classes.length] = class_name;
	}				
	
	return {
		current_class : 0,
		
		build : function () {
			var p = getPalette();

			var s = BigBlock.getBigBlockCSS(BigBlock.CSSid_color);

			for (var i in p.classes[this.current_class].val) {
				
				try {
					if (s.insertRule) { // Mozilla
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {
							s.insertRule("div.color" + p.classes[this.current_class].name + i + " {background-color:" + p.classes[this.current_class].val[i] + ";}", 0);
						}					
					} else if (s.addRule) { // IE
						if (p.classes[this.current_class].val.hasOwnProperty(i)) {					
							s.addRule("div.color" + p.classes[this.current_class].name + i, "background-color:" + p.classes[this.current_class].val[i] + ";color:" + p.classes[this.current_class].val[i]);
						}					
					} else {
						throw new Error('Err: CB001');
					}					
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
			}
					
			this.current_class++;
			
			var total_rules;
			try {
				if (s.cssRules) { // Mozilla
					BigBlock.Loader.update({
						'total' : Math.round((s.cssRules.length / (getTotalColors())) * 100)
					});
					total_rules = s.cssRules.length;		
				} else if (s.rules) { // IE
					BigBlock.Loader.update({
						'total' : Math.round((s.rules.length / (getTotalColors())) * 100)
					});
					total_rules = s.rules.length;				
				} else {
					throw new Error('Err: CB002');
				}					
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
			if (total_rules < getTotalColors()) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				for (i = 0; i < p.classes.length; i++) {
					delete BigBlock[p.classes[i].name]; // delete any color array properties after they've been added to CSS.
				}
				return true;
			}
		},
		add : function (params) {
			try {
				if (typeof(params) == 'undefined') {
					throw new Error(console.log('Err: CA001'));
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}			
			 
			for (var i = 0; i < params.classes.length; i++) {
				addToPalette(params.classes[i]);
			}
		},
		getPalette: function () {
			return getPalette();
		}
		
	};
	
})();