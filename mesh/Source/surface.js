/*
*This is the nexus for most of the more complicated compositing tasks.
*
*/

define(['haze', 'math'], function(){



function Surface( options ){
	if(!options) options = {};
	
	this.keepElements = options.keepElements || false;
		
	
	this.elements = [];
	
	this.canvas = options.canvas;
	this.context = this.canvas.getContext('2d');
	
	this.zIndex = options.zIndex;
	
	this.clearValue = options.clearValue;
	
	
	//clipping region
	this.viewPort = options.viewPort || {};//could use 3d matrix
	this.clipRegion;
	
	
	//it would be nice to have a setting to automatically do conversion from a
	//game or simulation's world space to camera space.
	this.spaceMapping = options.spaceMapping;
}

	

	
Surface.prototype.paint = function(){
	if(!this.canvas) throw "no canvas set to paint to";
		
	//if a sorting algorithm is defined,
	if(this.ShouldSort) this.sort(this.elements, 'z');
		
	
	//TODO set a clipping region!
	//TODO clear screen if necessary
	this.context.save();
	
	if(this.clipRegion) this.setClipRegion();
	
	
	if(this.clearValue)this.canvas.style.backgroundColor = this.clearValue;
	//TODO set the right clear value
	if(this.clearValue)this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
	
	
	//iterate through each element back to front
	for(var i = 0; i < this.elements.length; i++){
		this.elements[i].drawTo( this.canvas.getContext('2d') );
	};
		
	
	if(!this.keepElements) this.elements = [];
	
	this.context.restore();
}


	
//this function allows you to use bind but with an array instead of an arguments list. If it became more useful it coudl be moved to a library core function
Surface.prototype.bindArray = function(thisContext, argumentsArray){
		
		if(argumentsArray) argumentsArray = [null].concat(argumentsArray);
		
		return Function.prototype.bind.apply(thisContext, argumentsArray);
}

//might take in a reference to an element, or a type and options indicator
Surface.prototype.add = function(type, options){
	var e = type;
	
	
	//PIN UGLY yes it works but it looks hideous might be inneficient and gross to look at
	if(typeof type === 'string')e = new (this.bindArray(Haze.prototype[type], Array.prototype.slice.call(arguments, 1, arguments.length)));
	
	this.elements.push( e );
	
	return e;
};


Surface.prototype.canvasPoint = function(x, y){//from a screen coordinate to one relative to this canvas element
	if(!this.canvas) throw "surface doesn't have a canvas set";
	var offset = this.canvas.getBoundingClientRect();
	var data = getComputedStyle(this.canvas);
	//TODO because getBoundingClientRect doesn't take into account borders this value is wrong
	//TODO isolate numbers
	var border = {
		t: parseInt(data.borderTopWidth, 10),
		l: parseInt(data.borderLeftWidth, 10)
	}
	return {x: x - offset.left - border.l, y: y - offset.top - border.t};
}




//this function makes sure that the resolution of the canvas matches the absolute screen size it is taking up.
//you may not want this in all cases, but I've found that HTML 5 does not give you any control over how it upscales content from lower resolution canvases
//so if you set the canvas to a lower resolution, you will get antialising whether you like it or not, including on distinct pixel placements.
Surface.prototype.matchMarkupScale = function(){
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.ClientHeight;
};

//this function does the opposite of matchMarkupScale, it scales the DOM content of the canvas to match the pixel scale of the canvas content.
Surface.prototype.matchDrawScale = function(){
	this.canvas.style.width = this.canvas.width + "px";
	this.canvas.style.height = this.canvas.height + "px";
}




Surface.prototype.remove = function( element ){
	
	Haze.meta.arrayRemove(this.elements, element);
}








Haze.prototype.Surface = Surface;



});