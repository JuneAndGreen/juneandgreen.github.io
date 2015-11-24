var Lexer = require('./src/parser/lexer.js');

var le = new Lexer('ss<div>{x}<div>');

console.log(JSON.stringify(le.lex(), '', '\t'));