# 造一个简单可玩的五子棋AI

## 简要分析

五子棋算是大众游戏，其玩法亦算是妇孺皆知。此文为简单而论，故刨去各种禁手规则，仅以AI执白后手并以五子连线定输赢的规则来实现。

说到要写一个棋类游戏的AI，就不得不提一下A*算法，我们亦可称其为搜索算法。一句话来说，就是通过搜索一棵包含各种策略的博弈树来寻找最适合落子的点。跟人脑下棋类似，我们人类下棋讲究的就是预测对方的棋路，而搜索算法里就是电脑来预测我们人脑的棋路。流程简单来说如下：

```
AI遍历当前适合落子的点 ----> AI假设在该点落子 ----> AI遍历当前适合对方落子的点 ----> AI假设对方在该点落子 ----> AI再次遍历当前适合落子的点 ----> AI再假设在该点落子 ----> ......（一直循环）
```

通常来讲，循环遍历落子点的次数越多，得到的解是越接近最优解的，即可以得到最容易将对方逼入绝路的点。可是鉴于电脑内存性能有限，所以关于遍历落子点的循环次数是有限的，而在此文中是准备使用js在浏览器上跑这个算法，故将循环次数定在2次。而在博弈树中，每一次循环相当于树的一层，所以我们要构建3层（包含一层根结点）的博弈树。

## 文件结构

首先，我们先搭建好这一个简单的小游戏的文件目录吧，结构如下：

```
five-in-a-row
 |---image
 |     |---bg.jpg // 棋盘背景图片
 |     |---black.png // 黑子棋子图片
 |     |---white.png // 白子棋子图片
 |---src
 |    |---calc.js // 计算权值文件
 |    |---data.js // 全局数据文件
 |    |---draw.js // 绘制棋子棋盘文件
 |    |---index.js // 算法入口文件
 |    |---judge.js // 判断输赢文件
 |    |---money.js // 权值判断文件
 |---index.css
 |---index.html // 小游戏页面
 |---index.js // 将src文件夹里的文件打包后的js文件
```

文件不少，主要是把一个算法拆分成多个文件来实现。而实际上我们只需依赖于five-in-a-row的index.js这一个js文件即可，这个文件是src文件夹内的所有js文件进行合并打包后生成的，至于合并打包工具，我们采用webpack，所以src文件夹内的各个js文件的依赖可以采用简单的commonjs的标准来进行编写。

这里假设各位都已安装了webpack，当我们需要执行合并打包时，只需要在five-in-a-row文件内执行以下命令即可：

```bash
webpack src/index.js index.js
```

## 前置工作

在实现游戏算法前，我们先把游戏需要用到的页面，样式之类的先完成。

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link href="index.css" rel="stylesheet" type="text/css" />
        <title>五子棋</title>
    </head>
    <body>
        <!-- 游戏棋盘棋子采用canvas来绘制 -->
        <canvas id="canvas" width="640" height="640">你的浏览器不支持HTML5 canvas，请使用google chrome浏览器打开</canvas>
        <script type="text/javascript" src="index.js"></script>
    </body>
</html>
```

```css
/* index.css */
body {
    padding: 0;
    margin: 0;
}
#canvas {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    background-image:url(./image/bg.jpg);
}
```

然后，我们先把棋盘给绘制出来，所以先实现draw.js里面的功能：

```javascript
/* 绘制棋盘和棋子 */
var draw = {};

/* 绘制棋盘 */
draw.paintTable = (function() {
    var drawLine = function(context, dir, i) {
        var x,y;
        if(dir === 'row') {
            // 画横线
            x = [0, 640];
            y = [i, i];
        } else {
            // 画竖线
            x = [i, i];
            y = [0, 640];
        }

        context.beginPath();
        context.lineWidth = '4';
        context.strokeStyle = 'black';
        context.moveTo(x[0], y[0]);
        context.lineTo(x[1], y[1]);
        context.closePath();
        context.stroke();
    };
    return function() {
        var context = window.cache.table;
        
        for(var i=0; i<=640; i+=40) {
            drawLine(context, 'row', i);
            drawLine(context, 'column', i);
        }
    }
})();

