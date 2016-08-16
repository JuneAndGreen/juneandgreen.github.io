var Map = (function() {
	let map = Config.map;
	let ctx;
	let frontWidth = map.stateWidth;
	let windowLeft
	let stage;
	let spirits = [];

	let spirit;

	let init = function(){
		spirits = Array.prototype.slice.call(arguments, 0);

		canvas = document.body.appendChild(document.createElement('canvas'));		
		canvas.style.cssText = `
			position: absolute;
			z-index: 10001;
		`;
		
		Map.width = canvas.width = 900 || map.windowWidth;
		Map.height = canvas.height = 490 || map.height;

		ctx = canvas.getContext( '2d' );

		Timer.push(() => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		});
		
		setTimeout(() => {
			var audio = Interfaces.Audio();
			audio.loop();
			audio.play('sound/china.mp3');
		}, 100);
		
		ctx.stage = stage;
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



var Stage = function(s) {
	let spirits = s;

	let bg = document.createElement( 'div' );
	document.body.appendChild( bg );

	let ft1 = document.createElement( 'img' );
	let ft = document.createElement( 'img' );
	bg.appendChild( ft1 );
	bg.appendChild( ft );

	let f_left = 250;
	let f_scrollLeft = f_left;

	bg.className = 'bg';
	bg.scrollLeft = f_left;

	ft1.style.position = 'absolute';
	ft1.width = 1400;
	ft1.height = 400;
	ft1.src = Util.imgObj[Config.map.bgBehind].obj.src;
		
	ft.style.position = 'absolute';
	ft.width = 1400;
	ft.height = 490;
	ft.src = Util.imgObj[Config.map.bgFront].obj.src;

	return function() {
		let self = this, old_scrollLeft = bg.scrollLeft, scrolling = false, dis;

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




































