/*
 * 封装语法解析类
 */
var exprCache = require('../env').exprCache;
var _ = require("../util");
var Parser = require("../parser/Parser.js");
module.exports = {
  expression: function(expr, simple){
    // 获取对应表达式的语法树
    if( typeof expr === 'string' && ( expr = expr.trim() ) ){
      expr = exprCache.get( expr ) || exprCache.set( expr, new Parser( expr, { mode: 2, expression: true } ).expression() )
    }
    if(expr) return expr;
  },
  parse: function(template){
    // 获取对应模板的语法树
    return new Parser(template).parse();
  }
}

