
// thanks for angular && mootools for some concise&cross-platform  implemention
// =====================================


var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");
var noop = function(){}

var namespaces = {
  html: "http://www.w3.org/1999/xhtml",
  svg: "http://www.w3.org/2000/svg"
}

dom.body = document.body;

dom.doc = document;

// 转换字符串为驼峰式
function camelCase(str){
  return ("" + str).replace(/-\D/g, function(match){
    return match.charAt(1).toUpperCase();
  });
}

// 事件绑定器和解绑器
var tNode = document.createElement('div')
dom.tNode = tNode;
var addEvent, removeEvent;
if(tNode.addEventListener){
  addEvent = function(node, type, fn) {
    node.addEventListener(type, fn, false);
  }
  removeEvent = function(node, type, fn) {
    node.removeEventListener(type, fn, false) 
  }
}else{
  addEvent = function(node, type, fn) {
    node.attachEvent('on' + type, fn);
  }
  removeEvent = function(node, type, fn) {
    node.detachEvent('on' + type, fn); 
  }
}

// 判断是否是ie浏览器，如果不是，则dom.msie为NaN
dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(dom.msie)) {
  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

// 获取节点方法
dom.find = function(sl){
  if(document.querySelector) {
    try{
      return document.querySelector(sl);
    }catch(e){

    }
  }
  if(sl.indexOf('#')!==-1) return document.getElementById( sl.slice(1) );
}

// 将节点注入到某个节点的某个位置
dom.inject = function(node, refer, position){
  position = position || 'bottom';
  if(!node) return ;
  // 被注入节点是数组的情况，使用fragment
  if(Array.isArray(node)){
    var tmp = node;
    node = dom.fragment();
    for(var i = 0,len = tmp.length; i < len ;i++){
      node.appendChild(tmp[i])
    }
  }

  var firstChild, next;
  switch(position){
    case 'bottom':
      // 插入到节点里面底部
      refer.appendChild( node );
      break;
    case 'top':
      // 插入到节点里面顶部
      if( firstChild = refer.firstChild ){
        refer.insertBefore( node, refer.firstChild );
      }else{
        refer.appendChild( node );
      }
      break;
    case 'after':
      // 插入到节点后面
      if( next = refer.nextSibling ){
        next.parentNode.insertBefore( node, next );
      }else{
        refer.parentNode.appendChild( node );
      }
      break;
    case 'before':
      // 插入到节点前面
      refer.parentNode.insertBefore( node, refer );
  }
}

// 根据id获取节点
dom.id = function(id){
  return document.getElementById(id);
}

// 根据节点名和命名空间创建节点
dom.create = function(type, ns, attrs){
  // 针对svg节点
  if(ns === 'svg'){
    if(!env.svg) throw Error('the env need svg support')
    ns = namespaces.svg;
  }
  // 判断是否是自定义标签节点
  return !ns? document.createElement(type): document.createElementNS(ns, type);
}

// 使用documentFragment
dom.fragment = function(){
  return document.createDocumentFragment();
}

// 节点特殊属性处理
var specialAttr = {
  'class': function(node, value){
    // 针对html节点的class属性
    ('className' in node && (node.namespaceURI === namespaces.html || !node.namespaceURI)) ?
      node.className = (value || '') : node.setAttribute('class', value);
  },
  'for': function(node, value){
    ('htmlFor' in node) ? node.htmlFor = value : node.setAttribute('for', value);
  },
  'style': function(node, value){
    (node.style) ? node.style.cssText = value : node.setAttribute('style', value);
  },
  'value': function(node, value){
    node.value = (value != null) ? value : '';
  }
}

// 属性的setter和getter方法
dom.attr = function(node, name, value){
  if (_.isBooleanAttr(name)) {
    // 针对是布尔值的节点属性，即值可省略的属性
    if (typeof value !== 'undefined') {
      // setting
      if (!!value) {
        node[name] = true;
        node.setAttribute(name, name);
        // ie7以下，checked属性的setting方法是不可用的，需要使用defaultChecked
        if(dom.msie && dom.msie <=7 ) node.defaultChecked = true
      } else {
        node[name] = false;
        node.removeAttribute(name);
      }
    } else {
      // getting
      return (node[name] ||
               (node.attributes.getNamedItem(name)|| noop).specified) ? name : undefined;
    }
  } else if (typeof (value) !== 'undefined') {
    // 特殊属性处理
    // setting
    if(specialAttr[name]) specialAttr[name](node, value);
    else if(value === null) node.removeAttribute(name)
    else node.setAttribute(name, value);
  } else if (node.getAttribute) {
    // 必须添加额外的参数2才能从ie中获取a.href的正确值
    // 一些元素（如document）没有对应属性可以获取，所以会返回undefined
    var ret = node.getAttribute(name, 2);
    // 将属性不存在的情况返回的值规范到undefined
    return ret === null ? undefined : ret;
  }
}

// 针对ie9以下的checkbox和radio的change事件，转换成click事件
function fixEventName(elem, name){
  return (name === 'change'  &&  dom.msie < 9 && 
      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
        (elem.type === 'checkbox' || elem.type === 'radio')
      )
    )? 'click': name;
}
// 给节点绑定事件监听器
dom.on = function(node, type, handler){
  var types = type.split(' ');
  handler.real = function(ev){
    // 针对事件句柄进行包装
    var $event = new Event(ev);
    $event.origin = node;
    handler.call(node, $event);
  }
  types.forEach(function(type){
    type = fixEventName(node, type);
    addEvent(node, type, handler.real);
  });
}
// 给节点解绑事件监听器
dom.off = function(node, type, handler){
  var types = type.split(' ');
  handler = handler.real || handler;
  types.forEach(function(type){
    type = fixEventName(node, type);
    removeEvent(node, type, handler);
  })
}

