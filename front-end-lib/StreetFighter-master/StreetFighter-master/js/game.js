'use strict';

var mode = 1, ready = false;

const images = {
	g: [ 'behind.gif', 'fighterShadow.gif', 'front.gif' ],
	
	RYU1: [ 'RYU1_wait.gif', 'RYU1_goForward.gif', 'RYU1_goBack.gif', 'RYU1_jumpUp.gif', 'RYU1_jump_down.gif', 'RYU1_impact_boxing.gif', 'RYU1_after_impact_boxing.gif', 'RYU1_before_whirl_kick.gif', 'RYU1_after_whirl_kick.gif', 'RYU1_whirl_kick.gif', 'RYU1_heavy_kick.gif', 'RYU1_jump_forward.gif', 'RYU1_crouch_heavy_kick.gif', 'RYU1_stand_up.gif', 'RYU1_crouch.gif', 'RYU1_jump_forward.gif', 'RYU1_jump_back.gif', 'RYU1_light_boxing.gif',
		'RYU1_crouch_light_boxing.gif', 'RYU1_light_kick.gif', 'RYU1_middle_boxing.gif', 'RYU1_crouch_middle_boxing.gif', 'RYU1_crouch_light_kick.gif', 'RYU1_wave_boxing.gif', 'RYU1_jump_light_kick.gif', 'RYU1_jumpMoved_middle_kick.gif', 'RYU1_jump_heavy_kick.gif', 'RYU1_jump_light_boxing.gif', 'RYU1_jump_middle_boxing.gif', 'RYU1_jumpMoved_light_kick.gif', 'RYU1_jump_middle_boxing.gif', 'RYU1_jumpMoved_light_kick.gif', 'RYU1_near_light_boxing.gif', 'RYU1_near_heavy_boxing.gif', 'RYU1_near_light_kick.gif', 'RYU1_near_middle_kick.gif', 'RYU1_near_heavy_kick.gif', 'RYU1_stand_up_defense.gif', 'RYU1_stand_crouch_defense.gif',
		'RYU1_beAttacked_fall.gif', 'RYU1_somesault_up.gif', 'RYU1_beAttacked_top.gif', 'RYU1_beAttacked_bottom.gif', 'RYU1_beAttacked_heavy.gif', 'RYU1_before_fall_down.gif', 'RYU1_fall_down.gif', 'RYU1_beAttacked_impact.gif'
	
	],

	RYU2: [ 'RYU2_wait.gif', 'RYU2_goForward.gif', 'RYU2_goBack.gif', 'RYU2_jumpUp.gif', 'RYU2_jump_down.gif', 'RYU2_impact_boxing.gif', 'RYU2_after_impact_boxing.gif', 'RYU2_before_whirl_kick.gif', 'RYU2_after_whirl_kick.gif', 'RYU2_whirl_kick.gif', 'RYU2_heavy_kick.gif', 'RYU2_jump_forward.gif', 'RYU2_crouch_heavy_kick.gif', 'RYU2_stand_up.gif', 'RYU2_crouch.gif', 'RYU2_jump_forward.gif', 'RYU2_jump_back.gif', 'RYU2_light_boxing.gif',
		'RYU2_crouch_light_boxing.gif', 'RYU2_light_kick.gif', 'RYU2_middle_boxing.gif', 'RYU2_crouch_middle_boxing.gif', 'RYU2_crouch_light_kick.gif', 'RYU2_wave_boxing.gif', 'RYU2_jump_light_kick.gif', 'RYU2_jumpMoved_middle_kick.gif', 'RYU2_jump_heavy_kick.gif', 'RYU2_jump_light_boxing.gif', 'RYU2_jump_middle_boxing.gif', 'RYU2_jumpMoved_light_kick.gif', 'RYU2_jump_middle_boxing.gif', 'RYU2_jumpMoved_light_kick.gif', 'RYU2_near_light_boxing.gif', 'RYU2_near_heavy_boxing.gif', 'RYU2_near_light_kick.gif', 'RYU2_near_middle_kick.gif', 'RYU2_near_heavy_kick.gif', 'RYU2_stand_up_defense.gif', 'RYU2_stand_crouch_defense.gif',
		'RYU2_beAttacked_fall.gif', 'RYU2_somesault_up.gif', 'RYU2_beAttacked_top.gif', 'RYU2_beAttacked_bottom.gif', 'RYU2_beAttacked_heavy.gif', 'RYU2_before_fall_down.gif', 'RYU2_fall_down.gif', 'RYU2_beAttacked_impact.gif'
	
	],

	hitEffect: [ 'defense.gif', 'heavy.gif', 'light.gif' ],

	magic: [ 'simpleFire.gif', 'transverseWave.gif', 'transverseWaveDisappear.gif' ]

};

