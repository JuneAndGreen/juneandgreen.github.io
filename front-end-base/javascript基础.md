## 特性

* 动态
* 弱类型

## 类型

### 基础类型

原本有六种：Undefined/Null/Boolean/String/Number/Object
ES6追加了一种：Symbol（表示是唯一数据的一种类型）

### typeof

可能非返回值：undefined/boolean/string/number/object/function
其中对null和array使用typeof都会返回object，而ES6中对Symbol使用typeof返回symbol

### 引用类型

base value/referenced name/strict reference flag

### 类型转换

* 字符串转数字：parseInt/parseFloat
* 其它类型转字符串：xxx.toString()/''+sth
* 其他类型转布尔值：!!sth
* 其他类型转数字：~~sth

### 相等比较

* ==：相等比较，只比较值，假如类型不同会进行类型转换后再比较
* ===：全等比较，同时比较类型和值

## 语句

### 常见语句

if/switch/for/for-in/while/do-while/continue/break…

### 声明语句

var/function（声明会提前）

### 语句块

js中本身无块级作用域，在ES6中加入let和const，可产生块级作用域

### 逻辑表达式

相与相或会出现 短路情况：假如是相与，遇到值为假即返回，假如是相或，遇到值为真即返回。

### 函数表达式

区分函数声明，即使用表达式的方式来声明函数，如用var的方式：

```javascript
var f = function() {};
```

### 关键字运算符

* delete：删除某个对象的某个属性
* typeof：判断变量的类型
* void：计算表达式，但不返回值。如`void 0`或`void(0)`
* instanceof：判断变量是否属于某个类的实例

### 运算符优先级

* `.`、`[]`和`()`
* 自增 自减 delete new typeof void 等
* 乘除取模
* 加减
* 其他等

## 函数

### 函数声明/函数表达式/命名函数表达式

* 函数声明：`function() {}`
* 函数表达式：`var f = function() {}`
* 命名函数表达式：`var f = function func() {}`

### this

this表示当前上下文，即当前函数的调用者，可以使用bind/call/apply进行修改

1、在函数调用中（处于全局中的函数），this指向全局环境。
2、处于对象中的函数调用中，this指向该对象（即调用的那一级）。
3、当对象被实现后，即用new创建后，this则指向该对象。

### arguments

存储当前执行函数的信息，包括函数名，当前函数的引用和参数等

* arguments.caller：当前函数的调用函数的引用
* arguments.callee：当前函数的引用

### 原型/原型链

每个构造函数都有`prototype`属性，该属性存的是一个实例，该实例的constructor为自身。每个实例都有一个`__proto__`属性，该属性指向构造函数的`prototype`。当寻找实例的属性时，从该实例的`__proto__`往上找，若找不到就找`__proto__`的`__proto__`。这个寻找方式其实就是沿着原型链查找属性。

使用delete关键字可以删除一个对象的属性。
hasOwnProperty可以判断是否是自有属性，防止被重写。

### 原型继承/类继承

原型继承：根据原型实现的继承
类继承：Object.create中提供的继承方式，在es6中还提供了class和extend的方式来继承

### 作用域/作用域链

作用域是变量与函数的可访问范围。在js中，变量的作用域有全局作用域和局部作用域两种。

####  全局作用域（Global Scope）

在代码中任何地方都能访问到的对象拥有全局作用域，一般来说以下几种情形拥有全局作用域：

最外层函数和在最外层函数外面定义的变量拥有全局作用域，所有末定义直接赋值的变量自动声明为拥有全局作用域，例如：

```javascript
var a = 0;
function func() {
	b = 1;
    alert(a); // 0
    alert(1); // 1
}
alert(a); // 0
alert(1); // 1
```

全局作用域实际上就是window作用域，在全局作用域下的变量都是挂在window对象下。

####  局部作用域（Local Scope）　　

和全局作用域相反，局部作用域一般只在固定的代码片段内可访问到，最常见的是在函数内部，例如下列代码中的b只拥有局部作用域。

```javascript
function func() {
    var b = 0;
}
alert(b); // error
```

#### 作用域链（Scope Chain）

