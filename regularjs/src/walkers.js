var diffArray = require('./helper/arrayDiff.js');
var combine = require('./helper/combine.js');
var animate = require("./helper/animate.js");
var node = require("./parser/node.js");
var Group = require('./group.js');
var dom = require("./dom.js");
var _ = require('./util');


var walkers = module.exports = {};

walkers.list = function(ast, options){

  var Regular = walkers.Regular;  
  var placeholder = document.createComment("Regular list"), // 注释占位
    namespace = options.namespace,
    extra = options.extra;
  var self = this;
  var group = new Group([placeholder]); // 组对象

  var indexName = ast.variable + '_index';
  var variable = ast.variable;
  var alternate = ast.alternate;

  var track = ast.track, keyOf, extraObj;
  if( track && track !== true ){
    track = this._touchExpr(track);
    extraObj = _.createObject(extra);
    keyOf = function( item, index ){
      extraObj[ variable ] = item;
      extraObj[ indexName ] = index;
      return track.get( self, extraObj );
    }
  }
  function removeRange(index, rlen){
    // index - 开始移除的位置
    // rlen - 需要移除的数目
    for(var j = 0; j< rlen; j++){
      // 移除
      var removed = group.children.splice( index + 1, 1)[0]; // 移除多出来的项
      if(removed) removed.destroy(true);
    }
  }
  function addRange(index, end, newValue){
    // index - 开始增加的位置
    // end - 增加到结束的位置
    // newValue - 新值
    for(var o = index; o < end; o++){ 
      // 增加
      var item = newValue[o];
      var data = {};
      data[indexName] = o;
      data[variable] = item;

      data = _.createObject(extra, data); // 通过以extra为原型的方式创建data对象
      var section = self.$compile(ast.body, {
        extra: data,
        namespace:namespace,
        record: true,
        outer: options.outer
      })
      section.data = data;
      // autolink
      var insert =  combine.last(group.get(o));
      if(insert.parentNode){
        animate.inject(combine.node(section),insert, 'after');
      }
      group.children.splice( o + 1 , 0, section);
    }
  }

  function updateRange(start, end, newValue){
    // start - 开始更新的位置
    // end - 结束更新的位置
    // newValue - 新值
    for(var k = start; k < end; k++){
      // 没有变化
      var sect = group.get( k + 1 );
      sect.data[ indexName ] = k; // 添加list语句中的索引变量，即xxx_index
      sect.data[ variable ] = newValue[k]; // 添加list语句中的单项变量，即{#list aa as xxx}中的xxx
    }
  }

  function updateLD(newValue, oldValue, splices){
    if(!oldValue) oldValue = [];
    if(!newValue) newValue = [];


    var cur = placeholder;
    var m = 0, len = newValue.length;

    if(!splices && (len !==0 || oldValue.length !==0)  ){
      splices = diffArray(newValue, oldValue);
    }

    if(!splices || !splices.length) return;
      
    for(var i = 0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index; // beacuse we use a comment for placeholder
      var removed = splice.removed;
      var add = splice.add;
      var rlen = removed.length;
      // for track
      if( track && rlen && add ){
        var minar = Math.min(rlen, add);
        var tIndex = 0;
        while(tIndex < minar){
          if( keyOf(newValue[index], index) !== keyOf( removed[0], index ) ){
            removeRange(index, 1)
            addRange(index, index+1, newValue)
          }
          removed.shift();
          add--;
          index++;
          tIndex++;
        }
        rlen = removed.length;
      }
      // update
      updateRange(m, index, newValue);
      removeRange( index ,rlen)

      addRange(index, index+add, newValue)

      m = index + add - rlen;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i + 1);
        pair.data[indexName] = i;
      }
    }
  }

  // if the track is constant test.
  function updateSimple(newValue, oldValue){
    newValue = newValue || [];
    oldValue  = oldValue || [];

    var nlen = newValue.length || 0;
    var olen = oldValue.length || 0;
    var mlen = Math.min(nlen, olen);


    updateRange(0, mlen, newValue); // 重新注入单项变量xxx和单项变量索引xxx_index到list语句块中
    if(nlen < olen){ 
      // 需要删除节点
      removeRange(nlen, olen-nlen);
    }else if(nlen > olen){
      // 需要增加节点
      addRange(olen, nlen, newValue);
    }
  }

  // 更新回调
  function update(newValue, oldValue, splices){
    var nlen = newValue && newValue.length;
    var olen = oldValue && oldValue.length;
    if( !olen && nlen && group.get(1)){
      // 销毁已经生成的节点
      var altGroup = group.children.pop();
      if(altGroup.destroy)  altGroup.destroy(true);
    }

    // 更新
    if(track === true){
      updateSimple(newValue, oldValue, splices)
    }else{
      updateLD(newValue, oldValue, splices)
    }

    // 针对list数组为空的情况，即list语法中的else语句
    if( !nlen && alternate && alternate.length){
      var section = self.$compile(alternate, {
        extra: extra,
        record: true,
        outer: options.outer,
        namespace: namespace
      })
      group.children.push(section);
      if(placeholder.parentNode){
        animate.inject(combine.node(section), placeholder, 'after');
      }
    }
  }
  // 监听列表相关变量
  this.$watch(ast.sequence, update, { init: true, indexTrack: track === true });
  return group;
}