const audios = [ 'china.mp3', 'defense.mp3', 'fall.mp3', 'heavy_boxing.mp3', 'hit_heavy_boxing.mp3', 'hit_heavy_kick.mp3', 'hit_light.mp3', 'impact_boxing.mp3', 'light_boxing.mp3', 'wave_boxing.mp3', 'whirl_kick.mp3' ];

class Game {
	constructor() {}
	/**
	 * 初始化游戏
	 */
	init(hash) {
		
		if(hash) {
			mode = hash;
			return this.start();
		}

		// loading
		this.loadingInfo = document.querySelector('.loading_info');
		
		document.body.style.left = `${(document.body.offsetWidth  - 900) / 2}px`;
		
		this.loadImg(() => {	
			this.loadAudio(() => {
				this.start();
			});
		});
	}
	/**
	 * 装载图片
	 */
	loadImg(callback) {
		let sum = 0;
		let num = 0;

		let keys = Object.keys(images);
		keys.forEach((dir) => {
			sum += images[dir].length;
		});

		// 遍历装载
		keys.forEach((dir) => {
			let c;
			let ary = images[dir];

			while(c = ary.pop()) {
				let self = this;

				let image = new Image();
				image.onload = function() {
					let name = this.src.split( '/' );
					name = name[name.length - 1].split( '.' )[0]; // 图片名称
					Util.imgObj[name] = {
						obj: this,
						width: this.width,
						height: this.height
					};

					self.loadingInfo.innerHTML = `${++num}/${sum}`;
					if(sum === num) {
						// 加载完毕
						callback && callback();
					}
					this.onload = null;
				}
				image.src = `images/${dir}/${c}`;
			}
		});
	}
	/**
	 * 装载音频
	 */
	loadAudio(callback) {
		let c;
		let sum = audios.length;
		let num = 0;

		while(c = audios.pop()) {
			let audio = new Audio();
			audio.addEventListener('canplaythrough', () => {
				Util.audioObj[c] = `sound/${c}`;
				
				this.loadingInfo.innerHTML = `${++num}/${sum}`;
				if(sum === num) {
					// 加载完毕
					callback && callback();
				}
			}, false);
			audio.src = `sound/${c}`;
		}
	}
	/**
	 * 重置游戏
	 */
	reload() {
		player1.keyManage.stop();
		player2.keyManage.stop();
		player1.bloodBar.reload();
		player2.bloodBar.reload();
		setTimeout( function(){
			player1.play( 'force_wait', 'force' );
			setTimeout( function(){
			 player1.animate.moveto( 280, 240 );
			 player1.keyManage.start();
			 player1.direction = 1;
			}, 30 )

			player2.play( 'force_wait', 'force' );
			setTimeout( function(){
			 player2.animate.moveto( 480, 240 );
			 player2.keyManage.start();
			 player2.direction = -1;
			 if ( mode === 1 ){
			 	player2.ai.start();
			 }
			}, 30 )
			
		}, 1000 )


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
			
		Timer.start();
	
		// 创建角色
		let player1 = window.player1 = new Spirit(Config.Spirit.RYU1);
		let player2 = window.player2 = new Spirit(Config.Spirit.RYU2);
	
		// 设置对手
		player1.setEnemy(player2);
		player2.setEnemy(player1);

		// 设置血条
		player1.bloodBar = new LeftBar();
		player2.bloodBar = new RightBar();
	
		window.map = Map.init(); // 初始化地图
				
		window.Stage = Stage(); // 场地
		Spirit.interface('Stage', Stage);

		player1.init(280, 240, 1);   //left, top, direction
		player2.init(480, 240, -1);  //left, top, direction
		
		player2.keyManage.stop();
		player2.ai = player2.Ai();
		player2.ai.start();

		player2.enemy.bloodBar.event.listen('empty', () => {
			player2.ai.stop();
		});

		this.pause = false;
		this.lock = false;
	
		document.onkeydown = function(evt) {
			evt = evt || window.event;
			let keycode = evt.keyCode;

			if(keycode === 13) {
				// 按回车暂停或开始
				(pause = !pause) ? Timer.stop() : Timer.start();
			}

			if(keycode === 50 || keycode === 49) {
				// 切换练习模式和对打模式
				if(this.lock) return;
				this.lock = true;

				mode = keycode - 48;
				player2.ai.stop();
				game.reload();

				setTimeout(() => {
					this.lock = false;
				}, 1000);
			}
		}	
	
	
	}

}

