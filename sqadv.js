// set up canvas
var _canvas = document.getElementById('canvas');
var _canvasContext = null;
if (_canvas && _canvas.getContext) {
	_canvasContext = _canvas.getContext('2d');
}

// When we retrieve the player's name, we need somewhere to store it
var fbName = "";

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
	COLORCHANGE:  {r:5, g:0, b:0 },
	speed: 2,
	keys: 0,
	update: function() {
		// update Squarely's speed
		Squarely.speed = (Squarely.h + Squarely.w) / 16;
		// change color
		changeColor(this);
	}
};

// Ctrls, handles game input
var Ctrls = {
	
	// mouse control parameters
	mouseX: 0,
	mouseY: 0,

	_pressed: {},
	
	MOUSE:  0,
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
		this._pressed[this.MOUSE] = 0;
		this._pressed[this.UP] = 0;
		this._pressed[this.DOWN] = 0;
		this._pressed[this.LEFT] = 0;
		this._pressed[this.RIGHT] = 0;
		this._pressed[this.KEY_W] = 0;
		this._pressed[this.KEY_A] = 0;
		this._pressed[this.KEY_S] = 0;
		this._pressed[this.KEY_D] = 0;
		this._pressed[this.KEY_RETURN] = 0;
	},
	
	isDown: function(keyCode) {
		return this._pressed[keyCode];
	},
	
	getMouseX: function() {
		return this.mouseX;
	},
	
	getMouseY: function() {
		return this.mouseY;
	},
	
	onKeyDown: function(event) {
		if (this.isDown(event.keyCode) == 0) {
			this._pressed[event.keyCode] = new Date().getTime();
		}
	},
	
	onKeyUp: function(event) {
		this._pressed[event.keyCode] = 0;
	},
	
	onMouseDown: function(event){
		this._pressed[this.MOUSE] = new Date().getTime();
		
		// if mouse is in center, rotate him
		if (this.mouseX < (_canvas.width * 3/5) && this.mouseX > (_canvas.width * 2/5) )
		if (this.mouseY < (_canvas.height * 3/5) && this.mouseY > (_canvas.height * 2/5) )
			rotate(Squarely);
	},
	
	onMouseUp: function(event){
		this._pressed[this.MOUSE] = 0;
	},

	onMouseMove: function(event){
		this.mouseX = event.layerX;
		this.mouseY = event.layerY;
	},
	
	// if the mouse leaves the canvas, consider the mouse button released
	onMouseOut: function(event) {
		this._pressed[this.MOUSE] = 0;
	},
	
	// if mouse enters canvas with button pressed, treat it like button was just pressed
	onMouseOver: function(event) {
		if (event.buttons === 1)
			this._pressed[this.MOUSE] = new Date().getTime();
	},
	
	canRotate: true
	
};

// array of blocks (terrain)
var Blocks = new Array();

// array of Npcs, characters not controlled by the player
var Npcs = new Array();

// array of Keys, to be collected for unlocking doors
var Keys = new Array();

// array of Doors, to be opened by keys
var Doors = new Array();

