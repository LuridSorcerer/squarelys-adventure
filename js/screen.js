export const Screen = {
	canvas: null,
	canvasCtx: null,
	buffer: null,
	bufferCtx: null,

	camera: {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	},

	init: function () {
		// set up the on-screen canvas
		this.canvas = document.getElementById('canvas');
		this.canvasCtx = this.canvas.getContext('2d');

		// create an off-screen canvas to buffer rendering to
		this.buffer = document.createElement('canvas');
		this.bufferCtx = this.buffer.getContext('2d');
		this.buffer.width = 640;
		this.buffer.height = 360;

		// set up camera size
		this.camera.w = this.buffer.width;
		this.camera.h = this.buffer.height;
	},

	resize: function() {
		// resize the on-screen canvas to fill the window
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	},

	moveCamera: function(a) {
		this.camera.x = a.x - (this.buffer.width/2) + (a.w/2);
		this.camera.y = a.y - (this.buffer.height/2) + (a.h/2);
	}

};