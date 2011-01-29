/**
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */
 
var BigBlock = {};
BigBlock.Blocks = {}; // collects all blocks
BigBlock.BlocksKeys = []; // collects all block keys

// initial props

BigBlock.curentFrame = 0;
BigBlock.inputBlock = false; // set = true to block user input
BigBlock.URL_ittybitty8bit = "http://www.ittybitty8bit.com";
BigBlock.URL_Facebook = "http://www.facebook.com/pages/ittybitty8bit/124916544219794";
BigBlock.URL_Twitter = "http://www.twitter.com/ittybitty8bit";
BigBlock.CSSid_core = "core";
BigBlock.CSSid_color = "color";
BigBlock.CSSid_position = "i";
BigBlock.CSSid_char = "ch";
BigBlock.CSSid_char_pos = "ch_p";
BigBlock.CSSid_text_bg = "txt_bg";
BigBlock.CSSid_grid_pos = "grid_p";
BigBlock.user_agent = navigator.userAgent.toLowerCase();

if (BigBlock.user_agent.search("iphone") > -1) {
	BigBlock.is_iphone = true;
}

if (BigBlock.user_agent.search("ipad") > -1) {
	BigBlock.is_ipad = true;
}

/**
 * BigBlock.ready() is called from <body> onload()
 * To pass params to BigBlock.Timer.play(), overwrite this function in the html file.
 * Params should be json formatted. 
 */
BigBlock.ready = function () { 
	BigBlock.Timer.play();
};

//