// init: initializes the game
function init() {
	
	// CAUTION: FACEBOOK CRAP
	// Get the user's name so we can display it for no particular reason.
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '320216424781470',
			xfbml      : true,
			version    : 'v2.4'
		});


		// If logged in, get the user's name
		function onLogin(response) {
			if (response.status == 'connected') {
				FB.api('/me?fields=first_name', function(data) {
					fbName = data.first_name;
				});
			}
		}

		// If not logged in, show login page. 
		//Seems redundant, the app won't load if you aren't logged in, will it?
		FB.getLoginStatus(function(response) {
			// Check login status on load, and if the user is
			// already logged in, go directly to the welcome message.
			if (response.status == 'connected') {
				onLogin(response);
			} else {
				// Otherwise, show Login dialog first.
				FB.login(function(response) {
					onLogin(response);
				}, {scope: 'user_friends, email'});
			}
		});
	};

	// I assume this loads the actual Facebook API?
	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));	
	
	// END FACEBOOK CRAP
	
	// place Squarely squarely in the center of the world
	Squarely.x = 0;
	Squarely.y = 0;
	
	// add listeners for keyboard input
	window.addEventListener('keyup',function(event) {Ctrls.onKeyUp(event); }, false);
	window.addEventListener('keydown',function(event) {Ctrls.onKeyDown(event); }, false);
	_canvas.addEventListener('mousedown',function(event) {Ctrls.onMouseDown(event);},false);
	_canvas.addEventListener('mouseup',function(event) {Ctrls.onMouseUp(event);},false);
	_canvas.addEventListener('mousemove',function(event) {Ctrls.onMouseMove(event);},false);
	_canvas.addEventListener('mouseout',function(event) {Ctrls.onMouseOut(event);},false);
	_canvas.addEventListener('mouseover',function(event){Ctrls.onMouseOver(event);},false);
	
	// initialize controls
	Ctrls.init();
	
	// create a block or two-dozen
	var b = {x:20,y:10,h:300,w:25,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:400,y:350,h:200,w:200,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-500,y:-500,h:30,w:300,color:{r:20,g:20,b:20}};
	Blocks.push(b);
	
	// create a little house thingy
	b = {x:200,y:-300,h:16,w:100,color:{r:0,g:0,b:0}};
	Blocks.push(b)
	b = {x:200,y:-300,h:100,w:16,color:{r:0,g:0,b:0}};
	Blocks.push(b)
	b = {x:300,y:-300,h:100,w:16,color:{r:0,g:0,b:0}};
	Blocks.push(b)
	
	// put a key in the house
	n = { x:250,y:-250,w:16,h:16,color:{r:255,g:255,b:00}}
	Keys.push(n);
	
	// make a door for testing stuff
	n = { x:200+8,y:-200-16,w:100,h:16,color:{r:0,g:0,b:255}}
	Doors.push(n);

	// create another house thingy
	b = {x:-200,y:-300,h:16,w:100,color:{r:0,g:0,b:0}};
	Blocks.push(b)
	b = {x:-200,y:-300,h:100,w:16,color:{r:0,g:0,b:0}};
	Blocks.push(b)
	b = {x:-100,y:-300,h:100,w:16,color:{r:0,g:0,b:0}};
	Blocks.push(b)

	// make another NPC for some reason
	n = { x:-150,y:-250,w:16,h:16,color:{r:64,g:64,b:64},
		COLORCHANGE: {r:0,g:3,b:7},
		update: function() {
			changeColor(this);
		},
		message1: "I am Error.",
		message2: "",
	}
	Npcs.push(n);
		
	// make another door for testing stuff	
	n = { x:-200+8,y:-200-16,w:100,h:16,color:{r:0,g:0,b:255}}
	Doors.push(n);
	
	// create walls that can NEVER BE BREACHED
	b = {x:-1000,y:-1000,h:20,w:2000,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-1000,y:-1000,h:2000,w:20,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:-1000,y:1000,h:20,w:2020,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	b = {x:1000,y:-1000,h:2000,w:20,color:{r:0,g:0,b:0}};
	Blocks.push(b);
	
	// create block that will grow Squarely
	b = {x:100,y:180,h:64,w:64,color:{r:0,g:255,b:0}};
	Blocks.push(b);
	
	// create block that changes Squarely to normal size
	b = {x:200,y:80,h:16,w:16,color:{r:0,g:255,b:0}};
	Blocks.push(b);
	
	// create a block that will shrink Squarely
	b = {x:300,y:80,h:8,w:64,color:{r:0,g:255,b:0}};
	Blocks.push(b);

	// prevent arrow keys from scrolling window
	window.addEventListener("keydown", function(e) {
		// space and arrow keys
		if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		} 
	}, false);
	
	// assume buttons are up when the window loses focus
	window.addEventListener('blur',function(){Ctrls.init();},false);

	// let's make an NPC!
	var n = { x:600,y:300,w:16,h:16,color:{r:64,g:64,b:255}, 
		COLORCHANGE: {r:0,g:0,b:4},
		update: function() {
			changeColor(this);
		},
		message1: "I'm a test NPC.",
		message2: "I don't have much to say."
	}
	Npcs.push(n);
	
	// make a key for testing stuff
	n = { x:-50,y:-50,w:16,h:16,color:{r:255,g:255,b:00}}
	Keys.push(n);

}

