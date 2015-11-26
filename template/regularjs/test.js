var tpl = 'ss<div class="sss" required checked >{x}</div>';

var Lexer = require('./src/parser/lexer.js');
var le = new Lexer(tpl);


var Parser = require('./src/parser/Parser.js');
var p = new Parser(tpl);





// console.log(JSON.stringify(le.lex(), '', '\t'));
console.log(JSON.stringify(p.parse(), '', '\t'));