import { Time } from './time.js';
import { Ctrls } from './ctrls.js';
import { Screen } from './screen.js';

// create arrays to store the game state
let Blocks = [];
let Npcs = [];
let Keys = [];
let Doors = [];
let Teleporters = [];
let Pushblocks = [];
let Morphblocks = [];

// Squarely, the main character
let Squarely = {
	x: 0,
	y: 0,
	h: 16,
	w: 16,
	last_x: 0,
	last_y: 0,
	color: {r:64,g:64,b:64},
	MAXH: 32,
	MAXW: 32,
	MINH:  8,
	MINW:  8,
	COLORCHANGE:  {r:5, g:0, b:0 },
	speed: {x:0, y:0 },
	max_speed: 100,
	keys: 0,
};

function moveObject(obj) {
	obj.last_x = obj.x;
	obj.last_y = obj.y;
	obj.x += obj.speed.x * Time.delta / 1000;
	obj.y += obj.speed.y * Time.delta / 1000;
}

// init: initializes the game
function init() {

	// initialize the screen
	Screen.init();
	
	// initialize controls
	Ctrls.init();
	
	// initialize timer
	Time.init();

	// resize the canvas
	Screen.resize();
	window.addEventListener("resize",Screen.resize);
	
	// move to the first area
	changeArea("data/area1.json");
}

// update: updates the game's state
function update() {

	// update time
	Time.update();

	// update Squarely
	changeColor(Squarely);
	
	// check buttons
	Squarely.speed.y = 0;
	Squarely.speed.x = 0;
	if (Ctrls.isDown(Ctrls.UP) != 0 || Ctrls.isDown(Ctrls.KEY_W) != 0){ 
		Squarely.speed.y = -100;
	}
	if (Ctrls.isDown(Ctrls.DOWN) != 0 || Ctrls.isDown(Ctrls.KEY_S) != 0 ) {
		Squarely.speed.y = 100;
	}		
	if (Ctrls.isDown(Ctrls.LEFT) != 0 || Ctrls.isDown(Ctrls.KEY_A) != 0) {
		Squarely.speed.x = -100;
	}
	if (Ctrls.isDown(Ctrls.RIGHT) != 0 || Ctrls.isDown (Ctrls.KEY_D) != 0) {
		Squarely.speed.x = 100;
	}
	moveObject(Squarely);
	
	// check collisions with blocks
	for (let i = 0; i < Blocks.length; i++) {
		if (blockCollision(Squarely,Blocks[i])) { }
	}

	// if touching a green block, change size
	for (let i = 0; i < Morphblocks.length; i++) {
		if (blockCollision(Squarely,Morphblocks[i])) {
			changeSize(Squarely,Morphblocks[i]);
		}
	}

	// check collisions with blocks
	for (let i = 0; i < Pushblocks.length; i++) {
		if (pushblockCollision(Squarely,Pushblocks[i])) { }
	}	
	
	// check collisions with keys
	for (let i = 0; i < Keys.length; i++) {
		// if touching a key
		if (boxCollision(Squarely,Keys[i])){
			// add a key to the inventory
			Squarely.keys++;
			// delete the key
			Keys.splice(i,1);
		}
	}
	
	// check for collisions with doors
	for (let i=0; i<Doors.length; i++) {
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
	for (let i=0; i<Npcs.length; ++i) {
		if (boxCollision(Screen.camera,Npcs[i]) ) {
			changeColor(Npcs[i]);
		}
	}
	
	// check for collisions with teleporters
	for (let i=0; i<Teleporters.length; ++i) {
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
				changeArea("data/area3.json");
				break;
			}
			else {
				changeArea("data/the_end.json");
			}
		}
	}
	
	// move camera
	Screen.moveCamera(Squarely);
}

// render: draws all the crap onto the canvas
function render() { 

	// erase the canvas
	Screen.clear();

	// draw doors
	for (let i=0; i<Doors.length; ++i){
		if (boxCollision(Screen.camera,Doors[i]) ) {
			Screen.drawObject(Doors[i], "rgb(0,0,255)");
		}
	}	
	
	// draw blocks
	for (let i=0; i<Blocks.length; ++i) {
		if (boxCollision(Screen.camera,Blocks[i]) ) {
			Screen.drawObject(Blocks[i], "rgb(0,0,0)");
		}
	}
	
	// draw NPCs
	for (let i=0; i<Npcs.length; ++i) {
		if (boxCollision(Screen.camera,Npcs[i]) ) {
			Screen.drawObject(Npcs[i], "rgb("+Npcs[i].color.r+","+Npcs[i].color.g+","+Npcs[i].color.b+")");
		}
	}
	
	// draw Keys
	for (let i=0; i<Keys.length; ++i) {
		if (boxCollision(Screen.camera,Keys[i]) ) {
			Screen.drawObject(Keys[i], "rgb(255,255,0)");
		}
	}

	// draw Teleporters
	for (let i=0; i<Teleporters.length; ++i) {
		if (boxCollision(Screen.camera,Teleporters[i]) ) {
			Screen.drawObject(Teleporters[i], "rgb(255,255,255)");
		}
	}

	// draw pushable blocks
	for (let i=0; i<Pushblocks.length; ++i) {
		if (boxCollision(Screen.camera,Pushblocks[i]) ) {
			Screen.drawObject(Pushblocks[i], "rgb(255,0,255)");
		}
	}

	// draw morph blocks
	for (let i=0; i<Morphblocks.length; ++i) {
		if (boxCollision(Screen.camera,Morphblocks[i]) ) {
			Screen.drawObject(Morphblocks[i], "rgb(0,255,0)");
		}
	}

	// draw Squarely
	Screen.drawObject(Squarely, "rgb("+Squarely.color.r+","+Squarely.color.g+","+Squarely.color.b+")");
	
	// write message of whatever NPC is being collided with
	for (let i=0; i<Npcs.length; ++i) {
		if(boxCollision(Squarely,Npcs[i])){
			Screen.drawMessage(Npcs[i]);
			break;
		}
	}

	// Print keys held (only if any are picked up)
	Screen.bufferCtx.fillStyle = "rgb(0,0,0)";
	Screen.bufferCtx.font = "bold 14px monospace";
	if (Squarely.keys != 0) {
		Screen.bufferCtx.fillText("Keys:"+Squarely.keys, 10, 40);
	}

	// draw the offscreen canvas to the onscreen one
	Screen.canvasCtx.drawImage(
		Screen.buffer,0,0,Screen.buffer.width,Screen.buffer.height,
		0,0,Screen.canvas.width,Screen.canvas.height);
}

