export const Physics = {
	
	// moveObject(): Move an object based on its current speed. Pass in
	// the object to be moved and the time delta in milliseconds. 
	moveObject: function (obj,delta) {
		obj.last_x = obj.x;
		obj.last_y = obj.y;
		obj.x += obj.speed.x * delta / 1000;
		obj.y += obj.speed.y * delta / 1000;
	},
	
	// boxCollision(): Check if two objects have overlapping rectangles
	boxCollision: function (obja,objb) {
		if(objb.w !== Infinity && obja.w !== Infinity) {
			if (isNaN(obja.w) || isNaN(objb.w) || objb.x > (obja.w+obja.x) || obja.x > (objb.w+objb.x) )
				return false;
			if (isNaN(obja.h) || isNaN(objb.h) || objb.y > (obja.h+obja.y) || obja.y > (objb.h+objb.y) )
				return false;
		}
		return true;
	},

	// blockCollision(): If collision occured, eject the mover from the
	// block. Push them to the edge of the block based on the direction
	// they were moving.
	blockCollision: function (mover,block) {
		// if no collision happened, no need to proceed
		if( !this.boxCollision(mover,block) ) { return false; }
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
	},

	// pushblockCollision(): check collisions with push blocks.
	// Mover is blocked by them if smaller, can push them if >= in size.
	// KLUDGE: Sometimes clips through block when pushing up or left, 
	// added a buffer but it still sometimes happens
	pushblockCollision: function (mover,block) {
		// if no collision happened, no need to proceed
		if( !this.boxCollision(mover,block) ) { return false; }
		// calculate once if he is bigger than the target pushblock
		let bigger = (mover.w * mover.h) >= (block.w * block.h);
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
};
