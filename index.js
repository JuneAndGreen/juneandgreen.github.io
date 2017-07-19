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
subs.forEach(file => {
    let filePath = path.join(inputDir, file);
    if(path.extname(filePath) === '.md' && fs.statSync(filePath).isFile()) {
        // 文件
        files.push({
            path: filePath,
            name: file
        });
    }
});

files.forEach(fileObj => {
    gomd({
        watch: true,
        input: fileObj.path,
        output: path.join(outputDir, path.basename(fileObj.name, '.md')) + '.html',
        title: path.basename(fileObj.name, '.md')
    });
});