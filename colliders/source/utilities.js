(function(){
	
	
	//the simplest test would just be typeof == "object" but theres flaws in it and it might be slower
	function isFunction(x) {
		return Object.prototype.toString.call(x) == '[object Function]';
	};
	
	
	function isPlainObject( o ){
		
		if(Object.prototype.toString.call(o) !== "[object Object]"  || !o) return false;
		
		var proto = Object.getPrototypeOf(o), con;
		
		if (!proto)  return false;
		else con = Object.prototype.hasOwnProperty.call( proto, "constructor" ) && proto.constructor;//polyfill in place for this so it should work.
		
		
		return (typeof con === 'function' && Function.prototype.toString(con) === Function.prototype.toString() );
	};
	
	
	
	
	function extend(/*[recurse,] target, extension1, extension2,etc */){
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

		if ( typeof target !== "object" && isFunction( target ) ) {
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

					if ( deep && copy && ( isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray( src ) ? src : [];

						} else {
							clone = src && isPlainObject( src ) ? src : {};
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
	window.extend = extend;
	
	
	
})();