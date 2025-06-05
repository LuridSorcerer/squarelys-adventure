export const Time = {
	now: 0,
	delta: 0,
	init: function() {
		this.now = Date.now();
		this.delta = 0;
	},
	update: function() {
		let current = Date.now();
		this.delta = current - this.now;
		this.now = current;
	}
};
