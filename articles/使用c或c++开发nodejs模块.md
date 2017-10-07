# 使用c或c++开发nodejs模块

## 简介

nodejs提供了一个调用c/c++模块的方法，因为nodejs本身是使用单线程异步回调机制，针对一些密集计算和系统底层逻辑操作效率比较低下，所以我们可以使用用c/c++来编写相关模块，然后供nodejs调用。

c/c++模块的调用在nodejs的api中叫`c/c++ addons`，方法也很简单，以下就以一个hello world的例子来简要介绍下（c和c++调用方法类似，以下仅用c++调用举例）。

## 准备

首先我们要调用c/c++模块，我们就需要c/c++编译器将代码编译成二进制文件，最终我们在nodejs中调用的c/c++模块其实就是编译后的二进制文件。

然后还要安装`node-gyp`模块，具体命令如下：

```bash
npm install -g node-gyp
```

有关`node-gyp`更详细的信息请戳[这里](https://github.com/nodejs/node-gyp#installation)。

## 步骤

首先，我们先搭建好hello world项目的目录。目录结构如下：

```
|- helloWorld
|     |- binding.gyp  
|     |- hello.cc
|     |- hello.js
```

其中hello.cc是我们要调用的c++模块源码，hello.js则是这个项目的入口文件，c++模块的调用者。

假设c++模块的名字叫addon，并且提供一个hello方法，我们调用hello方法可以输出world这个单词，因此我们可以在hello.js里这样写：

```javascript
const addon = require('./build/Release/addon'); // 这里是依赖的c++模块，名字叫addon

console.log(addon.hello()); // 这里调用addon模块的hello方法，输出world这个单词
```

看来这里应该明了，c/c++模块的调用方法和其他普通nodejs模块一样，简单易用，接下来我们就来编写hello.cc，即c++模块的源码：

```c++
#include <node.h>

namespace demo {
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;

    /* hello方法声明 */
    void Method(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world")); // 设置返回值world
    }

    /* 模块初始化方法 */
    void init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "hello", Method); // hello方法到模块中
    }

    NODE_MODULE(addon, init) // 声明addon模块，注意，此处是没有分号的

}
```

## 编译

至此，c++模块已经写好了，我们要调用，还需要将该模块编译成addon.node文件，即我们需要的二进制文件。为此，我们需要一个配置文件binding.gyp：

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "hello.cc" ]
    }
  ]
}
```

其中`targets`字段是要编译的模块列表，`target_name`字段是要编译的模块名，`sources`是模块的源代码。

然后我们执行以下命令先进行配置：

```bash
node-gyp configure
```

再执行以下命令进行编译：

```bash
node-gyp build
```

之后，我们就可以看到项目目录下多了一个build文件夹，我们需要调用的二进制文件addon.node就在路径`./build/Release/`下面，这也就是为什么我们在hello.js中引入addon模块的路径是`./build/Release/addon`。

tips：c/c++模块的路径是取决于其如何编译的，有时候可能会在`./build/Debug/`目录下，故我们可以使用try和catch来进行引入模块：

```javascript
try {
  return require('./build/Release/addon.node');
} catch (err) {
  return require('./build/Debug/addon.node');
}
```

## 其他

c/c++模块不止是可以返回字符串参数而已，关于参数相关可参阅下面例子：

### 传参

```c++
// addon.cc
#include <node.h>

namespace demo {

    using v8::Exception;
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Number;
    using v8::Object;
    using v8::String;
    using v8::Value;

    // add方法实现
    // 输入的参数我们通过 const FunctionCallbackInfo<Value>& args 来传递
    void Add(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = args.GetIsolate();

      // 检查参数数量
      if (args.Length() < 2) {
        // Throw an Error that is passed back to JavaScript
        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong number of arguments")));
        return;
      }

      // 检查参数类型
      if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong arguments")));
        return;
      }

      // 做加法运算
      double value = args[0]->NumberValue() + args[1]->NumberValue();
      Local<Number> num = Number::New(isolate, value);

      // 设置返回值
      args.GetReturnValue().Set(num);
    }

    void Init(Local<Object> exports) {
      NODE_SET_METHOD(exports, "add", Add);
    }

    NODE_MODULE(addon, Init)

}
```

```javascript
// add.js
const addon = require('./build/Release/addon');

console.log('This should be eight:', addon.add(3,5));
```

### 回调

```c++
// addon.cc
#include <node.h>

namespace demo {

    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Null;
    using v8::Object;
    using v8::String;
    using v8::Value;

    void RunCallback(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = args.GetIsolate();
      Local<Function> cb = Local<Function>::Cast(args[0]); // 声明回调函数

      const unsigned argc = 1;
      Local<Value> argv[argc] = { String::NewFromUtf8(isolate, "hello world") }; // 设置回调的参数值

      cb->Call(Null(isolate), argc, argv);
    }

    void Init(Local<Object> exports, Local<Object> module) {
      NODE_SET_METHOD(module, "exports", RunCallback);
    }

    NODE_MODULE(addon, Init)

}
```

```javascript
// test.js
const addon = require('./build/Release/addon');

addon(function(msg) {
  console.log(msg); // 输出'hello world'
});
```

### 生成对象

```c++
// addon.cc
#include <node.h>

namespace demo {

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;

    void CreateObject(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = args.GetIsolate();

      Local<Object> obj = Object::New(isolate); // 声明返回对象
      obj->Set(String::NewFromUtf8(isolate, "msg"), args[0]->ToString()); \\ 设置msg属性

      args.GetReturnValue().Set(obj);
    }

    void Init(Local<Object> exports, Local<Object> module) {
      NODE_SET_METHOD(module, "exports", CreateObject);
    }

    NODE_MODULE(addon, Init)

}
```

```javascript
// test.js
const addon = require('./build/Release/addon');

var obj1 = addon('hello');
var obj2 = addon('world');
console.log(obj1.msg+' '+obj2.msg); // 输出'hello world'
```

### 生成函数

```c++
// addon.cc
#include <node.h>

namespace demo {

    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::FunctionTemplate;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;

    void MyFunction(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = args.GetIsolate();
      args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello world"));
    }

    void CreateFunction(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = args.GetIsolate();

      Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction); // 声明函数模板
      Local<Function> fn = tpl->GetFunction(); // 声明函数

      // 匿名实现函数
      fn->SetName(String::NewFromUtf8(isolate, "theFunction"));

      args.GetReturnValue().Set(fn);
    }

    void Init(Local<Object> exports, Local<Object> module) {
      NODE_SET_METHOD(module, "exports", CreateFunction);
    }

    NODE_MODULE(addon, Init)

} 
```

```javascript
// test.js
const addon = require('./build/Release/addon');

var fn = addon();
console.log(fn()); // 输出'hello world'
```

## 尾声

其他例子还有很多，以上内容主要来自nodejs官方api，更多例子请戳[这里](https://nodejs.org/api/addons.html)


