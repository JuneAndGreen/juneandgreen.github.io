var _ = require("../util.js"),
  fnTest = /xy/.test(function(){"xy";}) ? /\bsupr\b/:/.*/,
  isFn = function(o){return typeof o === "function"};

// 在函数外层封装一个supr方法，用来调用父类的同名方法
function wrap(k, fn, supro) {
  return function () {
    var tmp = this.supr;
    this.supr = supro[k];
    var ret = fn.apply(this, arguments);
    this.supr = tmp;
    return ret;
  }
}

// 扩展其他属性方法
function process( what, o, supro ) {
  for ( var k in o ) {
    if (o.hasOwnProperty(k)) {

      what[k] = isFn( o[k] ) && isFn( supro[k] ) && 
        fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
    }
  }
}


var merged = ["events", "data", "computed"], mlen = merged.length;
module.exports = function extend(o){
  // o是需扩展的对象或者是构造函数（包含属性方法）
  // supr是自身，即基类
  // supro是自身的原型，即基类的原型
  // fn是继承了自身的类，即扩展了o的类
  // proto是继承了自身的类的原型
  o = o || {};
  var supr = this, proto,
    supro = supr && supr.prototype || {};

  if(typeof o === 'function'){、
    // 针对Regular构造函数的扩展，即o是构造函数
    proto = o.prototype;
    o.implement = implement;
    // 给类添加extend方法
    o.extend = extend;
    return o;
  } 

  // 以下为针对对象的扩展，即o为需扩展的属性
  
  // 类构造器
  function fn() {
    supr.apply(this, arguments);
  }

  // 构造原型
  proto = _.createProto(fn, supro);

  // 扩展基类的属性方法
  function implement(o){
    var len = mlen;
    for(;len--;){
      var prop = merged[len];
      if(o.hasOwnProperty(prop) && proto.hasOwnProperty(prop)){
        // 如果属性里有events、data或computed，则需要合并覆盖到原型中
        _.extend(proto[prop], o[prop], true) 
        delete o[prop];
      }
    }

    // 扩展其他属性方法
    process(proto, o, supro); 
    return this;
  }



  fn.implement = implement;
  // 扩展属性方法，相当于继承
  fn.implement(o);

  if(supr.__after__) supr.__after__.call(fn, supr, o);
  // 为子类添加extend方法，为了实现链式继承
  fn.extend = extend;
  // 返回子类
  return fn;
}

