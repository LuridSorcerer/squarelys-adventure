export const Ctrls = {
	
	_pressed: {},
	
	LEFT:  37,
	UP:    38,
	RIGHT: 39,
	DOWN:  40,
	
	KEY_W:	87,
	KEY_A:	65,
	KEY_S:	83,
	KEY_D:	68,
	
	KEY_RETURN: 13,
	
	init: function() {
		this._pressed[this.UP] = 0;
		this._pressed[this.DOWN] = 0;
		this._pressed[this.LEFT] = 0;
		this._pressed[this.RIGHT] = 0;
		this._pressed[this.KEY_W] = 0;
		this._pressed[this.KEY_A] = 0;
		this._pressed[this.KEY_S] = 0;
		this._pressed[this.KEY_D] = 0;
		this._pressed[this.KEY_RETURN] = 0;

		// add listeners for keyboard input
		window.addEventListener('keyup',function(event) {Ctrls.onKeyUp(event); }, false);
		window.addEventListener('keydown',function(event) {Ctrls.onKeyDown(event); }, false);
		window.addEventListener('blur',function(){Ctrls.init();},false);
	},
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	onKeyDown: function(event) {
		if (this.isDown(event.keyCode) == 0) {
			this._pressed[event.keyCode] = new Date().getTime();
		}
	},
	
	onKeyUp: function(event) {
		this._pressed[event.keyCode] = 0;
	},
	
};
