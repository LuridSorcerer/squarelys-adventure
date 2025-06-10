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

    clear: function() {
        // clear canvas
        this.bufferCtx.fillStyle = "silver";
        this.bufferCtx.fillRect(0, 0, this.buffer.width, this.buffer.height);
    },

	moveCamera: function(a) {
		this.camera.x = a.x - (this.buffer.width/2) + (a.w/2);
		this.camera.y = a.y - (this.buffer.height/2) + (a.h/2);
	},

    drawObject: function (obj,style) {
        this.bufferCtx.fillStyle = style;
        this.bufferCtx.fillRect(obj.x-this.camera.x, obj.y-this.camera.y, obj.w, obj.h);
    },

    drawMessage: function (obj) {

        // create a text box
        this.bufferCtx.fillStyle = "rgb(0,0,0)";
        this.bufferCtx.fillRect(0,this.buffer.height-100,this.buffer.width,100);
        this.bufferCtx.fillStyle = "rgb(255,255,255)";
        this.bufferCtx.fillRect(10,this.buffer.height-90,this.buffer.width-20,80);

        // write message
        this.bufferCtx.fillStyle = "rgb(0,0,0)";
        this.bufferCtx.font = "bold 24px monospace";
        this.bufferCtx.fillText(obj.message1,20,this.buffer.height-60);
        this.bufferCtx.fillText(obj.message2,20,this.buffer.height-20);
    }
};