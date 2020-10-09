//the way I intend to use this render engine is to define rooms with static camera angles and pre-render background objects using raytracing.
//front objects will be rasterized using real time algorithms, While backgrounds will be raytraced.


function RayScene(){
	
	//the material makeup of an object determines if light bounces, is absorbed, or is emitted.
	//some materials are light sources and will just emit lights, while some will reflect completely, and others will refract at an angle while warping the color.
	this.objects;
	
	//how many bounces do we attempt?
	this.cycleCount;
	
	this.view = {//TODO what do we need to define the viewport, both where its positioned and how many pixels need rendered
		//depth;//how far the screen is from the back plane. If you want the camera to sit at z = 0 with a depht of 
		//width;//we assume that the viewport is centered on  0 0
		//height;
		//z;
		//xRes;
		//yRes;
	}
}




RayScene.prototype = {
	
	
	//returns an array of pixel color values.
	render:function( screen ){
		
		var l, render = [], backZ = this.view.z - this.view.depth;//line for each gridline
		
		
		//we generate a line from the back of the box through each gridpoint then raytrace it
		for(var x = 0; x < this.view.xRes; x++){
			for(var y = 0; y < this.view.yRes; y++){
				//TODO find the right point for each pixel to trace from
				l = {x1:0,
					y1:0, 
					z1:backZ,
					x2: -this.view.width / 2 + this.view.width * x / xRes,
					y2: - this.view.height / 2 + this.view.height * y / yRes,
					z2:this.view.z};
				
				render [ y * this.view.w + x ] = this.trace( l );
			}
		}
		
		
	},
	
	
	//a debug function that returns just if there was a hit or not. will return all trues if the area is enclosed like a room....
	bitRender(){
		var hits = new Uint8Array(this.view.xRes * this.view.yRes), l, backZ = this.view.z - this.view.depth;
		
		for(var i = 0; i < hits.length; i++ ){
			l = {x1:0,
					y1:0, 
					z1:backZ,
					x2: -this.view.width / 2 + this.view.width * (i % this.view.xRes) / this.view.xRes,
					y2: - this.view.height / 2 + this.view.height * (Math.floor(i / this.view.xRes)) / this.view.yRes,
					z2:this.view.z};
			//this time we only want to know if there was any kind of collision at all, we dont care what
			hits[i] = (this.trace( l )) ? 1 : 0;
		}
		
		return hits;
	},
	
	
	
	//private:
	
	//traces the hits of a single ray
	trace:function( l ){
	var hits = [], hit, back;//list of bounces. If empty drop to background color
		
		for(var i = 0; i < this.cycleCount; i++){
			
			//hit should give us both the 
			hit = this.collide( l );
			hits.push(hit.c);
			l = hit.l;
		}
		
		if(!hit ) return false;
	},
	
	//finds the closest plane of collision for a ray should be overwritten by any partitioning system
	collide:function( ray ){
		
		//for()
		
	},
	
	//once we know what triangle and what ray we need to actually select a color value from it, and get a new line directed to the next area
	bounce:function(ray, tri, material){
		
		//the material options we can have are based on how the object distorts color, and what angle light is bounced off.
		
		return this.math.refract3( this.math.getPlane( tri ) );
	}
}

//geometric math used in ray tracing - lines are defined by parametric t across two points, planes by 3 points or a surface normal and distance

/* During the tracing of a particular scene, the following mathematics must be used:
* for each sample location a ray must be defined that points from the back of the view frustrum to that location.
* a ray must be able to be intersected against an object (i.e the set of planes that make up the object), and the color information as well as angle of refraction from that object.
* once all intersection values are calculated the final color must be calculated from the subsequent surface interactions
*
*/