/* 绘制棋子 */
/* flag为1表示黑字，flag为2表示白子 */
draw.drawChess = function(flag, x, y) {
    var cache = window.cache;
    var context = cache.table;
    var iswin = cache.iswin;

    if(iswin === 1) return; // 结束战斗
    else {
        if(flag === 1) {
            // 画黑子
            context.drawImage(cache.black, x*40+20, y*40+20);
        } else if(flag === 2) {
            // 画白子
            context.drawImage(cache.white, x*40+20, y*40+20);
        }
    } 
}

module.exports = draw;
```

draw.js这个模块提供两个接口，一个是`paintTable`，用于绘制棋盘，另一个是`drawChess`，用于绘制棋子。而绘制棋盘的接口仅需要在初始化时调用一次即可，因此我们先在src/index.js里编写如下代码：

```javascript
var initData = require('./data.js'); // 初始化数据
var draw = require('./draw.js');

draw.paintTable();
```

在绘制棋盘的时候我们需要用到一些初始化数据，这些代码是写在data.js里的，比如`paintTable`接口里用到的`window.cache.table`就是在初始化数据中定义的。data.js里的内容暂且如下：

```javascript
module.exports = (function() {
    window.cache = window.cache || {};
    window.cache.data = window.cache.data || {};
    // 棋盘
    window.cache.canvas = document.querySelector('#canvas');
    window.cache.table = window.cache.canvas.getContext('2d'); 
    // 15*15的二维数组用来保存棋盘信息，0为无子，1为黑子，2为白子
    window.cache.chessValue = new Array(15);
    for(var i=0; i<15; i++) {
        window.cache.chessValue[i] = new Array(15);
        for(var j=0; j<15; j++) {
            window.cache.chessValue[i][j] = 0;
        }
    }
    // 棋子图片
    window.cache.black = new Image();
    window.cache.white = new Image();
    window.cache.black.src = 'image/black.png';
    window.cache.white.src = 'image/white.png';

    window.cache.iswin = 0; // 0表示棋局未结束，1表示棋局结束
    window.cache.isblack = true; // 是否轮到黑子（玩家）下子
})();
```

这样，一个简单的棋盘就绘制出来了。关于canvas相关的操作不是本文的重点，在此不做说明，有兴趣者可去查阅官方文档学习。

## 添加事件

一个五子棋游戏要如何落子？如果是命令行的话，我们只能通过输入坐标来落子，而我们如今采用页面实现，所以落子直接通过鼠标点击适当的位置来进行即可。为此我们先在src/index.js里追加如下代码：

```javascript
var initData = require('./data.js');
var draw = require('./draw.js');
var judge = require('./judge.js');
var chooseWhere = require('./calc.js');

draw.paintTable();
(function() {
    // 此处是为了获取棋盘居中时的偏移量
    var canvas = window.cache.canvas;
    window.cache.offsetX = canvas.offsetLeft - (canvas.clientWidth/2);
})();

