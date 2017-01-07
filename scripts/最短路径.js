'use strict';
(function() {
  /**
   * Dijkstra最短路径算法
   *
   * 求单点到各个点的最短路径
   */

  // 距离矩阵，arr[x][y]值为x到y的距离
  const arr = [
    /*          点1       点2       点3       点4        点5       点6    */
    /* 点1 */ [ 0,        1,        12,       Infinity, Infinity, Infinity ],
    /* 点2 */ [ Infinity, 0,        9,        3,        Infinity, Infinity ],
    /* 点3 */ [ Infinity, Infinity, 0,        Infinity, 5,        Infinity ],
    /* 点4 */ [ Infinity, Infinity, 4,        0,        13,       15       ],
    /* 点5 */ [ Infinity, Infinity, Infinity, Infinity, 0,        4        ],
    /* 点6 */ [ Infinity, Infinity, Infinity, Infinity, Infinity, 0        ]
  ];
  const dis = [].concat(arr[0]); // 起点为点1
  const book = [true, false, false, false, false, false]; // 记录是否已被遍历

  function dijkstra() {
    for(let i=0; i<5; i++) {
      // 获取离起点最近且未遍历过的点
      let min = Infinity;
      let minIndex;
      for(let j=0; j<6; j++) {
        if(!book[j] && dis[j] < min) {
          min = dis[j];
          minIndex = j;
        }
      }
      book[minIndex] = true; // 标记为已遍历

      // 比较目前已知的最短距离和假如从当前点经过时的最短距离
      for(let p=0; p<6; p++) {
        if(arr[minIndex][p] < Infinity && dis[minIndex] + arr[minIndex][p] < dis[p]) {
          // 当经由第三方点可以得到更短距离的时候，更新最短距离
          dis[p] = dis[minIndex] + arr[minIndex][p];
        }
      }
    }

    console.log(dis);
  };

  dijkstra();

})();

(function() {
  /**
   * Floyd最短路径算法
   *
   * 求任意两点间的最短距离
   */

   // 距离矩阵，arr[x][y]值为x到y的距离
   const arr = [
     /*          点1       点2       点3       点4      */
     /* 点1 */ [ 0,        2,        6,        4        ],
     /* 点2 */ [ Infinity, 0,        3,        Infinity ],
     /* 点3 */ [ 7,        Infinity, 0,        1        ],
     /* 点4 */ [ 5,        Infinity, 12,       0        ]
   ];

   function floyd() {
     for(let i=0; i<4; i++) {
       for(let j=0; j<4; j++) {
         for(let p=0; p<4; p++) {
           if(arr[j][i] + arr[i][p] < arr[j][p]) {
             arr[j][p] = arr[j][i] + arr[i][p];
           }
         }
       }
     }

     console.log(arr);
   }

   floyd();
 })();
