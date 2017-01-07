/*
 *  网易NEJ框架definejs源码注释，去掉部分配置相关逻辑
 */

(function(d, p) {
  var __xqueue = []; // 存放依赖加载相关的参数，item:{n:'filename',d:[/* dependency list */],f:function}
  var __scache = {}; // 存放依赖加载的状态，uri:STATE   0-loading  1-waiting  2-defined
  var __rcache = {}; // 存放依赖加载后的结果，uri:RESULT
  var __stack = []; // 定义依赖时的缓存栈
  /*
   * 文件初始化
   */
  var doInit = function() {
    // 初始化脚本
    var list = d.getElementsByTagName('script');
    if (!list || !list.length) return;
    for (var i = list.length - 1, script; i >= 0; i--) {
      script = list[i];
      script.xxx = true;
      if(/define\.js/.test(script.src)) continue;
      doScriptLoaded(script);
    }
  };
  /*
   * 解析文件类型
   */
  var doParseType = (function() {
    var _pmap = {
      text: function(uri) {
        doLoadText(uri);
      },
      json: function(uri) {
        doLoadJSON(uri);
      }
    };
    return function(uri) {
      var brr = [uri, null];
      var arr = uri.split('.');
      var type = arr.pop();
      if(type === 'js') {
        brr[1] = doLoadScript;
      } else if(type === 'json') {
        brr[1] = doLoadJSON;
      } else {
        brr[1] = doLoadText;
      }

      return brr;
    };
  })();
  /*
   * 取事件触发元素
   */
  var getElement = function(e) {
    return !e ? null: (e.target || e.srcElement);
  };
  /*
   * 相对路径转绝对路径
   */
  var doAbsoluteURI = (function() {
    var flag = false; // 标志是否把a标签加到文档中去了
    var anchor = d.createElement('a');
    // 添加a标签到文档中
    var append = function() {
      if(flag) return;
      flag = true;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
    };
    return function(uri) {
      // 利用浏览器特性，通过使用a标签来获取绝对路径
      append();
      anchor.href = uri;
      uri = anchor.href;
      return uri.indexOf('://') > 0 && uri.indexOf('./') < 0 ? uri : anchor.getAttribute('href', 4); // ie 6/7
    };
  })();

  /*
   * 格式化地址,取绝对路径
   */
  var doFormatURI = (function() {
    var reg1 = /([^:])\/+/g;
    var reg3 = /[^\/]*$/;
    var reg6 = /(file:\/\/)([^\/])/i;
    // 判断是否绝对路径
    var absolute = function(uri) {
      return uri.indexOf('://') > 0;
    };
    // 修复uri中错误，aa//df -->  aa/df
    var slash = function(uri) {
      return uri.replace(reg1, '$1/');
    };
    // 获取uri路径的上一级，用以处理相对路径
    var root = function(uri) {
      return uri.replace(reg3, '');
    };
    // 格式化uri，修复部分问题
    var format = function(uri) {
      uri = uri.replace(reg6, '$1/$2'); // 解决 mac file:// 问题
      return doAbsoluteURI(uri);
    };
    return function(uri, base) {
      // 如果是数组，则对数组内每一个uri进行格式化
      if(uri instanceof Array) {
        var list = [];
        for(var i = 0; i < uri.length; i++) {
          list.push(doFormatURI(uri[i], base));
        }
        return list;
      }

      uri = slash(uri);
      if(!uri) return '';
      // 已经是绝对路径的情况
      if(absolute(uri)) return format(uri);
      // 以.开始的相对路径
      if(base && uri.indexOf('.') == 0) uri = root(base) + uri;
      // 格式化成绝对路径
      return format(uri);
    };
  })();
  /*
   * 检查所有文件是否都载入
   */
  var isFinishLoaded = function() {
    for(var x in __scache) 
      if(__scache[x] === 0) return false;
    return true;
  };
  /*
   * 检查依赖列表是否都载入完成
   */
  var isListLoaded = function(list) {
    if(list && list.length)
      for(var i = list.length - 1; i >= 0; i--)
        if(__scache[list[i]] !== 2) return false;
    return true;
  };
  /*
   * 载入依赖文本
   */
  var doLoadText = (function() {
    var msid;
    var msxml = [
      'Msxml2.XMLHTTP.6.0',
      'Msxml2.XMLHTTP.3.0', 
      'Msxml2.XMLHTTP.4.0', 
      'Msxml2.XMLHTTP.5.0', 
      'MSXML2.XMLHTTP', 
      'Microsoft.XMLHTTP'
    ];
    var getXHR = function() {
      if(p.XMLHttpRequest) return new p.XMLHttpRequest();
      if(msid) return new ActiveXObject(msid);

      for(var i = 0,l = msxml.length,it; i < l; i++) {
        try {
          it = msxml[i];
          var xhr = new ActiveXObject(it);
          msid = it; // 缓存
          return xhr;
        } catch(e) {
          // ignore
        }
      }
    };
    return function(uri, callback) {
      if(!uri) return;
      // 未加载过
      var state = __scache[uri];
      if(state != null) return;
      // 加载文本
      // 标记为加载中
      __scache[uri] = 0;
      var xhr = getXHR();
      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          var text = xhr.responseText || '';
          // 标记为已定义
          __scache[uri] = 2;
          __rcache[uri] = text;

          if(callback) callback(text);

          doCheckLoading();
        }
      };
      xhr.open('GET', uri, !0);
      xhr.send(null);
    };
  })();
  /*
   * 载入依赖JSON
   */
  var doLoadJSON = function(uri) {
    doLoadText(uri, function(text) {
      // 解析JSON
      var data;
      try {
        if(p.JSON && JSON.parse) {
          data = JSON.parse(text);
        } else {
          data = eval('(' + text + ')');
        }
      } catch(ex) {
        data = null;
      }
      __rcache[uri] = data;
    });
  };


  /*
   * 侦测脚本载入情况
   */
  var doAddListener = (function() {
    var statechange = function(e) {
      var element = getElement(e) || this;
      if(!element) return;
      var state = element.readyState;
      if(state === 'loaded' || state === 'complete') doScriptLoaded(element);
    };
    return function(script) {
      script.onload = function(e) {
        // 加载成功
        doScriptLoaded(getElement(e));
      };
      script.onerror = function(e) {
        // 加载失败
        doScriptLoaded(getElement(e));
      };
      // ie hack
      script.onreadystatechange = statechange;
    };
  })();
  /*
   * 载入依赖脚本
   */
  var doLoadScript = function(uri) {
    if(!uri) return;
    // 已加载则返回
    var state = __scache[uri];
    if(state != null) return;
    // 标记当前脚本为加载中
    __scache[uri] = 0;
    // 使用script标签添加到文档中，加载运行完再删除
    var script = d.createElement('script');
    script.xxx = true;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    doAddListener(script); // 监听脚本加载运行
    script.src = uri;
    (d.getElementsByTagName('head')[0] || document.body).appendChild(script);
  };
  /*
   * 清理脚本节点
   */
  var doClearScript = function(script) {
    if(!script || !script.parentNode) return;
    // 清除事件
    script.onload = null;
    script.onerror = null;
    script.onreadystatechange = null;
    // 清除script标签
    script.parentNode.removeChild(script);
  };
  /*
   * 脚本载入完成回调
   */
  var doScriptLoaded = function(script) {
    var uri = doFormatURI(script.src);
    if(!uri) return;

    var arr = __stack.pop();
    if(arr) {
      arr.unshift(uri);
      doDefine.apply(p, arr);
    }
    // 当脚本不处于等待中的话，则标记为已定义
    if(__scache[uri] != 1)  __scache[uri] = 2;
    // 清理脚本节点
    doClearScript(script);
    doCheckLoading();
  };


  /*
   * 页面已存在的script节点添加事件检测
   */
  var doAddAllListener = (function() {
    var reg = /(?:NEJ\.)?define\s*\(/;
    var _isNEJInline = function(script) {
      var _code = script.innerHTML;
      return _code.search(reg) >= 0;
    };
    return function() {
      var list = document.getElementsByTagName('script');
      for(var i = list.length - 1,script; i >= 0; i--) {
        script = list[i];
        if(!script.xxx) {
          script.xxx = true;
          if(!script.src && _isNEJInline(script)) {
            doClearStack();
          } else {
            doAddListener(list[i]);
          }
        }
      }
    };
  })();

  /*
   * 搜索循环引用，传入需解锁环
   */
  var doFindCircularRef = (function() {
    var result;
    // 获取数组中某个元素的index
    var index = function(array, name) {
      for(var i = array.length - 1; i >= 0; i--) 
        if(array[i].n == name) 
          return i;
      return -1;
    };
    // 递归寻找循环引用的文件
    var loop = function(item) {
      if(!item) return;
      // 已经出现过的文件
      var i = index(result, item.n);
      if(i >= 0) return item;

      result.push(item);

      var deps = item.d;
      if(!deps || !deps.length) return;
      // 遍历依赖列表
      for(var i = 0,l = deps.length,citm; i < l; i++) {
        // 找到队列中当前依赖文件
        var tmp = __xqueue[index(__xqueue, deps[i])];
        // 递归调用
        citm = loop(tmp);
        if(citm) return citm;
      }
    };
    return function() {
      result = [];
      // 遍历检查
      var item = loop(__xqueue[0]);
      return item;
    };
  })();
  /*
   * 执行文件脚本
   */
  var doExecFunction = (function() {
    // 合并依赖注入参数
    var doMergeDI = function(dep) {
      var arr = [];
      if(dep) {
        // 遍历依赖列表
        for(var i = 0,l = dep.length,it; i < l; i++) {
          it = dep[i];
          if(!__rcache[it]) __rcache[it] = {};
          arr.push(__rcache[it]);
        }
      }
      return arr;
    };
    // 合并依赖注入结果
    var doMergeResult = function(uri, result) {
      var ret = __rcache[uri] || {};
      if(typeof result === 'object') {
        for(var item in result) 
          ret[item] = result[item];
      } else {
        ret = result;
      }
      // 将定义好的文件放入缓存
      __rcache[uri] = ret;
    };
    return function(item) {
      var args = doMergeDI(item.d);
      if(item.f) {
        // 注入依赖并执行
        var result = item.f.apply(p, args) || {};
        doMergeResult(item.n, result);
      }
      __scache[item.n] = 2;
    };
  })();

  /*
   * 检查依赖载入情况
   */
  var doCheckLoading = function() {
    if(!__xqueue.length) return;
    for(var i = __xqueue.length - 1,item; i >= 0;) {
      item = __xqueue[i];
      if(__scache[item.n] !== 2 && !isListLoaded(item.d)) {
        // 存在未定义的文件，且依赖列表中也存在未定义的文件
        i--;
        continue;
      }
      // 对于未定义文件，从队列中删除并进行执行，已定义的文件则直接删除
      __xqueue.splice(i, 1);
      if(__scache[item.n] !== 2) doExecFunction(item);
      i = __xqueue.length - 1;
    }
    if(__xqueue.length > 0 && isFinishLoaded()) {
      // 存在循环引用
      // 尝试解决，只能解决弱依赖引用，无法解决强依赖引用
      var item = doFindCircularRef() || __xqueue.pop();    
      doExecFunction(item);
      doCheckLoading();
    }
  };
  /*
   * 清理函数定义缓存栈
   */
  var doClearStack = function() {
    var args = __stack.pop();
    while(args) {
      doDefine.apply(p, args);
      args = __stack.pop();
    }
  };
  /*
   * 查找当前执行的脚本
   */
  var doFindScriptRunning = function() {
    // for ie8+
    var list = document.getElementsByTagName('script');
    for(var i = list.length-1,script; i >= 0; i--) {
      script = list[i];
      if (script.readyState === 'interactive') return script;
    }
  };

  /*
   * 执行模块定义
   */
  var doDefine = (function() {
    var seed = +new Date,
    keys = ['d', 'h'];
    // 将依赖列表中uri进行格式化
    var doComplete = function(list, base) {
      if(!list || !list.length) return;
      for(var i = 0,l = list.length,it; i < l; i++) {
        it = list[i] || '';
        if (it.indexOf('.') != 0) continue;
        list[i] = doFormatURI(it, base);
      }
    };
    return function(uri, deps, callback) {
      if(typeof uri !== 'string') {
        callback = deps;
        deps = uri;
        uri = './' + (seed++) + '.js'
      }
      uri = doFormatURI(uri);

      // 已定义
      if(__scache[uri] === 2) return; 

      doComplete(deps, uri);
      __scache[uri] = 1; // 当前脚本标记为等待中
      // 放进待加载队列中
      var xmap = {
        n: uri,
        d: deps,
        f: callback
      };
      __xqueue.push(xmap);

      var list = xmap.d;
      if(list &&list.length) {
        for(var i=0,len=list.length; i < len; i++) {
          var it = list[i];

          // 0 - url
          // 1 - 加载函数
          var arr = doParseType(it);
          var itm = doFormatURI(arr[0], uri);
          list[i] = itm;
          // 加载资源
          arr[1](itm);
        }
      }

      doCheckLoading();
    };
  })();

  p.NEJ = {};
  
  NEJ.define = function(deps, callback) {
    var args = [].slice.call(arguments, 0),
    script = doFindScriptRunning();
    // 针对IE的情况
    if(script) {
      var src = script.src;
      if(src) args.unshift(doFormatURI(src));
      return doDefine.apply(p, args);
    }
    // 非IE
    __stack.push(args);
    doAddAllListener();
  };
  
  doInit();
})(document, window);