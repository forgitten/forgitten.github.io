define(['math'], function(){

/*defines interfaces for existing native html 5 canvas advanced styles.
*A style should implement the following interface:
*Style() - a constructor for a fill or border style
*getStyle(x, y) - a getter that returns an html 5 element. (maybe I should change this to be a mutator for the canvas so it can do more? )
*getTransformed - returns a version of the style that has been fixed to a rotation and position
*/

function Gradient( options ){
	this.pos = (options.pos) ? new Haze.meta.M.Vec(options.pos.x, options.pos.y) : Haze.meta.M.Vec(0, 0);
	this.size = (options.size) ? new Haze.meta.M.Vec(options.size.x, options.size.y) : Haze.meta.M.Vec(1,1);
	
	if(options.r1) this.r1 = options.r1;
	if(options.r2) this.r2 = options.r2;
	
	this.colorStops = [];
	
	this.type = options.type || this.Types.radial;
	
	//TODO implement static
	
	this.static = (options.static) ? true : false;
}

Gradient.prototype.Types = {radial:"Radial", linear:"Linear"};


Gradient.prototype.context = document.createElement('canvas').getContext('2d');//reference to original canvas only exists on context


//TODO this handles rotation by simply offsetting the gradient - this works, but the gradient is always what it would be if there was no rotation at all
/*
* you should be able to programmatically rotate the gradient values, unlike patterns!
*
*/
Gradient.prototype.getStyle = function(x, y){
	var x1 = this.pos.x;
	var y1 = this.pos.y;
	//if(x) x1 += x;
	//if(y) y1 += y;
	
	var x2 = x1 + this.size.x;
	var y2 = y1 + this.size.y;
	
	var nativeGradient;
	
	if(this.type === this.Types.linear)nativeGradient = this.context.createLinearGradient(x1, y1, x2, y2);
	if(this.type === this.Types.radial) nativeGradient = this.context.createRadialGradient(x1,y1, this.r1, x2, y2, this.r2);
	
	
	this.colorStops.forEach(function(c){nativeGradient.addColorStop(c.pos, c.color);});
	
	return nativeGradient;
}








//TODO allow for pattern rotation independent of the rotation of the object, if its possible
//rotate rotation of object plus pattern rotation and paint onto canvas size of rotated, then use that canvas as pattern. might require canvas size calculation
function Pattern( options ){
	if(!options) options ={};
	
	//TODO
	this.offset = options.offset ? new Haze.meta.M.Vec(options.offset.x, options.offset.y) : new Haze.meta.M.Vec(0,0);
	//TODO this.clipSpace?
	this.rotation = options.rotation || Math.PI / 180 * 45;
	
	//image might not be loaded
	this.isReady = false;
	this.loadError = false;
	
	//not sure if this should be wrapped but right now I'll take a standard image object
	this.image = new Image();
	
	var that = this;
	this.image.onload = function(){that.isReady = true};
	this.image.onerror = function(){that.loadError = true;};
	
	this.image.src = options.source;
	
	
	
	this.repeat = options.repeat || this.Types.repeat;
	
	
	
	
	
}

Pattern.prototype.Types = {repeat:"repeat", repeat_x:"repeat-x", repeat_y:"repeat-y", no_repeat:"no-repeat"};

Pattern.prototype.context = document.createElement('canvas').getContext('2d');


Pattern.prototype.whenLoaded = function(callback, arguments, thisContext){
	
	this.isReady ? callback.apply( thisContext, arguments) : this.image.addEventListener('load', callback.bind( thisContext, arguments) );
	
}

Pattern.prototype.getStyle = function(x, y){
	if(!this.isReady) return false;
	//TODO this returns a canvas pattern but there is no way to set rotation.
	
	
	
	var nativePattern = this.context.createPattern(this.image, this.repeat);
	
	
	return nativePattern;
}

//TODO this is not functional!

//this operation is extremely expensive and should not be done on a per frame basis
//this works by first creating a tiled version of the texture onto a canvas big enough so that a rotated slice can be taken out of it.
//then the tiled version is rotated to the correct orientation on a second canvas which is returned as the rotated sprite.
https://stackoverflow.com/questions/21126536/how-to-get-a-rotated-crop-of-an-image-with-html5-canvas

Pattern.prototype.getTransformed = function(){
	
	
	//I think I need another helper function to determine the necessary size of a rotated version
	//get dimensions of an AABB fitting rotated image size WRONG, a rotated clip of the same size does not provide enough data to loop the image sprite it appears
	var shrinkWrap = Haze.meta.M.getBoundingFromOBB({x:0, y:0, width:this.image.width, height:this.image.height }, this.rotation);
	
	var baseOffset = {x : (-3 * this.image.width + shrinkWrap.width) / 2, y:(-3 * this.image.height + shrinkWrap.height) / 2};
	
	//create the canvas that will house the rotated version
	
	var helperCanvas = document.createElement('canvas');
	helperCanvas.width = shrinkWrap.width, helperCanvas.height = shrinkWrap.height;
	var newContext = helperCanvas.getContext('2d');
	
	
	//TODO factor in translation
	
	newContext.translate(baseOffset.x, baseOffset.y);
	
	
	newContext.fillStyle = newContext.createPattern( this.image, 'repeat' );
	newContext.fillRect(-baseOffset.x, -baseOffset.y, shrinkWrap.width - baseOffset.x, shrinkWrap.height - baseOffset.y);
	
	
	
	var resultCanvas = document.createElement('canvas');
	resultCanvas.width = shrinkWrap, resultCanvas.height = this.image.height;
	var finalContext = resultCanvas.getContext('2d');
	
	
	finalContext.translate(resultCanvas.width / 2, resultCanvas.height / 2 );
	finalContext.rotate( this.rotation );
	
	//this doesnt seem to be quite right
	finalContext.drawImage( helperCanvas, -helperCanvas.width / 2, -helperCanvas.height / 2 );
	finalContext.fillStyle = "pink"; finalContext.fillRect(0, 0, 4,4);
	
	//throw in a debug feature
	resultCanvas.canvasBefore = helperCanvas;
	
	return resultCanvas;
}

Haze.meta.Gradient = Gradient;
Haze.meta.Pattern = Pattern;
});