export const Physics = {
	
	// moveObject(): Move an object based on its current speed. Pass in
	// the object to be moved and the time delta in milliseconds. 
	moveObject: function (obj,delta) {
		obj.x += obj.speed.x * (delta / 1000);
		obj.y += obj.speed.y * (delta / 1000);
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

	// blockCollision: calculcate the minimum translation vector to determine
	// from which side the collision occured. Use this vector to eject the 
	// mover from the block.
	blockCollision: function (mover, block) {
		// calculate the center points of both objects
		const moverCenter = {x: mover.x + mover.w / 2, y: mover.y + mover.h / 2};
		const blockCenter = {x: block.x + block.w / 2, y: block.y + block.h / 2}; 

		// get the difference between the two center points
		const diff = {x: moverCenter.x - blockCenter.x, y: moverCenter.y - blockCenter.y };

		// calculate how close the centers need to be for an overlap to occur
		const totalHalfWidth = (mover.w + block.w) / 2;
		const totalHalfHeight = (mover.h + block.h) / 2;

		// check for overlap
		if( Math.abs(diff.x) < totalHalfWidth && Math.abs(diff.y) < totalHalfHeight ) {
			const overlap = {x: totalHalfWidth - Math.abs(diff.x), y: totalHalfHeight - Math.abs(diff.y)};
			// determine on which axis the overlap is smaller and resolve that one
			if (overlap.x < overlap.y) {
				// if the mover has a speed property, stop it
				if('speed' in mover) { mover.speed.x = 0; }
				if (diff.x > 0) {
					mover.x += overlap.x;
					return "left";
				} else {
					mover.x -= overlap.x;
					return "right";
				}
			} else {
				if('speed' in mover) { mover.speed.y = 0; }
				if (diff.y > 0) {
					mover.y += overlap.y;
					return "top";
				} else {
					mover.y -= overlap.y;
					return "bottom";
				}
			}
		}
		return null;
	}
};