在JavaScript中，函数也是对象，实际上，JavaScript里一切都是对象。函数对象和其它对象一样，拥有可以通过代码访问的属性和一系列仅供JavaScript引擎访问的内部属性。其中一个内部属性是[[Scope]]，由ECMA-262标准第三版定义，该内部属性包含了函数被创建的作用域中对象的集合，这个集合被称为函数的作用域链，它决定了哪些数据能被函数访问。
　　
当一个函数创建后，它的作用域链会被创建此函数的作用域中可访问的数据对象填充。例如定义下面这样一个函数：

```javascript
function add(num1, num2) {
    var sum = num1 + num2;
    return sum;
}
```

在函数add创建时，它的作用域链中会填入一个全局对象，该全局对象包含了所有全局变量。函数add的作用域将会在执行时用到。例如执行如下代码：

```javascript
var total = add(5, 10);
```

执行此函数时会创建一个称为“运行期上下文(execution context)”的内部对象，运行期上下文定义了函数执行时的环境。每个运行期上下文都有自己的作用域链，用于标识符解析，当运行期上下文被创建时，而它的作用域链初始化为当前运行函数的[[Scope]]所包含的对象。
　　
这些值按照它们出现在函数中的顺序被复制到运行期上下文的作用域链中。它们共同组成了一个新的对象，叫“活动对象(activation object)”，该对象包含了函数的所有局部变量、命名参数、参数集合以及this，然后此对象会被推入作用域链的前端，当运行期上下文被销毁，活动对象也随之销毁。

在函数执行过程中，每遇到一个变量，都会经历一次标识符解析过程以决定从哪里获取和存储数据。该过程从作用域链头部，也就是从活动对象开始搜索，查找同名的标识符，如果找到了就使用这个标识符对应的变量，如果没找到继续搜索作用域链中的下一个对象，如果搜索完所有对象都未找到，则认为该标识符未定义。函数执行过程中，每个标识符都要经历这样的搜索过程。
作用域链和代码优化

从作用域链的结构可以看出，在运行期上下文的作用域链中，标识符所在的位置越深，读写速度就会越慢。因为全局变量总是存在于运行期上下文作用域链的最末端，因此在标识符解析的时候，查找全局变量是最慢的。所以，在编写代码的时候应尽量少使用全局变量，尽可能使用局部变量。一个好的经验法则是：如果一个跨作用域的对象被引用了一次以上，则先把它存储到局部变量里再使用。例如下面的代码：

```javascript
function changeColor() {
    document.getElementById('btnChange').onclick = function() {
        document.getElementById('targetCanvas').style.backgroundColor = 'red';
    };
}
```
　　
这个函数引用了两次全局变量document，查找该变量必须遍历整个作用域链，直到最后在全局对象中才能找到。这段代码可以重写如下：

```javascript
function changeColor() {
    var doc = document;
    doc.getElementById('btnChange').onclick = function() {
        doc.getElementById('targetCanvas').style.backgroundColor = 'red';
    };
}
```

这段代码比较简单，重写后不会显示出巨大的性能提升，但是如果程序中有大量的全局变量被从反复访问，那么重写后的代码性能会有显著改善。

### 闭包

返回值为函数，主要用于保存数据的引用和保护作用域

### 函数创建和调用时执行上下文的信息

### 特殊语句及函数的性能影响

* with：with在作用域链上增加了一个新作用域，而原本的作用域处于作用域链中第二个位置
* cache：同with语句，会增加新作用域
* eval：会创造新的执行环境
* 使用尾调用或尾递归可以在当前作用域出栈后再进入新的作用域，对代码执行进行优化

## DOM

### 节点类型判断

通过nodeType来判断，1为元素节点，2为属性节点，3为文本节点，8为注释节点，9为文档节点（即document）

### 节点操作

* 增加：createElement/createAttribute/createTextNode
* 删除：removeChild
* 查找：getElementById/getElementsByTag/getElementsByName/querySelector/quertSelectorAll/firstChild/lastChild/parentNode/nextSibling/previousSibling/childNodes
* 更新：innerHTML/innerText/insertAdjacentHTML/insertBefore/appendChild
* 复制：cloneNode（传入true表示要拷贝子节点，不传表示只拷贝当前节点）
* 替换：replaceChild

### 节点属性操作

