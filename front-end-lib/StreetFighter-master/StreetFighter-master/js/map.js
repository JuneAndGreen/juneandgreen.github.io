/**
 * 地图
 */
var Map = (function() {
	let map = Config.map;
	let spirits = [];

	let spirit;

	let init = function() {
		spirits = Array.prototype.slice.call(arguments, 0);

		// 创建canvas
		canvas = document.body.appendChild(document.createElement('canvas'));		
		canvas.style.cssText = `
			position: absolute;
			z-index: 10001;
		`;
		
		Map.width = canvas.width = 900 || map.windowWidth;
		Map.height = canvas.height = 490 || map.height;

		let ctx = canvas.getContext( '2d' );

		Timer.push(() => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		});
		
		setTimeout(() => {
			// 开启bgm
			var audio = Interfaces.Audio();
			audio.loop();
			audio.play('sound/china.mp3');
		}, 100);
		
		return ctx;
	};

	let getMaxX = function() {
		return canvas.width;	
	};

	return {
		init,
		getMaxX
	};
})();


/**
 * 场景
 */
var Stage = function(s) {
	let spirits = s;

	let bg = document.createElement( 'div' );
	document.body.appendChild( bg );

	let ft1 = document.createElement( 'img' );
	let ft = document.createElement( 'img' );
	bg.appendChild( ft1 );
	bg.appendChild( ft );

	bg.className = 'bg';
	bg.scrollLeft = 250;

	ft1.style.position = 'absolute';
	ft1.width = 1400;
	ft1.height = 400;
	ft1.src = Util.imgObj[Config.map.bgBehind].obj.src;
		
	ft.style.position = 'absolute';
	ft.width = 1400;
	ft.height = 490;
	ft.src = Util.imgObj[Config.map.bgFront].obj.src;

	return function() {
		let self = this;
		let old_scrollLeft = bg.scrollLeft;
		let scrolling = false;
		let dis;

		let start = function() {
			old_scrollLeft = bg.scrollLeft;
		};

		let stop = function() {
			scrolling = false;
		};

		let scroll = function(dir) {
			dis = dir === 'left' ? -3 : 3;
			old_scrollLeft = bg.scrollLeft;
			bg.scrollLeft += dis;
			if(old_scrollLeft !== bg.scrollLeft) {
				scrolling = dis;
			} else {
				stop();
			}
		};

		let pushEnemy = function() {
			if(old_scrollLeft === bg.scrollLeft || !scrolling) {
				return;
			}	
			self.enemy.left = self.enemy.left - dis;	
		};

		let isScrolling = function() {
			return scrolling;
		};
		
		return {
			start,
			stop,
			scroll,
			pushEnemy,
			isScrolling
		};		
	}
}




































