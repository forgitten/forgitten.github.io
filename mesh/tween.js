define(['haze'], function(){

/* defines a utility for inbetweening the value of a numerical property with different options, or just passing a value to a function for use.
* the options available right now should be:
* 
*options = {
* increment:1 - the delta added every updated
* min: 0 - minimum value. if not set then will decrease without bound.
* max: 1 - maximum value. if not set will increase without bound.
* onLoop: "reverse", "restart" "end" - what to do when the value gets too big or too small
* type: "linear", "sin", "cos", "arc" - used for a curve factor
* 
*}
*
*/

function Tween(target, key, options){
	
	if(!options) options = {};
	
	this.target = target;
	this.key = key;
	
	if(typeof this.target === 'function'){
		// you can use a function instead
		options = key;
	}
	
	for(var k in this.baseOptions){
		
		(typeof this.baseOptions[k] !== 'undefined' && typeof options[k] === 'undefined') ? this[k] =  this.baseOptions[k]: this[k] = options[k];
	}
	
	
	
	this.factor = 1;//factor is used for curves like sin components
	this.bounded = (typeof this.min !== 'undefined' && typeof this.max !== 'undefined');
}


Tween.prototype = {
	baseOptions:{type:"linear", onLoop:"reverse", increment:1, min:undefined, max:undefined},
	
	
	//this function sets the value of this tween instance's watched variable. otherwise you would have to access it via the string representation this.target[this.key] over and over again
	valuize:function( set ){
		if (typeof set !== 'undefined')this.target[this.key] = set;
		
		return this.target[this.key];
	},
	
	
	//updates the value of the target, or invokes the functiop, then fixes its range
	update:function( delta ){
		var excess;
		
		if (this.interval === 0 ) return false;
		
		if(!delta) delta = 1;//delta is a timing factor. if no value is sent in, it will just assume the value is per frame
		
		if(typeof this.target === 'function' ){
			if(this.type && this.type !== "linear") throw Error('user supplied tweening functions must be linear');
			
			this.target( delta * this.increment );
			
			return;
		};
		
		switch( this.type ){
			case "linear":
			
			this.target[this.key] += delta * this.increment;
			
			break;
			case"sin":
			
			if(!this.bounded) throw Error('sin interpolation is only defined across bounded intervals');
			
			
			break;
		}
		
		
		
		
		
		
		//this handles reversal if the value goes outside the max and min ranges.
		 if((typeof this.min !== 'undefined' && this.target[this.key] < this.min) || (typeof this.max !== 'undefined' && this.target[this.key] > this.max ) ){
			 
			 //within this if block you can assume that the value is out of range.
			 goingUp = ( this.target[this.key] > this.max );
			 
			 //using a modulus ensures that if by some event the watched value becomes a multiple of the end point, it actually is put back in range and not just offset back to a still too big value.
			 excess = goingUp ? this.target[this.key] % this.max : this.min % this.target[this.key];
			 
			switch( this.onLoop ){
				case "reverse":
				
				this.increment = -this.increment;
				
				goingUp ? this.target[this.key] = this.max - excess : this.target[this.key] = this.min + excess;
				break;
				case "restart":
				
				
				this.target[this.key] = goingUp ? this.min + excess : this.max - excess;
				
				break;
				case "end":
				this.increment = 0;
			}
		
		 }
	},
	
	
	
	
	
	auto:function( interval ){
		
		if(typeof interval === 'undefined') interval = 100;
		return setInterval(this.update, interval);
		
	}
	
	
}








Haze.meta.tween = function(target, key, options){
	return new Tween(target, key, options);
}



function exampleOfSyntaxMightBe(){
	var screen = Haze();
	
	screen.tween(function( increment ){
		value += increment;
	}, {min:0, max:400, speed:30, type:"sin"})
	
	
	screen.tween(mesh,'pos', 40)
}

});