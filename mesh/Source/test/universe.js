requirejs.config({
    baseUrl: '../Source/'
});

require(['haze'], function(){

			//TODO this hsould all be moved to a seperate test file not just inline here
	
	//there isn't any structure to this at all, I just use it as a test structure.
	
	window.screenSize = new Haze.meta.M.Vec(0,0);
	
	var canvas2d = document.getElementById("view-2d").firstChild, canvas3d = document.getElementById("view-3d").firstChild, canvasMap;
	
	

	window.graphSystem = new Haze();
	
	
	//you can use a Haze handler function to add a surface and get a reference
	window.surface2d = graphSystem.addSurface({canvas:canvas2d, keepElements:true}, 'view-2d');
	
	//or create one yourself then register it
	window.surface3d = new Haze.meta.Surface({canvas:canvas3d, keepElements:true});
	graphSystem.addSurface(surface3d, 'view-3d');
	
	window.testPattern = new Haze.meta.Pattern({source: '../gtest.png',repeat: 'repeat'});
	
	
	window.testGradient = new Haze.meta.Gradient({type:"Linear", pos:{x:0,y:0}, size:{x:300,y:300}});
	testGradient.colorStops.push({pos:0, color:"red"},{pos:0.5, color:"white"},{pos:1, color:"blue"});
	
	
	window.radialGradient = new Haze.meta.Gradient({type:"Radial", pos:{x:80,y:40}, size:{x:0,y:0}, r1:5, r2:20});
	radialGradient.colorStops.push({pos:0, color:"black"},{pos:0.5, color:"purple"}, { pos:1, color:"rgba(0,0,0,0)"});
	
	
	window.tileBackground = surface2d.add('Rect', {pos:{x:10, y:10}, size:{x:100,y:100}, fillStyle:testGradient, borderStyle:testPattern});
	
	window.e = surface2d.add('Text', {textContent:"hello world", pos:{x:0, y :30}, fillStyle:testGradient, borderStyle:testPattern });
	window.f = surface2d.add(new graphSystem.Text({textContent:"hello mars", pos:{x:50, y:60}, pivot:{x:50, y:60}, rot:Math.PI / 8}));
	window.r = surface2d.add('Rect', {pos:{x:0, y:0}, size:{x:30, y:30}, fillStyle:testPattern});
	
	
	window.c = surface2d.add('Rect', {pos:{x:60, y:20}, size:{x:40,y:40}, fillStyle:radialGradient});
	
	
	window.p = surface2d.add('Polygon', {pos:{x:200,y:100}, fillStyle:"green", borderStyle:"purple",points:[{x:0,y:0},{x:10,y:-30},{x:40,y:40},{x:20,y:30}]});
	
	
	window.cube3d = surface2d.add( new Haze.meta.FakeCube({fillStyle:"rgba(255,0,0,0.5)", pos:{x:300, y:60}}));
	window.mesh = surface2d.add('Mesh', {pos:{x:400, y:90}}, {vertices:[{x:0,y:0,z:1,c:"red"},{x:30,y:30, z:10, c:"green"}, {x:0, y:80, z:10, c:"blue"}, {x:50, y:20, z:40, c:"pink"}], view:screenSize});
	
	//mesh.originalVertices =  Haze.meta.M.toPrism( Haze.meta.M.shape2d.star(5,100), 30 ).map(function(p){p.z -=25; p.c = "yellow"; p.w = 1; return p;});
	mesh.originalVertices = Haze.meta.M.shape2d.star(5,100).map(function(p){p.z =5; p.c = "yellow"; p.w = 1; return p;});
	
	mesh.rotationAngle = 0;
	
	window.cube2 = surface2d.add('Mesh', {pos:{x:500, y:90} ,shouldClose:false}, {vertices:[]});
	
	cube2.vertices =  Haze.meta.M.toPrism( Haze.meta.M.shape2d.polygon(4,60), 40).map(function(p){p.z += 60; p.c = "green"; return p;});
	cube2.rotationMatrix = Haze.meta.M.Mat4.getRotationMatrix(30,30,30);
	cube2.vertices = Haze.meta.M.shape3d.cube(5).map(function(p){var n = p; return n;} );
	
	
	var scaleFactor = 2;
	
	function onWindowResize( e ){
		canvas2d.width = canvas2d.offsetWidth / scaleFactor, canvas2d.height = canvas2d.offsetHeight / scaleFactor;
		
		window.screenSize = new Haze.meta.M.Vec(canvas2d.width, canvas2d.height);
	};
	
	testPattern.whenLoaded(function(){ document.body.appendChild(testPattern.getTransformed() ); document.body.appendChild(testPattern.getTransformed().canvasBefore) });
	
	
	var timeBefore, timeNow, delta;
	function loop( timeStamp ) {
		if(!timeBefore) timeBefore = timeStamp;
		timeNow = timeStamp;
		delta =  (timeNow - timeBefore) / 1000;
		
		
		update(delta);
		
		
		timeBefore = timeNow;
		requestAnimationFrame(loop);
	}
	window.loop = loop;
	
	
	
	
	
	var xSpeed = 80;
	var ySpeed = 80;
	function update(delta){
		
		surface2d.paint();
		e.pos.x+= delta * xSpeed;
		e.pos.y += delta * ySpeed;
		
		r.rot += 10*delta;
		
		if(e.pos.x < 0) {xSpeed = -xSpeed; e.pos.x = 0;};
		if(e.pos.x + e.measure().width > surface2d.canvas.width){ xSpeed = -xSpeed; e.pos.x = surface2d.canvas.width - e.measure().width};
		
		if(e.pos.y > surface2d.canvas.height){ySpeed = -ySpeed;e.pos.y = surface2d.canvas.height;};
		if(e.pos.y < 0){ySpeed = -ySpeed; e.pos.y = 0;};
		
		
		for(var i in p.points){
			p.points[i] = p.points[i].rotate(0, 0, Math.PI / 180 * Math.random() * 400 * delta);
		}
		
		
		mesh.rotationAngle += 1 * delta;
		mesh.rotationMatrix = graphSystem.M.Mat4.getRotationMatrix(mesh.rotationAngle, 0, 0);
		mesh.translationMatrix = new graphSystem.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,50, 0,0,0,1]);
		mesh.vertices = [];
		var vertex, intermediate;
		for(var i = 0; i < mesh.originalVertices.length; i++){
			
			vertex = mesh.originalVertices[i], intermediate = mesh.translationMatrix.multiply(mesh.rotationMatrix).multiplyVector(new graphSystem.M.Point3(vertex.x, vertex.y, vertex.z));
			
			mesh.vertices.push({x:intermediate.x, y:intermediate.y, z:intermediate.z, c:vertex.c});
		}
		
		
		var translationMatrix = new graphSystem.M.Mat4([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		//cube2.matrices.push (translationMatrix.multiply ( graphSystem.M.Mat4.getRotationMatrix(mesh.rotationAngle / 3, mesh.rotationAngle / 3, mesh.rotationAngle / 3) ) );
	}
	
	
	
	var input = {};
	
	function onMouseMove(event){
		
		r.pos.x = (event.clientX - this.offsetLeft)/ scaleFactor - r.size.x / 2;
		r.pos.y = (event.clientY - this.offsetTop) / scaleFactor - r.size.y / 2;
		
		r.piv.x = (event.clientX - this.offsetLeft)/ scaleFactor;
		r.piv.y = (event.clientY - this.offsetTop) / scaleFactor;
		
		
		input.mouse = {
			x: event.clientX,
			y: event.clientY
		}
		
	};
	
	
	
	requestAnimationFrame(loop);
	window.addEventListener('resize', onWindowResize);
	canvas2d.addEventListener('mousemove', onMouseMove);
	//canvas2d.addEventListener('mousedown', function(){r.fillStyle = "white"});
	//canvas2d.addEventListener('mouseup', function(){r.fillStyle = "purple"});
	onWindowResize();
	

});