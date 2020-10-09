require(['../main'],function(){
	//tests the clipping and texturing functionality
	
	var renderRect = {x:20,y:10,w:800, h:300}
window.renderRect = renderRect;

var pink = {r:255, g:192, b:203, a:255};

var scale = 3;

//for now we will use a top left rectangle 
window.projector = new View3d({
	screenWidth:renderRect.w,
	screenHeight:renderRect.h,
	depthBufferSize:3,
	clearColor:{r:100, g:100, b:100, a:100}
});
	
	//creates a triangle and draws the clipped version
window.demonstrate3dclip = function(){
	projector.clear();
	var box = {x:50, y:50, z:10, w:80, l:80, h:8}, a = getRandomPoint(), b = getRandomPoint(), c = getRandomPoint();
	
	
	function getRandomPoint(){
		return{
			x: Math.floor( box.x - box.w / 2 + Math.random() * box.w * 2.5 ),//make x and y whole numbers for painting
			y: Math.floor( box.y - box.l / 2 + Math.random() * box.h * 2.5 ),
			z: 0//box.z - box.h / 2 + Math.random() * 40,
		}
	}
	
	var clipped = View3d.math.clipTriangle(a, b, c, box);
	var boxPoints = {//ignore z since this is just for visualizing
		x1:box.x - box.w / 2, x2:box.x + box.w / 2, y1:box.y - box.l / 2, y2:box.y + box.l / 2
	};
	
	//TODO draw original triangle, viewport & clipped triangle. ignore z value for now
	var red = {r:255, g:0, b:0, a:100}, green = {r:0, g:255, b:0, a:100}, blue = {r:0, g:0, b:255, a:100};
	var lines = [
		//clip region
		{x1:boxPoints.x1, y1:boxPoints.y1, x2:boxPoints.x2, y2:boxPoints.y1, c:blue},
		{x1:boxPoints.x1, y1:boxPoints.y1, x2:boxPoints.x1, y2:boxPoints.y2, c:blue},
		{x1:boxPoints.x1, y1:boxPoints.y2, x2:boxPoints.x2, y2:boxPoints.y2, c:blue},
		{x1:boxPoints.x2, y1:boxPoints.y1, x2:boxPoints.x2, y2:boxPoints.y2, c:blue},
		//original triangle
		{x1:a.x, y1:a.y, x2:b.x, y2:b.y, c:red},
		{x1:b.x, y1:b.y, x2:c.x, y2:c.y, c:red},
		{x1:c.x, y1:c.y, x2:a.x, y2:a.y, c:red}
	];
	//clipped triangle
	
	var p, q;
	for(var i = 1; i < clipped.length + 1; i++){
		p = clipped[i - 1], q = clipped[i % clipped.length];
		lines.push({x1:Math.round(p.x), y1:Math.round(p.y), x2:Math.round(q.x), y2:Math.round(q.y), c:green});
	}
	
	
	lines.forEach(function(l){
		projector.drawLine(l.x1, l.y1, l.x2, l.y2, l.c);
	});
	
	return clipped;
}
	
	
window.clipped = demonstrate3dclip();
	
window.update = function(delta){
	View3d.renderWithImageData(surface2d.canvas.getContext('2d'), projector.blendAlpha(), renderRect, {x:renderRect.x, y:renderRect.y, w:renderRect.w * scale, h:renderRect.h * scale}, projector.clearColor);
	
	
	View3d.tempRender(surface2d.canvas.getContext('2d'), projector.blendAlpha(), {x:renderRect.x * 8 + 800, y:renderRect.y + 100, w:renderRect.w, h:renderRect.h}, projector.clearColor);
		
		
}
	
	


window.addEventListener('mousedown', ( e )=>{
	window.clipped = demonstrate3dclip();
});
	
	
	
});