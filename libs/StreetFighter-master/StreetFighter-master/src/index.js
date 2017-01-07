'use strict';

const Config = require('./config');
const Cache = require('./cache');
const Background = require('./background');
const Stage = require('./stage');
const Player = require('./player');

/**
 * 游戏基类
 */
class Game {
	constructor(mode) {
		// 0 - 人人对战
		// 1 - 人机对战
		this.mode = mode || 1;

		this.pause = false; // 是否暂停

		// loading
		this.loadingInfo = document.querySelector('.loading_info');

		// 居中显示
		document.body.style.left = `${(document.body.offsetWidth  - 900) / 2}px`;

		// 装载资源
		this.loadRes(() => {this.start()});
	}
	/**
	 * 装载资源
	 */
	loadRes(callback) {
		let num = 0; // 已加载资源数
		let sum = 0; // 总资源数
		let images = Config.images;
		let audios = Config.audios;
		let loadingInfo = this.loadingInfo;

		let imgResKeys = Object.keys(images);
		imgResKeys.forEach((key) => {sum+= images[key].length});
		sum+= audios.length; 

		// 图片
		imgResKeys.forEach((key) => {
			let item;
			let arr = images[key];

			while(item = arr.pop()) {
				let img = new Image();

				img.onload = function() {
					let name = this.src.split( '/' );
					name = name[name.length - 1].split('.')[0]; // 去掉后缀名的图片名称

					// 缓存图片
					Cache.images[name] = {
						obj: this,
						width: this.width,
						height: this.height
					};

					loadingInfo.innerHTML = `${++num}/${sum}`;
					if(sum === num) callback && callback(); // 装载完毕
					this.onload = null;
				};

				img.src = `images/${key}/${item}`;
			}
		});
		
		// 音频
		let item;

		while(item = audios.pop()) {
			let audio = new Audio();

			audio.addEventListener('canplaythrough', () => {
				Cache.audios[item] = `sound/${item}`;

				loadingInfo.innerHTML = `${++num}/${sum}`;
				if(sum === num) callback && callback(); // 装载完毕
			}, false);

			audio.src = `sound/${item}`;
		}
	}
	/**
	 * 开始游戏
	 */
	start() {
		// 去掉loading
		document.body.removeChild(document.querySelector('.loading_img'));
		document.body.removeChild(document.querySelector('.loading_title'));
		document.body.removeChild(this.loadingInfo);

		// 显示隐藏的节点
		document.querySelectorAll('.f-dn').forEach((node) => {
			node.classList.remove('f-dn');
		});

		// 创建角色
		this.player1 = new Player(Config.RYU1);
		this.player2 = new Player(Config.RYU2);

		// 初始化背景
		this.background = new Background();
		this.ctx = this.background.ctx;

		// 初始化舞台
		this.stage = new Stage();
	}
}

window.onload = () => {
	new Game();
};