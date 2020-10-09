define(['element'],function(){
	
function Sprite( options ){
	
	Haze.prototype.Element.call(this, options);
	
	this.image;
	this.loaded = false;
	
	this.reloadAttempts = 0;
	this.maxReloadAttempt = 5;
	this.broken;
	
	this.scaleType;
	
	if(options.src) this.load(options.src);
}

Sprite.prototype = Object.create(Haze.prototype.Element.prototype);



Sprite.draw = function(target, image, pos, size, rot, piv, clip){
	var context = (target.context) ? target.context : target;
	var pos = pos || {x:0,y:0};
	var size = size || {x:1, y:1};
	var piv = piv || {x:0,y:0};
	var rot = rot || 0;
	var clip = clip;
	
	var x = pos.x, y = pos.y, w = image.width * size.x, h = image.height * size.y;
	if(clip) {sx = clip.x; sy = clip.y};
	
	if(typeof clip !== 'undefined') context.drawImage(image, x, y, w, h, sx, sy);
	else context.drawImage(image, x, y, w, h);
	//else context.drawImage(image, x, y);
	
	
}


Haze.meta.define( Sprite.prototype, {
	
	load:function(src){
		this.reloadAttempts = 0;
		this.loaded = false, delete this.broken;
		
		this.image = new Image();
		this.image.onerror = this.onImageComplete.call(this, "error");
		this.image.onload = this.onImageComplete.call(this);
		
		this.image.src = src;
		
	},
	
	
	onImageComplete:function(e){
		
		
		if(!e){
			this.broken = true;
		}else{
			this.loaded = true;
		};
	},
	
	paint:function(context){
		
		if(!this.loaded) return false;
		//if(this.broken) throw Error('can\'t draw, broken');
		
		Sprite.draw(context, this.image, this.pos, this.size, this.rot, this.piv);
		
		
	},
	
	getData:function(){
		
	}
});


//extends sprite to allow for animations
function Reel( options ){
	
	Sprite.call(this, options);
	
	//TODO what do cells look like
	this.cells = [];
}

Reel.drawReel = function(){
	this.cells.foreach(function( c ){
		
	})
}


Reel.prototype = Object.create(Sprite.prototype);

Haze.meta.define( Reel.prototype, {
	
} );


Haze.prototype.Element.Sprite = Haze.prototype.Sprite = Sprite;
})