* 增加：setAttribute
* 删除：removeAttribute
* 查找（getAttribute）

### DOM树遍历

* previous[next]Sibling：返回上一个/下一个节点，包含文本节点、注释节点。
* previous[next]ElementSibling：返回上一个/下一个元素
* TreeWalker：高版本浏览器提供的一个用于遍历DOM树的对象，可以对节点进行遍历和过滤

## 事件

### 事件模型

三个阶段，捕获，目标，冒泡

### 事件类型

#### 鼠标事件

```
onclick     | 鼠标单击时触发
ondbclick   | 鼠标双击时触发
onmousedown | 鼠标左键按下时触发
onmouseup   | 鼠标释放时触发
onmouseover | 鼠标的光标移动到某对象上时触发
onmousemove | 鼠标移动时触发
onmouseout  | 鼠标光标离开某对象时触发
```

ps:当单击一次鼠标左键的时候，将同时触发onclick、onmousedown、onmouseup三个事件，事件处理程序执行的先后顺序为：onmousedown>onmouseup>onclick.因为按下鼠标产生的动作肯定是在释放鼠标之前的，而一次按下加上一次释放，才代表一次单击，所以onclick最后执行。

#### 键盘事件

````
onkeypress | 某个键按下以后触发
onkeydown  | 某个键按下时触发
onkeyup    | 某个键被释放时触发
```

ps:对键盘的操作也会同时触发这三个事件，其处理程序执行的先后顺序是onkeydown>onkeypress>onkeyup.原因参见鼠标事件。
ps:键盘事件中通过which（旧ff使用）/keyCode/charCode获取键值

#### 页面事件

```
onerror	 | 页面出错时触发
onload	 | 页面加载完成时触发
onresize | 浏览器窗口大小该表时触发
onscroll | 浏览器滚动条的位置发生变化时触发
onunload | 页面将被卸载时触发
```

#### 表单事件

````
onblur   | 元素失去焦点时触发
onchange | 元素失去焦点并且元素内容改变时触发
onfocus  | 元素获得焦点时触发
onsubmit | 表单被提交时触发
```

### 事件调度（事件循环）

### 事件监听

```javascript
/* 添加事件监听 */
var eventName = 'click';
var callback = function() {};

if(window.addEventListener) {
	window.addEventListener(eventName, callback);
} else {
	// IE8以下
	window.attachEvent('on' + eventName, callback);
}

/* 删除事件监听 */
if(window.removeEventListener) {
	window.removeEventListener(eventName, callback);
} else {
	// IE8以下
	window.detachEvent('on' + eventName, callback);
}

```

其中标准的addEventListener是允许第三个参数userCapture，表示事件进行的阶段，true为捕获阶段，false为冒泡阶段，默认为false。

### 监听回调事件对象信息

在监听事件的回调中，通常我们使用以下方式，目的是为了兼容IE和FF：

```javascript
function(event) {
	event = event || window.event;
}
```

### 取消默认事件

```javascript
if(event.preventDefault) {
	event.preventDefault();
} else {
	// ff
	event.returnValue = false;
}
```

### 阻止事件冒泡

```javascript
if(event.stopPropagation) {
	event.stopPropagation();
} else {
	// IE8以下
	event.cancelBubble = true;
}
```

### 可信任事件（非脚本创建，不触发默认行为[除click/DOMActivate]）

### 自定义事件

先存储事件句柄，待触发事件时遍历事件句柄并逐个调用

## 样式

### 样式表操作

方法有三种：

```javascript
/* 第一种 */
element.cssName = 'xxx';

/* 第二种 */
element.style.cssText = 'xxx:xxx;xxx:xxx;';

/* 第三种 */
element.style['cssAttrName'] = 'xxx';

/* 第四种 */
// 高版本浏览器
window.getComputedStyle('元素', '伪类'); // 只读，获取元素的所有样式的数组，包括未在样式表里定义的样式亦能返回值
document.defaultView.getComputedStyle('元素', '伪类'); // 同上
window.getComputedStyle('元素', '伪类').getPropertyValue('样式名'); // 只读，获取元素的单一样式
// 低版本IE
element.currentStyle; // 同getComputedStyle接口
element.currentStyle.getAttribute('样式名'); // 同getPropertyValue接口，唯一不同的是传入的样式名需要用驼峰形式，如font-size需传入fontSize

```

