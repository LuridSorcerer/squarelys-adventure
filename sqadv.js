// set up canvas
var _canvas = document.getElementById('canvas');
var _canvasContext = null;
if (_canvas && _canvas.getContext) {
	_canvasContext = _canvas.getContext('2d');
}

// camera offsets, for scrolling camera
var camOffset = {
	x: 0,
	y: 0,
	h: _canvas.height,
	w: _canvas.width
}

// Squarely, the main character
var Squarely = {
	x: 0,
	y: 0,
	h: 16,
	w: 16,
	color: {r:64,g:64,b:64},
	MAXH: 32,
	MAXW: 32,
	MINH:  8,
	MINW:  8,
	DEFAULTCOLOR: {r:64,g:64,b:64},
	speed: 2,
};

// adjusts how quickly Squarely's color changes
var redfactor = 5;


// Ctrls, handles game input
var Ctrls = {
	_pressed: {},
	
	LEFT:  37,
	UP:    38,
	RIGHT: 39,
	DOWN:  40,
	
	KEY_W:	87,
	KEY_A:	65,
	KEY_S:	83,
	KEY_D:	68,
	
	init: function() {
		this._pressed[this.UP] = 0;
		this._pressed[this.DOWN] = 0;
		this._pressed[this.LEFT] = 0;
		this._pressed[this.RIGHT] = 0;
		this._pressed[this.KEY_W] = 0;
		this._pressed[this.KEY_A] = 0;
		this._pressed[this.KEY_S] = 0;
		this._pressed[this.KEY_D] = 0;
	},
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	onKeyDown: function(event) {
		if (this.isDown(event.keyCode) == 0) {
			this._pressed[event.keyCode] = new Date().getTime();
		}
		//document.getElementById("info").value = event.keyCode;
	},
	
	onKeyUp: function(event) {
		this._pressed[event.keyCode] = 0;
	}
};

// array of blocks (terrain)
var Blocks = new Array();

// array of Npcs, characters not controlled by the player
Npcs: {};