window.cache.canvas.onmousedown = function(event) {
    event = event || window.event;

    var cache = window.cache;
    var chessValue = cache.chessValue;

    var x=parseInt((event.pageX - 20 - cache.offsetX)/40);
    var y=parseInt((event.pageY - 20)/40);
    var winjudge;

    if(!cache.isblack) return; // 如果不是轮到黑子下则返回
    else {
        if(chessValue[x][y]) {
            // 这里已经有棋子
            alert("此处不能落子！");
            return;
        } else {
            chessValue[x][y] = 1; // 下黑子
            cache.isblack = false;
            draw.drawChess(1, x, y); // 画棋子

            // 判断输赢
            winjudge = judge(1, x, y);
            if(winjudge === 1) { 
                cache.iswin = 1;
                alert("黑子赢!");
            } else if(winjudge === 3) {
                cache.iswin = 1;
                alert("平局！");
            }
            
            chooseWhere();
        }
    }
};
```

这就是完整的src/index.js里的代码，其中`chessValue`是用来存储某个点是否有落子的信息，其结构为15*15的二维数组，对应棋盘中15*15个点。`judge`函数负责判断输赢，`chooseWhere`函数用于选择落子点，在下文中将对此做详细说明。

## 判断输赢

`judge`函数在judge.js里定义，通过判断棋盘是否存在五子连珠来判断局面的输赢情况，其功能较简单，实现如下：

```javascript
/* 判断输赢 */
/* flag为1表示黑字，flag为2表示白子 */
module.exports = function(flag, x, y) {
    var chessValue = window.cache.chessValue;
    var count1 = count2 = count3 = count4 = 0; //分别表示横向，竖向，正对角线，反对角线方向棋子个数
    
    var i = j = 0;
    var hasBlank = false; // 是否存在空白位
    for(i=0; i<15; i++) {
        for(j=0; j<15; j++) {
            if(!chessValue[i][j]) {
                hasBlank=true;
                break;
            }
        }
        if(hasBlank) break;
    }
    // 平手
    if(!hasBlank) return 3;
    
    // 横向
    for(i=x; i>=0; i--) {
        if(chessValue[i][y] === flag) count1 ++;
        else break;
    }
    for(i=x+1; i<15; i++) {
        if(chessValue[i][y] === flag) count1 ++;
        else break;
    }
    // 纵向
    for(i=y; i>=0; i--) {
        if(chessValue[x][i] === flag) count2 ++;
        else break;
    }
    for(i=y+1; i<15; i++) {
        if(chessValue[x][i] === flag) count2 ++;
        else break;
    }
    // 正对角线
    for(i=x,j=y; i>=0 && j>=0; i--,j--) {
        if(chessValue[i][j] === flag) count3 ++;
        else break;
    }
    for(i=x+1,j=y+1; i<15 && j<15; i++,j++) {
        if(chessValue[i][j] === flag) count3 ++;
        else break;
    }
    // 反对角线
    for(i=x,j=y; i>=0 && j<=14; i--,j++) {
        if(chessValue[i][j] === flag) count4 ++;
        else break;
    }
    for(i=x+1,j=y-1; i<=14 && j>=0; i++,j--) {
        if(chessValue[i][j] === flag) count4 ++;
        else break;
    }

    // 存在五子相连则赢
    if(count1>=5 || count2>=5 || count3>=5 || count4>=5) { 
        if(flag === 1) return 1; // 黑子赢
        else if(flag === 2) return 2; // 白子赢
    }
    return 0;
}
```

输赢条件判断相当简单，通过暴力的方式，针对所有有落子的位置的八个方位进行遍历，如下所示：

```
--黑-------------黑-------------黑--
-----黑----------黑----------黑-----
---------黑------黑------黑---------
-------------黑--黑--黑-------------
--黑--黑--黑--黑--此--黑--黑--黑--黑--
-------------黑--黑--黑-------------
---------黑------黑------黑---------
-----黑----------黑----------黑-----
--黑-------------黑-------------黑--
```

假设`此`子为落子点，那么就往上下左右和斜线八个方位分别检查四个位置，如果存在连着的五个同色棋子，则局面存在输赢；而当棋盘上不存在落子点并且不分输赢时，算作平局；其他情况则视为当前局面仍处于游戏中。

## 计算权值

棋盘中任何一个可落子的位置都会存在权值，即该位置究竟有多值得落子。假设有如下局面：

```
--白-------------黑------------------
------黑---------黑------------------
---------黑--白--白------------------
-------------黑--白--黑--------------
--白--白--白--白--此--黑--------------
-------------黑------黑--------------
```

假设我是AI，我执白子并且轮到我落子，那么我在`此`字落子我就已经赢了。在如上局面中其他所有位置都不如`此`字位置值得落子，所以此局面中`此`字的权值是最高的。对于权值是可以量化计算的，比如`此`字位置的权值我可以赋予9999这个值，而其他权值我赋予10，这样我就可以根据权值判断哪个位置更适合落子，量化后的权值必然是值越大越适合落子。

当然，此权值是针对白子，亦即是AI来说的。

money.js里就封装了一个计算权值的函数，其代码比较长，并且设计到比较多专业术语，比如某些固定的棋盘局面被称为`活三`、`冲四`之类的，对此比较感兴趣的可以去查阅相关文档。另外在网上存在各种各样计算权值的方式，说明权值的量化并不止一种方式，而money.js里是我自己给出的一种私以为比较合理的权值计算方式，当然为简单而论，此处是剔除了各种禁手的计算的。

money.js的源码可以戳[这里](https://raw.githubusercontent.com/JuneAndGreen/funnygame/master/five-in-a-row/src/money.js)查看。

## 核心算法

核心算法其实就是在src/index.js里提到的`chooseWhere`函数，实现在calc.js里面。

所谓核心算法，其实就是我们通称的搜索算法，通过预测对方的棋路构造出一棵博弈树，然后我们在遍历博弈树的时候找出相对最优解来落子。前文说过，鉴于效率原因，此处仅构造3层的博弈树，简单来说就是先假设自己在任意一个空的落子点落一个子，然后再假设对方在剩余的空落子点落子，之后再判断局面的形势，找出在假设后产生的最好局面。

ps: 博弈树的层数通常为奇数。因为落子的一个回合为黑白双方各落子一次，再加上根节点的话，层数必然为奇数。

通俗的来讲，就是往最坏的方向打算，认为对方极其聪明，往往会在最不利于自己的位置落子，而我的落子要考虑到最坏情况下找出最好的落子点，尽量让自己的损失最小。

如果用一棵博弈树来表示的话，如下所示（假设剩下a、b、c三个落子点，AI是白子，现在轮到AI落子）：

```
根节点
    |----白子在a落子
    |        |----黑子在b落子---->局面1
    |        |----黑子在c落子---->局面2
    |
    |----白子在b落子
    |        |----黑子在a落子---->局面3
    |        |----黑子在c落子---->局面4
    |
    |----白子在c落子
             |----黑子在a落子---->局面5
             |----黑子在b落子---->局面6
