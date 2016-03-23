title: es6要点简略介绍
date: 2015-11-19 20:50:44
categories:
- 前端
tags:
- 前端
- es6
- 语法
---
## 变量声明

### let

```javascript
var a = 1;
// 如下用大括号括起来的区域属于一个代码块
{
  a = 4; // 报错，let会引起暂时性死区，无法调用外部定义的变量a
  console.log(b); // 报错，let不会让声明提升

  let a = 2;
  let b = 3;

  let a = 5; // 报错，作用域内无法声明同名变量
  var a = 6; // 报错，同上
}

console.log(b); // 报错，let支持块级作用域
```

```javascript
var c = 7;
console.log(window.c); // 输出7 
let d = 8; 
console.log(window.d); // 输出undefined，let声明的顶级变量不会作为window或者global的属性存在
```

### const

const的使用方式和let一样，唯一的区别是，const声明的是常量

```javascript
const a = 1;
console.log(a); // 输出a

a = 2; // 报错，const声明的常量为只读，不可再次赋值

const b; // 报错，const声明的常量必须赋值，不能先声明后赋值
```

## 解构赋值

### 数组

```javascript
let [a, b, c] = [1, 2, 3]; // 相当于var a = 1, b = 2, c = 3;
let [a] = 1; // 报错，等号右边必须具备Iterator接口方可进行解构赋值
let [a, [b], d] = [1, [2, 3], 4]; // 允许嵌套解构和不完全解构，相当于var a = 1, b = 2, c = 4;
let [a=1, b=2] = [3, 4]; // 可以指定默认值，当值为undefined时，默认值的生效
```

### 对象

```javascript
let {a, b} = {a:1, b:2}; // 相当于var a = 1, b = 2;
let {b, a} = {a:1, b:2}; // 对象的解构赋值与顺序无关，左边的语句等价与上面的语句
let {c} = {a:1, b:2}; // c未被赋值，对象的解构赋值要求属性名相同方可赋值
let {a:b} = {a:1}; // b的值为1，a为undefined，因为对象的解构赋值是先找同名属性，再赋值给同名属性的值变量
let {a=1} = {a:2}; // 可以指定默认值，当值为undefined时，默认值的生效
({a} = {a:1}); // 有时为了避免js将第一个大括号解析为代码块，需要加上小括号
```

### 字符串

```javascript
let [a, b] = 'hi'; // 相当于var a = 'h', b = 'i';
let {length: len} = 'hi'; // 相当于把字符串的length值赋给了len
```

### 函数参数

```javascript
function add([x, y]){
  console.log(x + y);
}
add([1, 2]) // 输出3
```

## 字符串扩展

### 模板字符串

```javascript
let x = 1;
let a = ` <div>
            <span>${x + 1}</span>
          </div>`; // 使用反引号`定义模板字符串，可以在字符串中嵌入变量或者变量表达式，并且支持多行
```

### 模板标签

```javascript
let x = 1;
let a = tag`hello${x}world`; // 模板标签可以像过滤器一样工作，可以对模板字符串做一系列操作，仅跟着模板标签之后的模板字符串作为参数传入
function tag(str, arg0, ...args) {
  // str是模板字符串中变量或变量表达式以外的字符串，之后的变量是模板字符串中的变量或变量表达式
  // 如上例子，str的值为['hello', 'world']，arg0的值为x的值，即为1
}
```

## 函数扩展

### rest参数和扩展运算符

```javascript
function min(a=0, b=0) {
  // 可以指定参数默认值，当值为undefined时，默认值的生效
}

function add(...args) {
  // 通过扩展运算符...可以获取传入函数的所有参数，类似于arguments
  // 当调用add(1, 2, 3)时，args就是[1, 2, 3]
}

let a = [1, 2, 3];
add(...a); // 扩展运算符...可以将a转成以,分隔的参数序列传进去