// update: updates the game's state
function update() {

	// resize the canvas to fill the window
	_canvas.width = document.body.clientWidth;
	_canvas.height = document.body.clientHeight;
	canvasW = _canvas.width;
	canvasH = _canvas.height;
	camOffset.h = _canvas.height,
	camOffset.w = _canvas.width

	// update Squarely
	// (speed, color, etc.)
	Squarely.update();
	
	// check mouse controls
	// TODO: Use distance function to create more precise movement
	if (Ctrls.isDown(Ctrls.MOUSE)) {
	
		// Move squarely according to where the mouse is being moved
		if (Ctrls.getMouseX() < (_canvas.width / 3) )
			{ Squarely.x -= Squarely.speed; }
		if (Ctrls.getMouseX() > ((_canvas.width / 3) * 2) ) 
			{ Squarely.x += Squarely.speed; }
		if (Ctrls.getMouseY() < (_canvas.height / 3) )
			{ Squarely.y -= Squarely.speed; }
		if (Ctrls.getMouseY() > ((_canvas.height / 3) * 2) )
			{ Squarely.y += Squarely.speed; }
	}
	
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
			// if touching a green block
			if (Blocks[i].color.g==255 && Blocks[i].color.r==0 && Blocks[i].color.b==0) {
				// change size
				changeSize(Squarely,Blocks[i]);
			}
		}
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
			Npcs[i].update();
		}
	}
	
	// check collision with NPCs
	
	// move camera
	camOffset.x = (_canvas.width/2)-(Squarely.w/2)-Squarely.x;
	camOffset.y = (_canvas.height/2)-(Squarely.h/2)-Squarely.y;
	
	// rotate
	if (Ctrls.isDown(Ctrls.KEY_RETURN) && Squarely.canRotate) {
		rotate(Squarely);
		Squarely.canRotate = false;
	} else if (!Ctrls.isDown(Ctrls.KEY_RETURN)) {
		Squarely.canRotate = true;
	}
	
}

// render: draws all the crap onto the canvas
function render() { 

	// clear canvas
	_canvasContext.fillStyle = "rgb(220,220,220)";
	_canvasContext.fillRect(0,0,_canvas.width,_canvas.height);
	
	// draw doors
	// debug: count doors drawn
	doorsDrawn = 0;
	for (i=0; i<Doors.length; ++i){
		if (camCollision(camOffset,Doors[i]) ) {
			drawObject(Doors[i]);
			doorsDrawn++;
		}
	}	
	
	// draw blocks
	blocksDrawn = 0;
	for (i=0; i<Blocks.length; ++i) {
		if (camCollision(camOffset,Blocks[i]) ) {
			drawObject(Blocks[i]);
			blocksDrawn++;
		}
	}
	
	// draw NPCs
	NpcsDrawn = 0;
	for (i=0; i<Npcs.length; ++i) {
		if (camCollision(camOffset,Npcs[i]) ) {
			drawObject(Npcs[i]);
			NpcsDrawn++;
		}
	}
	
	// draw Keys
	KeysDrawn = 0;
	for (i=0; i<Keys.length; ++i) {
		if (camCollision(camOffset,Keys[i]) ) {
			drawObject(Keys[i]);
			KeysDrawn++;
		}
	}
	
	// draw Squarely
	drawObject(Squarely);
	
	// write message of whatever NPC is being collided with
	for (i=0; i<Npcs.length; ++i) {
		if(boxCollision(Squarely,Npcs[i])){
			drawMessage(Npcs[i]);
			break;
		}
	}
	
	//Debug: Print stats
	_canvasContext.fillStyle = "rgb(0,0,0)";
	_canvasContext.font = "bold 14px monospace";
	// objects rendered/in area
	msg = "Blocks:"+blocksDrawn+"/"+Blocks.length+" NPCs:"+NpcsDrawn+"/"+Npcs.length+" Keys:"+KeysDrawn+"/"+Keys.length+" Doors:"+doorsDrawn+"/"+Doors.length;
	_canvasContext.fillText(msg,10,20);	
	// keys held
	msg = "Keys on-hand:"+Squarely.keys;
	_canvasContext.fillText(msg,10,40);	
	
	// CAUTION: FACEBOOK CRAP
	// Can't think of anything interesting to do, may as well just display the player's name somewhere.
	_canvasContext.fillText(fbName,_canvas.width-100,50);

}

function drawObject(obj) {
	_canvasContext.fillStyle = "rgb("+obj.color.r+","+obj.color.g+","+obj.color.b+")";
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

// rotate Squarley if possible
function rotate(obj) {

	// find the x and y adjustments (to make him remain centered)
	xadj = (obj.h - obj.w) / 2;
	yadj = (obj.w - obj.h) / 2;

	// swap height and width
	temp = obj.h;
	obj.h = obj.w;
	obj.w = temp;

	// BUG: These adjustments let 
	// adjust x and y (keep him centered)
	//obj.x = obj.x - xadj;
	//obj.y = obj.y - yadj;
	
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

// gameLoop: performs the game loop
function gameLoop() {
	update();
	render();
}

// ready to start!
init();
self.setInterval("gameLoop()",20);