```

这样就产生6种可能出现的局面。然而要如何判断这局面的优劣呢？在这里我们要动用回之前的权值计算。之前的权值计算是针对一个落子点的，而这里只需要把该局面的所有可落子点的权值加起来，就可以得到一个局面的权值。局面权值的计算因落子点权值计算方式不同而不同，我给出的这个权值计算刚好可以通过累加的方式得出局面权值，这也算是这种计算方式的其中一个优势。

在这棵画得有点不太像样的树中我们想要找出认为对方会在最有优势的地方落子而对于自己损失最小的局面，就需要对这棵树进行遍历，而衡量局面优势的方式刚才已经说过，就是局面的权值。

遍历这棵树的方式是从叶子往根节点的方向进行的，因为我们要从局面倒推回白子应该落子的位置。我们先假设各个局面的权值都计算出来的了：

```
局面1 ----> 权值11              局面2 ----> 权值8
局面3 ----> 权值24              局面4 ----> 权值3
局面5 ----> 权值2               局面6 ----> 权值5
```

根据刚才提到的，我们必须认为黑子很聪明，会挑选最利于他们的局面，也就是说最不利于我们的局面，因此他们肯定会挑选落子后可以形成权值最低局面的位置落子。那么我们把上面的树根据刚才的策略修改一下，把黑子不会挑选的树枝给干掉：

```
根节点
    |----白子在a落子
    |        |----黑子在c落子---->局面2
    |
    |----白子在b落子
    |        |----黑子在c落子---->局面4
    |
    |----白子在c落子
             |----黑子在a落子---->局面5
```

然后这样往前遍历了一层后，就应该是我们白子落子的选择情况。如上面的树所示：白子可能在a、b、c三个点落子，但是考虑到黑子是聪明的，所以现在可能形成的局面也只有3种，而不是最上面提到的理想状况下的6种。在这3种局面里，我们则要挑选最利于自己的局面。根据权值判断，剩下的3种局面里`局面2`权值最高，所以我们应该选择在a落子，到此为止，博弈树的遍历就算完成了。

虽然根据最开始的提出的可能性，白子在b落子可能获得所有局面中的最高权值24，但是也可能去到权值仅为3的局面。考虑到黑子是聪明的，后者的可能性要远远高于前者，所以我们要选择最保险的措施，即在a落子，聪明的黑子会在c落子，最终局面的权值为8。

搜索算法本身是一种谨慎的算法，白子要想尽办法让自己处于有利局面，黑子要想尽办法不让自己处于有利局面，这就形成白子和黑子的博弈，博弈树则应运而生。当然，以上的树仅仅是只剩3个可落子的点，并且有3层，故感觉此算法比较快即可执行完毕。而当树的层数变高，可落子的点变多时，这棵博弈树就会变得异常庞大，为此我们可以在遍历的时候使用剪枝函数对算法进行优化。

## 算法优化

所谓剪枝函数，即是搜素算法中常提到的α-β剪枝。如上面的树，我们在遍历时加上权值的话，就会如下所示（括号里为权值）：

```
根节点（8）
    |----白子在a落子（8）
    |        |----黑子在b落子（11）---->局面1，权值11
    |        |----黑子在c落子（8） ---->局面2，权值8
    |
    |----白子在b落子（3）
    |        |----黑子在a落子（24）---->局面3，权值24
    |        |----黑子在c落子（3） ---->局面4，权值3
    |
    |----白子在c落子（2）
             |----黑子在a落子（2） ---->局面5，权值2
             |----黑子在b落子（5） ---->局面6，权值5
