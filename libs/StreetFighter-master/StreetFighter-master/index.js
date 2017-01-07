/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Config = __webpack_require__(1);
	const Cache = __webpack_require__(2);
	const Background = __webpack_require__(4);
	const Stage = __webpack_require__(5);
	const Player = __webpack_require__(6);

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

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * 配置文件
	 */

	module.exports = {
		fps: 17, // 帧数
		map: {
			bgBehindImg: 'behind',
			bgFrontImg: 'front',
		},

		images: {
			g: ['behind.gif', 'fighterShadow.gif', 'front.gif'],
			RYU1: ['RYU1_wait.gif', 'RYU1_goForward.gif', 'RYU1_goBack.gif', 'RYU1_jumpUp.gif', 'RYU1_jump_down.gif', 'RYU1_impact_boxing.gif', 'RYU1_after_impact_boxing.gif', 'RYU1_before_whirl_kick.gif', 'RYU1_after_whirl_kick.gif', 'RYU1_whirl_kick.gif', 'RYU1_heavy_kick.gif', 'RYU1_jump_forward.gif', 'RYU1_crouch_heavy_kick.gif', 'RYU1_stand_up.gif', 'RYU1_crouch.gif', 'RYU1_jump_forward.gif', 'RYU1_jump_back.gif', 'RYU1_light_boxing.gif', 'RYU1_crouch_light_boxing.gif', 'RYU1_light_kick.gif', 'RYU1_middle_boxing.gif', 'RYU1_crouch_middle_boxing.gif', 'RYU1_crouch_light_kick.gif', 'RYU1_wave_boxing.gif', 'RYU1_jump_light_kick.gif', 'RYU1_jumpMoved_middle_kick.gif', 'RYU1_jump_heavy_kick.gif', 'RYU1_jump_light_boxing.gif', 'RYU1_jump_middle_boxing.gif', 'RYU1_jumpMoved_light_kick.gif', 'RYU1_jump_middle_boxing.gif', 'RYU1_jumpMoved_light_kick.gif', 'RYU1_near_light_boxing.gif', 'RYU1_near_heavy_boxing.gif', 'RYU1_near_light_kick.gif', 'RYU1_near_middle_kick.gif', 'RYU1_near_heavy_kick.gif', 'RYU1_stand_up_defense.gif', 'RYU1_stand_crouch_defense.gif', 'RYU1_beAttacked_fall.gif', 'RYU1_somesault_up.gif', 'RYU1_beAttacked_top.gif', 'RYU1_beAttacked_bottom.gif', 'RYU1_beAttacked_heavy.gif', 'RYU1_before_fall_down.gif', 'RYU1_fall_down.gif', 'RYU1_beAttacked_impact.gif'],
			RYU2: ['RYU2_wait.gif', 'RYU2_goForward.gif', 'RYU2_goBack.gif', 'RYU2_jumpUp.gif', 'RYU2_jump_down.gif', 'RYU2_impact_boxing.gif', 'RYU2_after_impact_boxing.gif', 'RYU2_before_whirl_kick.gif', 'RYU2_after_whirl_kick.gif', 'RYU2_whirl_kick.gif', 'RYU2_heavy_kick.gif', 'RYU2_jump_forward.gif', 'RYU2_crouch_heavy_kick.gif', 'RYU2_stand_up.gif', 'RYU2_crouch.gif', 'RYU2_jump_forward.gif', 'RYU2_jump_back.gif', 'RYU2_light_boxing.gif', 'RYU2_crouch_light_boxing.gif', 'RYU2_light_kick.gif', 'RYU2_middle_boxing.gif', 'RYU2_crouch_middle_boxing.gif', 'RYU2_crouch_light_kick.gif', 'RYU2_wave_boxing.gif', 'RYU2_jump_light_kick.gif', 'RYU2_jumpMoved_middle_kick.gif', 'RYU2_jump_heavy_kick.gif', 'RYU2_jump_light_boxing.gif', 'RYU2_jump_middle_boxing.gif', 'RYU2_jumpMoved_light_kick.gif', 'RYU2_jump_middle_boxing.gif', 'RYU2_jumpMoved_light_kick.gif', 'RYU2_near_light_boxing.gif', 'RYU2_near_heavy_boxing.gif', 'RYU2_near_light_kick.gif', 'RYU2_near_middle_kick.gif', 'RYU2_near_heavy_kick.gif', 'RYU2_stand_up_defense.gif', 'RYU2_stand_crouch_defense.gif', 'RYU2_beAttacked_fall.gif', 'RYU2_somesault_up.gif', 'RYU2_beAttacked_top.gif', 'RYU2_beAttacked_bottom.gif', 'RYU2_beAttacked_heavy.gif', 'RYU2_before_fall_down.gif', 'RYU2_fall_down.gif', 'RYU2_beAttacked_impact.gif'],
			hitEffect: ['defense.gif', 'heavy.gif', 'light.gif'],
			magic: ['simpleFire.gif', 'transverseWave.gif', 'transverseWaveDisappear.gif']
		},
		audios: ['china.mp3', 'defense.mp3', 'fall.mp3', 'heavy_boxing.mp3', 'hit_heavy_boxing.mp3', 'hit_heavy_kick.mp3', 'hit_light.mp3', 'impact_boxing.mp3', 'light_boxing.mp3', 'wave_boxing.mp3', 'whirl_kick.mp3'],

		RYU1: {
			name: 'RYU1',
			states: {
				default: 'wait',
				/* 移动 */
				wait: {
					bg: 'RYU1_wait',
					framesNum: 6,
					easing: [0, 0, 3, 'linear'],
					attack_type: 0
				}
			}
		},
		RYU2: {
			name: 'RYU2',
			states: {
				default: 'wait',
				/* 移动 */
				wait: {
					bg: 'RYU2_wait',
					framesNum: 6,
					easing: [0, 0, 3, 'linear'],
					attack_type: 0
				}
			}
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * 缓存文件
	 */

	module.exports = {
		images: {},
		audios: {}
	};

/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Config = __webpack_require__(1);

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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Config = __webpack_require__(1);
	const Cache = __webpack_require__(2);

	/**
	 * 舞台
	 */

	class Stage {
		constructor() {
			this.bg = document.querySelector('.stage_bg');
			this.bg.scrollLeft = 250;

			this.bgBehind = this.bg.querySelector('.stage_bg_behind');
			this.bgBehind.style.position = 'absolute';
			this.bgBehind.width = 1400;
			this.bgBehind.height = 400;
			this.bgBehind.src = Cache.images[Config.map.bgBehindImg].obj.src;
				
			this.bgFront = this.bg.querySelector('.stage_bg_front');
			this.bgFront.style.position = 'absolute';
			this.bgFront.width = 1400;
			this.bgFront.height = 490;
			this.bgFront.src = Cache.images[Config.map.bgFrontImg].obj.src;
		}
	}

	module.exports = Stage;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Config = __webpack_require__(1);
	const Cache = __webpack_require__(2);
	const Timer = __webpack_require__(7);

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

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Config = __webpack_require__(1);
	const Cache = __webpack_require__(2);

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

/***/ }
/******/ ]);