add.name; // 返回'add'
```

### 箭头函数

要点：
* this指向定义时的对象，而不是调用对象
* 不可被new
* 不可作为generator函数
* 不可使用arguments

```javascript
(a, b) => a + b; // 相当于function(a, b) {return a + b;}
let f = n => n * n; // 相当于let f = function(n) {return n * n;}
```

## 对象扩展

### 对象的使用简化

```javascript
var a = '12';
let o = {a}; // 相当于let o = {a: '12'};
let o2 = {[a]: '34'}; // 相当于let o2 = {'12': '34'};
```

```javascript
var t = {a: 1}, s1 = {b: 2}, s2 = {c: 3};
Object.assign(t, s1, s2); // target为{a:1, b:2, c:3}，将s1、s2的可枚举属性拷贝到t中
```

### 对象变化监测

```javascript
function observer(changes) {
  changes.forEach(function(change) {
    console.log(change.name); // 发生变动的属性
    console.log(change.oldValue); // 变动前的值
    console.log(change.object[change.name]); // 变动后的值
    console.log(change.type); // 变动类型
  });
}
Object.observe(o, observer); // 监测对象o的变化
Object.unobserve(o, observer); // 取消监测对象o的变化
```

## Symbol

Symbol是一个新的数据类型（第七种数据类型），表明该数据是独一无二的

```javascript
let a = Symbol('a'); // 不能使用new，因为Symbol是一种原始类型，不是对象
typeof a === 'symbol'; // 返回true
a.toString(); // 输出'Symbol(a)'

Symbol('a') === Symbol('a'); // 返回false
```

Symbol可以转化为字符串和布尔值，无法转化为数值类型

```javascript
Number(a); // 报错
```

可以为Symbol指定同样的key

```javascript
var a = Symbol.for('foo');
var b = Symbol.for('foo');
a === b; // 返回true
Symbol.keyFor(a); // 返回'foo'
```

Symbol类型可以作为对象的唯一属性名

```javascript
var s = Symbol();
// 第一种写法
var a = {};
a[s] = 'hello';
// 第二种写法
var a = {
  [s]: 'hello'
};
```

## Proxy和Reflect

Proxy用于修改对象的默认行为（代理默认行为），构造函数接收两个参数，第一个是目标对象，第二个是代理拦截

必须使用代理过的o才能使代理生效，使用a则是没有代理的原始对象

```javascript
var a = {};
var o = new Proxy(a, {
  get: function(target, propKey, receiver) {
    return 35;
  }
});
console.log(o.time); // 输出35
console.log(o.name); // 输出35
```

Reflect用于获取对象的默认行为

```javascript
var o = new Proxy(a, {
  get: function(target, propKey, receiver) {
    console.log('hahaha');
    return Reflect.get(target, propKey, receiver);
  }
});
o.time = 'a';
console.log(o.time); // 输出hahaha和a
```

## Set和Map

### Set

Set是一种不允许元素重复的数据结构

```javascript
var a = new Set([1, 2, 2, '2']); // 此时a里只有1、2和'2'三个元素
console.log(a.size); // 输出3
var arr = Array.from(a); // 转化为数组

a.add(3); // 添加元素3
a.delete(3); // 删除元素3
a.has(2); // 是否拥有元素2
a.clear(); // 清空所有元素
a.forEach(item => {}); // 遍历每个元素
```

### WeakSet

WeakSet是一种特殊的Set，只允许添加对象元素，并且元素是弱引用（当没有其他地方引用就会被垃圾回收），所以无法被遍历

```javascript
var b = new WeakSet([{}, {}]);
console.log(b.size); // 输出undefined，因为WeakSet无法被遍历
b.forEach(); // 报错，同样因为WeakSet无法被遍历
```

### Map

Map是一种允许其它类型作为键值的对象

```javascript
var a = new Map([['k0', 'val0'], ['k1', 'val1']]);
console.log(a.size); // 输出2

