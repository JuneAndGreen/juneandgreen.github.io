var slice = [].slice, _ = require("../util.js");
var API = {
  // 监听某个事件并添加回调
  $on: function(event, fn) {
    // 假如传入的是对象，则进行批处理
    if(typeof event === "object"){
      for (var i in event) {
        this.$on(i, event[i]);
      }
    }else{
      var context = this;
      var handles = context._handles || (context._handles = {}),
        calls = handles[event] || (handles[event] = []);
      calls.push(fn);
    }
    // 返回自身，为了链式方法调用
    return this;
  },
  // 删除某个事件的监听回调
  $off: function(event, fn) {
    var context = this;
    if(!context._handles) return;
    // 清空所有监听回调
    if(!event) this._handles = {};
    var handles = context._handles,
      calls;

    if (calls = handles[event]) {
      if (!fn) {
        // 清空该事件的所有监听回调
        handles[event] = [];
        return context;
      }
      // 遍历，删除监听回调
      for (var i = 0, len = calls.length; i < len; i++) {
        if (fn === calls[i]) {
          calls.splice(i, 1);
          return context;
        }
      }
    }
    // 返回自身，为了链式方法调用
    return context;
  },
  // 触发某个事件
  $emit: function(event){
    var context = this;
    var handles = context._handles, calls, args, type;
    if(!event) return;
    var args = slice.call(arguments, 1);
    var type = event;

    if(!handles) return context;
    if(calls = handles[type.slice(1)]){
      for (var j = 0, len = calls.length; j < len; j++) {
        calls[j].apply(context, args)
      }
    }
    if (!(calls = handles[type])) return context;
    for (var i = 0, len = calls.length; i < len; i++) {
      calls[i].apply(context, args)
    }
    // 返回自身，为了链式方法调用
    return context;
  },
  // capture  event
  $one: function(){
    
}
}
// 构建Event类
function Event() {}
_.extend(Event.prototype, API)

// 类方法，将obj转换成Event类或Event实例
Event.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  _.extend(obj, API)
}
module.exports = Event;