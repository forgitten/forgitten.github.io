require(['main'], function(){
var renderRect = {x:20,y:10,w:1080, h:640}
window.renderRect = renderRect;

var pink = [255, 192, 203, 255];

var scale = 3;

//for now we will use a top left rectangle 
window.projector = new View3d({
	screenWidth:renderRect.w,
	screenHeight:renderRect.h,
	depthBufferSize:-1,
	clearColor:[100, 100, 100, 100]
});

window.cube = surface2d.add('Mesh', {pos:{x:100, y:90} ,shouldClose:false}, {vertices:[]});
	cube.angle = 0.01;
	cube.vertices = Haze.meta.M.shape3d.cube(3).map(function(p){var n = p; n.z += 0.2; n.c = [0, 255, 0, 100];return n;} );
	cube.vertices[0].c = [255, 0, 0, 255];
	cube.paint = function(){};
	
	
	
window.star = surface2d.add('Mesh', {pos:{x:100, y:90}}, {vertices:[{x:0,y:0,z:1,c:"red"},{x:30,y:30, z:10, c:"green"}, {x:0, y:80, z:10, c:"blue"}, {x:50, y:20, z:40, c:"pink"}], view:screenSize});
	
	
	star.vertices = Haze.meta.M.toPrism ( Haze.meta.M.shape2d.star(5,10) ,5 ).map(function(p){p.z += 6; p.c = [0, 100, 155, 155]; p.w = 1; return p;});	
	
star.paint = function(){};
	
var triangle = [
	{x:1, y:1},
	{x:2, y:9},
	{x:8, y:5}
]



window.demonstrate3dIntersect = function(){
	
	var l1 = getRandomPoint(), l2 = getRandomPoint(), pv = getRandomPoint();
	l1.z = l2.z = pv.z = 0;
	
	var plane = new View3d.math.Plane(pv, Math.random());
	
	var p = plane.intersectLine(l1, l2);
	
	//TODO get some sort of visual of plane
	
	projector.drawLine(Math.floor( l1.x) , Math.floor( l1.y) , Math.floor( l2.x) , Math.floor(l2.y), pink);
	
}



window.demonstrate3dMirror = function(){
		var l1 = getRandomPoint(), l2 = getRandomPoint();
	
	var p = projector.math.reflect3(l1, l2 );//TODO fix input set
	
	//TODO get some sort of visual of plane
	
	projector.drawLine(Math.floor( l1.x) , Math.floor( l1.y) , Math.floor( l2.x) , Math.floor(l2.y), pink);
}






function getRandomPoint(is3d){ return { x:  Math.round ( Math.random() * (renderRect.w -1)), y : Math.round ( Math.random() * (renderRect.h -1))}};
//function moveRandomPoint(x, y){ switch(Math.round( Math.random() * 8 )){} };


window.line = {x1:getRandomPoint().x, y1:getRandomPoint().x, x2:getRandomPoint().y, y2:getRandomPoint().y};
//window.line = {x1:0, y1:0, x2:1, y2:1};

projector.drawTri(triangle[0], triangle[1], triangle[2]);
//projector.drawLine(line.x1, line.y1, line.x2, line.y2, {r:255, g:0, b:0, a:100});

window.cursor = {x:0,y:0, speed:0.5}






window.update = function( delta ){
	
	if(typeof skipDraw !== 'undefined' && skipDraw === true) return;
	
	
	//window.line = {x1:getRandomPoint().x, y1:getRandomPoint().x, x2:getRandomPoint().y, y2:getRandomPoint().y};
	//projector.drawTest();
	
	 //demonstrate3dIntersect();
	//var canvasPoint = surface2d.canvasPoint(input.mouse.x, input.mouse.y);
	//var mousePoint = getProjectorPixel(canvasPoint.x, canvasPoint.y);
	//projector.placePoint(mousePoint.x, mousePoint.y, {r:255, g:0, b:0, a:255});
	projector.clear();
	projector.pixels = projector.getPixels();
	
	//projector.drawLine(0,0,5, 5, {r:255, g:0, b:0, a:255});
	
	cube.angle += 0.8 * delta; 
	cube.rotationMat = Haze.meta.M.Mat4.getRotationMatrix(cube.angle,cube.angle,cube.angle);
	cube.matrices.push(cube.rotationMat);
	star.matrices.push(cube.rotationMat);
	cube.rotationMat.a[11] = 2.5;
	cube.paintToView();
	star.paintToView();
	
	drawCursor(Math.floor(cursor.x), Math.floor(cursor.y));
	
	
	//projector.placePoint(renderRect.w, renderRect.h-1, pink);
	
	projector.pixels = projector.getPixels();
	//View3d.renderWithImageData(surface2d.canvas.getContext('2d'), projector.pixels, renderRect, {x:renderRect.x, y:renderRect.y, w:renderRect.w * scale, h:renderRect.h * scale}, projector.clearColor);
	
	
	View3d.tempRender(surface2d.canvas.getContext('2d'), projector.pixels, {x:renderRect.x * 8 + 1, y:renderRect.y + 1, w:renderRect.w, h:renderRect.h}, projector.clearColor);
	//View3d.tempRender(surface2d.canvas.getContext('2d'), projector.blendAlpha(), {x:renderRect.x * 8 + 800, y:renderRect.y + 100, w:renderRect.w, h:renderRect.h}, projector.clearColor);
	
	
	
	
	//View3d.tempRenderScale(surface2d.canvas.getContext('2d'), projector.pixels, renderRect, {x:renderRect.x + 210, y:renderRect.y, w:renderRect.w * scale, h:renderRect.h * scale}, projector.clearColor);
	
}



//this function allows you to query where the mouse is in comparison to the projector screen area
window.getProjectorPixel = function(x, y){
	
	
	x -= renderRect.x, y -= renderRect.y;
	return {
		x: Math.floor( x / scale),
		y: Math.floor( y / scale)
	};
	
}


//draws a 2d cursor visual
window.drawCursor = function(x, y){
	var points = [x, y, x-1, y, x, y-1, x+1, y, x, y+1];
	
	for(var i = 0; i < points.length;  i+= 2){
		projector.placePoint(points[i], points[i + 1], [255, 0, 255, 250], 100);
	}
}


window.rotate = function(){
	cube.angle += 0.001;
}

})