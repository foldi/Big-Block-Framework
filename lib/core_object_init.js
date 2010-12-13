var BigBlock = {};
BigBlock.Sprites = [];

// initial props

BigBlock.curentFrame = 0;
BigBlock.inputBlock = false; // set = true to block user input
BigBlock.URL_ittybitty8bit = 'http://www.ittybitty8bit.com';
BigBlock.URL_Facebook = 'http://www.facebook.com/pages/ittybitty8bit/124916544219794';
BigBlock.URL_Twitter = 'http://www.twitter.com/ittybitty8bit';
BigBlock.CSSid_core = '.core';
BigBlock.CSSid_color = '.color';
BigBlock.CSSid_char_pos = '.char_pos';
BigBlock.CSSid_grid_pos = '.grid_pos';

/**
 * BigBlock.ready() is called from <body> onload()
 * To pass params to BigBlock.Timer.play(), overwrite this function in the html file.
 * Params should be json formatted. 
 */
BigBlock.ready = function () { 
	BigBlock.Timer.play();
};

//