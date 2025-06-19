export const Time = {
	now: 0,
	delta: 0,
	DELTA_CAP: 50,
	init: function() {
		this.now = Date.now();
		this.delta = 0;
	},
	update: function() {
		let current = Date.now();
		this.delta = current - this.now;
		if(this.delta > this.DELTA_CAP) { this.delta = this.DELTA_CAP; }
		this.now = current;
	}
};