var game = new Game();

class AnimateWidth {
	constructor(timeAll, _f_width, width) {
		this.f_time = +new Date;
		this.timeAll = timeAll;
		this._f_width = _f_width;
		this.width = width;
	}

	move() {
		let t = (+new Date - this.f_time) / this.timeAll;
		let easing = Config.easing['linear'];

		this.w = easing(t, this._f_width, this.width, 1);
		if(t > 1) {
			this.w = this._f_width + this.width;
			this.timeoutfn && this.timeoutfn();
		}
		return this.w;
	}

	timeout(fn) {
		this.w = this._f_width + this.width;
		this.timeoutfn = fn;
	}

	fireTimeout() {
		this.w = this._f_width + this.width;
		this.timeoutfn && this.timeoutfn();
	}
}

class Blood {
	constructor() {
		this.event = Event();

		this._blood = 1500; // 血量
		this._f__blood = 1500; // 总血量

		this.firing = false;

		this.timer = Timer.add(this.framefn.bind(this));
	}

	/**
	 * 削减血量
	 */
	reduce(count) {
		this._blood -= count;

		let _w = -count / this._f__blood * this._f_width; // 削减血量的宽度

		let timeAll = Math.min(500, Math.abs(count * 1.5));
		this.animate = new AnimateWidth(timeAll, this.currWidth, _w);

		if(this._blood < 0) {
			// 血量已光
			this.event.fireEvent('empty');
		}

		this.animate.timeout(() => {
			this.currWidth += _w;
			this.firing = false;
			this.timer.stop();
		});

		if(this.firing) {
			this.animate.fireTimeout();	
		}

		this.timer.start();
		this.firing = true;
	}

	reload() {
		this.reduce(this._blood - this._f__blood);
	}
}

class LeftBar extends Blood {
	constructor() {
		super();

		this.div = document.querySelector('.left_bar');
		this.div.style.cssText = `
			width: 322px;
			left: 96px;
		`;

		this._f_left = 96;
		this._f_width = 322;
		this.currWidth = this._f_width;
	}

	framefn() {
		let w = this.animate.move();

		this.div.style.width = w + 'px';
		this.div.style.left = Math.min(this._f_left + this._f_width - w , this._f_left + this._f_width ) + 'px';
	}
}

class RightBar extends Blood {
	constructor() {
		super();

		this.div = document.querySelector('.right_bar');
		this.div.style.cssText = `
			width: 320px;
			left: 493px;
		`;

		this._f_left = 493;
		this._f_width = 320;
		this.currWidth = this._f_width;
		this.queue = Interfaces.Queue();
	}

	framefn() {
		let w = this.animate.move();

		this.div.style.width = w + 'px';
	}
}

window.onload = function() {
	game.init();
};