### 响应式网站布局

使用媒体查询实现，可以多端共用一套页面，不过需要多端页面结构必须一致，对于移动端可能需要冗余一些请求。

## 其他

### AJAX

* 优点：局部刷新，占用流量小。
* 缺点：请求是异步的。

#### 创建请求对象

```javascript
var xhr
if(window.XMLHttpRequest){
    xhr= new XMLHttpRequest();
}else {
    // IE6以下
    xhr= new ActiveXObject(“Microsoft.XMLHTTP”);
}
```

#### 添加回调

```javascript
xhr.onreadystatechange = function() {
	if(xhr.readyState==4 && xhr.status==200) {
		// 通过xhr.responseText或xhr.responseXML获取返回数据
		// 进行其他操作
	}
};
 
//readyState:0表示初始化，1表示连接，2表示接收，3表示处理，4表示完成；
//status:200表示OK，404表示未找到页面；
```

#### 发送请求

```javascript

//Get请求
xhr.open('GET', url, true); //第二个参数是请求url，第三个参数是指是否采用异步
xhr.send();
 
//Post请求
xhr.open('POST', url, true); //同上
xhr.setRequestHeader(header, value); //设置表头，一般我们提交的form是用xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
```

#### 其他

```
1、创建XHR对象
new ActiveXObject('Microsoft.XMLHTTP')  | 适用于支持window.ActiveXObject的ie5和ie6等
new XMLHttpRequest()	                  | 适用于ie7+/ff/chrome/safari/opera等

2、XHR对象的属性和方法
readyState                   | 通信状态，取值0~4，见后文
onreadystatechange           | readyState改变时触发此事件
responseText                 | 服务器返回的文本格式文档
responseXML                  | 服务器返回的XML格式文档
status                       | 状态码，如100，200,404,500等
statusText                   | 状态码对应的文本（OK/Not Found)
abort()                      | 中止当前请求
open(method,url)             | 打开一个请求
send(args)                   | 发送请求
setRequestHeader(key,value)  | 设置请求的头部
getResponseHeader(key)       | 获取响应的头部值
getAllResponseHeaders()      | 以键值对形式返回所有头部信息

3、readyState各个值含义
0  | 代表一个未初始化的状态。以创建未初始化的XHR对象
1  | 代表连接状态。已经调用了open方法，准备发送请求
2  | 代表发送状态。已经调用了send方法，尚未得到响应数据
3  | 代表正在接收状态，已经接收了HTTP响应的头部信息，正在接收响应内容
4  | 代表已经加载状态，此时响应内容已经被完全接收
```

### 跨域请求

当两个域协议不同、端口不同或域名不同则属于不同源，不同源页面之间的通信则称之为跨域。

#### CORS

http提供的一个允许跨域请求的方法，只有高版本浏览器支持。主要通过设置请求头和相应头来实现，主要用到的头信息是`Access-Control-Allow-Origin`。

#### JSONP

页面中的src属性是可以跨域获取资源的：

```javascript
<scirpt>
	window.dosth = function(data) {
		// dosth为回调函数，名字可以自己定
	}
</script>
<script src = "http://aa.bb/c.action?callback=dosth"></script>
```

#### iframe

可已通过修改document.domain、window.name或postMessage来做。

PS：document.domain只可修改成和当前一样或更高级的父域。如a.c.b.com只可修改成a.c.b.com、c.b.com和b.com。
PS：window.name可以在同一个窗口内一直保存，所以在iframe中修改了window.name，然后将iframe的src改成同域的，父亲就可以通过iframe.contentWindow.name获取。

### 文件上传

### 长连接技术

#### EventSource

轮询接口，当其中一个轮询请求未回来会阻塞轮询，IE未实现。

```javascript
var polling = new EventSource(url, {
	withCredentials: true // 是否携带cookie，支持CORS模式
});

polling.addEventListener(eventName, function(event) {
	// eventName表示轮询回来需要触发的事件名
	// event.data - 轮询回来的数据
});
polling.onmessage = function() {}; // 无事件名的一律进入onmessage
polling.onerror = function() {}; // 异常事件回调
polling.onopen = function() {}; // 开始轮询回调

polling.close(); // 关闭轮询
```

