/*Math js copyright Percy Rocca
*
*Defines a set of math functions tailored for 2d and 3d graphics including
*2d and 3d points, 3d and 4d, matrices
*
*
*when applicable uses conventions based on webgl and html5 canvas
*/

/*
*TODO deal with vector vs point w component
*/

(function(){

"use strict";
var M = Object.create(Math);

M.equals = function(a, b){
	
}


//it would be nice to make a way for points and vectors to show up as constructors in a stack trace
M.Vec = function(x, y){
	
	this.x = x, this.y = y, this.w = 1;
}



M.Vec.prototype = {
	copy: function(){
		return new M.Vec(this.x, this.y);	
	},
	
	
	
	add : function(v){
		
		return new M.Vec(this.x + v.x, this.y + v.y);
	},
	
	
	
	subtract: function(v){
		
		return new M.Vec(this.x - v.x, this.y - v.y);
	},
	
	
	
	magnitude: function(){
		
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	
	
	//saves an expensive operation
	magnitudeSquared: function(){
		
		return (this.x * this.x + this.y * this.y);
	},
	
	
	
	normalize: function(){
		var m = this.magnitude();
		return new M.Vec(this.x / m, this.y / m);
	},
	
	//rotates the vector around a x and y location a given angle
	rotate:function(x, y, angle){
		var tx = this.x - x, ty = this.y - y;
		
		var sin = Math.sin( angle ), cos = Math.cos( angle );
		
		//negative sign determines direction of rotation I think
		var rtx = tx * cos - ty * sin, rty = tx * sin + ty * cos;
		
		return new M.Vec(rtx + x, rty + y);
	},
	
	
	dot:function( v ){
		return this.x * v.x + this.y * v.y;
	},
	
	
	mat:function( m ){
		
		
		return m.multiplyVector( this );
	}
};





// according to the documentation for html 5 canvas these values are
//
M.Mat3 = function( a, b, c, d, e, f ){
	if(Object.keys(this.presets).a) a = this.presets[a].slice();
	
	else if(arguments.length !== 6) throw new Error("matrix values must be 6 numbers");
	//TODO grab a new matrix
	
	this.a = [ a, c, e, b, d, f, 0, 0,  1];
}


M.Mat3.prototype = {
	presets:{
		identity:[1,0,0, 0,1,0, 0,0,1]
	},
	
	
	
	add: function( m ){
		var v = [];
		
		for(var i = 0; i < 9; i ++){
			v.push( this.a[i] + m.a[i] );
		};
		
		
		return new M.Mat3(v);
	},
	
	
	multiply:function( m ){
		var t = this.a, m = m.a,
			a = t[0] * m[0] + t[1] * m[3],		c = t[0] * m[1] + t[1] * m[4],		e = t[0] * m[2] + t[1] * m[5] + t[2],
			b = t[3] * m[0] + t[4] * m[3],		d = t[3] * m[1] + t[4] * m[4],		f = t[3] * m[2] + t[4] * m[5] + t[5];
			
			return new M.Mat3(a, b, c, d, e, f);
	},
	
	
	multiplyVector:function( v ){
		if(typeof v.w === 'undefined') throw Error('vectors must contain W components');
		
		return new M.Vec(
			v.x * this.a[0] + v.y * this.a[1] + v.w * this.a[2],
			v.x * this.a[3] + v.y * this.a[4] + v.w * this.a[5],
												v.w * this.a[8]
		);
		
	}
	
	
	
	
};




M.Vec3 = function(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.w = 0;
}











//w allows for translation
M.Point3 = function(x, y , z){
	M.Vec3.call(this, x, y, z);
	
	this.w = 1;
}
M.Point3.prototype = M.Vec3.prototype = {
	
	
	
	copy:function(){
		return new M.Vec3(this.x, this.y, this.z, this.w);
	},
	
	
	
	add:function(v){
		if((v instanceof M.Vec3) === false) throw new TypeError("vector to add must be of type v");
		
		return new M.Vec3( this.x + v.x, this.y + v.y, this.z + v.z );
	},
	
	
	
	addScalar:function( s ){
		return new M.Vec3(this.x + s, this.y + s, this.z + s);
	},
	
	
	
	subtract:function( v ){
		if((v instanceof M.Vec3) === false) throw new TypeError("vector to add must be of type v");
		
		return new M.Vec3( this.x + v.x, this.y + v.y, this.z + v.z );
	},
	
	
	
	subtractScalar:function( s ){
		return new M.Vec3( this.x - s, this.y - s, this.z - s);
	},
	
	
	
	divideScalar:function( s ){
		return new M.Vec3( this.x / s, this.y / s, this.z / s);
	},
	
	
	
	multiplyScalar:function( s ){
		return new M.Vec3(this.x * s, this.y * s, this.z * s);
	},
	
	
	//returns dot product
	dot:function(v){
		
		return this.x * v.x + this.y * v.y + this.z * v.z;
	},
	
	
	//returns a right handed perpendicular vector
	cross:function(v){
		return new M.Vec3( this.y * v.z - this.z * v.y, - (this.x * v.z - this.z * v.x), this.x * v.y - this.y * v.x );
	},
	
	
	//returns the size of the vector
	magnitude:function( leaveSquared ){
		var beforeRoot = this.x * this.x + this.y * this.y + this.z * this.z;
		
		return (leaveSquared) ? beforeRoot : Math.sqrt(beforeRoot);
	},
	
	
	
	//in cases where you just need to see which vector is larger, its better to not do an expensive square root.
	compare:function(v){
		var a = this.Magnitude(true), b = v.Magnitude(true);
		
		//TODO what about roundoff Error
		if(a === b) return 0;
		else if(a > b) return 1;
		else return -1;
	},
	
	
	//returns a unit vector
	normalize:function(){
		var m = this.Magnitude();
		
		return new M.Vec3(this.x / m, this.y / m, this.z / m);
	}
}







//TODO change constructor so it accepts a better parameter set


M.Mat4 = function(values){
	
	//TODO allow this to accept the name of a predefined mat
	if(this.presets[values]) values = this.presets[values].slice();
	
	this.a = values;//array of values
}


//just get a rotation matrix
//TODO order matters
M.Mat4.getRotationMatrix = function(x, y, z){
	var sinX = Math.sin(x), cosX = Math.cos(x), sinY = Math.sin(y), cosY = Math.cos(y), sinZ = Math.sin(z), cosZ = Math.cos(z);
	
	var values = [
		cosY * cosZ, sinX  * sinY * cosZ + cosX * sinZ, -cosX * sinY * cosZ + sinX * sinZ, 0,
		-cosY * sinZ, -sinX * sinY * sinZ + cosX * cosZ, cosX * sinY * sinZ + sinX * cosZ, 0,
		sinY, -sinX * cosY, cosX * cosY, 0,
		0, 0, 0, 1
	];
	
	return new M.Mat4( values );
}



M.Mat4.prototype = {
	presets:{
		identity:[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
		
	},
	
	
	add:function( m ){
		var v = [];
		
		for(var i = 0; i < this.a.length; i ++){
			v.push(m[i] + this[i]);
		}
		
		return new M.Mat4(v);
	},
	
	
	
	multiply: function( m ){
		var v = [];
		
		for(var i = 0; i < 4; i ++){
			for(var j = 0; j< 4; j++){
				//i is row, j is column
				//this could be done with a third loop iterating through each row/column pair, but I don't think the overhead is necessary
				v[i * 4 + j] = this.a[i * 4] * m.a[j] + this.a[i*4+1] *m.a[4 + j] + this.a[i*4+2] * m.a[8 + j] + this.a[i*4+3] * m.a[12 + j];
			}
		}
		
		return new M.Mat4( v );
		
	},
	
	
	
	multiplyVector: function( v ){
		var r = [];
		
		for(var i = 0; i < 4; i++){
			r[i] = v.x *  this.a[i * 4] + v.y * this.a[i * 4 + 1] + v.z * this.a[i * 4 + 2] + v.w * this.a[i * 4 + 3]; 
		};
		
		return (v.w === 0) ? new M.Vec3(r[0], r[1], r[2], r[3]) : new M.Point3(r[0], r[1], r[2], r[3]);
	}
	
	
	
	
}

//a rectangle defined by two points
M.Rect = function(x1, y1, x2, y2){
	this.x1 = x1||0,
	this.y1 = y1||0,
	this.x2 = (typeof x2 !== 'undefined')? x2 : 1,
	this.y2 = (typeof y2 !== 'undefined')? y2 : 1;
}

M.Rect.prototype = {
	
	
	
	
	
}


//a plane defined by 3 points or two parametric equations

M.Plane = function(a, b, c){
	
	
	
}




M.Plane.prototype = {
	
	//returns one of three return values: false if the two planes are parallel, a plane if the two are equivalent, and a line if the two intersect
	intersect:function( plane ){
		
	},
	
	
	intersectLine:function( line ){
		
	}
}




//PIN: optimization

//this is a brute force algorithm, and plays it extremely straight. given the fact that 2 points are equidistant, I believe it would be possible to optimize this and not rotate every point.
M.getBoundingFromOBB = function( rect, rot ){
	var centerX = rect.x + rect.width / 2, centerY = rect.y + rect.height / 2;
	
	//I think I could lock the rotation direction by either absolute value or subtracting from Math.PI * 2
	var sin = Math.sin( rot ), cos = Math.cos( rot );
	
	//move all points to origin
	var shiftedRect = {x:rect.x - centerX, y:rect.y - centerY, width: rect.width, height: rect.height};
	
	//determine actual points since after rotation x1 y1 x2 y2 will not be enough in the standard coordinate system
	var shiftedPoints = [
		{x: shiftedRect.x, 					   y: shiftedRect.y},					   //top left
		{x: shiftedRect.x + shiftedRect.width, y: shiftedRect.y},					   //top right
		{x: shiftedRect.x, 					   y: shiftedRect.y + shiftedRect.height}, //bottom left
		{x: shiftedRect.x + shiftedRect.width, y: shiftedRect.y + shiftedRect.height}
	];
	
	
	var shiftedRotatedPoints = [];
	
	//generate rotated values
	for(var i = 0; i < shiftedPoints.length; i++){
		shiftedRotatedPoints.push({
			x: shiftedPoints[i].x * cos - shiftedPoints[i].y * sin,
			y: shiftedPoints[i].x * sin + shiftedPoints[i].y * cos
		});
	}
	
	//determine maximum extent values with pure brute force
	
	var minX = Math.min(shiftedRotatedPoints[0].x, shiftedRotatedPoints[1].x, shiftedRotatedPoints[2].x, shiftedRotatedPoints[3].x),
	maxX = Math.max(shiftedRotatedPoints[0].x, shiftedRotatedPoints[1].x, shiftedRotatedPoints[2].x, shiftedRotatedPoints[3].x),
	minY = Math.min(shiftedRotatedPoints[0].y, shiftedRotatedPoints[1].y, shiftedRotatedPoints[2].y, shiftedRotatedPoints[3].y),
	maxY = Math.max(shiftedRotatedPoints[0].y, shiftedRotatedPoints[1].y, shiftedRotatedPoints[2].y, shiftedRotatedPoints[3].y),
	width = maxX - minX,
	height = maxY - minY;
	
	
	return {
		//shift all points back to original position
		x:minX + centerX,
		y:minY + centerY,
		
		width:width,
		height:height
	}
}

//given a triangle and a point returns the barycentric coordinates of the point
//barycentric coordinates relate a point to a triangle using 3 weighted values, one for each vertex of the triangle.
//they can be used for containment as well, since a point is only in the triangle if all 3 of its barycentric coordinates are positive.
//it can also be used in the process of texturing polygons from uv coordinates.

M.barycentric = function(aw, bw, cw, pw, r){//r is a flag for whether triangle data should be returned

	//make sure they are actual vectors so we can perform vector subtracts on them
	var av = new M.Vec(aw.x, aw.y), bv = new M.Vec(bw.x, bw.y), cv = new M.Vec(cw.x, cw.y), pv = new M.Vec(pw.x, pw.y);
	
	//shift all points to a new origin
	var v0 = bv.subtract(av), v1 = cv.subtract(av), v2 = pv.subtract(av);
	//TODO not done
	//generate projection tensor products
	//save ones that do not have to be recalculated
	var d00 = v0.dot(v0);
	var d01 = v0.dot(v1);
	var d11 = v1.dot(v1);
	
	var d20 = v2.dot(v0);
	var d21 = v2.dot(v1);
	
	var denom = d00 * d11 - d01 * d01;
	
	
	var v = ( d11 * d20 - d01 * d21 ) / denom,
		w = ( d00 * d21 - d01 * d20 ) / denom,
		u = 1 - v - w;
		
		return {u:u,v:v,w:w};
}

//returns a resuable set of values for a single triangle, for situations when many tests will be done with the same triangle
M.barycenter = function(pa, pb, pc){
	var a = new M.Vec(pa.x, pa.y), b = new M.Vec(pb.x, pb.y), c = new M.Vec(pc.x, pb.y);
	this.a = a;
	
	this.v0 = b.subtract(a), this.v1 = c.subtract(a);
	
	//these variables are unique to a single triangle whereas the others vary based on the point being converted
	
	this.d00 = this.v0.dot(this.v0);
	this.d01 = this.v0.dot(this.v1);
	this.d11 = this.v1.dot(this.v1);
	
	this.denom = this.d00 * this.d11 - this.d01 * this.d01;
}

M.barycenter.prototype = {
	calc:function( p ){
		var v2 = (new M.Vec(p.x, p.y)).subtract(this.a);
		
		var d20 = v2.dot(this.v0);
		var d21 = v2.dot(this.v1);
		
		
		var v = ( this.d11 * d20 - this.d01 * d21 ) / this.denom,
			w = ( this.d00 * d21 - this.d01 * d20 ) / this.denom,
			u = 1 - v - w;
			
		return {
			v:v,
			w:w,
			u:u
		}
	}
}

//calculates the barycentric coordinates using the property that the ratios remain unvariant under projection
M.barycentricP = function(aw, bw, cw, pw){
	
	//move all points into 0 0 space
	var a = new M.Vec(aw.x, aw.y), b = new M.Vec(bw.x, bw.y), c = new M.Vec(cw.x, cw.y), p = new M.Vec(pw.x, pw.y);
	var p0 = b.subtract(a), p1 = c.subtract(a), p2 = p.subtract(a);
	
	//choose projection plane of greatest variance
	//TODO
	
	
	
}


Haze.meta.M = M;

})();