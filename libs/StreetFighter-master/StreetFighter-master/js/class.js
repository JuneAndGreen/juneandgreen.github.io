class Base {
	constructor() {
		this._instances = [];
		this._unique = 0;
	}

	static interface(key, fn) {
		Base.prototype[key] = fn;
	}
}