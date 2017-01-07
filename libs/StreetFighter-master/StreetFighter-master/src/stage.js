'use strict';

const Config = require('./config');
const Cache = require('./cache');

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