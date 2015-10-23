/*
     * ------------------------------------------
     * 模板引擎
     * 实现原理参考trimpath项目 (GPL & APL)
     * @version  1.0
     * @author   june_01
     * ------------------------------------------
     */
    var TrimPath = {};
    TrimPath.parse = (function() {
        // 全局变量声明
        var stack  = [], // 循环语句堆栈
            rspc   = /\s+/g,
            trim, // 当前文本是否需要执行trim操作
            config,
            vars;  // 存储模板中出现的变量名
        /*
         * 解析表达式中变量信息，如a.b(c,d) || d('aaaa',f,g) && !!test() || 'eeee'
         */
        var doParseVars = (function() {
            var reg0 = /^\s*[\[\{'"].*?[\]\}'"]\s*$/,
                reg1 = /[\&\|\<\>\+\-\*\/\%\,\(\)\[\]\?\:\!\=\;]/,
                reg2 = /^(?:defined|null|undefined|true|false|instanceof|new|this|typeof|\$v|[\d]+)$/i,
                reg3 = /^new\s+/,
                reg4 = /['"]/;
            var doParseSimple = function(value) {
                // 字符串\数组\对象
                if(reg0.test(value)) {
                    return;
                }
                // 字符串方法
                value = value.split('.')[0].trim();
                if (!value||reg4.test(value)) {
                    return;
                }
                // 去除new方法
                value = value.replace(reg3,'');
                try{
                    // 检测到变量相关关键字
                    if (reg2.test(value)) {
                        return;
                    }
                    // 如果是变量
                    vars[value] = 1;
                }catch(e){}
            };
            return function(content){
                content = content||'';
                // 字符串\数组\对象，直接返回
                if(!content || reg0.test(content)) {
                    return;
                }

                // 按照分隔符分隔后逐个检查
                var arr = content.split(reg1);
                for(var i=0,l=arr.length; i < l; i++) {
                    doParseSimple(arr[i]);
                }
            };
        })();
        // 解析各种模板语句函数表
        var defmap = {
            doIF: function(part){
                // 解析IF语句前缀，['if','a'] -> if(a
                doParseVars(part.slice(1).join(' '));
                return 'if(';
            },
            doELSEIF: function(part){
                doParseVars(part.slice(1).join(' '));
                return '}else if(';
            },
            doVAR: function(part){
                doParseVars(part.slice(1).join(' '));
                return 'var ';
            },
            doMACRO: function(part){
                // 解析{macro macroName(arg1,arg2,...argN)}字符串的前缀，['macro','macroName(arg1,arg2,...argN)'] -> js代码前缀
                if (!part||!part.length) {
                    return;
                }
                part.shift(); // 移除 macro 关键字
                var name = part[0].split('(')[0];
                return 'var '+name+' = function'+part.join('').replace(name,'')+'{var OUT=[];';
            },
            doLIST: function(part){
                // 解析{list seq as x}或者{list 1..100 as x}字符串的前缀，['list','seq','as','x'] -> js语句前缀
                if (part[2]!='as') {
                    throw 'bad for list loop statement: '+part.join(' ');
                }
                var seq = part[1].split('..');
                if (seq.length>1){
                    // {list 1..100 as x}
                    // 生成代码类似如下
                    // for(var x,xindex=0,x_beg=1,xend=100,xlength=parseInt(xend-x_beg+1); xindex < xlength; xindex ++) {
                    //     x = x_beg + xindex;
                    doParseVars(seq[0]);
                    doParseVars(seq[1]);
                    return 'for(var '+part[3]+','+part[3]+'index=0,'+part[3]+'_beg='+seq[0]+','+part[3]+'end='+seq[1]+','+part[3]+'length=parseInt('+part[3]+'end-'+part[3]+'_beg+1);'+
                        part[3]+'index<'+part[3]+'length;'+part[3]+'index++){'+
                        part[3]+' = '+part[3]+'_beg+'+part[3]+'index;';
                }else{
                    // {list seq as x}
                    // 生成代码类似如下
                    // for(var __LIST__x=seq, x, xindex=0, xlength=__LIST__x.length; xindex < xlength; xindex ++) {
                    //     x = __LIST__x[xindex];
                    doParseVars(part[1]);
                    return 'for(var __LIST__'+part[3]+' = '+part[1]+','+part[3]+','+part[3]+'index=0,'+part[3]+'length=__LIST__'+part[3]+'.length;'+
                        part[3]+'index<'+part[3]+'length;'+part[3]+'index++){'+
                        part[3]+' = __LIST__'+part[3]+'['+part[3]+'index];';
                }
            },
            doFOREND: function(){
                // 解析{/for}字符串的前缀
                stack.pop();
                return '};';
            },
            doFORELSE: function(){
                // 解析{forelse}字符串的前缀
                var part = stack[stack.length-1];
                return '}; if(!__HASH__'+part+'||!'+part+'_count){';
            },
            doFOR: function(part){
                // 解析{for x in b}字符串的前缀，['for','x','in','b'] -> js语句前缀
                if (part[2] != 'in') {
                    throw 'bad for loop statement: ' + part.join(' ');
                }
                stack.push(part[1]);
                // 生成代码类似如下
                // var __HASH__x = b, x, x_count=0;
                // if(!!__HASH__x) {
                //     for(var x_key in __HASH__x) {
                //         x = __HASH__x[x_key];
                //         if(typeof x == "function") {
                //             continue;
                //         }
                //         x_count ++;
                doParseVars(part[3]);
                return 'var __HASH__'+part[1]+' = '+part[3]+','+part[1]+','+part[1]+'_count=0;'+
                       'if (!!__HASH__'+part[1]+')'+
                           'for(var '+part[1]+'_key in __HASH__'+part[1]+'){'+
                                part[1]+' = __HASH__'+part[1]+'['+part[1]+'_key];'+
                                'if (typeof('+part[1]+')=="function") continue;'+
                                part[1]+'_count++;';
            }
        };
        // 模板配置
        config = {
            blk : /^\{(cdata|minify|eval)/i,
            tag : 'forelse|for|list|if|elseif|else|var|macro|break|notrim|trim|include',
            //  pmin : 最少参数个数,
            //  pdft : 参数默认值,
            //  pfix : 对应js语句前缀,
            //  sfix : 对应js语句后缀
            def : {
                'if'     : {pfix:defmap['doIF'], sfix:'){', pmin:1},
                'else'   : {pfix:'}else{'},
                'elseif' : {pfix:defmap['doELSEIF'], sfix:'){', pdft:'true'},
                '/if'    : {pfix:'}'},
                'for'    : {pfix:defmap['doFOR'], pmin:3},
                'forelse': {pfix:defmap['doFORELSE']},
                '/for'   : {pfix:defmap['doFOREND']},
                'list'   : {pfix:defmap['doLIST'], pmin:3},
                '/list'  : {pfix:'};'},
                'break'  : {pfix:'break;'},
                'var'    : {pfix:defmap['doVAR'], sfix:';'},
                'macro'  : {pfix:defmap['doMACRO']},
                '/macro' : {pfix:'return OUT.join("");};'},
                'trim'   : {pfix:function(){trim = !0;}},
                '/trim'  : {pfix:function(){trim = null;}}
            },
            ext : {
                'default': function(value,_default){return value||_default;}
            }
        };
        /*
         * 解析语句，如{if customer != null && customer.balance > 1000}
         */
        var doParseStatement = (function(){
            var rbrc = /\\([\{\}])/g;
            return function(content, out) {
                // 将\{和\}替换成{和}
                content = content.replace(rbrc, '$1');
                // {if a} -> ['if', 'a']
                var part = content.slice(1, -1).split(rspc),
                    conf = config.def[part[0]];

                if(!conf) {
                    // 当不存在语句关键字，则当成文本段解析
                    doParseSectionText(content, out);
                    return;
                }
                if(!!conf.pmin && conf.pmin >= part.length) {
                    // 必须输入的参数不足
                    throw 'Statement needs more parameters:'+content;
                }
                // 解析语句关键字前缀
                out.push((!!conf.pfix && typeof(conf.pfix)!='string') ? conf.pfix(part) : (conf.pfix||''));
                // 解析语句关键字后缀和参数
                if (!!conf.sfix){
                    if(part.length <= 1) {
                        // 当没有参数时使用默认参数
                        if(!!conf.pdft) {
                            out.push(conf.pdft);
                        }
                    } else {
                        // 输入参数
                        for(var i=1,l=part.length; i < l; i++) {
                            if(i > 1) {
                                out.push(' ');
                            }
                            out.push(part[i]);
                        }
                    }
                    out.push(conf.sfix);
                }
            };
        })();
        /*
         * 解析表达式，如['firstName','default:"John Doe"','capitalize']
         */
        var doParseExpression = function(exps, out){
            // foo|a:x|b:y1,y2|c:z1,z2 -> c(b(a(foo,x),y1,y2),z1,z2)
            // 从尾向前递归解析
            var exp;
            if(!exps || !exps.length) {
                return;
            }
            // 当不存在过滤器时
            if(exps.length == 1) {
                exp = exps.pop();
                doParseVars(exp);
                out.push(exp==''?'""':exp);
                return;
            }
            // 当存在过滤器时
            exp = exps.pop().split(':');
            out.push('EXT[\''+exp.shift()+'\'](');
            // 递归调用
            doParseExpression(exps, out);

            if(exp.length > 0) {
                var args = exp.join(':');
                doParseVars(args);
                out.push(','+args);
            }
            out.push(')');
        };
        /*
         * 解析文本段内容，内容中可能包含换行
         */
        var doParseSectionText = function(content,out){
            if (!content) {
                return;
            }
            // 分行
            var lines = content.split('\n');
            if(!lines||!lines.length) {
                return;
            }
            for(var i=0,l=lines.length,line; i<l; i++) {
                line = lines[i];
                if(!!trim) {
                    // 当需要做去空格操作时
                    line = line.trim();
                    if(!line) {
                        continue;
                    }
                }
                // 解析单行
                doParseSectionTextLine(line,out);
                if(!!trim && i<l-1) {
                    out.push('OUT.push(\'\\n\');');
                }
            }
        };
        /*
         * 解析文本行内容，内容中可能包含${a}或者${%a%}取值语句
         */
        var doParseSectionTextLine = (function() {
            var raor = /\|\|/g,
                rvor = /#@@#/g;
            return function(content,out) {
                var contentBegin = 0, //待解析文段起始位置
                    len = content.length,
                    begin,
                    end,
                    begexp, // 取值语句初始位置
                    endexp, // 取值语句结束位置
                    exparr;
                while(contentBegin <len) {
                    // 获取取值语句初始和结束位置
                    begin = '${'; end = '}';
                    begexp = content.indexOf(begin, contentBegin);
                    if(begexp < 0) {
                        break;
                    }
                    if(content.charAt(begexp + 2) == '%') { // 解析 ${% XX.XX %} 语句
                        begin = '${%'; end = '%}';
                    }
                    endexp = content.indexOf(end, begexp + begin.length);
                    if(endexp < 0) {
                        break;
                    }

                    // 解析行中取值语句之前的文本内容
                    doParseText(content.substring(contentBegin, begexp), out);

                    // 按照过滤器'|'对取值语句进行分离，但是保留或语句'||'
                    exparr = content.substring(begexp + begin.length, endexp).replace(raor, '#@@#').split('|');
                    for(var i=0, l=exparr.length; i<l; i++) {
                        exparr[i]=exparr[i].replace(rvor,'||');
                    }

                    // 解析取值语句
                    out.push('OUT.push('); 
                    doParseExpression(exparr,out);
                    out.push(');');

                    contentBegin = endexp + end.length;
                }
                // 解析剩下文段的文本内容
                doParseText(content.substring(contentBegin), out);
            };
        })();
        /*
         * 解析纯文本内容，不包含需要解析的内容
         */
        var doParseText = (function(){
            var map = {r:/\n|\\|\'/g,'\n':'\\n','\\':'\\\\','\'':'\\\''};
            var doEncode = function(content){
                // 替换换行和转义字符
                return (content||'').replace(map.r,function($1){
                    return map[$1]||$1;
                });
            };
            return function(content,out){
                if (!content) {
                    return;
                }
                out.push('OUT.push(\''+doEncode(content)+'\');');
            };
        })();
        /*
         * 解析模板为执行函数
         */
        var doParseTemplate = (function(){
            var rtab = /\t/g,
                rnln = /\n/g,
                rlne = /\r\n?/g;
            var doSearchEnd = function(content, begin) {
                // 搜索语句结束位置
                var index = content.indexOf("}",begin+1);

                while(content.charAt(index-1) == '\\') {
                    // 当遇到 /} 转义的情况则继续往后搜索
                    index = content.indexOf("}",index+1);
                }
                return index;
            };
            var doParseVarMap = function(){
                // 解析模板变量并生成对应语句
                var arr = [],
                    arg = arguments[0];
                for(var x in arg){
                    x = (x||'').trim();
                    if (!x) {
                        continue;
                    }
                    arr.push(x+'=$v(\''+x+'\')');
                }
                return arr.length > 0 ? ('var ' + arr.join(',') + ';') : '';
            };
            return function(content) {
                // 初始化模板变量为空
                vars = {};
                // 替换换行符和退格符
                content = content.replace(rlne, '\n').replace(rtab, '    ');
                var ftxt = [
                        'if(!DATA) return \'\';',
                        '',
                        'function $v(NAME){var v = DATA[NAME];return v==null?window[NAME]:v;};',
                        'var defined=function(NAME){return DATA[NAME]!=null;},',
                        'OUT=[];'], // 模板生成函数预填数据
                    prvend = -1, // 检索文本起始位置
                    len = content.length,
                    stmtbeg, // 模板语句起始位置
                    stmtend, // 模板语句结束位置
                    statement, // 当前模板语句
                    blockrx, // minify/eval/cdata 语句关键字
                    blktmp,
                    blkend, // minify/eval/cdata 语句结束位置
                    blkmrk, // minify/eval/cdata 结束语句标记
                    blktxt; // minify/eval/cdata 语句中间文本
                // 检索文本
                while((prvend+1) < len) {
                    // 检索模板语句，不包含求值语句
                    stmtbeg = prvend;
                    stmtbeg = content.indexOf("{", stmtbeg+1);
                    while(stmtbeg >= 0) {
                        // 循环检查模板语句，直到模板语句为非求值和块级语句
                        stmtend = doSearchEnd(content, stmtbeg);
                        statement = content.substring(stmtbeg, stmtend);

                        blockrx = statement.match(config.blk);
                        if(!!blockrx) {
                            // 当检索到 minify/eval/cdata 时
                            blktmp = blockrx[1].length + 1;
                            blkend = content.indexOf('}',stmtbeg + blktmp);
                            if(blkend >= 0) {
                                // 获取 minify/eval/cdata 结束标记
                                blkmrk = blkend-stmtbeg-blktmp <= 0 ? ('{/'+blockrx[1]+'}') : statement.substr(blktmp+1);
                                // 获取结束标记位置
                                blktmp = content.indexOf(blkmrk, blkend + 1);

                                if(blktmp >= 0) {
                                    // 解析 minify/eval/cdata 语句前文本
                                    doParseSectionText(content.substring(prvend+1, stmtbeg), ftxt);
                                    // 获取 minify/eval/cdata 语句中间文本
                                    blktxt = content.substring(blkend+1, blktmp);
                                    switch(blockrx[1]) {
                                        case 'cdata' : 
                                            doParseText(blktxt, ftxt); 
                                            break;
                                        case 'minify': 
                                            doParseText(blktxt.replace(rnln,' ').replace(rspc,' '), ftxt); 
                                            break;
                                        case 'eval'  : 
                                            if(!!blktxt) {
                                                ftxt.push('OUT.push((function(){'+blktxt+'})());'); 
                                            }
                                            break;
                                    }
                                    // 将下一次解析位置定为 minify/eval/cdata 语句结束标记后
                                    stmtbeg = prvend = blktmp+blkmrk.length-1;
                                }
                            }
                        } else if(content.charAt(stmtbeg - 1) != '$' && content.charAt(stmtbeg - 1) != '\\' && statement.substr(statement.charAt(1) == '/' ? 2 : 1).search(config.tag) == 0) {
                            // 当模板语句 { 前是 $ 或者 \ 以及模板语句不符合模板语法时
                            break;
                        }
                        stmtbeg = content.indexOf("{", stmtbeg + 1);
                    }

                    // 当未检索都模板语句时
                    if(stmtbeg<0) {
                        break;
                    }
                    stmtend = doSearchEnd(content, stmtbeg);
                    if(stmtend<0) {
                        break;
                    }

                    // 解析当前模板语句之前的文本
                    doParseSectionText(content.substring( prvend+1, stmtbeg), ftxt);
                    // 解析模板语句
                    doParseStatement(content.substring(stmtbeg, stmtend+1), ftxt);

                    prvend = stmtend;
                }
                // 解析最后一段文本
                doParseSectionText(content.substring(prvend+1),ftxt);

                ftxt.push(';return OUT.join("");'); 
                // 生成变量语句
                ftxt[1] = doParseVarMap(vars);
                vars = null;

                return new Function('DATA', 'EXT', ftxt.join(''));
            };
        })();
        /**`
         * 根据模板数据生成代码
         * @method 
         */
        return function(content,data,extend){
            try{
                data = data||{};
                // 解析模板生成代码生成器
                var f = doParseTemplate(content);
                if (!!extend){
                    for(var x in config.ext)
                        if (!extend[x])
                            extend[x] = config.ext[x];
                }
                return f(data,extend||config.ext);
            }catch(ex){
                return ex.message||'';
            }
        };
    })();