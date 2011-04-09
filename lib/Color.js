/*global BigBlock */
/**
 Color
 Defines the color palette available to pixels.
  
 @author Vince Allen 12-05-2009
 
 Big Block Framework
 Copyright (C) 2011 Foldi, LLC

 */

BigBlock.Color = (function () {
	
	var palette, color, colors, s, i;
	
	palette = {'classes' : [ // default colors
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
	color = 'white_black';
	palette.classes[palette.classes.length] = {'name' : {},'val' : []};
	s = "";
	for (i = 255; i > -1; i -= 50) {
		if (i - 50 > -1) {
			s += "rgb(" + i + ", " + i + ", " + i + ");";
		} else {
			s += "rgb(" + i + ", " + i + ", " + i + ")";
		}
	}
	colors = s.split(";");				
	
	palette.classes[palette.classes.length-1].name = color;
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
		var i, max, total;
		total = 0;
		for (i = 0, max = palette.classes.length; i < max; i++) {
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
			
			var i,
				max,
				palette = getPalette(),
				classes = palette.classes,
				current_class = this.current_class,
				sheet = document.styleSheets[document.styleSheets.length - 1],
				total_rules;
				
			for (i in classes[current_class].val) {
				if (!classes[current_class].val[i]) {
					BigBlock.Log.display("Error: BigBlock.Color.build: invalid style rule. Check that class objects do not have empty values.");
				}
				if (classes[current_class].val.hasOwnProperty(i)) {
					BigBlock.Utils.appendCSSRule(sheet, BigBlock.CSSid_color + classes[current_class].name + i, "background-color:" + classes[current_class].val[i] + ";");	
				}
			}
					
			this.current_class += 1;

			total_rules = BigBlock.Utils.getCSSLength(sheet);

			BigBlock.Loader.update({
				'total' : Math.round((total_rules / (getTotalColors())) * 100)
			});
						
			if (total_rules < getTotalColors()) { // if all styles are not complete, send false back to Timer; Timer will call build again
				return false;
			} else {
				return true;
			}
		},
		add : function (params) {
			var i, max;
			try {
				if (typeof params === "undefined") {
					throw new Error("BigBlock.Color.add(): params are required.");
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			for (i = 0, max = params.classes.length; i < max; i++) {
				addToPalette(params.classes[i]);
			}
		},
		getPalette: function () {
			return getPalette();
		}
		
	};
	
}());