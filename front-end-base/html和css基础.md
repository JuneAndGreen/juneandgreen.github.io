## HTML标签

### 标签

* 非空标签：div、span、table、tr、td、ul、ol、li、a、head、body、html等
* 空标签：input、img、meta、link、hr、br等

### meta标签

```html
<meta http-equiv="把content属性关联到http头部" name="名称" content="值" />
```

* seo优化：如定义name为keywords和description的属性。
* 定义页面重定向和刷新：如定义http-equiv为refresh的属性。
* 定义视窗：如定义name为viewport的属性。
* 定义页面相关设置：如设置charset。
* 操作cookie：如定义http-equiv为Set-Cookie的属性。
* 操作缓存：如定义http-equiv为Cache-Control、Pragma或expires的属性。
* 禁止转码：http-equiv为Cache-Control，content为no-siteapp

### alt和title的区别

* alt：当前图片、窗体等无法显示时的替代文字，语言由lang属性指定。（一些浏览器会在没有title的时候将alt当title使用）
* title：该元素的提示信息。

### src和href的区别

* src：指向外部资源的位置，指向的内容会嵌入到文档中当前标签所在位置。在请求src资源时会将其指向的资源下载并应用到文档内，会阻塞页面渲染。
* href：指向网络资源所在位置，建立和当前元素（锚点）或当前文档（链接）之间的连接，不会阻塞页面渲染。

## 重排和重绘

浏览器渲染出页面的简单流程：

```
html代码 ---> DOM Tree  ---> Layout Tree <--- Style Rules <--- css代码
                                  |
                                  |---> Render Tree ---> UI
```

PS：Render Tree和Dom Tree并不是一一对应的，比如display为none的节点就不会存在于Render Tree中。

其中当对DOM进行操作时，就可能会引起重排（回流，重新计算位置大小信息）和重绘（重新渲染页面）。DOM操作的耗时就主要在于查询和重排重绘。

### 发生情景

* 添加或删除可见的Dom元素
* 元素位置改变
* 元素尺寸改变
* 元素内容改变（例如：一个文本被另一个不同尺寸的图片替代）
* 页面渲染初始化（这个无法避免）
* 浏览器窗口尺寸改变

PS：对于js修改Dom元素属性，大多数浏览器会通过队列化修改并批量执行来优化重排过程，当时当在修改Dom元素属性中有读取如offsetTop\scrollTop\clientTop、getComputedStyle\currentStyle时，会强制浏览器提前重排重绘

PS：动画，如使用requestAnimationFrame方法，每一帧都会引起重排和重绘。

### 优化方法

* 尽量不要再布局信息改变时做查询（会导致渲染队列强制刷新）
* 同一个Dom的多个属性改变可以写在一起（减少Dom访问，同时把强制渲染队列刷新的风险降为0）
* 如果要批量添加Dom，可以先让元素脱离文档流，操作完后再带入文档流，这样只会触发一次重排（fragment元素的应用）
* 将需要多次重排的元素，position属性设为absolute或fixed，这样此元素就脱离了文档流，它的变化不会影响到其他元素。例如有动画效果的元素就最好设置为绝对定位。

## CSS盒模型

### 简述

```
                outline
 ______________________________________
|                margin                |
|  _________________________________   |
| |              border              | |
| |  ______________________________  | |
| | |            padding           | | |
| | |  __________________________  | | |
| | | |          content         | | | |
| | | |                          | | | |
| | | |                          | | | |
| | | |                          | | | |
| | | |                          | | | |
| | | |--------------------------| | | |
| | |------------------------------| | |
| |----------------------------------| |
|--------------------------------------|
```

PS：W3C盒模型高宽是指content的高宽。IE盒模型高宽是指content+padding+border的高宽。

### 背景色区域

content + padding + border

### 更改盒模型

```css
/* W3C盒子模型 */
.box {
	box-sizing: content-box;
}
/* IE盒子模型 */
.box {
  box-sizing: border-box;
}
```

