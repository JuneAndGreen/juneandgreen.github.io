/* 
         ————语法分析器————
        
  <div>{x}</div>    

        ||

[
  {
    "type": "element",
    "tag": "div",
    "attrs": [],
    "children": [
      {
        "type": "expression",
        "body": "c._sg_('x', d, e)",
        "constant": false,
        "setbody": "c._ss_('x',p_,d, '=', 1)"
      }
    ]
  }
]


 */


var _ = require("../util.js");

var config = require("../config.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var ctxName = _.ctxName;
var extName = _.extName;
// 是否是关键字判断函数
var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt Object");



// 构建解析器类
function Parser(input, opts){
  opts = opts || {};

  this.input = input; // 输入的模板
  this.tokens = new Lexer(input, opts).lex(); // 词法分析结果
  this.pos = 0;
  this.length = this.tokens.length; // 词法分析结果长度
}

// 给解析器类添加原型方法
var op = Parser.prototype;

// 解析模板
op.parse = function(){
  this.pos = 0;
  var res= this.program(); // 执行解析
  if(this.ll().type === 'TAG_CLOSE'){
    this.error("You may got a unclosed Tag")
  }
  return res;
}

// 返回词法分析结果，默认返回当前下标对应结果，如果带偏移量参数，则返回当前下标与偏移量做计算好的下标对应结果，默认不带参数返回当前
op.ll =  function(k){
  k = k || 1;
  if(k < 0) k = k + 1;
  var pos = this.pos + k - 1;
  if(pos > this.length - 1){
    // 假如下标超过边界的话，取最后一个
    return this.tokens[this.length-1];
  }
  return this.tokens[pos];
}

// lookahead
op.la = function(k){
  return (this.ll(k) || '').type;
}

// 修改下标，默认指向下一个，接收偏移量作为参数
op.next = function(k){
  k = k || 1;
  this.pos += k;
}

// 打印解析错误信息
op.error = function(msg, pos){
  msg =  "\n【 parse failed 】 " + msg +  ':\n\n' + _.trackErrorPos(this.input, typeof pos === 'number'? pos: this.ll().pos||0);
  throw new Error(msg);
}

// 获取符合某条件的当前结果，并把下标指向下一个，如果未获取到，则不修改下标
op.eat = function(type, value){
  var ll = this.ll();
  if(typeof type !== 'string'){
    // 数组类型
    for(var len = type.length ; len--;){
      if(ll.type === type[len]) {
        this.next(); // 修改下标
        return ll;
      }
    }
  }else{
    // 字符串类型
    if( ll.type === type && (typeof value === 'undefined' || ll.value === value) ){
       this.next(); // 修改下标
       return ll;
    }
  }
  return false;
}

// 获取符合某条件的当前结果，并把下标指向下一个和打印日志，相当于包装了一层eat
op.match = function(type, value){
  var ll;
  if(!(ll = this.eat(type, value))){
    ll  = this.ll();
    this.error('expect [' + type + (value == null? '':':'+ value) + ']" -> got "[' + ll.type + (value==null? '':':'+ll.value) + ']', ll.pos)
  }else{
    return ll;
  }
}

// 执行解析过程
//  :EOF
//  | (statement)* EOF
op.program = function(){
  var statements = [],  ll = this.ll(); // 取词法分析结果
  // 循环遍历词法分析结果
  while(ll.type !== 'EOF' && ll.type !=='TAG_CLOSE'){
    // 当前结果不是模板结束或者标签解析结束（为了递归调用生成子节点）
    statements.push(this.statement()); // 进行语法解析并进行语法树构建
    ll = this.ll(); // 取词法分析结果
  }
  return statements;
}

// 构建语法树
//  按照文本、xml或html结构、模板语句三大类型进行构建
op.statement = function(){
  var ll = this.ll();
  switch(ll.type){
    case 'NAME': // 标签中的属性名(暂未清楚为何此处留有此项)
    case 'TEXT': // 模板起始部分的文本
      var text = ll.value;
      this.next(); // 修改下标
      while(ll = this.eat(['NAME', 'TEXT'])){
        // 如果有连着的NAME或TEXT类型的结果
        text += ll.value;
      }
      return node.text(text); // 返回文本节点
    case 'TAG_OPEN': // 标签开始
      return this.xml();
    case 'OPEN': // 语句开始
      return this.directive();
    case 'EXPR_OPEN': // 表达式开始
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
}

// 构建xml或html语法结构的语法树
// stag statement* TAG_CLOSE?(if self-closed tag)
op.xml = function(){
  var name, attrs, children, selfClosed;
  name = this.match('TAG_OPEN').value;

  attrs = this.attrs(); // 获取标签属性

  selfClosed = this.eat('/'); // 自结束符，即空标签
  this.match('>'); // 假如当前的标签结束符，则跳到下一个
  if( !selfClosed && !_.isVoidTag(name) ){
    // 如果没有遇到自结束符且自身不是空标签
    children = this.program(); // 递归生成子节点

    if(!this.eat('TAG_CLOSE', name)) 
      // 没有匹配到结束标签
      this.error('expect </'+name+'> got'+ 'no matched closeTag')
  }
  return node.element(name, attrs, children); // 返回文档节点
}

// 获取当前节点属性节点列表
// stag     ::=    '<' Name (S attr)* S? '>'  
// attr    ::=     Name Eq attvalue
op.attrs = function(isAttribute){
  var eat
  if(!isAttribute){
    // 非纯属性时，即可能包含语句时
    eat = ["NAME", "OPEN"]
  }else{
    // 纯属性时
    eat = ["NAME"]
  }

  var attrs = [], ll;
  while (ll = this.eat(eat)){
    // 逐个属性生成
    attrs.push(this.xentity( ll ))
  }
  return attrs;
}

// 生成单个属性节点
//  -rule(wrap attribute)
//  -attribute
//
// __example__
//  name = 1 |  
//  ng-hide |
//  on-click={{}} | 
//  {{#if name}}on-click={{xx}}{{#else}}on-tap={{}}{{/if}}

op.xentity = function(ll){
  var name = ll.value, value, modifier;
  if(ll.type === 'NAME'){
    // 纯属性，不带语句
    //@ only for test
    if(~name.indexOf('.')){ // 相当于if(name.indexOf('.') !== -1) 
      var tmp = name.split('.');
      name = tmp[0];
      modifier = tmp[1];
    }
    if( this.eat("=") )
      // 遇到=号，取属性值
      value = this.attvalue(modifier);
    return node.attribute( name, value, modifier ); // 返回属性节点
  }else{
    // 属性被语句所包含的情况，如<a {#if a}class="a"{/if}></a>
    // 目前仅支持if、else和elseif
    if( name !== 'if') 
      this.error("current version. ONLY RULE #if #else #elseif is valid in tag, the rule #" + name + ' is invalid');
    return this['if'](true);
  }

}

// 获取单个属性的值
op.attvalue = function(mdf){
  var ll = this.ll();
  switch(ll.type){
    case "NAME": // 非值类型
    case "UNQ": // 非字符串值，如数值，布尔值等
    case "STRING": // 字符串
      this.next(); // 修改下标
      var value = ll.value;
      if(~value.indexOf(config.BEGIN) && ~value.indexOf(config.END) && mdf!=='cmpl'){
        // 属性值里包含表达式，如<div r-class="{a}"></div>
        var constant = true;
        var parsed = new Parser(value, { mode: 2 }).parse(); // 不需要解析标签，所以使用mode2

        if(parsed.length === 1 && parsed[0].type === 'expression') return parsed[0];

        var body = [];
        parsed.forEach(function(item){
          if(!item.constant) constant=false;
          // 合并结果
          body.push(item.body || "'" + item.text.replace(/'/g, "\\'") + "'");        
        });
        body = "[" + body.join(",") + "].join('')";
        value = node.expression(body, null, constant);
      }
      return value;
    case "EXPR_OPEN": // 属性值本身是表达式
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
}

// 执行解析表达式
op.interplation = function(){
  this.match('EXPR_OPEN');
  var res = this.expression(true); // 解析表达式内容
  this.match('END');
  return res;
}

// 解析表达式
op.expression = function(){
  var expression;
  if(this.eat('@(')){ 
    //once bind，即单次绑定
    expression = this.expr();
    expression.once = true;
    this.match(')')
  }else{
    // 普通表达式
    expression = this.expr();
  }
  return expression;
}

// 解析表达式内容
op.expr = function(){
  this.depend = [];

  var buffer = this.filter()

  var body = buffer.get || buffer;
  var setbody = buffer.set;
  return node.expression(body, setbody, !this.depend.length); // 返回表达式节点
}


// 模板语句解析
op.directive = function(){
  var name = this.ll().value;
  this.next(); // 修改下标
  if(typeof this[name] === 'function'){
    return this[name]()
  }else{
    this.error('Undefined directive['+ name +']');
  }
}


// include语句解析
op.inc = op.include = function(){
  var content = this.expression();
  this.match('END');
  return node.template(content);
}

// if语句解析
op["if"] = function(tag){
  var test = this.expression();
  var consequent = [], alternate=[];

  var container = consequent;
  // 针对标签间的语句和标签内的语句使用不同的解析方式
  var statement = !tag? "statement" : "attrs"; 

  this.match('END');

  var ll, close;
  while( ! (close = this.eat('CLOSE')) ){
    ll = this.ll();
    if( ll.type === 'OPEN' ){
      switch( ll.value ){
        case 'else':
          container = alternate;
          this.next(); 
          this.match( 'END' );
          break;
        case 'elseif':
          // 将elseif语句当成else语句里的if语句解析
          this.next(); 
          alternate.push( this["if"](tag) );
          return node['if']( test, consequent, alternate );
        default:
          // 解析条件判断内的内容
          container.push( this[statement](true) );
      }
    }else{
      container.push(this[statement](true));
    }
  }
  // 没有匹配到对应的结束语句
  if(close.value !== "if") this.error('Unmatched if directive')
  return node["if"](test, consequent, alternate);
}


// list语句解析
// @mark   mustache syntax have natrure dis, canot with expression
op.list = function(){
  // sequence can be a list or hash
  var sequence = this.expression(), variable, ll, track;
  var consequent = [], alternate=[];
  var container = consequent;

  this.match('IDENT', 'as');

  variable = this.match('IDENT').value;

  if(this.eat('IDENT', 'by')){
    // 当出现自定义的下标变量时，即使用了by语法
    if(this.eat('IDENT',variable + '_index')){
      track = true;
    }else{
      track = this.expression();
      if(track.constant){
        // true代表是常量，通常定义成xxx_index
        track = true;
      }
    }
  }

  this.match('END');

  while( !(ll = this.eat('CLOSE')) ){
    if(this.eat('OPEN', 'else')){
      // 列表为空时
      container =  alternate;
      this.match('END');
    }else{
      container.push(this.statement());
    }
  }
  
  if(ll.value !== 'list') this.error('expect ' + 'list got ' + '/' + ll.value + ' ', ll.pos );
  return node.list(sequence, variable, consequent, alternate, track);
}


// 获取表达式和过滤器内容和生成器
// assign ('|' filtername[':' args]) * 
op.filter = function(){
  var left = this.assign(); // 获取过滤器之前的表达式解析结果
  var ll = this.eat('|');
  var buffer = [], setBuffer, prefix,
    attr = "t", 
    set = left.set, get, 
    tmp = "";

  if(ll){
    // 如果存在过滤器分隔符
    if(set) setBuffer = [];

    /*
      body(取值):

      (function(attr) {
        attr = context._f_('过滤器名').get.call(context, attr);
        return attr  
      })(context._sg_('变量名', varname, extname))
    */

    /*
      setbody(设值):

      context._ss_('变量名', (function(attr) {
        attr = context._f_('过滤器名').set.call(context, attr);
        return attr
      })(setname), varname, '=', 1)
    */


    prefix = "(function(" + attr + "){";

    // 遍历过滤器，拼接过滤器取值函数字符串
    do{
      tmp = attr + " = " + ctxName + "._f_('" + this.match('IDENT').value+ "' ).get.call( "+_.ctxName +"," + attr ;
      if(this.eat(':')){
        // 过滤器带有其他参数的情况
        tmp +=", "+ this.arguments("|").join(",") + ");"
      }else{
        tmp += ');'
      }
      buffer.push(tmp);
      setBuffer && setBuffer.unshift( tmp.replace(" ).get.call", " ).set.call") );

    }while(ll = this.eat('|'));

    buffer.push("return " + attr );
    setBuffer && setBuffer.push("return " + attr);

    get =  prefix + buffer.join("") + "})("+left.get+")"; // 取值函数字符串
    // we call back to value.
    if(setBuffer){
      // change _ss__(name, _p_) to _s__(name, filterFn(_p_));
      set = set.replace(_.setName, 
        prefix + setBuffer.join("") + "})("+　_.setName　+")" ); // 设值函数字符串

    }
    // 设值函数依赖于过滤器的定义。如果过滤器拥有set方法，设值函数就可用
    return this.getset(get, set); // 返回 {get: get, set: set}
  } else {
    return left; // 直接返回表达式节点对象
  }
}

// 获取表达式解析结果，以倒推的方式，由外到里进行
// 赋值相关解析
// condition = condition
op.assign = function(){
  var left = this.condition(), ll;
  if(ll = this.eat(['=', '+=', '-=', '*=', '/=', '%='])){
    if(!left.set) 
      // 左边的表达式不合法
      this.error('invalid lefthand expression in assignment expression');

    return this.getset( left.set.replace( "," + _.setName, "," + this.condition().get ).replace("'='", "'"+ll.type+"'"), left.set);
  }
  return left;
}

// 三目表达式解析
// or
// or ? assign : assign
op.condition = function(){
  var test = this.or();
  if(this.eat('?')){
    return this.getset([test.get + "?", 
      this.assign().get, 
      this.match(":").type, 
      this.assign().get].join(""));
  }

  return test;
}

// 或解析
// and
// and && and
op.or = function(){
  var left = this.and();
  if(this.eat('||')){
    return this.getset(left.get + '||' + this.or().get);
  }

  return left;
}

// 与解析
// equal
// equal && equal
op.and = function(){
  var left = this.equal();
  if(this.eat('&&')){
    return this.getset(left.get + '&&' + this.and().get);
  }
  return left;
}

// 相等解析
// relation
// relation == relation
// relation != relation
// relation === relation
// relation !== relation
op.equal = function(){
  var left = this.relation(), ll;
  // @perf;
  if( ll = this.eat(['==','!=', '===', '!=='])){
    return this.getset(left.get + ll.type + this.equal().get);
  }
  return left
}
// 关系运算符
// relation < additive
// relation > additive
// relation <= additive
// relation >= additive
// relation in additive
op.relation = function(){
  var left = this.additive(), ll;
  // @perf
  if(ll = (this.eat(['<', '>', '>=', '<=']) || this.eat('IDENT', 'in') )){
    return this.getset(left.get + ll.value + this.relation().get);
  }
  return left
}
// additive :
// multive
// additive + multive
// additive - multive
op.additive = function(){
  var left = this.multive() ,ll;
  if(ll= this.eat(['+','-']) ){
    return this.getset(left.get + ll.value + this.additive().get);
  }
  return left
}
// multive :
// unary
// multive * unary
// multive / unary
// multive % unary
op.multive = function(){
  var left = this.range() ,ll;
  if( ll = this.eat(['*', '/' ,'%']) ){
    return this.getset(left.get + ll.type + this.multive().get);
  }
  return left;
}

op.range = function(){
  var left = this.unary(), ll, right;

  if(ll = this.eat('..')){
    right = this.unary();
    var body = 
      "(function(start,end){var res = [],step=end>start?1:-1; for(var i = start; end>start?i <= end: i>=end; i=i+step){res.push(i); } return res })("+left.get+","+right.get+")"
    return this.getset(body);
  }

  return left;
}



// 元操作运算
// + unary
// - unary
// ~ unary
// ! unary
op.unary = function(){
  var ll;
  if(ll = this.eat(['+','-','~', '!'])){
    return this.getset('(' + ll.type + this.unary().get + ')') ;
  }else{
    return this.member()
  }
}

// 判断是否是值类型
var isPath = _.makePredicate("STRING IDENT NUMBER");
// 解析变量成员，如a[b]，a.b，a(b)
op.member = function(base, last, pathes, prevBase){
  // base - 这个变量表达式的getter_str
  // last - 当前解析到的变量getset对象
  // pathes - 当前变量解析的前置解析列表
  // prevBase - 这个变量表达式上一层解析出的getter_str
  var ll, path, extValue;

  var onlySimpleAccessor = false;
  if(!base){ 
    // 初次进来
    path = this.primary(); // 解析基础变量
    var type = typeof path;
    if(type === 'string'){ 
      // 变量名
      pathes = [];
      pathes.push( path );
      last = path;
      extValue = extName + "." + path
      base = ctxName + "._sg_('" + path + "', " + varName + ", " + extName + ")";
      onlySimpleAccessor = true;
    }else{
      // getset对象
      if(path.get === 'this'){
        base = ctxName;
        pathes = ['this'];
      }else{
        pathes = null;
        base = path.get;
      }
    }
  }else{ 
    // 非初次进来
    if(typeof last === 'string' && isPath( last) ){ // is valid path
      pathes.push(last);
    }else{
      if(pathes && pathes.length) this.depend.push(pathes);
      pathes = null;
    }
  }

  // 当存在成员的情况，如a[name]、a.name和a(2)
  if(ll = this.eat(['[', '.', '('])){
    switch(ll.type){
      case '.':
        var tmpName = this.match('IDENT').value; // 直接取点号后的值
        prevBase = base;
        if( this.la() !== "(" ){ 
          // 针对a.name的情况，再包装一层getter_str以维护变量表达式的上下文，保证通过getter_str能获取正确的值，并且能够知晓在获取undefined的变量时所报的异常
          base = ctxName + "._sg_('" + tmpName + "', " + base + ")";
        }else{
          base += "['" + tmpName + "']";
        }
        return this.member( base, tmpName, pathes,  prevBase);
      case '[':
        path = this.assign(); // 针对中括号里面的表达式进行解析
        prevBase = base;
        if( this.la() !== "(" ){
          // 同上
          base = ctxName + "._sg_(" + path.get + ", " + base + ")";
        }else{
          base += "[" + path.get + "]";
        }
        this.match(']')
        return this.member(base, path, pathes, prevBase);
      case '(':
        // call(callee, args)
        var args = this.arguments().join(',');
        base =  base+"(" + args +")";
        this.match(')')
        return this.member(base, null, pathes);
    }
  }

  if( pathes && pathes.length ) {
    // 加入依赖
    this.depend.push( pathes );
  }
  var res =  {get: base};
  if(last){
    // setter_str
    res.set = ctxName + "._ss_(" + 
        (last.get? last.get : "'"+ last + "'") + 
        ","+ _.setName + ","+ 
        (prevBase?prevBase:_.varName) + 
        ", '=', "+ ( onlySimpleAccessor? 1 : 0 ) + ")";
  
  }
  return res;
}

// 解析基础变量，不带任何操作符
op.primary = function(){
  var ll = this.ll();
  switch(ll.type){
    case "{": // 对象
      return this.object();
    case "[": // 数组
      return this.array();
    case "(": // 变量，可带过滤器
      return this.paren();
    // literal or ident
    case 'STRING': //字符串
      this.next();
      return this.getset("'" + ll.value + "'")
    case 'NUMBER': // 数字
      this.next();
      return this.getset(""+ll.value);
    case "IDENT": // 其他类型
      this.next();
      if(isKeyWord(ll.value)){
        // 关键字
        return this.getset( ll.value );
      }
      // 非关键字
      return ll.value;
    default: 
      this.error('Unexpected Token: ' + ll.type);
  }
}

// 大括号，即对象
// object
//  {propAssign [, propAssign] * [,]}

// propAssign
//  prop : assign

// prop
//  STRING
//  IDENT
//  NUMBER
op.object = function(){
  var code = [this.match('{').type];
  var ll = this.eat( ['STRING', 'IDENT', 'NUMBER'] );
  while(ll){
    code.push("'" + ll.value + "'" + this.match(':').type);
    var get = this.assign().get;
    code.push(get);
    ll = null;
    if(this.eat(",") && (ll = this.eat(['STRING', 'IDENT', 'NUMBER'])) ) code.push(",");
  }
  code.push(this.match('}').type);
  return {get: code.join("")}
}

// 中括号，即数组
// [ assign[,assign]*]
op.array = function(){
  var code = [this.match('[').type], item;
  if( this.eat("]") ){
    // 空数组
    code.push("]");
  } else {
    while(item = this.assign()){
      // 逐个变量解析
      code.push(item.get);
      if(this.eat(',')) code.push(",");
      else break;
    }
    code.push(this.match(']').type);
  }
  return {get: code.join("")};
}

// 小括号
// '(' expression ')'
op.paren = function(){
  this.match('(');
  var res = this.filter()
  res.get = '(' + res.get + ')';
  this.match(')');
  return res;
}

/**
 * 
 */
op.arguments = function(end){
  end = end || ')'
  var args = [];
  do{
    if(this.la() !== end){
      args.push(this.assign().get)
    }
  }while( this.eat(','));
  return args
}

// 包装get和set函数
op.getset = function(get, set){
  return {
    get: get,
    set: set
  }
}



module.exports = Parser;
