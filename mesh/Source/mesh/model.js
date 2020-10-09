//abstractions for polygon mesh data. Doesn't handle application layer rendering, just scenes, models, and bones
//structs, handles no rendering. Its assumed that these will be created and managed by higher level graphical entities that will send their data to the draw engine
//a seperate rasterizer will take in the polygon mesh scene data and turn it into fragments. Also does not handle interpolating. Allows you to set a model's animation to a specific
//time, a seperate iterator is needed to timestep


//requires a 3d matrix and point representation that allows for standard matrix based transform compositions of scale, rotation and position. Does not handle projective math.
function Scene3d(){
	this.activeCamera;
	this.cameras;
	
	this.models;
	
	this.lights;
	
	this.projection;
	
	this.materials;//a map of textures or materials used by models or vertex groups
}

Scene3d.prototype = {
	add:function( object ){
		
	},
	
	remove:function( object ){
		
	}
}



function Model3d( faces ){
	this.vertices;//an array of each vertex that makes up the model. each array item would be {x:4, y:3.4, z:-5}
	
	this.faces;//a list of keys to vertices that represent the triangles that actually make up the model each face would look like [5, 67, 4]
	
	this.vertexGroups;//i.e. bones, vertex groups can be all rotated
	
	this.animations;//a map of keyframed animations. technically any animation can be applied to any model, but this struct allows a model to keep track of its own as a lookup table
	
	//seperately applied 
	this.scale;
	
	this.rot;
	
	this.pos;
}


Model3d.prototype = {
	
	
	//basically on the model level we just need a bunch of arrays
	toArray:function(){
		
	},
	
	
	setTo( tr1, tr2, t ){//returns the model oriented at the time inbetween either two transformations or its base and 1 transformation. If only one argument is sent, sets to that transform.
		
	}
}


function Animation3d(){//represents a list of snapshots of a set of bones at a specific time. can be applied to a model.
	
	
	this.keyframes;
	
	
}


function Vertex( settings ){
	
	this.x;
	this.y;
	this.z;
	
	this.u;
	this.v;
	
	
	this.tex;//texture could be a color or function to calculate
};