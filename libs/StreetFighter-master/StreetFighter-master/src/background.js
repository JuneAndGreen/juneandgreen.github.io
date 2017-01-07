'use strict';

const Config = require('./config');

/**
 * 背景文件
 */

class Background {
	constructor() {
		let args = [].slice.call(arguments);

		// 创建canvas
		this.canvas = document.body.appendChild(document.createElement('canvas'));		
		this.canvas.style.cssText = `
			position: absolute;
			z-index: 10001;
		`;

		this.width = this.canvas.width = 900;
		this.height = this.canvas.height = 490;

		this.ctx = this.canvas.getContext('2d');

		// 播放bgm
		setTimeout(() => {
			let audio = new Audio();
			audio.loop = true;
			audio.src = 'sound/china.mp3';
			audio.play();
		}, 100);
	}
}

module.exports = Background;