// 遍历include语句（即inc语句）
walkers.template = function(ast, options){
  var content = ast.content, compiled;
  var placeholder = document.createComment('inlcude'); // 注释占位
  var compiled, namespace = options.namespace, extra = options.extra;
  var group = new Group([placeholder]); // 组对象
  if(content){
    var self = this;
    // 对模板内容变量进行监听
    this.$watch(content, function(value){
      var removed = group.get(1), type= typeof value;
      if( removed){
        // 对已经生成的节点进行销毁
        removed.destroy(true); 
        group.children.pop();
      }
      if(!value) return;
      group.push( compiled = (typeof value === 'function') ? value(): self.$compile(value, {record: true, outer: options.outer,namespace: namespace, extra: extra}) ); 
      if(placeholder.parentNode) {
        compiled.$inject(placeholder, 'before')
      }
    }, {
      init: true
    });
  }
  return group;
};


// how to resolve this problem
// 遍历if语句
var ii = 0;
walkers['if'] = function(ast, options){
  var self = this, consequent, alternate, extra = options.extra;
  if(options && options.element){
    // 针对节点内的if语句，如<div {#if test}class="ss"{/#if}></div>
    var update = function(nvalue){
      if(!!nvalue){
        // if条件为真
        if(alternate) combine.destroy(alternate)
        if(ast.consequent) consequent = self.$compile(ast.consequent, {record: true, element: options.element , extra:extra});
      }else{
        // if条件为假
        if(consequent) combine.destroy(consequent)
        if(ast.alternate) alternate = self.$compile(ast.alternate, {record: true, element: options.element, extra: extra});
      }
    }
    // 对if里的条件进行监听
    this.$watch(ast.test, update, { force: true });
    return {
      destroy: function(){
        if(consequent) combine.destroy(consequent);
        else if(alternate) combine.destroy(alternate);
      }
    }
  }

  var test, consequent, alternate, node;
  var placeholder = document.createComment("Regular if" + ii++); // 注释占位
  var group = new Group(); // 组对象
  group.push(placeholder);
  var preValue = null, namespace= options.namespace;


  var update = function (nvalue, old){
    var value = !!nvalue;
    if(value === preValue) return;
    preValue = value;
    if(group.children[1]){
      // 对已经生成的节点进行销毁
      group.children[1].destroy(true);
      group.children.pop();
    }
    if(value){
      // if条件为真
      if(ast.consequent && ast.consequent.length){
        consequent = self.$compile( ast.consequent , {record:true, outer: options.outer,namespace: namespace, extra:extra })
        group.push(consequent);
        if(placeholder.parentNode){
          animate.inject(combine.node(consequent), placeholder, 'before');
        }
      }
    }else{ 
      // if条件为假
      if(ast.alternate && ast.alternate.length){
        alternate = self.$compile(ast.alternate, {record:true, outer: options.outer,namespace: namespace, extra:extra});
        group.push(alternate);
        if(placeholder.parentNode){
          animate.inject(combine.node(alternate), placeholder, 'before');
        }
      }
    }
  }
  // 对if里的条件进行监听
  this.$watch(ast.test, update, {force: true, init: true});

  return group;
}

