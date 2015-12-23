// var tpl = 'ss<div class="sss" required checked >{x}</div><div>ssf</div>';
var tpl = '<div class="sss">{x|ff}</div>';
// var tpl = '<div r-class="{a+2} ss {b}"></div>'

var Lexer = require('./src/parser/lexer.js');
var le = new Lexer(tpl);


var Parser = require('./src/parser/Parser.js');
var p = new Parser(tpl);




console.log(JSON.stringify(le.lex(), '', '\t'), '\n===============================================\n');
console.log(JSON.stringify(p.parse(), '', '\t'));