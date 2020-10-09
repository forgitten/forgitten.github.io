define(['element'],function( Element ){


function Text( options ){
	Element.call(this, options);
	
	this.textContent = options.textContent;
	
	this.font = options.font || "30px Arial";
	
	
	
}


Text.prototype = Object.create(Element.prototype);


Text.prototype.paint = function( context, pos){
	
	context.font = this.font;
	
	if(this.fillStyle)context.fillText(this.textContent, pos.x, pos.y);
	
	if(this.borderStyle){
		context.lineWidth = 1;
		context.strokeText(this.textContent, pos.x, pos.y);
	}
}



Text.prototype.measure = function(){
	
	//TODO works but requires junk context....I also don't know if the canvas context changes this.
	var context = document.createElement('canvas').getContext('2d');
	
	var that = this;
	//this is not good!
	return this.drawTo (context,function(){  that.paint(context, {x:0, y:0}) ; return context.measureText(that.textContent ) });
};




//pixel fonts rather than system fonts
function Font(){
	
}



Haze.prototype.Text = Text;
Haze.prototype.Element.Text = Text;


});