// 遍历表达式
walkers.expression = function(ast, options){
  var node = document.createTextNode("");
  // 监听表达式变化
  this.$watch(ast, function(newval){
    dom.text(node, "" + (newval == null? "": "" + newval) );
  })
  return node;
}

// 遍历文本
walkers.text = function(ast, options){
  var node = document.createTextNode(_.convertEntity(ast.text));
  return node;
}



var eventReg = /^on-(.+)$/

/**
 * 遍历dom节点，包含组件 
 */
walkers.element = function(ast, options){
  var attrs = ast.attrs, self = this,
    Constructor = this.constructor,
    children = ast.children,
    namespace = options.namespace, 
    extra = options.extra,
    tag = ast.tag,
    Component = Constructor.component(tag),
    ref, group, element;

  if( tag === 'r-content' ){
    _.log('r-content is deprecated, use {#inc this.$body} instead (`{#include}` as same)', 'warn');
    return this.$body && this.$body();
  } 

  if(Component || tag === 'r-component'){
    options.Component = Component;
    return walkers.component.call(this, ast, options)
  }

  // @Deprecated: 在将来也许会被移除, 请使用{#inc }代替
  if(tag === 'svg') namespace = "svg";
  
  if( children && children.length ){
    // 遍历并编译子节点
    group = this.$compile(children, {outer: options.outer,namespace: namespace, extra: extra });
  }

  // 构建节点
  element = dom.create(tag, namespace, attrs);

  if(group && !_.isVoidTag(tag)){
    // 如果存在子节点并且当前节点不是空标签
    dom.inject( combine.node(group) , element)
  }

  if(!ast.touched){
    // 当属性未排过序时则先进行排序
    attrs.sort(function(a1, a2){
      // 指令放到数组后面
      var d1 = Constructor.directive(a1.name),
        d2 = Constructor.directive(a2.name);
      if( d1 && d2 ) return (d2.priority || 1) - (d1.priority || 1);
      if(d1) return 1;
      if(d2) return -1;
      if(a2.name === "type") return 1;
      return -1;
    })
    ast.touched = true;
  }
  // may distinct with if else
  // 遍历属性
  var destroies = walkAttributes.call(this, attrs, element, extra);

  return {
    type: "element",
    group: group,
    node: function(){
      return element; // 返回结点
    },
    last: function(){
      return element;
    },
    destroy: function(first){
      // 销毁
      if( first ){
        animate.remove( element, group? group.destroy.bind( group ): _.noop );
      }else if(group) {
        group.destroy();
      }
      // destroy ref
      if( destroies.length ) {
        destroies.forEach(function( destroy ){
          if( destroy ){
            if( typeof destroy.destroy === 'function' ){
              destroy.destroy()
            }else{
              destroy();
            }
          }
        })
      }
    }
  }
}

