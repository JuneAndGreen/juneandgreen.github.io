// 一些特性检测
// ---------------
var _ = require('./util');
exports.svg = (function(){
	// 判断是否支持svg
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();

// 返回document的nodeType（9）
exports.browser = typeof document !== "undefined" && document.nodeType;
// whether have component in initializing
exports.exprCache = _.cache(1000); // 表达式缓存，最大值为1000
exports.isRunning = false;
