define(['element'], function( Element ){
	
function Rect( options ){
	//Rect really doesn't need any extra settings
	
	Element.call(this, options);
	
}

Rect.draw = function(context ){
	
}

Rect.prototype = Object.create(Element.prototype);


Rect.prototype.paint = function( context, pos ){
	
	if(this.fillStyle)context.fillRect(pos.x, pos.y, this.size.x, this.size.y);
	if(this.borderStyle)context.strokeRect(pos.x, pos.y, this.size.x, this.size.y);
}


Haze.prototype.Rect = Rect;
Haze.prototype.Element.Rect = Rect;















function Polygon( options ){
	Element.call(this, options);
	
	this.points = options.points ? options.points.map(function( p ){
		return new Haze.meta.M.Vec(p.x, p.y);
	}):[];
	
}

Polygon.prototype = Object.create(Element.prototype);


Polygon.prototype.paint = function(context, pos){
	
	context.beginPath();
	
	//move the draw pointer to the starting point
	context.moveTo(this.points[0].x + pos.x, this.points[0].y + pos.y);
	
	//paint to every point along the line
	for(var i = 1; i < this.points.length; i++){
		context.lineTo(this.points[i].x + pos.x, this.points[i].y + pos.y);
	}
	
	//move cursor back to starting position
	context.lineTo(this.points[0].x + pos.x, this.points[0].y + pos.y);
	
	context.closePath();
	
	
	context.fill();
	context.stroke();
	
}


Haze.prototype.Polygon = Polygon;
Haze.prototype.Element.Polygon = Polygon;

});