//this entire struct is going to be a nest of ugly hidden math errors regaurding zero division and coordinate systems which is why I'm containing it here.
//this isn't intended to be a fully fledged math engine, simply the least amount necessary to provide ray casting and selecting capabilities
RayScene.Math = RayScene.prototype.Math = {
	
	//returns a normalized plane defined by a normal and distance from 3 points.
	getPlane:function(a, b, c){
		//first get a line that is perpendicular to the plane through any point using cross product
		var p = {}, v1 = {x:b.x - a.x, y:b.y - a.y, z:b.z - a.z}, v2 = {x:c.x - a.x, y:c.y - a.y, z:c.z - a.z};
		
		//cross product contains plane normal. Handedness kindof doesnt matter
		var cross = {x:v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x + v1.x * v2.z, z: v1.x * v2.y + v1.y * v2.x};
		var dot = a.x * cross.x + a.y * cross.y + a.z * cross.z;
		
		
		return this.normalize(cross, dot);
	},
	
	
	
	
	
	//normalize a plane, or vector
	//HANGING if we were to normalize all our plane normals beforehand we could write much faster code in general
	normalize:function(p, n){
		
		var dist = Math.sqrt(p.x + p.y + p.z), ret = {x: p.x / dist, y: p.y / dist, z:p.z / dist};
		
		if(n) ret.n = n / dist;
		
		return ret;
		
	},
	
	
	
	
	//returns the time and point at which a line hits a plane.
	intersectLinePlane(p, d, l1, l2){
		var dt = {x:l2.x - l1.x, y: l2.y - l1.y, z:l2.z - l1.z}, den = (p.x * dt.x + p.y * dt.y + p.z * dt.z), t;
		
		//looking for x, ( l1 + dt * x ) dot p = d  ->  l1 dot p + dt * x dot p = d  ->  x * dt dot p = d - l1 dot p  ->  x = (d - l1 dot p) / dt dot p
		if(den === 0) return false;
		
		t = (d - (l1.x * p.x + l1.y * p.y + l1.z * p.z)) / den;
		
		//TODO n should be a normal that represents the mirror to reflect around forr mirroring
		
		
		//point and time of intersection
		return{
			p: {x: l1.x + t * dt.x, y: l1.y + t * dt.y, z:l1.z + t * dt.z},
			t:t
		}
	},
	
	
	
	
	//TODO how?
	//note 1:the angle of the line being intersected doesnt matter once you know the point of intersection. no matter what line is being bounced, the plane stays the same.
	getMirror:function(normal, i){//returns a new plane normal that could be used to mirror lineVec off of original normal, assuming both are centered at the point of interesection.

		//false means that the normal was equal to the line vector
		//if() return false;
		
		//return{
		//	x:
		//	y:
		//	z:
		//}
	},
	
	
	
	
	//returns new line that represents the line reflected off the given plane, and the time t of intersection.
	//does NOT return reflection IN plane, but as if line BOUNCED OFF OF plane, so reflection around plane normal at point of collision
	//equation for VECTOR mirroring in n dimensions is   Ref(v) in a = v - 2 * (v dot a / a dot a) * a
	//https://en.wikipedia.org/wiki/Reflection_(mathematics)
	reflect3:function(p, d, l1, l2){
		//find the point at which the line penetrates the plane, if any
		var intersection = this.intersectLinePlane(p, d, l1, l2), i = intersection.p, diff = {x:l2.x - l1.x, y:l2.y - l1.y, z:l2.z - l1.z};
		
		//the line never touches the plane
		if(intersection === false) return false;
		
		p = this.getMirror(p, i);
		
		if(p == false){//this means the original line was directed into the plane perpendicularly and just needs to be reversed.
			//we simply return the original, swapped with the point of intersection.
			return{
				l1: {x:l2.x, y:l2.y, z:l2.z},
				l2: {x:l1.x, y:l1.y, z:l1.z},
				i: i
			}
		}
		
		
		
		
		//NOTICE everything below this comment in this function works. All we need is the right "p". If it isn't working its probably something avoe this point.
		
		//what we're actually reflecting is not l1 or l2, its l1 and l2 in the vector space of intersection, or l1 - intersection
		var v1 = {x:l1.x - intersection.p.x, y:l1.y - intersection.p.y, z:l1.z - intersection.p.z}, v2 = {x:l2.x - intersection.p.x, y:l2.y - intersection.p.y, z:l2.z - intersection.p.z};
		
		
		//now mirror across plane normal, and re add intersection
		
		//v1s is scalar component, dMag is magnitude of plane normal, dl is the vector between the initial lines
		var pMag = (p.x * p.x + p.y * p.y + p.z * p.z), v1s = 2 * (v1.x * p.x + v1.y * p.y + v1.z * p.z) / pMag, v2s = 2 * (v2.x * p.x + v2.y * p.y + v2.z * p.z) / pMag,
		 v1m = {x:v1.x - v1s * p.x, y: v1.y - v1s * p.y, z:v1.z - v1s * p.z }, v2m = {x:v2.x - v2s * p.x, y: v2.y - v2s * p.y, z:v2.z - v2s * p.z};
		
		//finally add the vector we removed at the start to make mirroring work.
		return{
			l1: {x:v1m.x + intersection.p.x, y:v1m.y + intersection.p.y, z:v1m.z + intersection.p.z}, 
			l2: {x:v2m.x + intersection.p.x, y:v2m.y + intersection.p.y, z:v2m.z + intersection.p.z},
			i: intersection.p
		}
	},
	
	
	
	
	
	//returns new line that represents the line reflected about the given plane, and the time t of intersection.
	refract3:function(p, d, l1, l2, index1, index2){
		
		//first we need to find the angle between the surfaces, then calculate a version rotated in the direction 
		var intersection = this.intersectLinePlane(p, d, l1, l2), theta = this.vectorAngle(), muffledTheta, mirroredTheta;
		
		
		
		
		
		//return{
			//l1,
			//l2,
			//ti
	},
	
	
	
	
	
	//given two vectors it finds the angle between them, in radians, clockwise, should work
	vectorAngle:function(a, b){
		
		//the dot product is related to vector angle in all dimensions
		var aMag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z), bMag = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
		
		return Math.acos( (a.x * b.x + a.y * b.y + a.z * b.z) / aMag * bMag);
		
	}
}