## CSS属性和值

	display有哪些值、position有哪些值
	哪些属性有缩，说明缩写方法
	float的默认值是什么、background的默认值是什么

## 选择器

### 种类

* ID选择器：#id {}
* 类选择器：.class {}
* 标签选择器：tagname {}
* 后代选择器：element element {}、element > element {}
* 兄弟选择器：element + element {}
* 伪类选择器：element:hover {}、element:focus {}等
* 伪元素选择器：element::before {}等
* 属性选择器：element[attribute=value] {}等

### 选择器等级

* a = 行内样式style。
* b = ID选择器的数量。
* c = 类、伪类和属性选择器的数量。
* d = 类型选择器和伪元素选择器的数量。

| 选择器                    | 等级(a,b,c,d) |
|--------------------------|---------------|
| style=""                 | 1,0,0,0       |
| #wrapper #content {}     | 0,2,0,0       |
| #content .dateposted {}  | 0,1,1,0       |
| div#content {}           | 0,1,0,1       |
| #content p {}            | 0,1,0,1       |
| #content {}              | 0,1,0,0       |
| p.comment .dateposted {} | 0,0,2,1       |
| div.comment p {}         | 0,0,1,2       |
| .comment p {}            | 0,0,1,1       |
| p.comment {}             | 0,0,1,1       |
| .comment {}              | 0,0,1,0       |
| div p {}                 | 0,0,0,2       |
| p {}                     | 0,0,0,1       |

### 属性选择器的匹配规则

| 选择器             | 例子             | 例子描述                                       |
|--------------------|-----------------|------------------------------------------------|
| [attribute]        | [target]        | 选择带有 target 属性所有元素。                   |
| [attribute=value]  | [target=_blank] | 选择 target="_blank" 的所有元素。               |
| [attribute~=value] | [title~=flower] | 选择 title 属性包含单词 "flower" 的所有元素。    |
| [attribute|=value] | [lang|=en]      | 选择 lang 属性值以 "en" 开头的所有元素。         |
| [attribute^=value] | a[src^="https"] | 选择其 src 属性值以 "https" 开头的每个 <a> 元素。 |
| [attribute$=value] | a[src$=".pdf"]  | 选择其 src 属性以 ".pdf" 结尾的所有 <a> 元素。   |
| [attribute*=value] | a[src*="abc"]   | 选择其 src 属性中包含 "abc" 子串的每个 <a> 元素。 |

### 伪类和伪元素

伪类：`:active`、`:visited`、`:link`、`:focus`、`:hover`、`:lang(xx)`、`:first-child`、`:last-child`、`:nth-child(xx)`、`:empty`、`:disabled`、`:checked`等。
伪元素：`::first-line`、`::before`、`::after`、`::first-letter`、`::selection`等。

## 切图基础

### PS切图方法

* 成图：使用切片工具
* PSD稿：找到需要切的图层，复制到新图层，然后裁剪保存。

### 图片类型及应用场景

#### gif

体积小，有着极好的压缩效果，支持动画，并且支持透明效果，但色彩效果最低（只有256种颜色）。

适用情景：动图，只有单调色彩、没有渐变色的图片或者小图标。

#### jpg

色彩还原好，可以再照片不明显失真的情况下大幅降低体积，但不支持透明。

适用情景：照片之类的图片，颜色复杂、光影复杂的图片。

#### png

清晰，无损压缩，压缩比例高，可渐变透明（具备几乎所有gif的优点），但不如jpg的颜色丰富，同样的图片体积也比jpg略大。png-8和gif一样，只有256色，不支持半透明。

适用场景：logo类的网页图片（带透明效果）、在编码过程中的图片或复杂的图片。

ps：png的另一个优点——逐次逼近显示：先显示模糊，逐渐变清晰。

#### 综合比较

* 大小：png ≈ jpg > gif
* 透明：png > gif > jpg
* 色彩丰富程度：jpg > png > gif
* 兼容程度：gif ≈ jpg > png（png在IE6下不透明，使用hack可解决）

#### 新技术

