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
	
	mouse: {x: 0, y: 0, b:0 },
	
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
		//window.addEventListener('blur',function(){Ctrls.init();},false);
		
		// add listeners for mouse input
		window.addEventListener('mousemove', 
			function(event) { Ctrls.onMouseMove(event); }, 
			false);
		window.addEventListener('mousedown',
			function(event) { Ctrls.onMouseBtn(event); },
			false);
		window.addEventListener('mouseup',
			function(event) { Ctrls.onMouseBtn(event); },
			false);
			
		// add event listeners for touch input
		window.addEventListener('touchstart',
			function(event) { 
				event.preventDefault();
				event.buttons = 1;
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
				Ctrls.onMouseBtn(event);
				Ctrls.onMouseMove(event);
			}, false);
		window.addEventListener('touchend',
			function(event) {
				event.preventDefault();
				event.buttons = 0;
				Ctrls.onMouseBtn(event);
			}, false);
		window.addEventListener('touchmove',
			function(event) {
				event.preventDefault();
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
				Ctrls.onMouseMove(event);
			}, false);
	},
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	onKeyDown: function(event) {
		if (this.isDown(event.keyCode) === 0) {
			this._pressed[event.keyCode] = new Date().getTime();
		}
	},
	
	onKeyUp: function(event) {
		this._pressed[event.keyCode] = 0;
	},
	
	onMouseMove: function(event) {
		this.mouse.x = event.clientX / window.innerWidth; 
		this.mouse.y = event.clientY / window.innerHeight;
	},

	onMouseBtn: function(event) {
		this.mouse.b = event.buttons;
	},
};

