import { Time } from './time.js';
import { Ctrls } from './ctrls.js';
import { Screen } from './screen.js';
import { Physics } from './physics.js';

// create arrays to store the game state
const Blocks = [];
const Npcs = [];
const Keys = [];
const Doors = [];
const Teleporters = [];
const Pushblocks = [];
const Morphblocks = [];

// Squarely, the main character
const Squarely = {
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
	if (Ctrls.isDown(Ctrls.UP) !== 0 || Ctrls.isDown(Ctrls.KEY_W) !== 0){ 
		Squarely.speed.y = -100;
	}
	if (Ctrls.isDown(Ctrls.DOWN) !== 0 || Ctrls.isDown(Ctrls.KEY_S) !==0 ) {
		Squarely.speed.y = 100;
	}		
	if (Ctrls.isDown(Ctrls.LEFT) !== 0 || Ctrls.isDown(Ctrls.KEY_A) !== 0) {
		Squarely.speed.x = -100;
	}
	if (Ctrls.isDown(Ctrls.RIGHT) !== 0 || Ctrls.isDown (Ctrls.KEY_D) !== 0) {
		Squarely.speed.x = 100;
	}
	Physics.moveObject(Squarely,Time.delta);
	
	// check collisions with blocks
	Blocks.forEach( (b) => {
		Physics.blockCollision(Squarely,b); 
	});

	// if touching a green block, change size
	Morphblocks.forEach( (m) => {
		if ( Physics.blockCollision(Squarely,m) ) {
			changeSize(Squarely,m);
		}
	});

	// check collisions with pushable blocks
	Pushblocks.forEach( (p) => {
		//Physics.pushblockCollision(Squarely,p);
		if (Squarely.w * Squarely.h >= p.w * p.h) {
			Physics.blockCollision(p,Squarely);
		} else {
			Physics.blockCollision(Squarely,p);
		}
	});
	
	// check collisions with keys
	Keys.forEach( (k,i) => {
		if ( Physics.boxCollision(Squarely,k) ) {
			Squarely.keys++;
			Keys.splice(i,1);
		}
	});
	
	// check for collisions with doors
	Doors.forEach( (d,i) => {
		if ( Physics.blockCollision(Squarely,d) && Squarely.keys > 0) {
			Squarely.keys--;
			Doors.splice(i,1);
		}
	});
	
	// update NPCs
	Npcs.forEach( (n) => {
		changeColor(n);
	});
	
	// check for collisions with teleporters
	Teleporters.forEach( (t) => {
		if ( Physics.blockCollision(Squarely,t) ){
			// reset Squareley's position
			Squarely.x = t.move.x;
			Squarely.y = t.move.y;
			// transport to the new area
			if (t.target === 1) {
				changeArea("data/area1.json");
			}
			else if (t.target === 2) {
				changeArea("data/area2.json");
			}
			else if (t.target === 3) {
				changeArea("data/area3.json");
			}
			else {
				changeArea("data/the_end.json");
			}
		}
	});
	
	// move camera
	Screen.moveCamera(Squarely);
}

// render: draws all the crap onto the canvas
function render() { 

	// erase the canvas
	Screen.clear();

	// draw doors
	Doors.forEach( (d) => {
		if ( Physics.boxCollision(Screen.camera,d) ) {
			Screen.drawObject(d, "rgb(0,0,255");
		}
	} );
	
	// draw blocks
	Blocks.forEach( (b) => {
		if ( Physics.boxCollision(Screen.camera,b) ) {
			Screen.drawObject(b, "rgb(0,0,0");
		}
	});

	// draw NPCs
	Npcs.forEach( (n) => {
		if ( Physics.boxCollision(Screen.camera, n) ) {
			Screen.drawObject(n, "rgb("+n.color.r+","+n.color.g+","+n.color.b+")");
		}
	});
	
	// draw Keys
	Keys.forEach( (k) => {
		if ( Physics.boxCollision(Screen.camera, k) ) {
			Screen.drawObject(k, "rgb(255,255,0)");
		}
	});

	// draw Teleporters
	Teleporters.forEach( (t) => {
		if ( Physics.boxCollision(Screen.camera,t) ) {
			Screen.drawObject(t, "rgb(255,255,255");
		}
	});

	// draw pushable blocks
	Pushblocks.forEach( (p) => {
		if ( Physics.boxCollision(Screen.camera,p) ) {
			Screen.drawObject(p, "rgb(255,0,255)");
		}
	});

	// draw morph blocks
	Morphblocks.forEach( (m) => {
		if ( Physics.boxCollision(Screen.camera,m) ) {
			Screen.drawObject(m, "rgb(0,255,0)");
		}
	});

	// draw Squarely
	Screen.drawObject(Squarely, "rgb("+Squarely.color.r+","+Squarely.color.g+","+Squarely.color.b+")");
	
	// write message of whatever NPC is being collided with
	Npcs.forEach( (n) => {
		if ( Physics.boxCollision(Squarely,n) ) {
			Screen.drawMessage(n);
		}
	});

	// Print keys held (only if any are picked up)
	Screen.bufferCtx.fillStyle = "rgb(0,0,0)";
	Screen.bufferCtx.font = "bold 14px monospace";
	if (Squarely.keys !== 0) {
		Screen.bufferCtx.fillText("Keys:"+Squarely.keys, 10, 40);
	}

	// draw the offscreen canvas to the onscreen one
	Screen.canvasCtx.drawImage(
		Screen.buffer,0,0,Screen.buffer.width,Screen.buffer.height,
		0,0,Screen.canvas.width,Screen.canvas.height);
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
			if (Physics.blockCollision(Squarely,Blocks[i])) {
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
			if (Physics.blockCollision(Squarely,Blocks[i])) {
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
	Blocks.length = 0;
	Npcs.length = 0;
	Keys.length = 0;
	Doors.length = 0;
	Teleporters.length = 0;
	Pushblocks.length = 0;
	Morphblocks.length = 0;
	
	// load new objects from the specified file
	fetch(filename).then(res=>{
		if (!res.ok) {
			throw new Error("Load failed!");
		}
		return res.json();
	}).then(jsondata => {
		jsondata.blocks.forEach( (e,i) => { Blocks.push(e); } );
		jsondata.npcs.forEach( (e,i) => { Npcs.push(e); } );
		jsondata.keys.forEach( (e,i) => { Keys.push(e); } );
		jsondata.doors.forEach( (e,i) => { Doors.push(e); } );;
		jsondata.teleporters.forEach( (e,i) => { Teleporters.push(e); } );
		jsondata.pushblocks.forEach( (e,i) => { Pushblocks.push(e); } );
		jsondata.morphblocks.forEach( (e,i) => { Morphblocks.push(e); } );
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