科普一下Webp：WebP格式，谷歌（google）开发的一种旨在加快图片加载速度的图片格式。图片压缩体积大约只有JPEG的2/3，并能节省大量的服务器带宽资源和数据空间。Facebook Ebay等知名网站已经开始测试并使用WebP格式。

在质量相同的情况下，Webp格式图像的体积要比JPEG格式图像小40%。

ps：bmp（位图）体积大，一般不考虑。

## 兼容技术

### 浏览器内核

* 使用Trident内核的浏览器：IE。
* 使用Gecko内核的浏览器：FireFox。
* 使用Presto内核的浏览器：Opera。
* 使用Webkit内核的浏览器：Safari、Chrome。
* 使用Blink内核的浏览器：Chrome、Opera。

### IE中的bug及其解决方案

* 盒模型
* IE6浮动双边距问题：第一个左浮动元素的margin-left加倍（右浮动同样），使用`display: inline;`解决。
* IE6浮动3px问题：给浮动元素天界3px的负外边距解决。
* IE6绝对定位元素消失问题：绝对定位元素在浮动元素前后会消失，当浮动元素在前时，给绝对定位元素添加`clear: both;`解决，当浮动元素在后时，给浮动元素添加`margin-right: -3px;`解决。
* IE6定位1px问题：IE6下容器宽高为奇数时，绝对定位元素设置了位置为0或100%时，仍会有1px的空隙，此时应将容器宽高设为偶数解决。
* IE6定位错误问题：当容器为相对定位时，绝对定位元素的定位会错乱。可以通过给相对定位容器添加`zoom: 1;`来触发haslayout。
* IE67定位溢出问题：当容器可滚动，相对定位元素会溢出容器并且不可跟随滚动而滚动。可以给容器添加`position: relative;`来解决。
* IE67表单元素偏移问题：当某些表单元素的父元素上触发了haslayout后，这些表单元素会以祖先元素上的margin-left值偏离。通过给该表单元素或该表单元素的父元素外再套一个触发haslayout的div即可。
* IE67图片链接无效问题：对于`<a><span><img></span></a>`这种结构，如果span触发了haslayout，则链接无效。可通过给a设置`cursor: pointer;`，再给img设置`position: relative;z-index: -1;`解决。

在IE6，IE7中，每个元素都有haslayout这个属性，可以设置为true或者false。如果设置为true，元素就必须去自我布局和渲染，因此元素会扩展去包含它溢出的内容，例如浮动或没截断的单词。如果haslayout没有被设置成true，那么元素需依靠某个祖先元素来渲染它。这就是很多的ie bugs诞生的地方。IE浏览器下的很多bug都是`haslayout = false`引起的。而我们当需要触发haslayout时，可以通过追加`zoom:1;`来触发。

### IE下的hack

#### 样式hack

```css
.cnt {
  /* 所有识别 */
  background: green;
  /* IE6，7，8，9，10，11识别 */
  background: black\0;
  /* IE8，9，10识别 */
  background: grey\9;
  /* IE6，7识别 */
  *background: blue;
  +background: blue;
  /* IE6识别 */
  _background: red;
}
```

#### 条件注释

```html
<!-- 针对所有IE -->

<!-- [ if IE ]> 代码 <! [ endif ] -->

<!-- 针对IE6以下 -->

<!-- [ if lt IE7 ]> 代码 <! [ endif ] -->
```

### 浏览器对CSS支持情况

