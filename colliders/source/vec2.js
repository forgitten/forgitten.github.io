(function(){
	
function Vec2(x, y){
	this.x = x ||0, this.y = y ||0;
}


//TODO inlining this stuff might make it more efficient

Vec2.prototype = {
	add:function(v){return new Vec2(this.x + v.x, this.y + v.y)},
	subtract:function(v){return this.add(new Vec2(-v.x, -v.y))},
	multiply:function(s){
		return new Vec2(this.x * s, this.y * s);
	},
	dot(v){return this.x * v.x + this.y * v.y},
	magnitude(squared){return (squared)? this.x * this.x + this.y * this.y : Math.sqrt(this.magnitude(true))},
	normalize(){var m = this.magnitude(); return new Vec2(this.x/m, this.y/m)},
	mirror(n){
		n = n.normalize(), multiplier = 2 * this.dot(n);
		return this.subtract(new Vec2(n.x * multiplier, n.y * multiplier));
	},//mirrors this vector on argument vector,
	
	rotate:function(r){}//TODO rotate vector x radians
	
	
};

window.Vec = Vec2;

})()