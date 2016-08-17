'use strict';

const Config = require('./config');
const Cache = require('./cache');
const Timer = require('./timer');

/**
 * 角色
 */

class Player {
	constructor(config) {
		this.states = config.states; // 角色状态
		this.queue = []; // 执行队列
		this.timer = new Timer(); // 动作执行器
		this.timer.start();
	}
	/**
	 * 初始化状态
	 */
	init(left, top, direction) {
		this.play(this.states.default);
	}
	/**
	 * 追加某个状态
	 */
	play(state) {
		if(state) this.queue.push(this.states[state]);
		this.fire();
	}
	/**
	 * 执行某个状态
	 */
	fire() {
		let state = this.currentState = this.queue.unshift();

		if(!state) {
			// 队列里没有状态，则进入默认状态
			this.queue.push(this.states[this.states.default]);
			this.fire();
			return;
		}


	}
}

module.exports = Player;