#### webSocket

```javascript
var websocket = new WebSocket(url);

websocket.onopen = function() {}; // 开始长连接回调
websocket.onmessage = function(event) {
	// 收到消息回调
	// event.data - 收到的消息数据
};

websocket.send(data); // data可以为字符串、Blob或ArrayBuffer
```

### 音频/视频

#### 音频

HTML5提供了`<audio>`元素来支持音频。以MOozilla核心的Firefox浏览器只支持`.ogg`文件，webkit核心的浏览器支持`.mp3`扩展，safari不承认`.ogg`,它会跳过并移到`.mp3`版本。所以需要创建两个版本的音频。

Audio支持三种音频格式：Ogg Vorbis，MP3，Wav。

```html
<audio autoplay="autoplay" controls="controls">
  <source src="xxx.ogg"/>
  <source src="xxx.mp3"/>
</audio>
<!--标签的属性与video相同。没有height与width。-->
```

#### 视频

* Ogg：带有`Theora`视频编码和`Vorbis`音频编码的文件
* MPEG4：带有`H.264`视频编码和`AAC`音频编码的MPEG4文件
* WebM：`VP8`视频编码和`Vorbis`音频编码的文件

HTML5的规范没有指定特定的视频编解码器，它留给了浏览器来决定。Safari和IE9预期支持`H.264`格式的视频，Firefox和Opera坚持开源的`Theora`和`Vorbis`格式，所以需要提供两种格式。

Video支持三种视频格式：Ogg，MPEG4，WebM。

```html
<!-- 此属性表示视频在页面加载时进行加载，预备播放。如果设置为"autoplay"，就忽略该属性。controls用于显示如播放按钮的控件-->
<video controls="preload">
  <source src="xxx.ogv" type="video/ogg; codecs='vorbis,theora'"/>
  <source src="xxx.mp4" type="vide0/mp4; codecs='avc1.42E01E,mp4a.40.2'"/>
  <p>你的浏览器太旧了。<a href="xxx.mp4">下载这个视频。</a></p>
</video>
```

PS：技术上是不需要设置type属性的，但是不这样做的话，浏览器就会自己去寻找类型，为了节省一些带宽，最好还是声明下。
PS：不是所有的浏览器都支持HTML5，所以在资源元素的下面，可以提供一个下载链接或者嵌入视频的flash版本替代，这取决于个人。

### 桌面提醒

#### 申请权限

```javascript
Notification.requestPermission(function(status) {
  // 此接口用于向浏览器用户申请通知权限，申请方式为弹框申请
  // 其中status为granted为用户同意，denied为用户拒绝，default为用户没有做任何   
      许可，因此也不会弹出通知
});
```

#### 创建桌面提醒

```javascript
var n = new Notification(title, {
  dir: '', // 文字方向，auto，ltr(从左向右)，rtl(从右向左)
  lang: '', // 语种
  body: '', // 通知内容
  tag: '', // 通知的ID，格式为字符串。一组相同tag的通知，不会同时显示，只会在用户关闭前一个通知后，在原位置显示
  icon: '', // 图标的url
});

n.close();  //关闭通知
```

#### 支持的事件

```
click | 点击通知事件
show  | 显示通知事件
close | 关闭事件
error | 通知显示出错事件
```

### 地理位置

```javascript
if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		// 成功
		// position对象有以下属性：
		// position.coords.latitude：十进制数的纬度
		// position.coords.longitude：十进制数的经度
		// position.coords.accuracy：位置精度
		// position.coords.altitude：海拔，海平面以上以米计
		// position.coords.altitudeAccuracy：位置的海拔精度
		// position.coords.heading：方向，从正北开始以度计
		// position.coords.speed：速度，以米/每秒计
		// position.timestamp：响应的日期/时间
	}, function(error) {
		// 失败
		// errer.code 可能为以下四种：
		// error.PERMISSION_DENIED：用户不允许地理定位
		// error.POSITION_UNAVAILABLE：无法获取当前地址 
		// error.TIMEOUT：操作超时
		// error.UNKNOWN_ERROR：未知错误
	});
} else {
	alert('不支持Geolocaltion');
}

// 当需要观测位置信息，当位置信息变化触发回调时，可用以下接口
var id = navigator.geolocation.watchPosition(function() {});
navigator.geolocation.clearWatch(id); // 停止观测
```

