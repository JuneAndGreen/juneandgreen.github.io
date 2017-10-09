function get() {
  	return [2, 6, 3, 1, 45, 2, 5, 6, 8, 656, 3, 23, 1, 5, 345, 44];
}
function swap(arr, a, b) {
	var tmp = arr[a];
	arr[a] = arr[b];
	arr[b] = tmp;
}

/**
 * 快速排序
 *
 * 原理：设立基准，将比基准大和比基准小的数分成两个数组，再对分好的数组进行同样的操作
 *
 * 最佳:O(nlogn)
 * 最差:O(n^2)
 * 平均:O(nlogn)
 * 辅助空间:O(logn)
 * 稳定性:不好
 */
console.log('----------------------快速排序----------------------');
var qArr;
(function() {
	qArr = get();
	qpart(0, qArr.length-1);
	console.log(qArr);
})();
function qpart(p, q) {
	var head = p;
	var tail = q;
	var base = qArr[p];

	if(p>=q) return;
	while(head<tail){
		while(head<tail && qArr[tail]>=base) tail--; // 判断尾部，直到尾部小于基准
		qArr[head] = qArr[tail];

		while(head<tail && qArr[head]<=base) head++; // 判断头部，直到头部大于基准
		qArr[tail] = qArr[head];
	}

	qArr[head] = base; // 设置基准位置
	qpart(p,head-1);
	qpart(tail+1,q);
}

/**
 * 归并排序
 *
 * 原理：拆分成多个数组，然后相邻数组进行合并再排序
 *
 * 最佳:O(nlogn)
 * 最差:O(nlogn)
 * 平均:O(nlogn)
 * 辅助空间:O(n)
 * 稳定性:好
 */
console.log('----------------------归并排序----------------------');
var mArr;
(function() {
	mArr = get();
	mArr = mpart(0, mArr.length-1);
	console.log(mArr);
})();
function mpart(p, q) {
	var left, right;
	var head = p;
	var tail = q;
	var mid = parseInt((p+q)/2);

	if(p > q) return [];
	if(p == q) return [mArr[p]];

	left = mpart(p, mid);
	right = mpart(mid+1, q);
	return mall(left, right);
}
function mall(left, right) {
  	// 合并两个已排好序的数组
	var result = new Array();

	if(left.length <= 0) return right;
	if(right.length <= 0) return left;

	while(left.length>0 && right.length>0) {
		if(left[0] < right[0]) {
			result.push(left.shift());
		} else {
			result.push(right.shift());
		}
	}

  	// 合并剩余部分
	while(left.length > 0) {
		result.push(left.shift());
	}
	while(right.length > 0) {
		result.push(right.shift());
	}
	return result;
}

/**
 * 堆排序
 *
 * 原理：建立最小堆或最大堆，每次输出最小值或最大值后进行堆调整
 *
 * 最佳:O(nlogn)
 * 最差:O(nlogn)
 * 平均:O(nlogn)
 * 辅助空间:O(1)
 * 稳定性:不好
 */
console.log('----------------------堆排序----------------------');
(function() {
	var arr = get();
	hpart(arr);
	console.log(arr);
})();
function hbuild(arr) {
  	// 建最大堆
	var i;
	// 只调整前半部分即可，从最后一个非叶子结点开始调整
	for(i=parseInt((arr.length)/2) - 1; i >= 0; i--) {
		hadjust(arr, i, arr.length-1);
	}
}
function hpart(arr) {
	var i;
	hbuild(arr); // 建好最大堆后，堆顶（下标为0的位置）即为最大值

	for(i=arr.length-2; i>=0; i--) {
    	// 逐步调整堆
		swap(arr, 0, i+1); // 把堆顶元素放到不可调整区域
		hadjust(arr, 0, i);
	}
}
function hadjust(arr, p, q) {
  	// 调整堆，p到q为可调整区域
	var top = p;
	var left = p * 2 + 1; // 左孩子
	var right = p * 2 + 2; // 右孩子

	if(left<=q && arr[top]<arr[left]) top = left; // 与左孩子比较
	if(right<=q && arr[top]<arr[right]) top = right; // 与右孩子比较

	if(top != p) {
		swap(arr, p, top); // 向下调整
		hadjust(arr, top, q);
	}
}

/**
 * 冒泡排序
 *
 * 原理：相邻元素之间进行打擂，打赢即换，打输即保持原样
 *
 * 最佳:O(n)
 * 最差:O(n^2)
 * 平均:O(n^2)
 * 辅助空间:O(1)
 * 稳定性:好
 */
console.log('----------------------冒泡排序----------------------');
(function() {
	var arr = get();

  	var i,j;
	for(i=0; i<arr.length; i++) {
		for(j=0; j<arr.length-1; j++) {
			if(arr[j] > arr[j+1]) swap(arr, j, j+1);
		}
	}

	console.log(arr);
})();

/**
 * 直接插入排序
 *
 * 原理：将当前元素和已经排序好的元素进行比较，找到自己插入的位置
 *
 * 最佳:O(n)
 * 最差:O(n^2)
 * 平均:O(n^2)
 * 辅助空间:O(1)
 * 稳定性:好
 */
console.log('----------------------直接插入排序----------------------');
(function() {
	var arr = get();
	var ret = new Array();

  	var i;
	ret.push(arr.shift());
	while(arr.length > 0) {
		var temp = arr.shift();
		for(i=0; i<ret.length; i++) {
			if(temp <= ret[i]) {
        	// 找到属于自己的位置并插入
				ret.splice(i, 0, temp);
				break;
			}

			if(i >= (ret.length - 1)) {
        	// 没有属于自己的位置，则追加
				ret.push(temp);
				break;
			}
		}
	}

	console.log(ret);
})();

/**
 * 简单选择排序
 *
 * 原理：遍历剩下的元素，找出其中最小或最大元素
 *
 * 最佳:O(n^2)
 * 最差:O(n^2)
 * 平均:O(n^2)
 * 辅助空间:O(1)
 * 稳定性:不好
 */
console.log('----------------------简单选择排序----------------------');
(function() {
	var arr = get();

  	var i,j;
	for(i=0; i<arr.length-1; i++) {
		for(j=i+1; j<arr.length; j++) {
      	// 遍历后面所有元素，选出最小的排在当前位置
			if(arr[i] > arr[j]) swap(arr, i, j);
		}
	}

	console.log(arr);
})();