walkers.component = function(ast, options){
  var attrs = ast.attrs, 
    Component = options.Component,
    Constructor = this.constructor,
    isolate, 
    extra = options.extra,
    namespace = options.namespace,
    ref, self = this, is;

  var data = {}, events;

  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    // consider disabled   equlasto  disabled={true}
    var value = this._touchExpr(attr.value === undefined? true: attr.value);
    if(value.constant) value = attr.value = value.get(this);
    if(attr.value && attr.value.constant === true){
      value = value.get(this);
    }
    var name = attr.name;
    if(!attr.event){
      var etest = name.match(eventReg);
      // event: 'nav'
      if(etest) attr.event = etest[1];
    }

    // @compile modifier
    if(attr.mdf === 'cmpl'){
      value = _.getCompileFn(value, this, {
        record: true, 
        namespace:namespace, 
        extra: extra, 
        outer: options.outer
      })
    }
    
    // @if is r-component . we need to find the target Component
    if(name === 'is' && !Component){
      is = value;
      var componentName = this.$get(value, true);
      Component = Constructor.component(componentName)
      if(typeof Component !== 'function') throw new Error("component " + componentName + " has not registed!");
    }
    // bind event proxy
    var eventName;
    if(eventName = attr.event){
      events = events || {};
      events[eventName] = _.handleEvent.call(this, value, eventName);
      continue;
    }else {
      name = attr.name = _.camelCase(name);
    }

    if(value.type !== 'expression'){
      data[name] = value;
    }else{
      data[name] = value.get(self); 
    }
    if( name === 'ref'  && value != null){
      ref = value
    }
    if( name === 'isolate'){
      // 1: stop: composite -> parent
      // 2. stop: composite <- parent
      // 3. stop 1 and 2: composite <-> parent
      // 0. stop nothing (defualt)
      isolate = value.type === 'expression'? value.get(self): parseInt(value === true? 3: value, 10);
      data.isolate = isolate;
    }
  }

  var definition = { 
    data: data, 
    events: events, 
    $parent: (isolate & 2)? null: this,
    $root: this.$root,
    $outer: options.outer,
    _body: ast.children
  }
  var options = {
    namespace: namespace, 
    extra: options.extra
  }


  var component = new Component(definition, options), reflink;


  if(ref && this.$refs){
    reflink = Component.directive('ref').link
    this.$on('$destroy', reflink.call(this, component, ref) )
  }
  if(ref &&  self.$refs) self.$refs[ref] = component;
  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    var value = attr.value||true;
    var name = attr.name;
    // need compiled
    if(value.type === 'expression' && !attr.event){
      value = self._touchExpr(value);
      // use bit operate to control scope
      if( !(isolate & 2) ) 
        this.$watch(value, (function(name, val){
          this.data[name] = val;
        }).bind(component, name))
      if( value.set && !(isolate & 1 ) ) 
        // sync the data. it force the component don't trigger attr.name's first dirty echeck
        component.$watch(name, self.$update.bind(self, value), {sync: true});
    }
  }
  if(is && is.type === 'expression'  ){
    var group = new Group();
    group.push(component);
    this.$watch(is, function(value){
      // found the new component
      var Component = Constructor.component(value);
      if(!Component) throw new Error("component " + value + " has not registed!");
      var ncomponent = new Component(definition);
      var component = group.children.pop();
      group.push(ncomponent);
      ncomponent.$inject(combine.last(component), 'after')
      component.destroy();
      // @TODO  if component changed , we need update ref
      if(ref){
        self.$refs[ref] = ncomponent;
      }
    }, {sync: true})
    return group;
  }
  return component;
}

// 遍历全部属性
function walkAttributes(attrs, element, extra){
  var bindings = []
  for(var i = 0, len = attrs.length; i < len; i++){
    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs, extra: extra})
    if(binding) bindings.push(binding);
  }
  return bindings;
}
// 遍历属性
walkers.attribute = function(ast ,options){

  var attr = ast;
  var name = attr.name;
  var value = attr.value || "";
  var constant = value.constant;
  var Component = this.constructor;
  var directive = Component.directive(name);
  var element = options.element; // 节点
  var self = this;


  value = this._touchExpr(value);

  if(constant) value = value.get(this);

  if(directive && directive.link){
    // 对指令进行处理
    var binding = directive.link.call(self, element, value, name, options.attrs);
    // 返回对应可销毁指令对象
    if(typeof binding === 'function') binding = {destroy: binding}; 
    return binding;
  } else{
    // 对属性进行处理
    if(value.type === 'expression' ){
      // 属性值是表达式，则对该属性值进行监听
      this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }, {init: true});
    }else{
      // 属性值是其他类型
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
    if(!options.fromElement){
      // 如果是暂时不需要附着在节点上的属性，则返回对应可销毁属性对象
      return {
        destroy: function(){
          dom.attr(element, name, null);
        }
      }
    }
  }

}

