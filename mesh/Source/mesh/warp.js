//defines an interface and implementation of interpolation functions used in projecting 3d into 2d with a projective component.

//represents a structure to project back and forth from uv to 3D coordinates
//the base implementation will be a perfect
function Projector(tri, uv){
	//we are mapping the space defined by tri to the 
	
	this.uv;//if a uv exists we will try to map consecutive 
	this.tri;
	
	//we need a vector space under which to map. A triangle may not begin or end at a pixel boundary. I don't see a reason to handle coordinate systems 
	//that aren't axis aligned, but I will 
	
	
}


Projector.prototype = {
	
	get:function(){
		
	},
	
	
	next:function(){
		
	},
	
	
	jump:function(x, y){
		
	}
}



//example of projecting image across 3d polygon
function example(){
	var myImage = new Image('url');
	var canvas = document.createElement('canvas');
	var triangle = [{x:5, y:-3, z:7},{x:4.3, y:-9, z:6.4},{}];
	var p = new Projector(triangle, 0, 1, );
	
	
}