```

我们把这棵树简化成如下所示：

```
a节点（8）
    |----b节点（8）
    |      |----e节点（11）
    |      |----f节点（8）
    |
    |----c节点（3）
    |      |----g节点（24）
    |      |----h节点（3）
    |
    |----d节点（2）
           |----i节点（2）
           |----j节点（5）
```

其中奇数层非叶子的节点的权值我们都称为α值（下界值），偶数层的节点的权值我们都成为β值（上界值）。如上面那棵树，a节点的权值即是α值，b节点、c节点和d节点的权值即为β值。

α值和β值是跟随我们遍历过程中动态变化的，上面树中标注的权值都是遍历完所有节点后得出的权值。假设我们按e、f、g这样的顺序遍历叶子节点时，刚遍历完e节点，b节点上的β值则为11，而不是8；a节点的α值也应该是11，而不是8。因为我们还没有遍历到其他节点时，是不知道其他节点的权值的，我们只能根据已知的节点权值计算出α值和β值。

而所谓的剪枝，就是根据刚遍历到的节点权值和目前已知的α值或β值做比较，然后判断属于同一父亲节点的其他未遍历兄弟节点是否可以舍弃。其中奇数层的节点只需要和爷爷节点的α值做比较（α剪枝），偶数层的节点只需要和爷爷节点的β值做比较（β剪枝）。因为上面那棵树只有爷孙三代，因此只能做α剪枝。

### α剪枝

α剪枝就是将当前节点权值和爷爷节点的α值进行比较，如果当前节点权值小于爷爷节点的α值的时候，舍弃掉和当前节点属于同一个父亲节点的未遍历兄弟节点。

感觉直接从文字说明还是不太好理解，我们直接拿上面那棵树来说明。当我们遍历到i节点时，我们已经遍历了e、f、g和h节点，已经得出爷爷节（a节点）的α值为8，而i节点的权值小于a节点的α值8，所以剩下的j节点我们直接舍弃不再遍历。

其原理也很好理解，因为d节点的权值是取i节点和j节点的最小权值，而a节点的权值是取b、c和d节点的最大权值。当我们遍历到i节点时，剩下的j节点未遍历，所以我们还不知道它的权值。假设它的权值是大于i节点，则d节点的权值肯定等于i节点的权值，即为2，那么a节点的权值仍然为8；而假设它的权值小于i节点，则d节点的权值必然等于j节点的权值，而a节点是取其子节点最大的权值，i节点的权值已经小于a节点的权值，j节点的权值又小于i节点的权值，那么我们可以得出d节点的权值也小于a节点的权值，a节点权值还是为8。因此，无论j节点的权值为多少，当i节点的权值小于a节点的α值（权值）时，直接可以舍弃j节点了。

这也就是α值又被称为下界值的原因。

### β剪枝

β剪枝和α剪枝类似，只要当前节点权值和爷爷节点的β值进行比较，如果当前节点权值大于爷爷节点的β值的时候，舍弃掉和当前节点属于同一个父亲节点的未遍历兄弟节点。

原理和α节点也差不多，这里就不再做赘述了，从β值又被称为上界值就可以看出。

### 必须注意的点

可以做α剪枝的，只有在遍历奇数层节点的时候；可以做β剪枝的，只有在遍历偶数层节点的时候。另外还有一点，这些节点都必须有爷爷节点，只有爷爷节点的权值才能作为α值或β值来比较。

## 核心代码

讲了那么久核心算法的原理，或许大家以为这个算法的代码量一定很庞大吧，其实不然，整个代码也就短短一百多行：

```javascript
var calcMoney = require('./money.js');
var judgeWin = require('./judge.js');
var draw = require('./draw.js');
var calc = {};

