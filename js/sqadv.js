// set up canvas
let _canvas = document.getElementById('canvas');
let _canvasContext = _canvas.getContext('2d');

// create arrays to store the game state
let Blocks = [];
let Npcs = [];
let Keys = [];
let Doors = [];
let Teleporters = [];
let Pushblocks = [];
let Morphblocks = [];

let debug = true;

// camera offsets, for scrolling camera
let camOffset = {
	x: 0,
	y: 0,
	h: _canvas.height,
	w: _canvas.width
}

// Squarely, the main character
let Squarely = {
	x: 0,
	y: 0,
	h: 16,
	w: 16,
	color: {r:64,g:64,b:64},
	MAXH: 32,
	MAXW: 32,
	MINH:  8,
	MINW:  8,
	COLORCHANGE:  {r:5, g:0, b:0 },
	speed: 2,
	keys: 0,
};

// Ctrls, handles game input
// TODO: Touch / mouse control
let Ctrls = {
	
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

// init: initializes the game
function init() {
	
	// initialize controls
	Ctrls.init();
	
	// move to the first area
	changeArea("data/area1.json");
}

// update: updates the game's state
function update() {

	// resize the canvas to fill the window
	_canvas.width = 640;
	_canvas.height = 360;
	// TODO: Find a better way to scale this
	// Possibly render to an offscreen canvas, then scale and draw to the displayed one?
	// https://www.w3schools.com/tags/canvas_scale.asp
	_canvas.style.width = window.innerWidth;
	_canvas.style.height = window.innerHeight;
	camOffset.h = _canvas.height,
	camOffset.w = _canvas.width

	// update Squarely
	changeColor(Squarely);
	
	// check buttons
	if (Ctrls.isDown(Ctrls.UP) != 0 || Ctrls.isDown(Ctrls.KEY_W) != 0) 
		{ Squarely.y -= Squarely.speed; }
	if (Ctrls.isDown(Ctrls.DOWN) != 0 || Ctrls.isDown(Ctrls.KEY_S) != 0 ) 
		{ Squarely.y += Squarely.speed; }
	if (Ctrls.isDown(Ctrls.LEFT) != 0 || Ctrls.isDown(Ctrls.KEY_A) != 0) 
		{ Squarely.x -= Squarely.speed; }
	if (Ctrls.isDown(Ctrls.RIGHT) != 0 || Ctrls.isDown (Ctrls.KEY_D) != 0) 
		{ Squarely.x += Squarely.speed; }
	
	// check collisions with blocks
	for (i = 0; i < Blocks.length; i++) {
		if (blockCollision(Squarely,Blocks[i])) {
			// DEBUG: Tell me which block
			if (debug) console.log("Block: ",i);
		}
	}

	// if touching a green block, change size
	for (let i = 0; i < Morphblocks.length; i++) {
		if (blockCollision(Squarely,Morphblocks[i])) {
			changeSize(Squarely,Morphblocks[i]);
		}
	}

	// check collisions with blocks
	for (i = 0; i < Pushblocks.length; i++) {
		if (pushblockCollision(Squarely,Pushblocks[i])) { }
	}	
	
	// check collisions with keys
	for (i = 0; i < Keys.length; i++) {
		// if touching a key
		if (blockCollision(Squarely,Keys[i])){
			// add a key to the inventory
			Squarely.keys++;
			// delete the key
			Keys.splice(i,1);
		}
	}
	
	// check for collisions with doors
	for (i=0; i<Doors.length; i++) {
		// if touching a door
		if (blockCollision(Squarely,Doors[i])){
			// if you have a key...
			if (Squarely.keys > 0) { 
				// lose a key
				Squarely.keys--;
				// open the door
				Doors.splice(i,1);
			}
		}
	}
	
	// update NPCs
	for (i=0; i<Npcs.length; ++i) {
		if (camCollision(camOffset,Npcs[i]) ) {
			changeColor(Npcs[i]);
		}
	}
	
	// check for collisions with teleporters
	for (i=0; i<Teleporters.length; ++i) {
		if (blockCollision(Squarely,Teleporters[i])){
			// reset Squareley's position
			Squarely.x = Teleporters[i].move.x;
			Squarely.y = Teleporters[i].move.y;
			// transport to the new area
			if (Teleporters[i].target == 1) {
				changeArea("data/area1.json");
				break;
			}
			if (Teleporters[i].target == 2) {
				changeArea("data/area2.json");
				break;
			}
			if (Teleporters[i].target == 3) {
				changeArea("data/the_end.json");
				break;
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
	
	// draw doors
	for (i=0; i<Doors.length; ++i){
		if (camCollision(camOffset,Doors[i]) ) {
			drawObject(Doors[i], "rgb(0,0,255)");
		}
	}	
	
	// draw blocks
	for (i=0; i<Blocks.length; ++i) {
		if (camCollision(camOffset,Blocks[i]) ) {
			drawObject(Blocks[i], "rgb(0,0,0)");
		}
	}
	
	// draw NPCs
	for (i=0; i<Npcs.length; ++i) {
		if (camCollision(camOffset,Npcs[i]) ) {
			drawObject(Npcs[i], "rgb("+Npcs[i].color.r+","+Npcs[i].color.g+","+Npcs[i].color.b+")");
		}
	}
	
	// draw Keys
	for (i=0; i<Keys.length; ++i) {
		if (camCollision(camOffset,Keys[i]) ) {
			drawObject(Keys[i], "rgb(255,255,0)");
		}
	}

	// draw Teleporters
	for (i=0; i<Teleporters.length; ++i) {
		if (camCollision(camOffset,Teleporters[i]) ) {
			drawObject(Teleporters[i], "rgb(255,255,255)");
		}
	}

	// draw pushable blocks
	for (i=0; i<Pushblocks.length; ++i) {
		if (camCollision(camOffset,Pushblocks[i]) ) {
			drawObject(Pushblocks[i], "rgb(255,0,255)");
		}
	}

	// draw morph blocks
	for (i=0; i<Morphblocks.length; ++i) {
		if (camCollision(camOffset,Morphblocks[i]) ) {
			drawObject(Morphblocks[i], "rgb(0,255,0)");
		}
	}

	// draw Squarely
	drawObject(Squarely, "rgb("+Squarely.color.r+","+Squarely.color.g+","+Squarely.color.b+")");
	
	// write message of whatever NPC is being collided with
	for (i=0; i<Npcs.length; ++i) {
		if(boxCollision(Squarely,Npcs[i])){
			drawMessage(Npcs[i]);
			break;
		}
	}

	// Print keys held (only if any are picked up)
	_canvasContext.fillStyle = "rgb(0,0,0)";
	_canvasContext.font = "bold 14px monospace";
	if (Squarely.keys != 0) {
		msg = "Keys on-hand:"+Squarely.keys;
		_canvasContext.fillText(msg,10,40);	
	}
}

function drawObject(obj,style) {
	_canvasContext.fillStyle = style;	
	_canvasContext.fillRect(obj.x+camOffset.x,obj.y+camOffset.y,obj.w,obj.h);
}

function drawMessage(obj) {

	// create a text box
	_canvasContext.fillStyle = "rgb(0,0,0)";
	_canvasContext.fillRect(0,_canvas.height-100,_canvas.width,100);
	_canvasContext.fillStyle = "rgb(255,255,255)";
	_canvasContext.fillRect(10,_canvas.height-90,_canvas.width-20,80);

	// write message
	_canvasContext.fillStyle = "rgb(0,0,0)";
	_canvasContext.font = "bold 24px monospace";
	_canvasContext.fillText(obj.message1,20,_canvas.height-60);
	_canvasContext.fillText(obj.message2,20,_canvas.height-20);
	
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

// TODO: is this function even necessary? is there a generic rectangle collision that can be used instead? 
function camCollision(cam,objb) {
	cam.x *= -1; // what in God's green, flat earth is going on here? 
	cam.y *= -1;
	// maybe we can just put this in a try/catch instead of all these little error checks
	if(objb.w !== Infinity && cam.w !== Infinity) { // "Is this error check necessary?" -- famous last words
		if (isNaN(cam.w) || isNaN(objb.w) || objb.x > (cam.w+cam.x) || cam.x > (objb.w+objb.x) ) {
			cam.x *= -1; // why is it necessary to flip signs then flip back? 
			cam.y *= -1;
			return false;
		}if (isNaN(cam.h) || isNaN(objb.h) || objb.y > (cam.h+cam.y) || cam.y > (objb.h+objb.y) ) {
			cam.x *= -1; // why is it necessary to flip signs then flip back? 
			cam.y *= -1;
			return false;
		}
	}
	cam.x *= -1; // why is it necessary to flip signs then flip back? 
	cam.y *= -1;
	return true;
}

// TODO: can blockCollision and blockCollision be consolated, or at least have their shared code refactored?
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

// TODO: see blockCollision comment
function pushblockCollision(mover,block) {
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
			// if bigger than the block, push it upward
			if ((mover.h * mover.w) > (block.h * block.w)) {
				block.y--;
				// don't let it go inside of other blocks
				for (i=0;i<Blocks.length;++i){
					if(blockCollision(block,Blocks[i])) {
						block.y++;
					}
				}
			}
	}
	// check if he collided with the right
	if ( (mover.x <= block.x+block.w) && 
		 ((mover.x+mover.speed)>(block.x+block.w)) ) {
			mover.x = block.x+block.w+1;
			// if bigger than the block, push it upward
			if ((mover.h * mover.w) > (block.h * block.w)) {
				block.x--;
				// don't let it go inside of other blocks
				for (i=0;i<Blocks.length;++i){
					if(blockCollision(block,Blocks[i])) {
						block.x++;
					}
				}
			}
	}
	// check if he collided with the bottom
	if ( (mover.y <= block.y+block.h) && 
		 ((mover.y-mover.speed)<(block.y-mover.h)) ) {
			mover.y = block.y-mover.h-1;
			// if bigger than the block, push it upward
			if ((mover.h * mover.w) > (block.h * block.w)) {
				block.y++;
				// don't let it go inside of other blocks
				for (i=0;i<Blocks.length;++i){
					if(blockCollision(block,Blocks[i])) {
						block.y--;
					}
				}
			}
	}
	// check if he collided with the left
	if ( (mover.x+mover.w >= block.x) && 
		 ((mover.x-mover.speed)<(block.x-mover.w)) ) {
			mover.x = block.x-mover.w-1;
			// if bigger than the block, push it upward
			if ((mover.h * mover.w) > (block.h * block.w)) {
				block.x++;
				// don't let it go inside of other blocks
				for (i=0;i<Blocks.length;++i){
					if(blockCollision(block,Blocks[i])) {
						block.x--;
					}
				}
			}			
	}
	
	return true;
}

function changeColor(obj) {

	// change red
	obj.color.r += obj.COLORCHANGE.r;
	if (obj.color.r < 1) {obj.COLORCHANGE.r *= -1; obj.color.r=0; }
	if (obj.color.r > 255) { obj.COLORCHANGE.r *= -1; obj.color.r=255;}
	
	// change green
	obj.color.g += obj.COLORCHANGE.g;
	if (obj.color.g < 1) {obj.COLORCHANGE.g *= -1; obj.color.g=0; }
	if (obj.color.g > 255) { obj.COLORCHANGE.g *= -1; obj.color.g=255;}
	
	// change blue
	obj.color.b += obj.COLORCHANGE.b;
	if (obj.color.b < 1) {obj.COLORCHANGE.b *= -1; obj.color.b=0; }
	if (obj.color.b > 255) { obj.COLORCHANGE.b *= -1; obj.color.b=255;}
	
}

function changeSize(Squarely,block) {
	
	// change Squarely's height closer to the block's height
	if (block.h > Squarely.h) {
		Squarely.h += 1;
		/* KLUDGE: Prevent him from passing through blocks while growing */
		if (Squarely.y < block.y) { Squarely.y--; }
		// don't let Squarely grow through blocks
		// check collisions with blocks
		for (i = 0; i < Blocks.length; i++) {
			if (blockCollision(Squarely,Blocks[i])) {
				Squarely.h -= 1;
			}
		}
	} else if (block.h < Squarely.h) {
		Squarely.h -= 1;
	} 
	
	// change Squarely's width closer to the block's width
	if (block.w > Squarely.w) {
		Squarely.w += 1;
		/* KLUDGE: Prevent him from passing through blocks */
		if (Squarely.x < block.x) { Squarely.x--; }
		// don't let Squarely grow through blocks
		// check collisions with blocks
		for (i = 0; i < Blocks.length; i++) {
			if (blockCollision(Squarely,Blocks[i])) {
				Squarely.w -= 1;
			}
		}
	} else if (block.w < Squarely.w) {
		Squarely.w -= 1;
	}
	
}

// rotate Squarely if possible
function rotate(obj) {

	// find the x and y adjustments (to make him remain centered)
	xadj = (obj.h - obj.w) / 2;
	yadj = (obj.w - obj.h) / 2;

	// swap height and width
	temp = obj.h;
	obj.h = obj.w;
	obj.w = temp;

	// if it'll push him into a block, switch back
	for (i = 0; i < Blocks.length; i++) {
		if (blockCollision(obj,Blocks[i])) {
		
			// undo the rotation
			temp = obj.h;
			obj.h = obj.w;
			obj.w = temp;
			break;
		}
	}
	
	// if it'll push him into a door, switch back
	for (i = 0; i < Doors.length; i++) {
		if (blockCollision(obj,Doors[i])) {
		
			// undo the rotation
			temp = obj.h;
			obj.h = obj.w;
			obj.w = temp;
			break;
		}
	}	
	
}

// changeArea( filename )
function changeArea( filename ) {

	// clear out the current lists of objects
	Blocks = [];
	Npcs = [];
	Keys = [];
	Doors = [];
	Teleporters = [];
	Pushblocks = [];
	Morphblocks = [];
	
	// load new objects from the specified file
	fetch(filename).then(res=>{
		return res.json();
	}).then(jsondata => {
		console.log(jsondata);
		Blocks = jsondata.blocks
		Npcs = jsondata.npcs;
		Keys = jsondata.keys;
		Doors = jsondata.doors;
		Teleporters = jsondata.teleporters;
		Pushblocks = jsondata.pushblocks;
		Morphblocks = jsondata.morphblocks;
	});

	// move squarely to the new location
}

// gameLoop: performs the game loop
function gameLoop() {
	update();
	render();
	window.requestAnimationFrame(gameLoop)
}

// ready to start!
init();
window.requestAnimationFrame(gameLoop);