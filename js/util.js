function sum(arr) {
	var s = 0;
	for (var i=0; i<arr.length; i++) {
		s += arr[i];
	}
	return s;
}

function vecOp(arr, f) {
	var a = [];
	for (var i=0; i<arr.length; i++) {
		a[i] = f(arr[i], i);
	}
	return a;
}

function quickMap(arr, key) {
	return arr.map(function(m){ return m[key]; });
}

function zip() {
	var lengths = vecOp(arguments, function(d,i){ return d.length; });
	var len0 = lengths[0];

	// if the lengths aren't the same, return
	if ( (len0 * lengths.length) != sum(lengths) ) {
		console.log("array lengths not equal");
		console.log(lengths);
		return undefined;
	}

	var zipped = [];
	for (var k=0; k<len0; k++) {
		var z = [];
		for (var i=0; i<arguments.length; i++) {
			z[i] = arguments[i][k];
		}
		zipped[k] = z;
	}
	return zipped;
}

function unzip(arr) {
	var ndim = arr[0].length;

	var list = [];

	for (var d=0; d<ndim; d++) {
		list[d] = arr.map(function(m){ return m[d]; });
	}

	return list;
}

function areArraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	for (var i=0; i<arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

// is essentially a replicate method
// it takes the initVal and replicates it len times
// function buildArray(len, initVal) {
// 	var a = [];
// 	for (var i=0; i<len; i++) {
// 		a[i] = initVal;
// 	}
// 	return a;
// }

function replicate(value, ntimes) {
	var a = [];
	for (var i=0; i<ntimes; i++) {
		a[i] = value;
	}
	return a;
}

// to build arrays in a vectorized fashion based on some function, use this functions
function buildCustomArray(len, f) {
	var a = [];
	for (var i=0; i<len; i++) {
		a[i] = f(i);
	}
	return a;
}

// distance formula (generalized)
// a and b are n-dimensional points
function euclideanDist(a,b) {
	if (a.length !== b.length) {
		console.log("incompatible vectors - array lengths not equal");
		return undefined;
	}

	// zip together a anb b
	// example: a = [0,0,0], b = [3,4,0]  =>  z = [ [0,3], [0,4], [0,0] ]
	var z = zip(a,b);

	// since z is always an array of pairs (associated with each dimension), we can vectorize
	// the squared-difference operation
	// example: sq = [ (3-0)^2, (4-0)^2, (0-0)^2 ]  =>  sq = [9,16,0]
	var sq = vecOp(z, function(d,i){ return ( (d[1] - d[0]) * (d[1] - d[0]) ); });

	// add the squared differences together
	// examples: s = 9 + 16 + 0 = 25
	var s = sum(sq);

	// and take the square root to get the euclidean distance in n-dimensional space
	// dist = sqrt(25) = 5
	var dist = Math.sqrt(s);

	return dist;
}


// returns form: [index in array of max value, max value]
function max(arr) {
	var m = [0, arr[0]];
	for (var i=0; i<arr.length; i++) {
		m = m[1] >= arr[i] ? m : [i, arr[i]];
	}
	return m;
}

// returns form: [index in array of min value, min value]
function min(arr) {
	var m = [0, arr[0]];
	for (var i=0; i<arr.length; i++) {
		m = m[1] <= arr[i] ? m : [i, arr[i]];
	}
	return m;
}

function randInt(min, max) {
	var range = max - min;
	return Math.floor(Math.random() * (range + 1)) + min;
}

function randReal(min, max) {
	return Math.random() * (max - min) + min;
}

function radToDeg(rad) {
	return rad * (180 / Math.PI);
}

function mod(n, m) {
	return n % m >= 0 ? n % m : n % m + m;
}

function freq(array, item) {
	var count = 0;
	for (var i=0; i<array.length; i++) {
		if (array[i] === item) count++;
	}
	return count;
}

function resetCanvasMatrix(canvasContext) {
	canvasContext.setTransform(1, 0, 0, 1, 0, 0);
}

function randParity() {
	return Math.random() <= 0.5 ? -1 : 1;
}

function randInt(min, max) {
	var range = max - min;
	return Math.floor(Math.random() * (range + 1)) + min;
}

function randReal(min, max) {
	return Math.random() * (max - min) + min;
}

function radToDeg(rad) {
	return rad * (180 / Math.PI);
}

function Color(r,g,b,a) {
	this.r = r === undefined || r > 255 || r < 0 ? randInt(0,255) : Math.floor(r);
	this.g = g === undefined || g > 255 || g < 0 ? randInt(0,255) : Math.floor(g);
	this.b = b === undefined || b > 255 || b < 0 ? randInt(0,255) : Math.floor(b);
	this.a = a === undefined || a < 0 || a > 1 ? 1 : a;
}
Color.prototype.rgbString = function(){ return "rgb(" + this.r + "," + this.g + "," + this.b + ")"; };
Color.prototype.rgbaString = function(){ return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")"; };

function mod(n, m) {
	return n % m >= 0 ? n % m : n % m + m;
}

// canvas only
function drawLine(pos1, pos2, ctx, c, lw) {
	var linewidth = lw || 1;
	var color = c === undefined ? "#333" : c;
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(pos1.x, pos1.y);
	ctx.lineTo(pos2.x, pos2.y);
	ctx.lineWidth = linewidth;
	ctx.stroke();
}

function terp(a,b) {
	return function(t) {
		return ((1-t) * a) + (t * b);
	};
}

function seqBy(xMin, xMax, step) {
	var numSeq = Math.floor((xMax - xMin) / step);
	var seq = [];
	for (var i=0; i<=numSeq; i++) {
		var num = xMin + step*i;
		num = parseFloat(num.toFixed(5));
		seq.push(num);
	}
	return seq;
}

function seqLen(xMin, xMax, numOfPoints) {
	var range = (xMax - xMin); console.log(range);
	var step = range / (numOfPoints-1); console.log(step);
	var seq = [];
	for (var i=0; i<numOfPoints; i++) {
		var num = xMin + step*i;
		num = parseFloat(num.toFixed(5));
		seq.push(num);
	}
	return seq;
}



function randColor(a) {
	var r = randInt(0,255);
	var g = randInt(0,255);
	var b = randInt(0,255);

	var c = r + "," + g + "," + b;

	if (a === undefined) return "rgb(" + c + ")";
	else return "rgba(" + c + "," + a + ")";
}


// MathJax specific function for creating math dynamically using JS
// function found here: https://stackoverflow.com/questions/22823702/how-to-add-a-mathjax-equation-into-the-html-page-using-a-javascript-button
// but was heavily edited to be more general for my purposes
function queueMathJax(newhtml, element) {
	element.innerHTML = newhtml;
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
}

// D3 specific function for waiting until all transitions have ended before running a callback
// found here: https://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition/20773846#20773846
// .each vs .on fix found here: https://stackoverflow.com/questions/38607647/d3-transition-looping-throwing-uncaught-typeerror-t-call-is-not-a-function
function endall(transition, callback) {
  if (typeof callback !== "function") throw new Error("Wrong callback in endall");
  if (transition.size() === 0) { callback(); }
  var n = 0;
  transition
      .each(function() { ++n; })
      // .each("end", function() { if (!--n) callback.apply(this, arguments); }); // use with D3 v3
      .on("end", function() { if (!--n) callback.apply(this, arguments); });      // use with D3 v4
}

// example of use
// d3.selectAll("g").transition().call(endall, function() { console.log("all done") });