// boxCollision: Check if two objects have overlapping rectangles
function boxCollision(obja,objb) {
	if(objb.w !== Infinity && obja.w !== Infinity) {
		if (isNaN(obja.w) || isNaN(objb.w) || objb.x > (obja.w+obja.x) || obja.x > (objb.w+objb.x) )
			return false;
		if (isNaN(obja.h) || isNaN(objb.h) || objb.y > (obja.h+obja.y) || obja.y > (objb.h+objb.y) )
			return false;
	}
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
	if ( (mover.y+mover.h > block.y) && (mover.last_y+mover.h <= block.y) ) {
		mover.y = block.y - mover.h;
		mover.speed.y = 0;
	}
	// check if he collided with the right
	if ( (mover.x+mover.w > block.x) && (mover.last_x+mover.w <= block.x) ) {
		mover.x = block.x - mover.w;
		mover.speed.x = 0;
	}
	// check if he collided with the bottom
	if ( (mover.y < block.y+block.h) && (mover.last_y >= block.y+block.h) ) {
		mover.y = block.y + block.h;
		mover.speed.y = 0;
	}
	// check if he collided with the left
	if ( (mover.x < block.x+block.w) && (mover.last_x >= block.x+block.w) ) {
		mover.x = block.x + block.w;
		mover.speed.y = 0;
	}
	
	return true;
}

// pushblockCollision(): check collisions with push blocks.
// Squarely is blocked by them if smaller, can push them if >= in size.
// KLUDGE: Without Math.floor, Squarely may pass through. Still may 
// happen, but happens less often. 
function pushblockCollision(mover,block) {
	if(block.w !== Infinity && mover.w !== Infinity) {
		if (isNaN(mover.w) || isNaN(block.w) || block.x > (mover.w+mover.x) || mover.x > (block.w+block.x) )
			return false;
		if (isNaN(mover.h) || isNaN(block.h) || block.y > (mover.h+mover.y) || mover.y > (block.h+block.y) )
			return false;
	}
	// calculate once if he is bigger than the target pushblock
	let bigger = (mover.w * mover.h) >= (block.w *block.h);
	// check if he collided with the top
	if ( (mover.y+mover.h > block.y) && (mover.last_y+mover.h <= block.y) ) {
		if (bigger) {
			block.y = mover.y + mover.h;
		} else {
			mover.y = block.y - mover.h;
			mover.speed.y = 0;
		}
	}
	// check if he collided with the right
	if ( (mover.x+mover.w > block.x) && (mover.last_x+mover.w <= block.x) ) {
		if (bigger) {
			block.x = mover.x + mover.w;
		} else {
			mover.x = block.x - mover.w;
			mover.speed.x = 0;
		}
	}
	// check if he collided with the bottom
	if ( (mover.y < block.y+block.h) && (mover.last_y >= block.y+block.h) ) {
		if (bigger) {
			block.y = Math.floor(mover.y - block.h);
		} else {
			mover.y = block.y + block.h;
			mover.speed.y = 0;
		}
	}
	// check if he collided with the left
	if ( (mover.x < block.x+block.w) && (mover.last_x >= block.x+block.w) ) {
		if (bigger) {
			block.x = Math.floor(mover.x - block.w);
		} else {
			mover.x = block.x + block.w;
			mover.speed.y = 0;
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
		for (let i = 0; i < Blocks.length; i++) {
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
		for (let i = 0; i < Blocks.length; i++) {
			if (blockCollision(Squarely,Blocks[i])) {
				Squarely.w -= 1;
			}
		}
	} else if (block.w < Squarely.w) {
		Squarely.w -= 1;
	}
	
}

// changeArea(): Load a new area, specify a JSON containing the level 
// properties. 
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
		if (!res.ok) {
			throw new Error("Load failed!");
		}
		return res.json();
	}).then(jsondata => {
		Blocks = jsondata.blocks
		Npcs = jsondata.npcs;
		Keys = jsondata.keys;
		Doors = jsondata.doors;
		Teleporters = jsondata.teleporters;
		Pushblocks = jsondata.pushblocks;
		Morphblocks = jsondata.morphblocks;
	}).catch( error => {
		console.log("Failed to load level: " + error);
	});

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
