'use strict';

const path = require('path');
const fs = require('fs');
const gomd = require('gomd');
const tooltpl = require('tooltpl');

/**
 * 主流程
 */
function main() {
    // transformArticlesToHtml();
    generateArticlesHtml();
}

/**
 * 将articles转成html
 */
function transformArticlesToHtml() {
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
            watch: false,
            input: fileObj.path,
            output: path.join(outputDir, path.basename(fileObj.name, '.md')) + '.html',
            title: path.basename(fileObj.name, '.md')
        });
    });
}

/**
 * 生成博客文章页面
 */
function generateArticlesHtml() {
    let articlesTemplate = fs.readFileSync(path.join(__dirname, './page/templates/articles.html'), 'utf8');
    let articlesDir = path.join(__dirname, './articles_html/');
    let baseUrl = '//juneandgreen.github.io/articles_html/';
    let colors = ['#dff0d8', '#d9edf7', '#fcf8e3', '#f2dede', '#f5f5f5'];

    let articles = [];
    fs.readdirSync(articlesDir).forEach((file, index) => {
        articles.push({
            title: path.basename(file, '.html'),
            url: baseUrl + encodeURIComponent(file),
            color: colors[index % 5],
        });
    });

    let html = tooltpl.generate(articlesTemplate, {
        articles,
    });

    fs.writeFileSync(path.join(__dirname, './page/articles/index.html'), html, 'utf8');
}

main();
