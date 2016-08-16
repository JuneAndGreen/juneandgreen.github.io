'use strict';

class Time {
	constructor() {
		this.t;
		this.timers = [];
		this.curr;
		this.prepareTimer = [];
		this.slowTimer = 1;
		this.index = 0;
	}
	add(fn) {
		fn.state = 'normal';

		let start = () => {
			if(fn.state === 'normal') {
				this.unshift( fn );
				fn.state = 'add';
			} else if(fn.state === 'stop') {
				fn.state = 'add';	
			}
		};

		let stop = () => {
			fn.state = 'stop';
		};

		return {
			start,
			stop
		};
	}
	unshift(fn) {
		return this.prepareTimer.unshift(fn);  //保持同步, 不然可能会出现A添加进了timer， 而B没有. 好基友永远不分开.
	}
	getSlow() {
		return Config.fps * this.slowTimer;	
	}
	start() {
		if(this.t) return;

		// 开启帧数控制
		this.t = setInterval(() => {
			if(this.slowTimer !== 1 ) {
				if(this.index++ % this.slowTimer !== 0 ) {
					return;
				}
			}

			// 合并timer
			this.timers = this.prepareTimer.concat(this.timers);
			this.prepareTimer.length = 0;

			let curr = this.curr;
			for(curr = this.timers.length - 1; curr >= 0; curr--) {
				if(this.timers[curr].state === 'stop' ) continue;
				
				this.timers[curr]();
			}
			this.curr = curr;
		}, Config.fps * this.slowTimer);
	}
	clean() {
		for(; this.curr >= 0; this.curr-- ){
			if(this.timers[this.curr]() === 'done') {
				this.timers.splice(i, 1);
			}
		}
	}
	push(fn) {
		this.timers[this.timers.length] = fn;
		return fn;
	}
	normal() {
		this.slowTimer = 1;
	}
	checkZindex(fn) {
		let j;
		let k;
		let oldFn;
		for(let i = 0, c; c = this.timers[i++];) {
			if(c === fn) {
				j =  i - 1;	
			} else if(c.zIndex) {
				k = i - 1;
				oldFn = c;
			}
		}
		if(j > k) {
			this.timers[ j ] = oldFn;
			this.timers[ k ] = fn;	
		}
	}
	slow(timer) {
		this.stop()
		this.slowTimer = 3;
		this.start();
		setTimeout(() => {
			this.stop();
			this.slowTimer = 1;
			this.start();
		}, timer);
	}
	stop() {
		this.clean();
		clearInterval(this.t);
		this.t = null;
	}
	empty() {
		this.timers.length = 0;
	}
}

var Timer = new Time();