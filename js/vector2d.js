export const Vector2d = {

	getDistance: function (a,b) {
		return Math.hypot( b.x - a.x, b.y - a.y );
	},

	normalize: function (a) {
		let l = Math.hypot(a.x, a.y);
		if (l === 0) { return {x:NaN, y:NaN }; }
		return {x: a.x/l, y: a.y/l}; 
	}
};
