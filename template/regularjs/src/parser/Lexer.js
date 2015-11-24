/* 
         ————词法分析器————
        
  <div>{x}<div>    

        ||

  [
    {
      "type": "TAG_OPEN",
      "value": "div",
      "pos": 0
    },{
      "type": ">",
      "value": ">",
      "pos": 4
    },{
      "type": "EXPR_OPEN",
      "escape": false,
      "pos": 5
    },{
      "type": "IDENT",
      "value": "x",
      "pos": 6
    },{
      "type": "END",
      "pos": 7
    },{
      "type": "TAG_OPEN",
      "value": "div",
      "pos": 8
    },{
      "type": ">",
      "value": ">",
      "pos": 12
    },{
      "type": "EOF"
    }
]

 */

var _ = require("../util.js");
var config = require("../config.js");

// 一些标签在词法分析过程中可能会产生冲突
var conflictTag = {"}": "{", "]": "["}, map1, map2;
// 词法分析器的一些常量
var macro = {
  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/, 
  'IDENT': /[\$_A-Za-z][_0-9A-Za-z\$]*/, 
  'SPACE': /[\r\n\f ]/
}

// 构造Lexer类，初始化一些自身属性
function Lexer(input, opts){
  if(conflictTag[config.END]){
    this.markStart = conflictTag[config.END]; // 语句开始符号
    this.markEnd = config.END; // 语句结束符号
  }

  this.input = (input||"").trim(); // 输入的模板
  this.opts = opts || {}; // 配置项
  this.map = this.opts.mode !== 2?  map1: map2; // 映射表
  this.states = ["INIT"];
  if(opts && opts.expression){
     this.states.push("JST");
     this.expression = true;
  }
}

// 获取原型，添加原型方法
var lo = Lexer.prototype

// 词法分析
lo.lex = function(str){
  str = (str || this.input).trim();
  var tokens = [], split, test,mlen, token, state;
  this.input = str, 
  this.marks = 0;
  this.index = 0; // 用来标记当前解析到的位置
  var i = 0;
  while(str){
    i++
    state = this.state(); // 获取当前词法分析中最后一个状态
    split = this.map[state]; // 获取属于该状态下的规则
    test = split.TRUNK.exec(str); // 从当前的串开头开始匹配词法
    if(!test){
      // 无法识别的词法
      this.error('Unrecoginized Token');
    }
    mlen = test[0].length;
    str = str.slice(mlen); // 截取剩下未匹配部分
    token = this._process.call(this, test, split, str); // 执行解析
    if(token) tokens.push(token); // 当前解析到的结果入栈
    this.index += mlen;
  }

  tokens.push({type: 'EOF'}); // 词法分析结束

  return tokens; // 返回词法分析树
}

