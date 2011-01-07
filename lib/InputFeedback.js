/**
 * Input Feedback object
 * Renders a block where user either clicks or touches.
 * 
 * @author Vince Allen 05-29-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
BigBlock.InputFeedback = (function () {
	
	return {
		
		life : 10,
		className : 'white',
		configure: function (params) {
			
			if (typeof(params) != 'undefined') { // loop thru passed params to override above defaults
				for (var i in params) {
					if (params.hasOwnProperty(i)) {
						this[i] = params[i];
					}
				}
			}
			
		},
		
		display : function (x, y) {
			
			try {
				if (typeof(x) == 'undefined' || typeof(y) == 'undefined') {
					throw new Error('Err: IFD001');
				} else {
					BigBlock.BlockSmall.create({
						alias : 'input_feedback',
						className : this.className,
						x : x - BigBlock.GridActive.x,
						y : y - BigBlock.GridActive.y,
						life : this.life
					});					
				}
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
							
				
			
		},
		destroy : function () {
			if (typeof(BigBlock.Blocks[BigBlock.getBlkIndexByAlias('input_feedback')]) != "undefined") {
				BigBlock.Blocks[BigBlock.getBlkIndexByAlias('input_feedback')].destroy();
				delete BigBlock.InputFeedback;
			}			
		}
			
	};
	
})();