### 文件系统

fileReader对象提供了读取用户计算机上文件内容的接口。可使用的对象包括File对象、Blob对象、input元素的filelist或者拖放操作中的dataTransfer等。

```javascript
var fr = new FileReader();

/* 方法 */
fr.abort(); // 中断读取
fr.readAsArrayBuffer(file); // 读取为ArrayBuffer
fr.readAsBinaryString(file); // 读取为二进制字符串
fr.readAsDataURL(file); // 读取为如data: URL格式的字符串
fr.readAsText(file); // 读取为纯文本

/* 事件 */
fr.onload = function() {
	// 当读取操作成功完成时调用
	// fr.result - 读取到的结果
};

fr.onabort // 当读取操作被中止时调用
fr.onerror // 当读取操作发生错误时调用
fr.onloadend // 当读取操作完成时调用,不管是成功还是失败.该处理程序在onload或者onerror之后调用
fr.onloadstart // 当读取操作将要开始之前调用
fr.onprogress // 在读取数据过程中周期性调用
```

### 客户端数据库

webSql已被弃用，推荐使用indexedDB.

### 本地存储系统

* localStorage：可以长期存储数据而没有时间限制。
* SessionStorage：不能长期存储数据，数据会随着浏览器的关闭而删除。

低版本IE下有一个userData对象实现了类似的接口。

用法：
```
localStorage.setItem('xxx', 'xxx');
var xxx = localStorage.getItem('xxx');
localStorage.removeItem('xxx');
localStorage.clear();
```

### 离线应用缓存（manifest文件）

### 历史记录管理

window.history对象是浏览器提供的一个用于操纵历史记录的接口。

```javascript
history.forward(); // 相当于历史记录中的前进
history.back(); // 相当于历史记录中的后退
history.go(-2); // 相当与历史记录中的后退两次
history.length; // 历史记录栈中有多少条记录

/* html5中添加 */
history.pushState(stateObj, title, url); // 添加历史记录，常用于单页系统中
history.replaceState(stateObj, title, url); // 替换历史记录，常用于无刷新修改url
window.onpopstate = function() {}; // 历史记录变化时触发的事件 
```

### 拖拽

#### drop和drag

HTML5提供了drop和drag来实现拖拽。可供拖拽的只有图片、超链接等部分元素。对于需要被拖拽的元素，要将元素的draggable属性设置为true，然后通过监听事件进行操作。

```
dragstart：当一个元素开始被拖拽的时候触发。用户拖拽的元素需要附加dragstart事件。在这个事件中，监听器将设置与这次拖拽相关的信息，例如拖动的数据和图像。

dragenter：当拖拽中的鼠标第一次进入一个元素的时候触发。这个事件的监听器需要指明是否允许在这个区域释放鼠标。如果没有设置监听器，或者监听器没有进行操作，则默认不允许释放。当你想要通过类似高亮或插入标记等方式来告知用户此处可以释放，你将需要监听这个事件。

dragover：当拖拽中的鼠标移动经过一个元素的时候触发。大多数时候，监听过程发生的操作与dragenter事件是一样的。

dragleave：当拖拽中的鼠标离开元素时触发。监听器需要将作为可释放反馈的高亮或插入标记去除。

drag：这个事件在拖拽源触发。即在拖拽操作中触发dragstart事件的元素。

drop：这个事件在拖拽操作结束释放时于释放元素上触发。一个监听器用来响应接收被拖拽的数据并插入到释放之地。这个事件只有在需要时才触发。当用户取消了拖拽操作时将不触发，例如按下了Escape（ESC）按键，或鼠标在非可释放目标上释放了按键。

dragend：拖拽源在拖拽操作结束将得到dragend事件对象，不管操作成功与否。
```

与事件相关的数据均存放到event.dataTransfer中，通过调用相关的API完成数据操作。

#### 原生js实现