lo.error = function(msg){
  throw  Error("Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, this.index));
}

// 判断括号里面不能被捕获的时候是否返回undefined
var test = /a|(b)/.exec("a");
var testSubCapure = test && test[1] === undefined? 
  function(str){ return str !== undefined }
  :function(str){return !!str};
// 执行某个状态的解析
lo._process = function(args, split,str){
  var links = split.links, marched = false, token;

  for(var len = links.length, i=0;i<len ;i++){
    var link = links[i],
      handler = link[2],
      index = link[0]; // 当前的偏移量，用于获取合并后的正则exec后的对应结果
    
    if(testSubCapure(args[index])) {
      // 假如有捕获成功的
      marched = true;
      if(handler){
        token = handler.apply(this, args.slice(index, index + link[1])); // 获取对应的正则匹配结果
        if(token)  token.pos = this.index;
      }
      break;
    }
  }
  if(!marched){
    switch(str.charAt(0)){
      case "<":
        // 进入标签解析状态
        this.enter("TAG");
        break;
      default:
        // 进入模板解析状态
        this.enter("JST");
        break;
    }
  }
  return token;
}
// 进入某个状态
lo.enter = function(state){
  this.states.push(state)
  return this;
}

// 返回当前词法分析中的当前状态
lo.state = function(){
  var states = this.states;
  return states[states.length-1];
}

// 离开当前状态
lo.leave = function(state){
  var states = this.states;
  if(!state || states[states.length-1] === state) states.pop()
}


Lexer.setup = function(){
  // 将语句开始结束符放到常量中
  macro.END = config.END;
  macro.BEGIN = config.BEGIN;
  
  map1 = genMap([
    // INIT
    rules.ENTER_JST,
    rules.ENTER_TAG,
    rules.TEXT,

    //TAG
    rules.TAG_NAME,
    rules.TAG_OPEN,
    rules.TAG_CLOSE,
    rules.TAG_PUNCHOR,
    rules.TAG_ENTER_JST,
    rules.TAG_UNQ_VALUE,
    rules.TAG_STRING,
    rules.TAG_SPACE,
    rules.TAG_COMMENT,

    // JST
    rules.JST_OPEN,
    rules.JST_CLOSE,
    rules.JST_COMMENT,
    rules.JST_EXPR_OPEN,
    rules.JST_IDENT,
    rules.JST_SPACE,
    rules.JST_LEAVE,
    rules.JST_NUMBER,
    rules.JST_PUNCHOR,
    rules.JST_STRING,
    rules.JST_COMMENT
    ])

  // 无视标签相关的词法分析
  map2 = genMap([
    // INIT no < restrict
    rules.ENTER_JST2,
    rules.TEXT,
    // JST
    rules.JST_COMMENT,
    rules.JST_OPEN,
    rules.JST_CLOSE,
    rules.JST_EXPR_OPEN,
    rules.JST_IDENT,
    rules.JST_SPACE,
    rules.JST_LEAVE,
    rules.JST_NUMBER,
    rules.JST_PUNCHOR,
    rules.JST_STRING,
    rules.JST_COMMENT
    ])
}

// 生成映射表
function genMap(rules){
  var rule, map = {}, sign;
  for(var i = 0, len = rules.length; i < len ; i++){
    rule = rules[i];
    sign = rule[2] || 'INIT'; // 规则的类别
    ( map[sign] || (map[sign] = {rules:[], links:[]}) ).rules.push(rule);
  }
  return setup(map);
}

// 针对handler是字符串的情况，包装成一个函数
function wrapHander(handler){
  return function(all){
    return {type: handler, value: all }
  }
}

// 构建映射表
function setup(map){
  var split, rules, trunks, handler, reg, retain, rule;

  // 对规则逐类遍历
  for(var i in map){
    split = map[i]; // 当前这一类规则
    split.curIndex = 1;
    rules = split.rules;
    trunks = [];

    // 对每一类下的规则逐条
    for(var j = 0,len = rules.length; j<len; j++){
      rule = rules[j]; // 当前这条规则
      reg = rule[0]; // 正则表达式或正则表达式字符串
      handler = rule[1]; // 正则相关句柄

      if(typeof handler === 'string'){
        // 针对handler是字符串的情况，包装成一个函数
        handler = wrapHander(handler);
      }
      // 如果reg是一条正则表达式，则取正则表达式的内容并转化成字符串
      if(_.typeOf(reg) === 'regexp') reg = reg.toString().slice(1, -1);

      reg = reg.replace(/\{(\w+)\}/g, function(all, one){
        // 把对应的内容替换成正则表达式字符串，用于匹配模板
        return typeof macro[one] === 'string'? 
          _.escapeRegExp(macro[one]) // 添加转义
          : String(macro[one]).slice(1,-1); // 直接取字符串之间
      });

      retain = _.findSubCapture(reg) + 1; // 当前正则字符串中可被捕获的子串数量（包括自身）
      split.links.push([split.curIndex, retain, handler]); // 偏移量、自身子串数量主要用于合并后的正则表达式使用，当合并后的正则执行exec后得到的结果可通过这两个变量获取到
      split.curIndex += retain; // 偏移量
      trunks.push(reg);
    }
    // 将同类规则下的正则字符串合并成一个正则表达式
    split.TRUNK = new RegExp("^(?:(" + trunks.join(")|(") + "))")
  }
  return map;
}

var rules = {

  // 1. INIT
  // ---------------

  // mode1的模板开始
  ENTER_JST: [/[^\x00<]*?(?={BEGIN})/, function(all){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  // mode2的模板开始
  ENTER_JST2: [/[^\x00]*?(?={BEGIN})/, function(all){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  // 进入标签
  ENTER_TAG: [/[^\x00]*?(?=<[\w\/\!])/, function(all){ 
    this.enter('TAG');
    if(all) return {type: 'TEXT', value: all}
  }],

  // 文本内容，任意字符
  TEXT: [/[^\x00]+/, 'TEXT' ],

  // 2. TAG类，标签相关
  // --------------------
  // 标签名
  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],
  TAG_UNQ_VALUE: [/[^\{}&"'=><`\r\n\f ]+/, 'UNQ', 'TAG'],
  // 标签开始
  TAG_OPEN: [/<({NAME})\s*/, function(all, one){
    return {type: 'TAG_OPEN', value: one}
  }, 'TAG'],
  // 标签结束
  TAG_CLOSE: [/<\/({NAME})[\r\n\f ]*>/, function(all, one){
    this.leave();
    return {type: 'TAG_CLOSE', value: one }
  }, 'TAG'],

    // mode2's JST ENTER RULE
  TAG_ENTER_JST: [/(?={BEGIN})/, function(){
    this.enter('JST');
  }, 'TAG'],


  TAG_PUNCHOR: [/[\>\/=&]/, function(all){
    if(all === '>') this.leave();
    return {type: all, value: all }
  }, 'TAG'],
  TAG_STRING:  [ /'([^']*)'|"([^"]*)\"/, /*'*/  function(all, one, two){ 
    var value = one || two || "";

    return {type: 'STRING', value: value}
  }, 'TAG'],

  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],
  TAG_COMMENT: [/<\!--([^\x00]*?)--\>/, function(all){
    this.leave()
  } ,'TAG'],

  // 3. JST类，模板语句
  // -------------------
  // 语句开始
  JST_OPEN: ['{BEGIN}#{SPACE}*({IDENT})', function(all, name){
    return {
      type: 'OPEN',
      value: name
    }
  }, 'JST'],
  // 语句结束
  JST_LEAVE: [/{END}/, function(all){
    if(this.markEnd === all && this.expression) return {type: this.markEnd, value: this.markEnd};
    if(!this.markEnd || !this.marks ){
      this.firstEnterStart = false;
      this.leave('JST');
      return {type: 'END'}
    }else{
      this.marks--;
      return {type: this.markEnd, value: this.markEnd}
    }
  }, 'JST'],
  JST_CLOSE: [/{BEGIN}\s*\/({IDENT})\s*{END}/, function(all, one){
    this.leave('JST');
    return {
      type: 'CLOSE',
      value: one
    }
  }, 'JST'],
  JST_COMMENT: [/{BEGIN}\!([^\x00]*?)\!{END}/, function(){
    this.leave();
  }, 'JST'],
  JST_EXPR_OPEN: ['{BEGIN}',function(all, one){
    if(all === this.markStart){
      if(this.expression) return { type: this.markStart, value: this.markStart };
      if(this.firstEnterStart || this.marks){
        this.marks++
        this.firstEnterStart = false;
        return { type: this.markStart, value: this.markStart };
      }else{
        this.firstEnterStart = true;
      }
    }
    return {
      type: 'EXPR_OPEN',
      escape: false
    }

  }, 'JST'],
  JST_IDENT: ['{IDENT}', 'IDENT', 'JST'],
  JST_SPACE: [/[ \r\n\f]+/, null, 'JST'],
  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|\@\(|\.\.|[<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two || ""}
  }, 'JST'],
  JST_NUMBER: [/(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
    return {type: 'NUMBER', value: parseFloat(all, 10)};
  }, 'JST']
}


// setup when first config
Lexer.setup();



module.exports = Lexer;
