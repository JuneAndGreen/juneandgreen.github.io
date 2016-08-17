'use strict';

const Config = require('./config');
const Cache = require('./cache');

/**
 * 动画执行器
 */

class Timer {
	constructor() {
		this.timer;
		this.cache = [];
	}
	/**
	 * 追加动画
	 */
	add(act) {
		this.cache.unshift();
	}
	/**
	 * 开启循环检查
	 */
	start() {
		if(this.timer) return;

		this.timer = setInterval(() => {
			let item;
			while(item = this.cache.pop()) {
				if(item.state === 'stop') continue; // 不需要执行的动画

				item();
			}
		}, Config.fps);
	}
}

module.exports = Timer;