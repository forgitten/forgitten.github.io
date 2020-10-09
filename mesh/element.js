/*
* Defines base class for screen elements
*
*
*
*/
define(['math'], function(){
	
	Haze.meta.define();
	
	
	/*
	options:{
		pos:{x:number, y:number},
		size:{x:number, y:number},
		rot:number,
		piv:{x:number, y:number},
		alignment:number, (-1, 0, 1 for top left, center, bottom right)
		fillStyle:"blue",
		borderStyle:{ getStyle:function(x, y){return new context.createPattern(some arguments)} }
	}
	
	
	
	TODO add an equivalent to CSS box-sixing to determine if border width is subtracted from entire or 
	*/
	
	function Element( options ){
		if(!options) options = {};
		
		this.zIndex;
		this.modifiers = [];
		
		this.fillStyle = options.fillStyle || "pink";
		this.borderStyle = options.borderStyle;
		
		//these values could be moved to their own structure or abstracted for different representations
		this.pos = (options.pos) ? new Haze.meta.M.Vec(options.pos.x, options.pos.y) : new Haze.meta.M.Vec(0, 0);
		this.size = (options.size)? new Haze.meta.M.Vec(options.size.x, options.size.y) : new Haze.meta.M.Vec(1, 1);
		this.rot = options.rot || 0;
		this.piv = (options.piv) ? new Haze.meta.M.Vec(options.piv.x, options.piv.y) : new Haze.meta.M.Vec(0, 0);
		
		//todo clip region
		
		
		//if you use modifiers, then a struct will be needed to save the composition of this object's pos and all its modifiers back to front.
		this.computed;
		
		
		
		this.alignment;//center, top left, bottom right
	}
	
	
	Element.draw = function(context, value){
		//the application draw function cannot be bound to the specific values of the element, as that intertwines it with the structure of the element.
		//instead, each element should have a self contained draw function that is invoked with the right parameters.
	}
	
	Element.prototype = Object.create(Modifier.prototype);
	
	
	//this sets a canvas's rotation and pivot to the right place to paint this element. It doesn't return the canvas, so it should be called after a save()
	//returns x and y coordinates to actually paint to.
	Element.prototype.setRotation = function( context ){
		context.translate( this.piv.x, this.piv.y);
		context.rotate( this.rot );
		
		
		return new Haze.meta.M.Vec(this.pos.x - this.piv.x, this.pos.y - this.piv.y);
	}
	
	
	
	
	//prepares context for specific drawing routine by setting proper fill, stroke, alpha, transforms
	Element.prototype.drawTo = function( context, replacement ){
		//context saving, restoring, and setting fillstyle should be done in helper function, so draw can just focus on painting
		context.save();
		var pos = this.pos, replacementReturn;
		
		
		if(this.rot && this.rot!==0)pos = this.setRotation( context );
	
	
		if(this.fillStyle)context.fillStyle = this.fillStyle;
		if(this.borderStyle)context.strokeStyle = this.borderStyle;
		
		//a fill or stroke style can be a real canvas style, or an object that has a getStyle function with a return value
		if(this.fillStyle && this.fillStyle.getStyle )context.fillStyle = this.fillStyle.getStyle(pos.x - this.pos.x, pos.y - this.pos.y);
		if(this.borderStyle && this.borderStyle.getStyle ) context.strokeStyle = this.borderStyle.getStyle(pos.x - this.pos.x, pos.y - this.pos.y);
		
		
		//TODO this nebulous "pos" value is just bad.... bad bad bad
		(replacement) ?  replacementReturn = replacement(context, pos) : this.paint( context, pos );
		
		
		
		context.restore();
	
		
		return replacementReturn;
	};
	
	
	Element.prototype.paint = function( context, pos ){
		
		
	};
	
	
	//TODO what resolution?
	Element.prototype.getData = function(){
		
		
		//should return a canvas that just has the data
		
		var canvas = document.createElement("canvas");
		//TODO handle rotation or differently sized objects like text! maybe with a "getheight overload function
		
		canvas.width = this.size.x, canvas.height = this.size.y;
		
		var context = canvas.getContext('2d');
		this.drawTo(context);
		
	}
	
	
	
	
	//Modifiers stack atop eachother to allow for conversion steps without modifying its base values
	//you can stack them onto the element's computed value, or retrieve a new end result
	Element.prototype.addModifier = function( m ){
		
		
		this.modifiers.push(m);
	};
	
	Element.prototype.removeModifier = function( m ){
		
		
		return (typeof m === 'undefined') ? m.pop() : Haze.meta.arrayRemove(m);
	}
	
	
	Element.prototype.generatedModifiers = [];
	
	
	Element.prototype.computeModifiers = function(){
		var computed = new Modifier(this.pos, this.size, this.rot, this.piv);
		
		//TODO this is a good place for an extension hook, more modifiers could be added and dumped.
		
		if(Element.prototype.generatedModifiers.length > 0) this.generatedModifiers.forEach();
		
		
		var m;
		for(var i = 0; i < this.modifiers.length; i++ ){
			m = this.modifiers[i];
			
			computed.applyModifier(m);
			
			
		}
	};
	
	
	
	
	
	//modifiers could be a generalized interpretation of lookup chains
	
	function Modifier(pos, size, rot, piv){
		
		this.pos = pos, this.size = size, this.rot = rot, this.piv = piv;
		
		//TODO some form of color mixing
	};
	
	
	//get 3x3 matrix composition
	//  cos( rot ) , -sin( rot ), 0,
	//  something, something, 0,
	//  something, something, 1
	//because the order of composition of transformation matters, we rotate and scale, then translate
	Modifier.prototype.getTransform = function(){
		return[
			0, 0, 0,
			0, 0, 0,
			0, 0, 1
		]
	}
	
	
	Modifier.prototype.applyModifier = function( m ){
		//applies the argument onto this one. equivalent to multiplying this one by the argument matrix
		
		return new Modifier(
			
		);
		
	};
	
	
	
	
	Haze.meta.Element = Element;
	Haze.meta.Modifier = Modifier;
	return Element;
});