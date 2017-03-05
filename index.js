'use strict';

const path = require('path');
const fs = require('fs');
const gomd = require('gomd');

/**
 * 将articles转成html
 */

let inputDir = path.join(__dirname, './articles/');
let outputDir = path.join(__dirname, './articles_html/');
let subs = fs.readdirSync(inputDir);

let files = [];
subs.forEach((file) => {
    let filePath = path.join(inputDir, file);
    if(path.extname(filePath) === '.md' && fs.statSync(filePath).isFile()) {
      // 文件
      files.push(filePath);
    }
});

files.forEach((file) => {
    gomd({
        watch: true,
        input: file,
        output: path.join(outputDir, path.basename(file, '.md')) + '.html'
    });
});