//this structure just accelerates trace functions by selecting the appropriate plane / object
//basically all this does is select planes based on any partitioning system that can divide space for easy lookup
RayScene.partition = function( points, tris ){
	
	//for now I'm going to hold data the same way I would it in the graphics engine, an array of points an an array of tris that key into it
	this.points = points, this.tris = tris;
	
	
	this.topCell = this.getNode();
	
	
}

RayScene.partition.prototype = {
	//whatever structure the partitioning system uses needs to be created from a soup of polygons
	build:function(  ){
		
		//first we just need to know how large our area we are covering is. Cluster is used to weight our boxes so that more are in the places with more stuff
		var box = this.getBound( this.points ), cluster = this.getAverage(this.points);
		
		
	},
	//TODO how to get handles to tris
	add:function(){
		
	},
	
	remove:function(){
		
	},
	
		//returns either the object or plane with planar properties of the 
	selectPlane:function( ray ){
		//first we need to find the right bucket to search in.
		
		
		
	},
	
	//private:
	
	//gets a new holder
	getNode:function(box, children){
		
		
	},
	
	//finds the smallest axis aligned bounding volume in 3d
	getBound:function( points ){
		//what should starting min and max values be?
		var x1, x2, y1, y2, z1, z2;
		
		for(var p = 0; p < points.length; p++){
			
			if(!x1 || p.x < x1) x1 = p.x;
			if(!x2 || p.x > x2) x2 = p.x;
			
			if(!y1 || p.y < y1) y1 = p.y;
			if(!y2 || p.y > y2) y2 = p.y;
			
			if(!z1 || p.z < z1) z1 = p.z;
			if(!z2 || p.z > z2) z2 = p.z;
		}
		
	},
	
	//finds the average point of a polygon soup
	getAverage:function( points ){
		var t = {x:0, y:0, z:0};
		for(var i = 0; i < points.length; i++){
			
			t.x += points[i].x;
			t.y += points[i].y;
			t.z += points[i].z;
		}
		
		return {x:t.x / points.length, y:t.y / points.length, z:t.z / points.length };
	},
	
	//TODO we still need to select the proper box out of the ones we have
	selectBox:function(){
		//traverse whatever structure we have in place to find the right bucket
		
	},
	
	
	
	//simply returns the time that a ray intersects a box, if it does at all.
	testBox:function(l1, l2, b1, b2){
		
		//we test for slab consistency across the 3 planes
		var dims = ['x', 'y', 'z'];
		var min, max, t1, t2, dt, d, swap;
		
		
		for(var i = 0; i < dims.length; i ++){
			d = dims[i];
			
			dt = 1 / ( l2[d] - l1[d] ); //dt is sometimes 0
			
			//find the times when the ray intersects these extents
			//i = l1 + dt * ti    ->    i - l1 = dt * ti ->   ti = ( i - l1 ) / dt
			
			t1 = (b1[d] - l1[d]) * dt;
			t2 = (b2[d] - l1[d]) * dt;
			
			if(t2 < t1){
				swap = t1;
				t1 = t2;
				t2 = swap;
			}
			
			min = (min)? Math.max(min, t1) : t1;
			max = (max)? Math.min(max, t2) : t2;
			
			//no intersection
			if(max < min) return false;
		}
		
		
		return {
			x:l1.x + (l2.x - l1.x) * min,
			y:l1.y + (l2.y - l1.y) * min,
			z:l1.z + (l2.z - l1.z) * min
		};
	}
	
}