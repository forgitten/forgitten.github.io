require(['main'], function(){
	
	
	window.worldCamera = new Haze.meta.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
	var worldZ = 0, worldZchange = 5;
	
	
	window.mesh = surface2d.add('Mesh', {pos:{x:400, y:90}}, {vertices:[{x:0,y:0,z:1,c:"red"},{x:30,y:30, z:10, c:"green"}, {x:0, y:80, z:10, c:"blue"}, {x:50, y:20, z:40, c:"pink"}], view:screenSize});
	
	
	mesh.originalVertices = Haze.meta.M.toPrism ( Haze.meta.M.shape2d.star(5,70) ,40 ).map(function(p){p.z -= 20; p.c = "yellow"; p.w = 1; return p;});
	
	mesh.rotationAngle = 0;
	
	window.cube = surface2d.add('Mesh', {pos:{x:500, y:90} ,shouldClose:false}, {vertices:[]});
	
	cube.vertices =  Haze.meta.M.toPrism( Haze.meta.M.shape2d.polygon(4,60), 40).map(function(p){p.z += 60; p.c = "green"; return p;});
	cube.rotationMatrix = Haze.meta.M.Mat4.getRotationMatrix(0,0,30);
	cube.vertices = Haze.meta.M.shape3d.cube(5).map(function(p){var n = p; return n;} );
	
	
	
	window.pointer = surface2d.add('Mesh', {pos:{x:100, y:100} }, {vertices:[{x:-10, y:0, z:0, c:"white"}, {x:-10, y:10, z:0, c:"white"}, {x:-15, y:10, z:0, c:"white"}, {x:0, y:20,z:0,c:"white"}, {x:15, y:10,z:0,c:"white"}, {x:10, y:10, z:0, c:"white"}, {x:10, y:0, z:0, c:"white"}, {x:-10, y:0, z:0, c:"white"}]} );
	
	pointer.orientMatrix  = Haze.meta.M.Mat4.getRotationMatrix(0, 0, Math.PI /180 * 205);
	
	pointer.rollAngle = 0;
	pointer.scale = 0.25;
	pointer.scaleChange = 0.5;
	
	pointer.vertices = Haze.meta.M.toPrism(pointer.vertices, 10);
	
	pointer.vertices.forEach(function( v ){
		v.w = 1;
		v.c = "white";
		var rotated = pointer.orientMatrix.multiplyVector( v );
		
		v.z -= 5;
		//v.x = rotated.x, v.y = rotated.y, v.z = rotated.z;
	});
	
	
	
	
	//im using this shape to test the intersection of screen coordinates
	window.sect = surface2d.add('Mesh', {pos:{x:300, y:120} }, {vertices:[{x:-10, y:0, z:40, c:"red"},{x:10,y:0,z:40,c: "blue"}, {x:10, y:5, z:60, c:"green"}, {x:-10,y:5, z:60, c:"yellow"}]});
	
	sect.movementSpeed = 5;
	sect.update = function( delta ){
		if(arrows.left) this.control({x:-sect.movementSpeed * delta});
		if(arrows.right) this.control({x:sect.movementSpeed * delta});
		
		if(arrows.up) this.control({y:-this.movementSpeed * delta});
		if(arrows.down) this.control({y:this.movementSpeed * delta});
		
		if(arrows.w) this.control({z:this.movementSpeed * delta});
		if(arrows.a) this.control({z:-this.movementSpeed * delta});
	}
	
	
	
	pointer.update = function( delta ){
		this.rollAngle += 0.9 * delta;
		this.scale += pointer.scaleChange * delta;
		
		if(this.scale >0.5) {this.scaleChange = - this.scaleChange; this.scale = 0.5};
		if(this.scale < 0.01) {this.scaleChange = - this.scaleChange; this.scale = 0.01;};
		
		this.rollMatrix = Haze.meta.M.Mat4.getRotationMatrix(0, this.rollAngle, Math.PI /180 * 205);
		this.translateMatrix = new Haze.meta.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1, 30 ,0,0,0,1]);
		this.scaleMatrix = new Haze.meta.M.Mat4([this.scale, 0,0,0, 0, this.scale, 0,0, 0,0,this.scale,0, 0,0,0,1]);
		
		this.matrices = [this.rollMatrix, this.scaleMatrix, this.translateMatrix];
		
		
		this.pos.x = input.mouse.x / window.scaleFactor, this.pos.y = input.mouse.y / window.scaleFactor;
	}
	
	
	window.update = function(delta){
		
		surface2d.context.clearRect(0,0, surface2d.canvas.width, surface2d.canvas.height);
		
		worldZ += delta * worldZchange;
		if(worldZ > 20){worldZ = 20; worldZchange = -worldZchange};
		if(worldZ < -20){worldZ = -20; worldZchange = -worldZchange};
		worldCamera = Haze.meta.M.Mat4.getRotationMatrix(0,0, Math.PI / 180 * worldZ);
		
		surface2d.elements.forEach(function(e){if(e instanceof Haze.meta.Element.Mesh) e.cameraSpace = worldCamera;});
		
		
		
		pointer.update( delta );
		sect.update( delta );
		
		
		
		mesh.rotationAngle += 1 * delta;
		mesh.rotationMatrix = graphSystem.M.Mat4.getRotationMatrix(mesh.rotationAngle, mesh.rotationAngle, 0);
		mesh.translationMatrix = new graphSystem.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,50, 0,0,0,1]);
		mesh.vertices = [];
		var vertex, intermediate;
		for(var i = 0; i < mesh.originalVertices.length; i++){
			
			vertex = mesh.originalVertices[i], intermediate = mesh.translationMatrix.multiply(mesh.rotationMatrix).multiplyVector(new graphSystem.M.Point3(vertex.x, vertex.y, vertex.z));
			
			mesh.vertices.push({x:intermediate.x, y:intermediate.y, z:intermediate.z, c:vertex.c});
		}
		
		
		var translationMatrix = new graphSystem.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); 
	}
	
	
	
	
	
	window.arrows = {left:false, right:false, down:false, up:false, w:false, a:false};
	
	window.addEventListener('keydown', function( e ){
		switch (e.keyCode){
			case 37:
			arrows.left = true;
			break;
			case 38:
			arrows.up = true;
			break;
			case 39:
			arrows.right = true;
			break;
			case 40:
			arrows.down = true;
			break;
			
			case 87:
			arrows.w = true;
			break;
			case 83:
			arrows.a = true;
			break;
		}
	});
	
	
	
	window.addEventListener('keyup', function( e ){
		switch (e.keyCode){
			case 37:
			arrows.left = false;
			break;
			case 38:
			arrows.up = false;
			break;
			case 39:
			arrows.right = false;
			break;
			case 40:
			arrows.down = false;
			break;
			
			case 87:
			arrows.w = false;
			break;
			case 83:
			arrows.a = false;
			break;
		}
	});
	
});