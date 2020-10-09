define( ['shapes', 'math/solids', 'surface'], function(){

/*
* I'm just using this as my fun stuff test dump right now. it isn't anything useful, more a place to test interesting features
*I am working on a more well organized model class, this is just for testing right now ( so I say )
*/

var Element = Haze.meta.Element, Polygon = Haze.meta.Polygon;

//defines a test rotating cube, mostly a toy

function FakeCube( options ){
	Element.call(this, options);
	
	this.size = 30;
	this.perspective = 2;
	this.rotation3d = Math.PI / 180 * 45;
	
	this.pBasis = 0.5;
	//8 vertices
	//all in camera space with 
	this.vertices = [
	/*  [ x,  y,  z]*/
		[-1, -1,  1],//1
		[ 1, -1,  1],//2
		[ 1,  1,  1],//3
		[-1,  1,  1],//4
		
		[-1, -1, -1],//5
		[ 1, -1, -1],//6
		[ 1,  1, -1],//7
		[-1,  1, -1] //8
	];
	
	
	this.faces = [
		[0,1,2,3], //front
		[4,5,1,0], //bottom
		[3,7,4,0], //left
		
		[7,4,5,6], //back
		[6,2,3,7], // top
		[5,1,2,6]  //right
	];
	
	//2d screen coordinates
	this.computedVertices;
}

FakeCube.prototype = Object.create( Polygon.prototype );

FakeCube.prototype.paint = function( context, pos ){
	
	
	this.rotation3d += Math.PI / 180 * 2;
	this.rotationMatrix = new Haze.meta.M.Mat4.getRotationMatrix(this.rotation3d,this.rotation3d,this.rotation3d);
	this.scaleMatrix = new Haze.meta.M.Mat4([1 ,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
	
	//generate 2d screen coordinates from faces
	this.computedVertices = this.vertices.map(function(v){
		
		var p  = this.rotationMatrix.multiply(this.scaleMatrix).multiplyVector(new Haze.meta.M.Vec3(v[0], v[1], v[2] ));
		
		var pComponent =0.5  + 0.5 * (p.z + 1) /2;
		
		//return {x:(p.x * pComponent) * this.size + this.pos.x, y:( v[1] * pComponent)  * this.size + this.pos.y};
		
		return {x:(p.x / pComponent) * this.size + this.pos.x, y:( p.y / pComponent)  * this.size + this.pos.y};
		
	}, this);
	
	
	
	var face, points;
	for(var f = 0; f < this.faces.length; f++){
		face = this.faces[f];
		points = face.map(function(p){return this.computedVertices[p];}, this);
		
		context.beginPath();
		
		
		context.moveTo(points[0].x, points[0].y);
		
		context.lineTo(points[1].x, points[1].y);
		context.lineTo(points[2].x, points[2].y);
		context.lineTo(points[3].x, points[3].y);
		context.lineTo(points[0].x, points[0].y);
		
		context.closePath();
		
		context.stroke();
		context.fill();
	}
	
	
	
};






function Mesh( options, data ){
	//data will be an array of polygon points in order I think
	
	if(!data) data = {};
	Element.call(this, options);
	
	
	this.vertices = data.vertices || [];
	this.vertices.forEach(function( v ){if(!v.c) v.c = "pink"; if (typeof v.z === 'undefined') v.z = -50;});
	
	this.faces;//???
	
	
	this.matrices = [];//a stack of matrices that can be appended by anything and will be multiplied in order
	this.computedVertices;
	
	
	this.fov = options.fov || 60;
	
	this.uvMap;//???
	
	
	this.transform;
	
	this.orthographic = options.orthographic || false;
	
	this.shouldClose = (options.shouldClose === false) ? false :true;
	this.shouldClip = (options.shouldClip === false) ? false :true;
	
	
	//TODO allow free moving camera
	this.cameraSpace;
	
	
	//used to hold position of camera in space for panning
	this.controller = {x:0, y:0, z:0, ax:0, ay:0, az:0};
}

Mesh.prototype = Object.create( Haze.meta.Element.prototype );


Mesh.prototype.projectRound = function( point ){
	if(point.z === 0) return {x:point.x, y:point.y, z:point.z, c:point.c};
	
	var dist = Haze.meta.M.Point3.prototype.magnitude.call( point );
	
	
	var w = this.fov / dist;
	
	return {x:point.x * w ,y: point.y * w, c:point.c};
}


Mesh.prototype.project = function( point ){
	//returns the point after being run through perspective division into x and y values
	
	//we use position and width to define the front plane for projection. models with the same position width and fov would be drawn in the same view space
	
	//BIG ISSUE TODO the 0 division measure is broken, which comes into play a lot worse when clipping since that generates points right on the 0 marker
	//if(point.z === 0)return {x:point.x, y:point.y, z:this.fov, c:point.c};
	
	var w = (point.z === 0) ? this.fov : this.fov / point.z;
	
	
	return {x:point.x * w ,y: point.y * w, z: point.z, c:point.c};
	
},

//basically just allows you to move the points around for debugging purposes
Mesh.prototype.control = function( input ){
	
	if(input.x) this.controller.x += input.x;
	if(input.y) this.controller.y += input.y;
	if(input.z) this.controller.z += input.z;
	//TODO rotation
	
	if(input.ax) this.controller.ax += input.ax;
	if(input.ay) this.controller.ay += input.ay;
	if(input.az) this.controller.az += input.az;
	
	var rotationMatrix = Haze.meta.M.Mat4.getRotationMatrix(this.controller.ax, this.controller.ay, this.controller.az);
	this.controlMatrix = new Haze.meta.M.Mat4([1,0,0,this.controller.x, 0,1,0,this.controller.y, 0,0,1,this.controller.z, 0,0,0,1]);
	
	this.controlMatrix = rotationMatrix.multiply (this.controlMatrix);
}

Mesh.prototype.stackMatrix = function( dump ){
	var matrices = (dump) ? this.matrices : this.matrices.slice();
	//initialize to fresh matrix
	var rolling = new Haze.meta.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]), m;
	
	while(m = matrices.pop()){
		
		rolling = rolling.multiply(m);
		
	}
	
	this.matrix = rolling;
},




	//starting with a point defined by two lines, return a new line that represents that line clipped to the viewport
	//returns an array of two points
	//returns false if entire line falls behind plane
Mesh.prototype.clip = function(p1, p2){
	//assume everything is in the proper coordinate system
	
	//early exit if both points are on same side, or if entire line is obscured
	if(p1.z >= 0 && p2.z >= 0) return [p1, p2];
	if(p1.z < 0 && p2.z < 0) return false;
	
	
	//what time along the entire line does z = 0
	//what do x and y equal when z = 0?
	
	// p1.z + t(p2.z - p1.z) = 0  ->
	var t = -p1.z / (p2.z - p1.z);
	
	var pi = {x: t * (p2.x - p1.x) + p1.x, y: t * (p2.y - p1.y) + p1.y, z:0, c:"white"}; //t * (p2.z - p1.z) + p1.z};
	
	return (p1.z > 0) ? [{x:p1.x, y:p1.y, z:p1.z, c:p1.c},{x:pi.x, y:pi.y, z:pi.z, c:p1.c}] : [{x:pi.x, y:pi.y, z:pi.z, c:pi.c},{x:p2.x, y:p2.y, z:p2.z, c:p2.c}];
	
},



//this function needs to take a point and the point before it, apply the matrices to both, then clip them, leaving out points that fall entirely outside the view space

//this may be finished I need to test it.
Mesh.prototype.clipVertices = function( vertices ){
	
	var after = [];
	
	var myVertices = vertices.slice();
	
	//go through each vertex. assume the last vertex has been added, so only add NEW vertices. if 
	myVertices.forEach(function(tv, index){
		var lv = vertices[( index - 1 + vertices.length ) % vertices.length ];
		
		var clipped = this.clip(lv, tv);
		
		
		if(clipped === false) after.push(undefined);
		
		
		else if(tv.z > 0 && lv.z > 0) after.push({x:tv.x, y:tv.y, z:tv.z, c:tv.c});//if entire line is infront of clipping plane, then push next point.
		
		else if(tv.z < 0){//if line is pointing into camera, add point of entry and break marker
			after.push(clipped[1]);
			after.push(undefined);
		}
		
		else if(tv.z >= 0){//if line is returning into camera, push both entrance point and endpoint
			after.push(clipped[0]);
			after.push(clipped[1]);
		}
		
	}, this);
	
	return after;
}


Mesh.prototype.computeVertices = function(){
	
	//1. apply matrices to get into camera space 2.clip to camera front plane 3. apply projection matrix
	
	if(!this.vertices || this.vertices.length < 1){console.log('no vertices to draw');return;};
	
	if(this.controlMatrix) this.matrices.push(this.controlMatrix);
	
	if(this.cameraSpace) this.matrices.push(this.cameraSpace);
	
	this.stackMatrix( true );
	
	
	//apply matrices into camera space
	var cameraVertices = this.vertices.map(function(v){
		
		
		var p = (this.matrix) ? this.matrix.multiplyVector({x:v.x, y:v.y, z:v.z, c:v.c, w:1}) : v;
		
		p.c = v.c;
		
		return p;
		
	}, this);
	
	
	
	if(this.shouldClip){
		
		cameraVertices = this.clipVertices(cameraVertices);
		
	}
	

	
	
	return cameraVertices.map(function(ov){
		if(!ov) return;
		
		var v = {x:ov.x, y:ov.y, z:ov.z, w:1};
		
		
		
		if(!this.orthographic){
			(this.shouldProjectRound)?v = this.projectRound(v): v = this.project(v);
		}
		
		
		
		
		
		
		//now just translate lmao
		
		v.x += this.pos.x;
		v.y += this.pos.y;
		
		v.c = ov.c, v.w = 1;
		
		
		return v;
	}, this);
}

Mesh.prototype.paint = function(context, pos){
	
	if(!this.vertices || this.vertices.length < 1) {console.log('no vertices to draw');return;};
	
	
	
	this.computedVertices = this.computeVertices();
	
	
	
	
	//this just draws each line in turn
	context.lineWidth = 2;
	
	var p, lp, grad;
	for (var pk = 1; pk < this.computedVertices.length + 1; pk++){
		
		if(pk === this.computedVertices.length && !this.shouldClose) continue;//so that it wont close the mesh
		
		p = this.computedVertices[pk % this.computedVertices.length], lp = this.computedVertices[pk - 1];
		
		if(!p || !lp) continue;
		
		//this isn't a well projected color gradient but it hopefully will give some not awful visual for a wireframe mesh
		grad = context.createLinearGradient(lp.x, lp.y, p.x, p.y);
		grad.addColorStop(0, lp.c);grad.addColorStop(1, p.c);
		
		context.strokeStyle = grad;
		
		context.beginPath();
		
		context.moveTo(lp.x, lp.y);
		context.lineTo(p.x, p.y);
		context.stroke();
		
		context.closePath();
	}
	
	
	if(this.Rasterizer){
		//TODO
	}
}


Mesh.prototype.paintToView = function(){
	if(!this.vertices || this.vertices.length < 1) {console.log('no vertices to draw');return;};
	
	
	
	this.computedVertices = this.computeVertices();
	
	var p, lp;
	for(var i = 1; i < this.computedVertices.length + 1; i++){
		
		
		if(i === this.computedVertices.length && !this.shouldClose) continue;//so that it wont close the mesh
		p = this.computedVertices[i % this.computedVertices.length], lp = this.computedVertices[i - 1];
		
		if(!p || !lp) continue;
		
		
		
		projector.drawLine(Math.floor(lp.x), Math.floor(lp.y), Math.floor(p.x), Math.floor(p.y), p.c);//lp.c);
		
		
	}
	
	
	
}


Mesh.prototype.getAsObject = function(){
	
}


Haze.meta.Mesh = Mesh;
Haze.meta.Element.Mesh = Mesh;


















//TODO a texel picker that could take in a triangle and retreive the correct data from an image. Impractical for sure, but an interesting puzzle
function Rasterizer( options ){
	
	this.texture;//should be array of some kind ig
	
	this.buffer;
	
	if(options.url) this.loadImage(options.url);
}

Rasterizer.prototype = {
	
	drawTri:function(context, a, b, c){// each point should probably have an x, y, z and u v coordinate
		
		//we assume that a b and c are signed integer values, so the resolution is tied to their separation distances.
		switch(this.type){
			case "correct":
				
			break;
			default:
			
			throw "unknown texture type";
		}
	},
	
	
	getSolid:function(){
		
	},
	
	
	loadImage:function( i ){
		var tag = new Image();
		tag.onload = this.toColorArray.bind(this, tag);
		
		tag.src = i;
		
	},
	
	toColorArray:function( tag ){
		var supportCanvas = document.createElement('canvas'), supportContext = supportCanvas.getContext('2d');
		supportCanvas.width = tag.width, supportCanvas.height = tag.height;
			
		supportContext.drawImage(tag, 0,0);
		this.textureData = supportContext.getImageData(0,0, supportCanvas.width, supportCanvas.height);
	}
	
}


Haze.meta.Mesh.Rasterizer = Rasterizer;








function Mandlebrot( options ){
	Haze.meta.Element.call(this, options);
	
}
Mandlebrot.prototype = Object.create(Haze.meta.Element.prototype);



Haze.meta.FakeCube = FakeCube;
Haze.meta.Element.FakeCube = FakeCube;
});