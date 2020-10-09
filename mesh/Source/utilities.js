/* utilities.js copyright Percy 
* Some conventions and algorithms are derivative of or conformant to jQuery
*
*
*/




define(['base'], function(){
	
	
(function(){
	//I am only going to define class properties for polyfills, where the function is defined in all but a few outdated browsers, or 
	//functionality so commonplace that it would be a signficant nuisance to invoke it without the prototype. In virtually all cases any browse with html 5 canvas support would have these anyway.
	
	
	//I don't like having my personal additions mixed in with polyfills...
	
	http://javascript.about.com/od/problemsolving/a/modulobug.htm
	Object.defineProperty(Number.prototype, 'modSafe',{
		value:function(n){
			
			if(n==0) throw new Error("operand must not be 0 for modulo");
			
			return ((this%n)+n)%n;
		}
	});
	
	
	
	// https://tc39.github.io/ecma262/#sec-array.prototype.includes
	if(!Array.prototype.includes)Object.defineProperty(Array.prototype, 'includes', {
		value:function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      var len = o.length >>> 0;

      if (len === 0) {
        return false;
	}

      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      while (k < len) {
		  
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }

      return false;
    }
	});
	
	
	//https://johnresig.com/blog/objectgetprototypeof/
	if(!Object.getPrototypeOf){
		if(typeof "a value".__proto__ === 'object'){
			
			Object.defineProperty(Object, 'getPrototypeOf', {
				value:function( o ){
					return o.__proto__;
				}
			});
			
		}else{
			Object.defineProperty(Object, 'getPrototypeOf', {
				value:function( o ){
					return o.constructor.prototype;
				}
			});
		}
	};
	
	
	
	Haze.meta.arrayRemove = function(a, r){
		var l = 1, e, i;
		
		if (!Array.isArray(a)) throw TypeError("first argument not of type array");
		
		
		while(l < arguments.length){
			e = arguments[l];
			
			while((i = a.indexOf(e)) !== -1 ){
				
				a.splice(i, 1);
			}
			
			l++;
		};
	};
	
	
})();









//utilities related to object and class extending
(function( scope ){
	
	
	
	Haze.meta.getType = function( o ){//returns typeof except with arrays identified
		return Array.isArray( o ) ? "array": typeof o;
	}
	
	//functionally equivalent to jquery version, hopefully
	Haze.meta.isPlainObject = function( o ){
		
		if(Object.prototype.toString.call(o) !== "[object Object]"  || !o) return false;
		
		var proto = Object.getPrototypeOf(o), con;
		
		if (!proto)  return false;
		else con = Object.prototype.hasOwnProperty.call( proto, "constructor" ) && proto.constructor;//polyfill in place for this so it should work.
		
		
		return (typeof con === 'function' && Function.prototype.toString(con) === Function.prototype.toString() );
	};
	
	
	
	Haze.meta.isFunction = function( o ){
		return o && Object.prototype.toString.call( o ) === "[object Function]";
	};
	
	
	
	//adapted from Jquery
	Haze.meta.extend = function(/*[recurse,] target, extension1, extension2,etc */){
			var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		if ( typeof target === "boolean" ) {
			deep = target;

			target = arguments[ i ] || {};
			i++;
		}

		if ( typeof target !== "object" && !Haze.meta.isFunction( target ) ) {
			target = {};
		}
		
		
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			if ( ( options = arguments[ i ] ) != null ) {

				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					if ( target === copy ) continue;

					if ( deep && copy && ( Haze.meta.isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray( src ) ? src : [];

						} else {
							clone = src && Haze.meta.isPlainObject( src ) ? src : {};
						}

						target[ name ] = Haze.meta.extend( deep, clone, copy );

					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		return target;
	};
	
	
	
	//simpler version of extend that just copies everything, no recursion logic
	//this actually works haha
	Haze.meta.define = function(target, source, warn){
		var i, p;
		
		for(i in source){
			p = source[i];
			
			if(p == null || p == target) continue;
			
			if(warn && typeof target[i] !== 'undefined') throw Error('the target already has an object at the specified property');
			
			Object.defineProperty(target, i,{
				value:p
			});
			
		};
		
		return target;
	};
	
	//adds a new link into an existing prototype chain to allow mixins
	//TODO this was never finished
	Haze.meta.infuse = function(target, mixin, priority){
		var meta = target.prototype;
		var inter = Object.create(meta);
		//TODO copy not link
		mixin.prototype = inter;
		
		target.prototype = mixin;
		
	}
	
	//tests whether a prototype-like object conforms to a given interface
	//this isn't commutative, a class that "implements" an interface may have more functions than the parent.
	Haze.meta.conforms = function(meta, model){
		
		for(var p in model){
			if (! Object.prototype.hasOwnProperty.call(meta, p) ) return false;
		}
		
		return true;
	};
	
	
})( this );






//system for getting unique Ids
(function(){
	var M = {};
	
	
	M.nextId = 0;
	
	M.maxId = Number.MAX_SAFE_INTEGER || 9007199254740991;
	M.getId = function(){
		
		if(M.nextId  === M.maxId ) throw new Error("Maximum Id limit has been acheived ");
		
		
		M.nextId++;
		return M.nextId;
		
	};

	
	//this is static, so IDs are unique across instances
	Haze.meta.getId = M.getId;
	
})();





(function() {
	//TODO more rigourously test these and error check
	/*STABILITY IS IMPORTANT FOR SORTING SCREEN ELEMENTS BECAUSE THE ELEMENTS LIST SHOULD RETAIN THE ORDER IN WHICH "NEUTRAL" ELEMENTS SENT IN WITHOUT A Z-FRAME OR WITH THE SAME Z-FRAME WERE PUSHED IN.
	 *
	 *mergeSort is stable so could be used for sorting screen elements
	 *
	 */
	
	
	
	var sort = {};
	//TODO in cases where the key is undefined for some elements this doesn't do anything
	
	//stable by nature. use for sorting screen Elements.
	/*A note on javascript's array sorting library function:
	*it takes in a compare function which returns a result of 0 or 1, however some implementations allow -1 0 and 1 for less than, more than, and equal,
	*while some do not. this is a neccessary condition for stability, so I am polyfilling it.
	*/
	sort.mergeSort = function(array, compare, workArray) {
		var compare = compare;
		if(typeof compare !== 'function'){
			if(typeof compare ==='string'){
				var s = compare;
				//as this is written right now, undefined values will all get kicked to the beginning.
				compare = function(x, y){var a = x[s], b = y[s];if(typeof a !=='undefined' && typeof b === 'undefined'){return 1;}else if(typeof a ==='undefined' && typeof b !== 'undefined'){return -1;} else if(typeof a === 'undefined' && typeof b === 'undefined'){return 0};
					if(a>b){return 1;}else if(a < b){return -1;}else{return 0;}};
			}else if(typeof compare ==='undefined'){
				compare = function(a, b){ if(a > b){return 1;}else if(a < b){return -1;}else{return 0;};};
			}else{
				this.log(/* error */);
			};
		};


		if(!workArray) workArray = [];
		splitDownMerge(array, 0, array.length, compare, workArray);
		
		
	};
	function splitDownMerge (array, start, end, compare, workArray){
		if( end - start < 2) return;
		
		var middle = Math.floor((end + start) >>> 1);
		splitDownMerge(array, start, middle, compare, workArray);
		splitDownMerge(array, middle, end, compare, workArray);
		mergeHalves(array, start, end, middle, compare, workArray);
		
		for(var i = start; i < end; i++){
			array[i] = workArray[i];
		};
	};
	
	
	function mergeHalves(array, start, end, middle, compare, workArray){
		
		var i = start, j = middle;
		for (var x = start; x < end; x++){
			
			if((i < middle) && ( j >= end || (compare(array[i], array[j]) < 1))){
				
				workArray[x] = array[i];
				i++;
				
			}else{
				workArray[x] = array[j];
				j++;
			};
			
		};
			
			return workArray;
		
	};
	
	
	//not stable by nature !now finished, should work
	//note that when sending in the "hi" value, do array.length-1, not array.length!!!!
	sort.partitionSort = function(array, lo, hi, compare) {
		if(typeof array[hi] ==='undefined') array.log("you probably meant array.length - 1, but sent in array.length");
		if(lo < hi){
			var p = sort.partition(array, lo, hi, compare);
			
			sort.partitionSort(array,lo, p,compare);
			sort.partitionSort(array,p+1, hi, compare);
		};
	};
	
	sort.quickSort = function(array, compare){
		var compare = compare;
		if(!typeof compare !== 'function'){
			if(typeof compare ==='string'){
				compare = ( function(){return  function(x, y){var a = x['foo'], b = y[foo]; if(a>b){return 1;}else if(a < b){return -1;}else{return 0;};}; })();
			}else if(typeof compare ==='undefined'){
				//very ugly code line, basically makes is so that if you send in a string it will use that string as the property name for comparison.
				compare = function(a, b){ if(a > b){return 1;}else if(a < b){return -1;}else{return 0;};};
			}else{
				this.log(/* error */);
			};
		};
		sort.partitionSort(array, 0, array.length -1, compare);
	};
	


	//normal implementations are not stable. I've run across a few stabalization methods, some revolve around a second comparison, but I feel a mergeSort might be better
	sort.partition = function(array, lo, hi, compare) {
		var pivotPos = (lo + hi) >>> 1;
		var l = lo -1, h = hi + 1;
		var swap;
		var forever = true;
		while(forever){
			do { l++; }while(compare(array[l], array[pivotPos]) < 0);
			do { h--; }while(compare(array[h], array[pivotPos]) > 0);
			
			if(l >= h) return h;
			
			swap = array[l];
			array[l] = array[h];
			array[h] = swap;
				
		};
	};
	
	Haze.meta.sort = sort;
})();


(function(){
	//color related helper functions
	var color = {};
	
	color.toHex = function( RGB ){
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	
	color.toRGB = function( Hex ){
		
	};
	
	
	Haze.prototype.color = color;
})();


(function(){
	//a generic implementation of a binary node tree maybe for use with spliney animations
	//TODO
	function Node( settings ){
		if (!settings) settings = {};
		this.children = [];
		this.id = settings.id || Node.undefinedId;
		
		
	};
	
	Node.undefinedId = 'THISNODEISUNDEFINED';
	
	Node.prototype = new Object();
	
	Node.prototype.addChild = function( childNode ){
		
		
		
	};
	
	Node.prototype.removeChild = function( childNode ){
		
	};
	
	//
	//Orb.prototype.Node = Node;
	
})();


});