// init: initializes the game
function init() {

	// place Squarely squarely in the center of the world
	Squarely.x = (_canvas.width/2)-(Squarely.w/2);
	Squarely.y = (_canvas.height/2)-(Squarely.h/2);
	
	// add listeners for keyboard input
	window.addEventListener('keyup',function(event) {Ctrls.onKeyUp(event); }, false);
	window.addEventListener('keydown',function(event) {Ctrls.onKeyDown(event); }, false);
	
	// initialize controls
	Ctrls.init();
	
	// create a block or two-dozen
	var b = {x:10,y:10,h:300,w:25,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:400,y:350,h:200,w:200,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-500,y:-500,h:30,w:300,color:{r:20,g:20,b:20}};
	Blocks.push(b);
	
	// create walls that can NEVER BE BREACHED
	b = {x:-1000,y:-1000,h:20,w:2000,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-1000,y:-1000,h:2000,w:20,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-1000,y:1000,h:20,w:2020,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:1000,y:-1000,h:2000,w:20,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	
	// create blue block that will grow Squarely
	b = {x:100,y:100,h:32,w:32,color:{r:0,g:0,b:255}};
	Blocks.push(b);
	
	// create a yellow block that will shirnk Squarely
	b = {x:300,y:100,h:8,w:8,color:{r:255,g:255,b:0}};
	Blocks.push(b);
	
}

// update: updates the game's state
function update() {
	
	// update Squarely's speed
	Squarely.speed = (Squarely.h + Squarely.w) / 16
	
	// check buttons
	if (Ctrls.isDown(Ctrls.UP) != 0 || Ctrls.isDown(Ctrls.KEY_W) != 0) 
		{ Squarely.y -= Squarely.speed; }
	if (Ctrls.isDown(Ctrls.DOWN) != 0 || Ctrls.isDown(Ctrls.KEY_S) != 0 ) 
		{ Squarely.y += Squarely.speed; }
	if (Ctrls.isDown(Ctrls.LEFT) != 0 || Ctrls.isDown(Ctrls.KEY_A) != 0) 
		{ Squarely.x -= Squarely.speed; }
	if (Ctrls.isDown(Ctrls.RIGHT) != 0 || Ctrls.isDown (Ctrls.KEY_D) != 0) 
		{ Squarely.x += Squarely.speed; }
	
	// change color
	Squarely.color.r += redfactor;
	Squarely.color.g = Squarely.DEFAULTCOLOR.g; Squarely.color.b = Squarely.DEFAULTCOLOR.b;
	if (Squarely.color.r < 1) {redfactor *= -1; Squarely.color.r=0; }
	if (Squarely.color.r > 255) { redfactor *= -1; Squarely.color.r=255;}
	
	// check collisions with blocks
	Squarely.color.g = 64;
	for (i = 0; i < Blocks.length; i++) {
		if (blockCollision(Squarely,Blocks[i])) {
			// on collision, crank up the green and...
			//Squarely.color.g = 255;
			// if touching a blue block, grow
			if (Blocks[i].color.b == 255) {
				Squarely.h += 1;
				Squarely.w += 1;
				if (Squarely.y < Blocks[i].y) Squarely.y -= 1; /* KLUDGE: Prevent Squarley from passing through blue block if he collides with top */
				if (Squarely.x < Blocks[i].x) Squarely.x -= 1; /* KLUDGE: Prevent Squarely from passing through blue blocks on the left */
				// limit maximum size!
				if (Squarely.h > Squarely.MAXH) { Squarely.h = Squarely.MAXH; }
				if (Squarely.w > Squarely.MAXW) { Squarely.w = Squarely.MAXW; } 
				// change color while growing
				Squarely.color = {r:32,g:32,b:128};
			}
			//if touching a yellow block, shrink
			if (Blocks[i].color.r == 255 && Blocks[i].color.g == 255 && Blocks[i].color.b == 0) {
				Squarely.h -= 1;
				Squarely.w -= 1;
				// limit minimum size!
				if (Squarely.h < Squarely.MINH) { Squarely.h = Squarely.MINH; }
				if (Squarely.w < Squarely.MINW) { Squarely.w = Squarely.MINW; }
				// change color while shrinking
				Squarely.color = {r:128,g:128,b:32};
			}
		}
	}
	
	// move camera
	camOffset.x = (_canvas.width/2)-(Squarely.w/2)-Squarely.x;
	camOffset.y = (_canvas.height/2)-(Squarely.h/2)-Squarely.y;
	

	
}

// render: draws all the crap onto the canvas
function render() { 

	// clear canvas
	_canvasContext.fillStyle = "rgb(220,220,220)";
	_canvasContext.fillRect(0,0,_canvas.width,_canvas.height);

	// draw blocks
	//rblocks=0;
	for (i=0; i<Blocks.length; ++i) {
		if (camCollision(camOffset,Blocks[i]) ) {
			//rblocks+=1;
			drawObject(Blocks[i]);
		}
		//document.getElementById("info").value = rblocks;
	}
	
	// draw NPCs
	
	// draw Squarely
	drawObject(Squarely);
}

function drawObject(obj) {
	_canvasContext.fillStyle = "rgb("+obj.color.r+","+obj.color.g+","+obj.color.b+")";
	_canvasContext.fillRect(obj.x+camOffset.x,obj.y+camOffset.y,obj.w,obj.h);
}

function boxCollision(obja,objb) {
	if(objb.w !== Infinity && obja.w !== Infinity) {
		if (isNaN(obja.w) || isNaN(objb.w) || objb.x > (obja.w+obja.x) || obja.x > (objb.w+objb.x) )
			return false;
		if (isNaN(obja.h) || isNaN(objb.h) || objb.y > (obja.h+obja.y) || obja.y > (objb.h+objb.y) )
			return false;
	}
	return true;
}

function camCollision(cam,objb) {
	cam.x *= -1;
	cam.y *= -1;
	if(objb.w !== Infinity && cam.w !== Infinity) {
		if (isNaN(cam.w) || isNaN(objb.w) || objb.x > (cam.w+cam.x) || cam.x > (objb.w+objb.x) ) {
			cam.x *= -1;
			cam.y *= -1;
			return false;
		}if (isNaN(cam.h) || isNaN(objb.h) || objb.y > (cam.h+cam.y) || cam.y > (objb.h+objb.y) ) {
			cam.x *= -1;
			cam.y *= -1;
			return false;
		}
	}
	cam.x *= -1;
	cam.y *= -1;
	return true;
}


function blockCollision(mover,block) {
	if(block.w !== Infinity && mover.w !== Infinity) {
		if (isNaN(mover.w) || isNaN(block.w) || block.x > (mover.w+mover.x) || mover.x > (block.w+block.x) )
			return false;
		if (isNaN(mover.h) || isNaN(block.h) || block.y > (mover.h+mover.y) || mover.y > (block.h+block.y) )
			return false;
	}
	
	// check if he collided with the top
	if ( (mover.y+mover.h >= block.y) && 
		 ((mover.y+mover.speed)>(block.y+block.h)) ) {
			mover.y = block.y+block.h+1;
	}
	// check if he collided with the right
	if ( (mover.x <= block.x+block.w) && 
		 ((mover.x+mover.speed)>(block.x+block.w)) ) {
			mover.x = block.x+block.w+1;
	}
	// check if he collided with the bottom
	if ( (mover.y <= block.y+block.h) && 
		 ((mover.y-mover.speed)<(block.y-mover.h)) ) {
			mover.y = block.y-mover.h-1;
	}
	// check if he collided with the left
	if ( (mover.x+mover.w >= block.x) && 
		 ((mover.x-mover.speed)<(block.x-mover.w)) ) {
			mover.x = block.x-mover.w-1;
	}
	
	return true;
}

// gameLoop: performs the game loop
function gameLoop() {
	update();
	render();
}

// ready to start!
init();
self.setInterval("gameLoop()",20);