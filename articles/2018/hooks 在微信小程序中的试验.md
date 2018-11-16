# hooks 在微信小程序中的试验

> PS：首先，这不是一个成熟的东西，只是一个实现极其简单的玩具而已。

## 前言

前段时间 react hooks 特性刷得沸沸扬扬的，看起来挺有意思的，计不少其他框架也会逐步跟进，所以也来尝试一下能不能用在小程序上。

react hooks 允许你在函数式组件中使用 state，用一段官方的简单例子概括如下：

```js
import { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

函数式组件本身非常简洁，不维护生命周期和状态，是一个可以让性能得以优化的使用方式。但是在之前这种方式只能用于纯展示组件或者高阶组件等，它很难实现一些交互行为。但是在 hooks 出现之后，你就可以为所欲为了。

这里有一份官方的文档，不明围观群众有兴趣的可以点进去了解一下：[https://reactjs.org/docs/hooks-intro.html](https://reactjs.org/docs/hooks-intro.html)。

hooks 的使用目前有两个限制：

* 只能在函数式组件内或其他自定义 hooks 内使用，不允许在循环、条件或普通 js 函数中调用 hooks。
* 只能在顶层调用 hooks 。

这个限制和 hooks 的实现方式有关，下面小程序 hooks 也会有同样限制，原因应该也是类似的。为了能让开发者更好的使用 hooks，react 官方也提供了一套 eslint 插件来协助我们开发：[https://reactjs.org/docs/hooks-rules.html#eslint-plugin](https://reactjs.org/docs/hooks-rules.html#eslint-plugin)。

下面就来介绍下在小程序中的尝试~

## 函数式组件

小程序没有提供函数式组件，这倒是很好理解，小程序的架构是双线程运行模式，逻辑层执行 js 代码，视图层负责渲染。那么声明在逻辑层的自定义组件要渲染在视图层必须保证来两个线程都存在自定义组件实例并一一对应，这样的架构已经成熟，目前对函数式组件并没有强烈的需求。在基础库不大改的情况下，就算提供了函数式组件也只是提供了另一种新写法而已，本质上的实现没有区别也不能提升什么性能。

不过也不排除以后小程序会提供一种只负责渲染不维护生命周期不做任何逻辑的特殊组件来优化渲染性能，这种的话本质上就和函数式组件类似了，不过函数式组件较为极端的是在理论上是有办法做到无实例的，这个在小程序中怕是有点困难。

言归正传，小程序没有提供函数式组件，那么就强行封装出一个写法好了，假设我们有一个自定义组件，它的 js 和 wxml 内容分别是这样的：

```js
// component.js
const {useState, useEffect, FunctionalComponent} = require('miniprogram-hooks') 

FunctionalComponent(function() {
  const [count, setCount] = useState(1)

  useEffect(() => {
    console.log('count update: ', count)
  }, [count])

  const [title, setTitle] = useState('click')

  return {
    count,
    title,
    setCount,
    setTitle,
  }
})
```

```wxml
<!-- component.wxml -->
<view>{{count}}</view>
<button bindtap="setCount" data-arg="{{count + 1}}">{{title}}</button>
<button bindtap="setTitle" data-arg="{{title + '(' + count + ')'}}">update btn text</button>
```

一个很奇葩的例子，但是能看明白就行。小程序里视图和逻辑分离，不像 react 可以将视图和逻辑写到一起，那么小程序里的函数式组件里想返回一串渲染逻辑就不太科学了，这里就改成返回要用于渲染的 state 和方法。

> PS：wxml 里不支持 bindtap="setCount(count + 1)" 这种写法，所以参数就走 dataset 的方式传入了。

FunctionComponent 函数其实就相当于封装了小程序原有的 Component 构造器，它的实现类似这样：

```js
function FunctionalComponent(func) {
  func = typeof func === 'function' ? func : function () {}

  // 定义自定义组件
  return Component({
    attached() {
      this._$state = {}
      this._$effect = {}
      this._$func = () => {
        currentCompInst = this // 记录当前的自定义组件实例
        callIndex = 0 // 初始化调用序号
        const newDef = func.call(null) || {}
        currentCompInst = null

        const {data, methods} = splitDef(newDef) // 拆分 state 和方法

        // 设置 methods
        Object.keys(methods).forEach(key => {
          this[key] = methods[key]
        })

        // 设置 data
        this.setData(data)
      }

      this._$func()
    },
    detached() {
      this._$state = null
      this._$effect = null
      this._$func = null
    }
  })
}
```

实现很简单，就是在 attached 的时候跑一下传入的函数，拿到 state 和方法后设置到自定义组件实例上就行。其中 currentCompInst 和 callIndex 在 useState 和 useEffect 的实现上会用到，下面来介绍。

## useState 和 useEffect

这里的一个难点是，useState 是没有指定变量名的。初次渲染还好，二次渲染的话要找回这个变量就要费一段代码了。

> PS：后续的实现除了参考了 react 的 hooks 外，也参考了 [vue-hooks](https://github.com/yyx990803/vue-hooks) 的尝试，有兴趣的同学也可以去观摩一下。

这里上面提到的 currentCompInst 和 callIndex，将上一次的变量存储在 currentCompInst 中，用 callIndex 记录调用 useState 和 useEffect 的顺序，这样就可以在二次渲染的时候通过顺序找回上一次使用的变量：

```js
function useState(initValue) {
  if (!currentCompInst) throw new Error('component instance not found!')

  const index = callIndex++
  const compInst = currentCompInst

  if (compInst._$state[index] === undefined) compInst._$state[index] = initValue

  const updater = function (evt) {
    let value = evt

    // wxml 事件回调
    if (typeof evt === 'object' && evt.target && evt.currentTarget) {
      const dataset = evt.currentTarget.dataset
      value = dataset && dataset.arg
    }

    // 存入缓存
    compInst._$state[index] = value
    compInst._$func()
  }
  updater._isUpdater = true

  return [compInst._$state[index], updater]
}
```

useEffect 的实现逻辑也类似，这里就不再贴代码了。小程序本身没有提供 render 函数，调 FunctionalComponent 声明函数式组件传入的函数就作为 render 函数来用。每次调 setXXX 方法——也就是上面代码中返回的 updater 的时候，找到原本存储这个 state 的地方存储进去，然后再次执行 render 函数，进行组件的渲染。

到这里应该就明白了，对于 hooks 使用为什么会有一开始的那两条限制。如果在一些条件、循环等语句内使用 hooks，就无法确保 state 的顺序，再二次渲染时就不一定能找回对应的 state。

## 尾声

完整的代码在 [https://github.com/wechat-miniprogram/miniprogram-hooks](https://github.com/wechat-miniprogram/miniprogram-hooks)，不过这终究只是个试验性质的尝试，并不推荐拿来实战，写在这里是为与大家共享~
