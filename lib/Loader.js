/**
 * Loader object
 * Renders loading info to a div in the DOM
 * 
 * @author Vince Allen 12-05-2009
 */
BigBlock.Loader = (function () {
	
	return {
		
		id : 'loader',
		class_name : 'loader_container',
		style : {
			position : 'absolute',
			backgroundColor : 'transparent',
			border : '1px solid #aaa',
			padding : '2px',
			textAlign : 'center',
			color: '#aaa'
		},
		style_bar : {
			fontSize: '1%',
			position: 'absolute',
			top: '2px',
			left: '2px',
			backgroundColor: '#999',
			color: '#999',
			height: '10px',
			cssFloat: 'left'
		},
		width : 100,
		height : 10,
		format : 'percentage',
		total : 0,
		msg : '&nbsp;',
		bar_color : '#999',
		
		add: function(){	

			try {	
				if (window.innerWidth) { // mozilla
					this.style.left = (window.innerWidth / 2 - (this.width / 2)) + 'px';	
					this.style.top = (window.innerHeight / 2 - (this.height / 2)) + 'px';
				} else if (document.documentElement.clientWidth) { // IE
					this.style.left = (document.documentElement.clientWidth / 2 - (this.width / 2)) + 'px';	
					this.style.top = (document.documentElement.clientHeight / 2 - (this.height / 2)) + 'px';								
				} else {
					this.style.left = '350px';
					this.style.top = '195px';
					throw new Error('Err: LA001');
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
			this.style.width = this.width + 'px';
			this.style.height = this.height + 'px';
						
			//document.body.innerHTML = "<div id='" + this.id + "' class='" + this.class_name + "'><div id='" + this.id + "_bar' class='" + this.class_name + "_bar'>.</div></div>"; // insert the Loader container into the body

			var lc = document.createElement("div"); // create loader container div
			lc.setAttribute('id', this.id);			
			lc.setAttribute('class', this.class_name);
			if (typeof document.addEventListener != 'function') { // test for IE
				lc.setAttribute('className', this.class_name); // IE6
			}
														
			var b = document.getElementsByTagName('body').item(0);
			b.appendChild(lc); // add loader container to body

			var l = document.createElement("div"); // create loader
			l.setAttribute('id', this.id + '_bar');			
			l.setAttribute('class', this.class_name + '_bar');
			if (typeof document.addEventListener != 'function') { // test for IE
				l.setAttribute('className', this.class_name + '_bar'); // IE6
			}
		
			var lc_ = document.getElementById(this.id);
			lc_.appendChild(l); // add loader to loader container
									
			for (var key in this.style) { // loop thru styles and apply
				if (this.style.hasOwnProperty(key)) {
					document.getElementById(this.id).style[key] = this.style[key];
				}
			}
			
			for (key in this.style_bar) { // loop thru styles and apply
				if (this.style_bar.hasOwnProperty(key)) {
					document.getElementById(this.id + '_bar').style[key] = this.style_bar[key];
				}
			}

			document.getElementById(this.id + '_bar').style.cssFloat = 'left';
				
			
		},
		update: function (params) {
			if (typeof(params) != 'undefined') {
				if (typeof(params.total) != 'undefined') {
					this.total = params.total;
				}
			}
			var width = (this.total/100) * 100;
			document.getElementById(this.id+'_bar').style.width = width + 'px';
		}
	};
	
})();