// 针对节点的文本内容进行操作
dom.text = (function (){
  var map = {};
  if (dom.msie && dom.msie < 9) {
    // ie9以下
    map[1] = 'innerText';    
    map[3] = 'nodeValue';    
  } else {
    map[1] = map[3] = 'textContent';
  }
  
  return function (node, value) {
    var textProp = map[node.nodeType];
    if (value == null) {
      // getting
      return textProp ? node[textProp] : '';
    }
    // setting
    node[textProp] = value;
  }
})();

// 针对节点内的html代码进行操作
dom.html = function( node, html ){
  if(typeof html === "undefined"){
    // getting
    return node.innerHTML;
  }else{
    // setting
    node.innerHTML = html;
  }
}

// 替换某个节点
dom.replace = function(node, replaced){
  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
}

// 删除某个节点
dom.remove = function(node){
  if(node.parentNode) node.parentNode.removeChild(node);
}

// 针对节点的css样式值进行操作
dom.css = function(node, name, value){
  if( _.typeOf(name) === "object" ){
    // 批量操作
    for(var i in name){
      if( name.hasOwnProperty(i) ){
        dom.css( node, i, name[i] );
      }
    }
    return;
  }
  if ( typeof value !== "undefined" ) {
    // setting
    name = camelCase(name);
    if(name) node.style[name] = value;

  } else {
    // getting
    var val;
    if (dom.msie <= 8) {
      // ie8以下
      val = node.currentStyle && node.currentStyle[name];
      if (val === '') val = 'auto';
    }
    val = val || node.style[name];
    if (dom.msie <= 8) {
      // ie8以下
      val = val === '' ? undefined : val;
    }
    return  val;
  }
}

// 添加某个类
dom.addClass = function(node, className){
  var current = node.className || "";
  if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
    node.className = current? ( current + " " + className ) : className;
  }
}

// 删除某个类
dom.delClass = function(node, className){
  var current = node.className || "";
  node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
}

// 判断是否拥有某个类
dom.hasClass = function(node, className){
  var current = node.className || "";
  return (" " + current + " ").indexOf(" " + className + " ") !== -1;
}



// simple Event wrap



var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/; // 鼠标事件
var doc = document;
// 标准规范模式下使用document.documentElement
doc = (!doc.compatMode || doc.compatMode === 'CSS1Compat') ? doc.documentElement : doc.body;
// 封装Event类
function Event(ev){
  ev = ev || window.event;
  if(ev._fixed) return ev; // 已经是此类实例
  this.event = ev; // 原始事件对象
  this.target = ev.target || ev.srcElement; // 事件触发对象

  var type = this.type = ev.type; // 原始事件类型
  var button = this.button = ev.button; // 事件由哪个鼠标按键触发的

  // 鼠标事件
  if(rMouseEvent.test(type)){ 
    // 修复鼠标事件中滚动pageX和pageY
    this.pageX = (ev.pageX != null) ? ev.pageX : ev.clientX + doc.scrollLeft;
    this.pageY = (ev.pageX != null) ? ev.pageY : ev.clientY + doc.scrollTop;
    if (type === 'mouseover' || type === 'mouseout'){
      // 修复mouseover和mouseout事件中的relatedTarget
      var related = ev.relatedTarget || ev[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
      while (related && related.nodeType === 3) related = related.parentNode;
      this.relatedTarget = related;
    }
  }
  
  // 滚轮事件
  if (type === 'DOMMouseScroll' || type === 'mousewheel'){、
    // 修复火狐与其他浏览器滚动数值不相同的问题
    // 火狐 - ev.detail: 3    
    // 其他 - ev.wheelDelta: -120
    this.wheelDelta = (ev.wheelDelta) ? ev.wheelDelta / 120 : -(ev.detail || 0) / 3;
  }
  // 修复which属性
  this.which = ev.which || ev.keyCode;
  if( !this.which && button !== undefined){
    // 修复鼠标点击事件时的which属性
    this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
  }
  this._fixed = true; // 已修复标志
}

// 添加Event类的方法
_.extend(Event.prototype, {
  immediateStop: _.isFalse,
  stop: function(){
    // 阻断事件
    this.preventDefault().stopPropagation();
  },
  preventDefault: function(){
    // 阻止默认事件
    if (this.event.preventDefault) this.event.preventDefault();
    else this.event.returnValue = false;
    return this;
  },
  stopPropagation: function(){
    // 阻止事件冒泡
    if (this.event.stopPropagation) this.event.stopPropagation();
    else this.event.cancelBubble = true;
    return this;
  },
  stopImmediatePropagation: function(){
    // 阻止事件冒泡并且阻止当前事件所在元素上的所有相同类型事件的事件处理函数的继续执行
    if(this.event.stopImmediatePropagation) this.event.stopImmediatePropagation();
  }
})

// 动画
dom.nextFrame = (function(){
    var request = window.requestAnimationFrame ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame || 
                  function(callback){
                    setTimeout(callback, 16)
                  }

    var cancel = window.cancelAnimationFrame ||
                 window.webkitCancelAnimationFrame ||
                 window.mozCancelAnimationFrame ||
                 window.webkitCancelRequestAnimationFrame ||
                 function(tid){
                    clearTimeout(tid)
                 }
  
  return function(callback){
    var id = request(callback);
    return function(){ cancel(id); }
  }
})();

// 3ks for angular's raf  service
var k;
dom.nextReflow = dom.msie? function(callback){
  return dom.nextFrame(function(){
    k = document.body.offsetWidth;
    callback();
  })
}: dom.nextFrame;



