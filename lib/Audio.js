/**
 * Audio object
 * Provides an interface to play audio files. Browser must be HTML 5 compliant.
 * 
 * @author Vince Allen 01-01-2011
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Audio = (function () {
	
	var supported = true;

	if (typeof(window.Audio) == 'undefined') {
		supported = false;
		BigBlock.Log.display('This browser does not support HTML5 audio.');
	}															

	return {
		
		alias : 'audio',
		supported : supported,
		playlist : {}, // contains instances of Audio elements
		pause_timeout: null,
		debug: false,
		is_single_channel: false,  // typically set by checking BigBlock.is_iphone and BigBlock.is_ipad
		single_channel_id: null,
		last_play: new Date().getTime(),
		last_play_delay: 500,
		muted : false,	
		/**
		 * Adds an audio element to the DOM. Also runs load() to set up the audio file for playback.
		 * 
		 * @param {String} src
		 * @param {String} loop
		 * 
		 */				
		add: function(id, src, loop) {

			if (supported === true) {
						
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}				
					if (typeof(src) == 'undefined') {
						throw new Error('Path to audio file required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				var ext = BigBlock.getFileExtension(src); // get file extension
				
				var mime_type = BigBlock.getMimeTypeFromFileExt(ext); // get mime-type
				
				var audio = new Audio(src); // create audio element
				
				var supported_mime_type = this.canPlayType(audio, mime_type); // check media.canPlayType
				
				if (supported_mime_type != "") {
					
					this.playlist[id] = audio; // add audio element to playlist
					
					var a = this.playlist[id];
					
					a.id = id; // add the id to the audio element; useful to identify audio file when events fire
				
					if (a.addEventListener) { // mozilla
						a.addEventListener("canplay", this.eventHandler, false); // add canplay event listener
						a.addEventListener("loadstart", this.eventHandler, false); // add loadstart event listener
						a.addEventListener("progress", this.eventHandler, false); 
						a.addEventListener("suspend", this.eventHandler, false); 
						a.addEventListener("abort", this.eventHandler, false); 
						a.addEventListener("error", this.eventHandler, false); 
						a.addEventListener("emptied", this.eventHandler, false); 
						a.addEventListener("stalled", this.eventHandler, false); 
					} else if (a.attachEvent) { // IE
						a.attachEvent("canplay", this.eventHandler, false);
						a.attachEvent("loadstart", this.eventHandler, false);
						a.attachEvent("progress", this.eventHandler, false); 
						a.attachEvent("suspend", this.eventHandler, false); 
						a.attachEvent("abort", this.eventHandler, false); 
						a.attachEvent("error", this.eventHandler, false); 
						a.attachEvent("emptied", this.eventHandler, false); 
						a.attachEvent("stalled", this.eventHandler, false);					
					}				
						
				} else {
					BigBlock.Log.display("Audio mime-type " + mime_type + " not supported. " + ext + " files will not be played.");
				}
			
			}
 			
		},
		eventHandler: function (e) {
			var message = "An audio event for " + e.target.id + " just fired.";
			
			switch (e.type) {
				case "loadstart":
					message = "Audio: eventHandler: Audio file " + e.target.id + " has started loading.";
					break;	
				case "progress":
					message = "Audio: eventHandler: Audio file " + e.target.id + " is loading.";
					break;	
				case "suspend":
					message = "Audio: eventHandler: The user agent is intentionally not currently fetching " + e.target.id + ", but does not have the entire media resource downloaded.";
					break;
				case "abort":
					message = "Audio: eventHandler: The user agent stopped fetching " + e.target.id + " before it was completely downloaded, but not due to an error.";
					break;	
				case "error":
					message = "Audio: eventHandler: An error occurred while fetching " + e.target.id + ".";
					break;
				case "emptied":
					message = "Audio: eventHandler: " + e.target.id + "'s network state just switch to NETWORK_EMPTY.";
					break;	
				case "stalled":
					message = "Audio: eventHandler: The user agent is trying to fetch " + e.target.id + ", but data is unexpectedly not forthcoming.";					
					break;																															
				case "canplay":
					message = "Audio: eventHandler: Audio file " + e.target.id + " is ready to play.";
					break;
			}
			
			try {
				if (BigBlock.Audio.debug == true) {
					throw new Error(message);
				}															
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
		},
		/**
		 * Returns the empty string (a negative response), "maybe", or "probably" based on how confident the user agent is that it can play media resources of the given type.
		 * Allows the user agent to avoid downloading resources that use formats it cannot render.
		 * 
		 * @param {String} type
		 * 
		 */				
		canPlayType: function(element, type) {
			
			try {
				if (typeof(type) == 'undefined') {
					throw new Error('A type is required');
				}															
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}

			try { 
				var val = element.canPlayType(type);									
			} catch(e) {
				BigBlock.Log.display(e.name + ': ' + e.message);
			}
			
			return val;
			
		},		
		/**
		 * Causes the element to reset and start selecting and loading a new media resource from scratch.
		 * 
		 * @param {String} id
		 * 
		 */			
		load: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					this.playlist[id].load(); // load the sound									
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			
			}

		},
		/**
		 * Plays an audio element.
		 * 
		 * @param {String} id
		 * 
		 */			
		play: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				
				var rs;
				
				try {
					
					if (this.is_single_channel === true) {
						
						var time_now = new Date().getTime();
						if (time_now - this.last_play > this.last_play_delay) {
							
							rs = this.getReadyState(this.single_channel_id, true);
							
							if (rs.state > 2) { // check that the sound is ready to play
							
								var start_time = this.track_labels[id].start_time;
								var duration = this.track_labels[id].duration;
								
								this.pause(this.single_channel_id); // pause the sound
								
								this.setCurrentTime(this.single_channel_id, start_time); // set the time to start playing
								
								this.playlist[this.single_channel_id].play(); // play the sound
								this.last_play = time_now;
								
								this.pause_timeout = setTimeout(function () {
									BigBlock.Audio.pause(BigBlock.Audio.single_channel_id);
								}, duration);								
							
							} else {
								BigBlock.Log.display("Audio: " + rs.message);
							}
			
						}							
					} else {
						rs = this.getReadyState(id, true);
							
						if (rs.state > 2) { // check that the sound is ready to play
							this.playlist[id].play();
						}
						
					}
					
														
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}	
				
			
			}
		},
		/**
		 * Sets the paused attribute to true, loading the media resource if necessary.
		 * 
		 * @param {String} id
		 * 
		 */			
		pause: function (id, toggle) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				var rs = this.getReadyState(id, true);
	
				if (rs.state > 2) { // check that the sound is ready
				
					if (typeof(toggle) != "undefined") { // should this toggle bw paused/play
						if (this.isPaused(id) === false) {
							try {
								this.playlist[id].pause(); // pause the sound
							} catch(e) {
								BigBlock.Log.display(e.name + ': ' + e.message);
							}							
						} else {
							var timeRanges = this.getPlayed(id);
							var ended = this.isEnded(id);
							if (timeRanges.length > 0 && ended != true) { // if file has started playing and then paused; if file has not ended; start playing again
								try {
									this.playlist[id].play(); // play the sound
								} catch(e) {
									BigBlock.Log.display(e.name + ': ' + e.message);
								}								
							}				
						}
					} else {
						try {
							this.playlist[id].pause(); // pause the sound										
						} catch(e) {
							BigBlock.Log.display(e.name + ': ' + e.message);
						}					
					}
				
				} else {
					BigBlock.Log.display("Audio: " + rs.message);
				}
			
			}
		},
		/**
		 * Returns true if playback is paused; false otherwise.
		 * 
		 * @param {String} id
		 * 
		 */			
		isPaused: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].paused; // pause the sound										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
			
			return val;	
			
			}
		},
		/**
		 * Returns a TimeRanges object that represents the ranges of the media resource that the user agent has played.
		 * 
		 * @param {String} id
		 * 
		 */			
		getPlayed: function (id) {
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
						
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].played;									
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				return val;
			
			}

		},
		/**
		 * Returns true if playback has reached the end of the media resource.
		 * 
		 * @param {String} id
		 * 
		 */			
		isEnded: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
						
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].ended; 									
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				return val;	
			
			}
		},
		/**
		 * Returns the current rate playback, where 1.0 is normal speed.
		 * 
		 * @param {String} id
		 * 
		 */			
		getPlaybackRate: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].playbackRate; 									
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
				
				return val;	
			
			}
		},				
		/**
		 * Returns a value that expresses the current state of the element with respect to rendering the current playback position, from the codes in the list below.
		 * 
		 * @param {String} id
		 * @param {Boolean} debug
		 * 
		 */			
		getReadyState: function (id, debug) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
				var state = this.playlist[id].readyState; // get the ready state
				
				var val; // will be an object or integer depending on value of debug
				
				if (typeof(debug) != 'undefined') { // if debug has a value return the message along with the state value
					
					var message;
	
					switch (state) {
						case 0:
							message = "HAVE_NOTHING: No data for the current playback position is available. ";
							break;
							
						case 1:
							message = "HAVE_METADATA : Enough of the resource has been obtained that the duration of the resource is available. No media data is available for the immediate current playback position.";
							break;
							
						case 2:
							message = "HAVE_CURRENT_DATA: Data for the immediate current playback position is available, but not enough data is available to successfully advance the current playback position in the direction of playback.";
							break;
							
						case 3:
							message = "HAVE_FUTURE_DATA: Data for the immediate current playback position is available. However, not enough data is avaialble to determine if playback will out-pace the data stream.";
							break;
							
						case 4:
							message = "HAVE_ENOUGH_DATA: All data for the immediate current playback position is available.";
							break;					
																									
					}
									
					val = {
						state : state,
						message : message
					};
					
				} else {
					
					val = state; 
				
				}
				
				return val;
			
			}
			
		},
		/**
		 * Returns the current state of network activity for the element, from the codes in the list below.
		 * 
		 * @param {String} id
		 * @param {Boolean} debug
		 * 
		 */			
		getNetworkState: function (id, debug) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}
							
				var state = this.playlist[id].networkState; // get the ready state
				var val; // will be an object or integer depending on value of debug
				
				if (typeof(debug) != 'undefined') { // if debug has a value return the message along with the state value
					
					var message;
	
					switch (state) {
						case 0:
							message = "NETWORK_EMPTY: The element has not yet been initialized. All attributes are in their initial states.";
							break;
							
						case 1:
							message = "NETWORK_IDLE: The element's resource selection algorithm is active and has selected a resource, but it is not actually using the network at this time.";
							break;
							
						case 2:
							message = "NETWORK_LOADING: The user agent is actively trying to download data.";
							break;
							
						case 3:
							message = "NETWORK_NO_SOURCE: The element's resource selection algorithm is active, but it has so not yet found a resource to use.";
							break;				
																									
					}
									
					val = {
						state : state,
						message : message
					};
					
				} else {
					
					val = state; 
				
				}
				
				return val;
			
			}
			
		},				
		/**
		 * Returns the length of the media resource, in seconds, assuming that the start of the media resource is at time zero.
		 * Returns NaN if the duration isn't available.
		 * Returns Infinity for unbounded streams.
		 * 
		 * @param {String} id
		 * 
		 */			
		getDuration: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].duration;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
				
				return val;
			
			}
		},		
		/**
		 * Returns the current playback position, in seconds.
		 * Will throw an INVALID_STATE_ERR exception if there is no selected media resource.
		 * 
		 * @param {String} id
		 * 
		 */			
		getCurrentTime: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].currentTime;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
				
				return val;
			
			}
			
		},		
		/**
		 * Sets the current playback position, in seconds.
		 * Will throw an INVALID_STATE_ERR exception if there is no selected media resource.
		 * Will throw an INDEX_SIZE_ERR exception if the given time is not within the ranges to which the user agent can seek.
		 * 
		 * @param {String} id
		 * @param {Number} time
		 */			
		setCurrentTime: function (id, time) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {	
					this.playlist[id].currentTime = time;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
			}
			
		},		
		/**
		 * Returns the current playback volume, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest.
		 * 
		 * @param {String} id
		 * 
		 */			
		getVolume: function (id) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}											
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].volume;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
				
				return val;
			
			}
			
		},		
		/**
		 * Sets the current playback volume, as a number in the range 0.0 to 1.0, where 0.0 is the quietest and 1.0 the loudest.
		 * Throws an INDEX_SIZE_ERR if the new value is not in the range 0.0 .. 1.0.
		 * 
		 * @param {String} id
		 * @param {Number} volume
		 * 
		 */			
		setVolume: function (id, volume) {
			
			if (typeof(this.playlist[id]) != "undefined" && this.supported === true) { // must be a valid audio file; browser must support HTML5 Audio
			
				try {
					if (typeof(id) == 'undefined') {
						throw new Error('An id is required');
					}
					if (typeof(volume) == 'undefined') {
						throw new Error('A volume value between 0.0 and 1.0 is required');
					}																
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}

				try {
					var val = this.playlist[id].volume = volume;										
				} catch(e) {
					BigBlock.Log.display(e.name + ': ' + e.message);
				}			
				
				return val;
			
			}
			
		},				
		/**
		 * Mutes all audio elements in playlist.
		 * 
		 * 
		 */			
		mute: function () {
			
			if (this.supported === true) { // browser must support HTML5 Audio
	
				for (i in this.playlist) {
					
					try {	
						this.playlist[i].muted = true; // mutes the sound						
					} catch(e) {
						BigBlock.Log.display(e.name + ': ' + e.message);
					}
										
				}
				
				this.muted = true;
			
			}
			
		},		
		/**
		 * Unmutes all audio elements in playlist.
		 * 
		 * 
		 */			
		unmute: function () {
			
			if (this.supported === true) { // browser must support HTML5 Audio
			
				for (i in this.playlist) {
					
					try {
						this.playlist[i].muted = false;	// unmutes the sound										
					} catch(e) {
						BigBlock.Log.display(e.name + ': ' + e.message);
					}
										
				}
				
				this.muted = false;
			
			}
			
		}
		
	};
	
})();