通过mousedown、mousemove和mouseup事件来实现，移动的位置通过获取鼠标的坐标来计算。下面是一个简单的例子：

```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>test</title>
	<style type="text/css">
	#haha{
		position:absolute;
		margin:-100px 0 0 -100px;
		background:#0C9;
		width:200px;
		height:200px;
	}
	</style>
</head>

<body>
	<div id="haha" style="left:0;top:0;" onMouseDown=mouseDown() onMouseUp=mouseUp() onMouseMove=mouseMove() onMouseOut=mouseOut() onMouseOver=mouseOver()></div>
	<script type="text/javascript">
	window.onload = function(){ // 将div设置在屏幕中间
		var div = document.getElementById('haha');
		div.style.left = document.documentElement.clientWidth/2 + 'px';
		div.style.top = document.documentElement.clientHeight/2 + 'px';
	}

	var position = {
		'isMouseDown':0, // 鼠标是否被按下，0表示未被按下，1表示被按下
		'ox':0, // 鼠标按下位置和div左上角的横向位移偏移
		'oy':0, // 鼠标按下位置和div左上角的纵向位移偏移
	}
	function mouseDown(e) { // 按下鼠标时
		var e= e||event;
		var div = document.getElementById('haha');
		position.isMouseDown = 1; // 将鼠标状态置为按下
		//记录偏移位置
		position.ox = e.clientX - parseInt(div.style.left);
		position.oy = e.clientY - parseInt(div.style.top);
	}
	function mouseMove(e) { // 移动鼠标时
		var e = e||event;
		var div = document.getElementById('haha');
		
		if(position.isMouseDown==0) return;

		div.style.left = e.clientX - position.ox + 'px';
		div.style.top = e.clientY - position.oy + 'px';
	}
	function mouseUp() { // 鼠标移开时，将鼠标状态和偏移状态重置
		position.isMouseDown = 0;
		position.ox = 0;
		position.oy = 0;
	}
	function mouseOver() { // 鼠标移上去后的鼠标变化
		vardiv = document.getElementById('haha');
		div.style.cursor = 'move';
	}
	function mouseOut() { // 鼠标移开后的鼠标变化
		vardiv = document.getElementById('haha');
		div.style.cursor = 'default';
		mouseUp();
	}
	</script>
</body>
</html>

```

### 性能相关API

### Canvas

### Web Messaging（PostMessage/onMessage）

postMessage/onMessage通常用于当前窗口与iframe、frame或window.open打开的窗口之间的通信，可跨域。

```javascript
otherWindow.postMessage(message, origin); // 发信息，origin为指定的域，不指定或值为'*'表示不限定otherWindow的域

otherWindow.onmessage = function(event) {
	// event.data - 发过来的message
	// event.origin - 消息来源的域
	// event.source - 消息来源的window引用
};
```

### Web Worker

Worker 接口会生成真正的操作系统级别的线程，并让脚本文件运行在该线程中。简单来说，就是实现了前端的多线程。

```javascript
var myWorker = new Worker('task.js'); // 脚本文件必须是同源内的文件

myWorker.onmessage = function(event) {
  // event.data - 接收到的数据
};

myWorker.postMessage(''); // 发送数据
```

task.js里的内容：

```javascript
postMessage('aaa'); // 发送数据

onmessage = function(event) {
  // event.data - 接收到的数据
};
```

## 性能优化

*减少HTTP请求
*使用CDN
*禁止src/href指定空值
*HTTP caching（缓存相关Header）
*gzip资源/原理/实现
*CSS sprites原理
*样式置顶/脚本置底
*禁用CSS表达式（expression）
*外联脚本/样式
*分解资源载入（并行）/减少DNS查找
*精简脚本/样式
*禁止重定向
*删除重复脚本/样式
*使用GET方式的Ajax请求
*减少DOM节点数量
*减少Cookie大小
*Cookie-Free域加载资源
*减少DOM操作
*优化图片/不要拉伸图片
*禁用滤镜
*用link替换@import载入样式
*优化事件监听
*减少IFrame数量
*资源预加载/延时资源加载
*网站安全
*同源策略/CORS规范
*Injection/XSS/CSRF攻击原理及防范（OWASP）
*Session/Cookie/Headers

