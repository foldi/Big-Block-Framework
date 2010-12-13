/**
 * Input Feedback object
 * Renders a block where user either clicks or touches.
 * 
 * @author Vince Allen 05-29-2010
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
					BigBlock.SpriteSimple.create({
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
		die : function () {
			BigBlock.Sprites[BigBlock.getObjIdByAlias('input_feedback')].die();
			delete BigBlock.InputFeedback;
		}
			
	};
	
})();