善用网站[CANIUSE](http://caniuse.com/)

### 主流浏览器的私有前缀

```css
.cnt {
  /* chrome、safari */
  -webkit-xxx: yyy;
  /* 老版本safari */
  -khtml-xxx: yyy;
  /* ff */
  -moz-xxx: yyy;
  /* IE */
  -ms-xxx: yyy;
  /* opera */
  -o-xxx: yyy;
  /* 标准 */
  xxx: yyy;
}
```

特殊需求解决技巧

### 清除浮动

```css
.clear {
	zoom: 1;
}
.clear::after {
	display: block;
	clear: both;
	visibility: hidden;
	height: 0;
	overflow: hidden;
	content:".";
}
```

### 居中

#### 水平居中

1、内联元素或行内块元素

```css
.center {
  text-align: center; /* 相对父级块级元素 */
}
```

2、块级元素

```css
.center {
  width: 200px; /* 必须指明元素的宽度 */
  margin: 0 auto;
}
```

3、多元素居中

（1）行内块方式：

```css
.container {
  text-align: center;
}
.container div {
  display: inline-block;
}
```

（2）flex方式：

```css
.container {
  display: flex;
  justify-content: center;
}
```

二、垂直居中

1、内联元素

```css
.container {
  height: 300px;
  line-height: 300px; /* 行高等于容器高度 */
}
```

2、块级元素

flex方式：

```css
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

三、万能居中（内联、块级和浮动元素）

1、知道宽高

```css
.div {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 400px;
  margin-left: -100px;
  margin-top: -200px;
}
```

2、不知道宽高

```css
.div{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 自适应布局

flex实现：

```css
.container {
  display: flex;
}
.left {
  width: 200px; /* 左侧定宽 */
}
.right {
  flex: 1; /* 右侧自适应 */
}
```

绝对定位实现：

```css
.left {
  width: 200px; /* 左侧定宽 */
}
.right {
  position: absolute;
  left: 200px; /* 右侧自适应 */
  right: 0;
  top: 0;
  bottom: 0;
}
```

浮动实现：

```css
.left {
  width: 200px; /* 左侧定宽 */
  float: left;
  margin-right: -200px;
}
.right {
  margin-left: 200px;
}
```

## 前沿技术

### HTML5

#### 新增标签

* 脚本：template。
* 章节：section、nav、article、header、footed、main。
* 组织内容：figure、figcaption。
* 文字形式：time、mark、ruby、rt、rp、bdi、wbr。
* 嵌入内容：embed、video、audio、source、track、canvas、svg、math。
* 表单：datalist、keygen、output、progress、meter。
* 交互元素：details、summary、menu、menuitem。


#### 标签语义化

```
 ____________________________________
|             <header>               |
|------------------------------------|
|               <nav>                |
|------------------------------------|
|        <article>       |           |
|   __________________   |           |
|  |                  |  |  <aside>  |
|  |     <section>    |  |           |
|  |                  |  |           |
|  --------------------  |           |
|------------------------------------|
|             <footer>               |
--------------------------------------
```

### CSS3

#### flex

一、flex容器

```css
.flexbox {
  /* 设为flex布局以后，子元素的float、clear和vertical-align属性将失效 */
  display: flex | inline-flex;

  /* 
    主轴方向，即flex元素的排列方向 

    row（默认值）：主轴为水平方向，起点在左端。
    row-reverse：主轴为水平方向，起点在右端。
    column：主轴为垂直方向，起点在上沿。
    column-reverse：主轴为垂直方向，起点在下沿。
  */
  flex-direction: row | row-reverse | column | column-reverse;

  /*
    flex元素在一条轴线排不下时的换行方式

    nowrap（默认）：不换行。
    wrap：换行，第一行在上方。
    wrap-reverse：换行，第一行在下方。
  */
  flex-wrap: nowrap | wrap | wrap-reverse;

  /* flex-direction和flex-wrap属性的合并写法。 */
  flex-flow: <flex-direction> || <flex-wrap>;

  /*
    flex元素在主轴上的对齐方式

    flex-start（默认值）：左对齐。
    flex-end：右对齐。
    center：居中。
    space-between：两端对齐，项目之间的间隔都相等。
    space-around：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。
  */
  justify-content: flex-start | flex-end | center | space-between | space-around;

  /* 
    flex元素在侧轴上如何对齐

    flex-start：交叉轴的起点对齐。
    flex-end：交叉轴的终点对齐。
    center：交叉轴的中点对齐。
    baseline: 项目的第一行文字的基线对齐。
    stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。
   */
  align-items: flex-start | flex-end | center | baseline | stretch;

  /*
    多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

    flex-start：与侧轴的起点对齐。
    flex-end：与侧轴的终点对齐。
    center：与侧轴的中点对齐。
    space-between：与侧轴两端对齐，轴线之间的间隔平均分布。
    space-around：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
    stretch（默认值）：轴线占满整个交叉轴。
  */
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

一、flex元素

```css
.flexbox {
  /* flex元素的排列顺序。数值越小，排列越靠前，默认为0。 */
  order: <integer>;

  /* flex元素的放大比例，默认为0，即如果存在剩余空间，也不放大。 */
  flex-grow: <number>;

  /* flex元素的缩小比例，默认为1，即如果空间不足，该项目将缩小。 */
  flex-shrink: <number>;

  /* 在分配多余空间之前，flex元素占据的主轴空间。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即flex元素的本来大小。 */
  flex-basis: <length> | auto;

  /*
    flex-grow、flex-shrink和flex-basis的合并写法。默认为0 1 auto。

    none：相当于0 0 auto。
    auto：相当于1 1 auto。
  */
  flex: none | auto | [<flex-grow> <flex-shrink> <flex-basis>];

  /* 设置单个flex元素与其他flex元素不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

#### 多背景

```css
.myclass {
  /* 第一个背景在最上面，最后一个背景在最下面，依次叠加 */
  background: background1, background2, ..., backgroundN;
}
```

#### 过渡

当页面中存在样式变化，如hover改变样式时，可给样式的变化添加过渡效果：

```css
.tran {
  /* 针对浏览器的支持情况，可能需要追加前缀，如 -webkit-transition，-moz-transition，-o-transition */
  /* property表示需要加过渡效果的属性，duration是过渡时间，timing-function是时间变化曲线，delay是过渡延迟播放时间 */
  transition: property duration [[timing-function] delay];
}
```

#### 动画

定义动画：

```css
/* 针对浏览器的支持情况，可能需要追加前缀，如 @-webkit-keyframes、@-moz-keyframes，@-o-keyframes */
@keyframes animation_name {
  from { /* 样式 */ }
  to { /* 样式 */ }
}

/* 也可以定义关键帧 */
@keyframes animation_name {
  5% { /* 样式 */ }
  50% { /* 样式 */ }
  100% { /* 样式 */ }
}
```

使用动画：

```css
.ani {
  /* 针对浏览器的支持情况，可能需要追加前缀，如 -webkit-animation，-moz-animation，-o-animation */
  /* animation_name是动画名，duration是动画持续时间，timing-function是时间变化曲线，delay是动画延迟播放时间，iteration-count是动画播放次数，direction是动画是否需要轮流反向播放 */
  animation: animation_name duration [[[[timing-function] delay] iteration-count] direction];
}
```

#### 变换

一、2D变换

```css
.box {
  transform: xxx;
}
```

其中xxx可为translate（移动），rotate（旋转），scale（缩放），skew（斜转）和matrix（组合各种转换的矩阵方法）等。例如：

``` css
.box {
  transform: translate(-10px, -10px); /* 往左往上各移动10px */
}
```

二、3D变换

3D变换相对复杂，写法和2D变换相似，只不过xxx方法要使用3D方法，如translate3d，scale3d，rotate3d等。

另外还可以通过定义perspective来设置到3d视图的视角距离。

#### 阴影

一、盒子阴影

```css
.box {
  box-shadow: h-shadow v-shadow blur spread color inset;
}
```

其中h-shadow和v-shadow是必需的，表示水平和垂直阴影的位置。blur表示模糊距离，spread表示阴影尺寸。inset表示是内部阴影，默认是外部阴影。

二、文本阴影

```css
.box {
  text-shadow: h-shadow v-shadow blur color;
}
```

其中h-shadow和v-shadow是必需的，表示水平和垂直阴影的位置。blur表示模糊距离。

#### 多列

文本本身可被拆分成多列显示，如：

```css
.content {
  /* 列数 */
  -moz-column-count: 3; /* Firefox */
  -webkit-column-count: 3; /* Safari和Chrome */
  column-count: 3;

  /* 列间隔 */
  -moz-column-gap: 40px; /* Firefox */
  -webkit-column-gap: 40px; /* Safari和Chrome */
  column-gap: 40px;
}
```

#### 圆角

```css
.box {
  /* 可同时设多个值，如果省略bottom-left，则与top-right相同。如果省略bottom-right，则与top-left相同。如果省略top-right，则与top-left相同 */
  border-radius: length || xx%;
}
```

#### 透明和渐变

一、透明

```css
.transparent_class {
  filter: alpha(opacity = 50); /* IE */
  -moz-opacity: 0.5; /* Firefox */
  -khtml-opacity: 0.5; /* 老版本Safari */
  opacity: 0.5; /* Chrome、Safari、Opera */
}
```

ps：数值越低表示透明度越高，100或1表示不透明。
ps：子元素会继承透明性，且不可取消继承。

二、渐变

```css
.gradient_class {
  /* IE滤镜，gradientType为0时为垂直渐变，为1时为水平渐变 */
  filter: progid: DXImageTransform.Microsoft.Gradient(startColorStr = "#...", endColorStr = "#...", gradientType = "0");

  /* Chrome、Safari等，linear表示线性渐变，radial表示径向渐变 */
  background: -webkit-gradient(linear/radial, x1, y1, x2, y2, from(#...), to(#...));
  /* 以上的线性渐变可简写为
    background: -webkit-linear-gradient(top, #..., #...);
  其中top表示渐变开始的位置 */

  /* Opera，同上 */
  background: -o-linear-gardient(top, #..., #...);

  /* Firefox，同上 */
  background: -moz-linear-gardient(top, #..., #...);
}
```

ps：低版本可以用color-stop ( 0.5 , #... )，高版本可用把 50% , #... 添加到参数后面，以决定中间渐变色。

#### 背景显示

背景的默认显示区域是`padding + content + right border + bottom border`。即`background-clip`的值默认为`border-box`。

```css
.bg {
  /* Firefox3.6- */
  -moz-background-clip: border || padding;
  /* Webkit */
  -webkit-background-clip: border-box || padding-box || context-box;
  /* W3C标准 IE9+ and Firefox4.0+ */
  background-clip: border-box || padding-box || context-box;
}
```

#### 媒体查询

语法：

```
@media 设备名 only （选取条件） not （选取条件） and （设备选取条件） 设备={sRules}
```

PS：sRule为兼容样式表，only限定某种设备（一般可省略，常用来排除不支持媒体查询的浏览器），and逻辑与，not排除某种设备。

使用方式：

```html
<link rel="stylesheet" type="text/css" href="a.css" media="screen" />
```

```html
<?xml-stylesheet href="a.css" media="screen" ?>
```

```css
@import url("a.css") screen;
```

```html
<head>
  <!-- IE6-7不支持 -->
  <style type="text/css">
    @import url("a.css") screen;
  </style>
</head>
```

```
@media screen {
    选择器 {
        属性: 值;
    }
}
```

* 常见设备名：all（所有的媒介设备）、screen（电脑显示器）、handheld（手持设备）、print（打印机）、tv（电视机类型的设备）、aural（语音和音频合成器）。
* 常见参数：max-width、min-width、max-height、min-height、max-device-width、min-device-width、max-device-height、min-device-height。

```css
@media screen and (max-width: 900px) {
  /* 当屏幕宽度小于900px时 */
}
```

## 优化技术

CSS优化技术
例举CSS优化方法
SEO优化技术
例举SEO优化技术

3.	新技术专题

图像图像（Canvas/WebGL/SVG）
Web forms 2.0
离线应用（Offline web applications）
平台适配（Viewport/MediaQuery）
JS
触摸事件(Touch events)
文件操作（File API/FileReader API/Filesystem&FileWriter API）
本地存储（Web Storage - name/value pairs/IndexedDB）
动画（requestAnimationFrame）
XMLHttpRequest 2