a.set('k2', 'val2'); // 添加元素
a.get('k0'); // 返回val0，获取元素值
a.has('k0'); // 是否拥有键值为'k0'的元素
a.delete('k0'); // 删除键值为'k0'的元素
a.clear(); // 清空所有元素
a.forEach((value, key) => {}); // 遍历每个元素
```

### WeakMap

WeakMap和WeakSet类似，只允许对象作为键值

```javascript
var b = new WeakMap([[{}, {}]]);
console.log(b.size); // 输出undefined，因为WeakMap无法被遍历
b.forEach(); // 报错，同样因为WeakMap无法被遍历
```

## Iterator

Iterator（迭代器）是一种特殊的对象，使用next方法来遍历对象中的元素

```javascript
let arr = ['a', 'b'];
let iter = arr[Symbol.iterator](); // 返回数组的迭代器对象
iter.next(); // 返回{value: 'a', done: false}
iter.next(); // 返回{value: 'b', done: false}
iter.next(); // 返回{value: undefined, done: true}
```

一个数据结构只要部署了Symbol.iterator属性，就被视为具有Iterator接口，就可以用for...of循环遍历它的元素

```javascript
for(let val of arr) {
  console.log(val); // 依次输出'a'，'b'
}
```

## Generator

Generator是一种可中断的函数，当调用函数的next方法时可恢复函数的执行

```javascript
// 声明Generator函数
function* a() {
  yield 'a'; // 使用yield中断函数的执行，把控制权交回调用者
  yield 'b';
  return 'c'; // 结束函数的执行
}

var ga = a();
ga.next(); // 返回{value: 'a', done: false}
ga.next(); // 返回{value: 'b', done: false}
ga.next(); // 返回{value: 'c', done: true}
ga.next(); // 返回{value: undefined, done: true}
```

## Promise

Promise常用于解决回调金字塔的问题

```javascript
var a = new Promise(function(resolve, reject) {
  if(err) {
    // 操作失败
    reject(err);
  } else {
    // 操作成功
    resolve(val);
  }
});

a.then(function(val) {
  // 操作成功，val即上面resolve返回的参数
}, function(err) {
  // 操作失败，err即上面reject返回的参数
}).catch(function(err) {
  // 异常捕获
});
```

## Class

es6的类系统和传统语言的使用方式类似

```javascript
// 定义类A
class A {
  constructor(x) {
    // 构造函数
    if(new.target === A) {
      // 判断对象是否使用new实例化
      this.x = x;
    }
  }
  rX() {
    // 类方法
    return this.x;
  }
  get x() {
    // 取值方法
    return this.x;
  }
  set x(x) {
    // 设值方法
    this.x = x;
  }
  * gX() {
    // Generator方法
    yield this.x;
  }
  static sX() {
    // 静态方法
    return 'hello';
  }
}

var a = new A(2);
a.rX(); // 返回2
A.sX(); // 返回'hello'
```

同样，es6的类系统也支持继承

```javascript
// 定义类B，继承类A
class B extends A {
  constructor(x) {
    super(x);
    this.x ++;
  }
}

var b = new B(2);
b.rX(); // 返回3
```

## Module

### export、import和module

export用于暴露对外的接口，import用于导入接口，module用于定义模块

假设如下是s1.js：

```javascript
// 写法一
export var a = 'a';
export var b = 'b';
// 写法二
var a = 'a';
var c = 'b';
export {a, c as b};
```

假设如下是s2.js：

```javascript
// 写法一
import {a, b as c} from './s1.js'; // import命令会提升
// 写法二
import * as all from './s1.js'; // 可以使用all.a和all.b来访问a和b
// 写法三
module all from './s1.js'; // 与写法二等价
```

### export default

export default用于暴露整个模块

假设如下是s1.js：

```javascript
export default function a() {};
```

假设如下是s2.js：

```javascript
import a from './s1.js'; // 注意，不是import {a} from './s1.js';
```

## 结尾

如果想查看更详细规范，[请戳这里](http://www.ecma-international.org/)

如果想要下载源码，[请戳这里](https://raw.githubusercontent.com/JuneAndGreen/learningSth/master/es6/es6.js)