/* ai选择位置并落子 */
module.exports = (function() {
    var cache = window.cache;
    var chessValue = cache.chessValue;

    /* 求棋盘最高分 */
    var calculmaxvalue = function() {
        var maxvalue = [0, 0, 0]; // 分别表示价值，坐标x，坐标y

        for(var i=0; i<15; i++)
            for(var j=0; j<15; j++)
                maxvalue[0] += calcMoney(i, j);

        return maxvalue;
    }
    /* 分别表示递归终止标志(搜索博弈树层数)，落子为谁，α值和β值 */
    /* 目前仅遍历三层，根节点（第一层） ----> AI白子下（第二层） ----> 玩家黑子下（第三层）*/
    var seapo = function(flag, chess, aa, bb) {
        var i = 0, j = 0;
        var buff; // 分别表示价值，坐标x，坐标y
        var fin = [-1, 0, 0];
        // 用于存储同层级的α和β值
        var atmp = aa;
        var btmp = bb;
        
        if(flag === 2) return calculmaxvalue(); // 到达叶子结点，计算棋盘权值
        
        for(i=0; i<15; i++) {
            for(j=0; j<15; j++) {
                if(chessValue[i][j]) continue; // 此处已有棋子
                if(chess === 1) {
                    // 此时轮到黑子下

                    var thisMoney = calcMoney(i, j);
                    if(thisMoney === 0) continue; // 此处无价值可言

                    chessValue[i][j] = 1; // 假设在此位置落黑子
                    buff = seapo(flag+1, 2, atmp, btmp); // 遍历下一层
                    chessValue[i][j] = 0; // 恢复为未落子的状态

                    if(buff[0] <= aa) {
                        // α剪枝
                        return buff;
                    }
                    if(buff[0] < btmp) {
                        // 重新设置β值
                        btmp = buff[0];
                        fin[0] = buff[0];
                        fin[1] = i;
                        fin[2] = j;
                    }
                } else if(chess === 2) {
                    // 此时轮到白子下

                    var thisMoney = calcMoney(i, j);
                    if(thisMoney === 0) continue; // 此处无价值可言
                    if(thisMoney >= 99999 || thisMoney <= -50000) {
                        // 当此处为必须落子的点（自己在此落子即赢或对方在此落子即输）
                        fin[0] = 99999;
                        fin[1] = i;
                        fin[2] = j;
                        return fin
                    }

                    chessValue[i][j] = 2; // 假设在此位置落白子
                    buff = seapo(flag+1, 1, atmp, btmp); // 遍历下一层
                    chessValue[i][j] = 0; // 恢复为未落子的状态
                    
                    if(buff[0] >= bb) {
                        // β剪枝
                        return buff;
                    }
                    if(buff[0] > atmp) {
                        // 重新设置α值
                        atmp = buff[0];
                        fin[0] = buff[0];
                        fin[1] = i;
                        fin[2] = j;
                    }
                }
            }
        }
        return fin;
    }

    return function() {
        var value=[-1,0,0]; // 分别表示价值，坐标x，坐标y和距离
        var leng = 0;
        var x,y;
        var winjudge;
        
        if(cache.iswin==1) return;
        
        value = seapo(0, 2, -1000000, 1000000);
        x = value[1];
        y = value[2];
        
        cache.isblack = true;

        draw.drawChess(2, x, y);
        chessValue[x][y] = 2;

        // 判断输赢
        winjudge= judgeWin(2, x, y);
        if(winjudge==2) {
            cache.iswin = 1;
            alert("白子赢!");
        } else if(winjudge === 3) {
            cache.iswin = 1;
            alert("平局！");
        }
    };
})();
```

## 尾声

至此，整个五子棋游戏的代码就完成的差不多了。代码量除了计算权值那部分其他的也不多，尤其是核心算法怎么说也算不上很复杂。在大学时期想必大家也或多或少会接触过此算法，诸如1024那些小游戏也是基于此算法编写的AI，广泛来说，只要是类似下棋一样博弈类的游戏都可以用搜索算法来设计AI，至于AI的难度取决于权值计算和遍历的博弈树的复杂度，与算法本身无关。

这里补上完整代码，请戳[这里](https://github.com/JuneAndGreen/funnygame/tree/master/five-in-a-row)。

试玩地址，请戳[这里](/example/five-in-a-row/)。

