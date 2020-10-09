//tests math functions related to raytracing
require(['../main'], function(){

window.addEventListener('keyup', function(){
	getRandomReflect();
})

window.lines = [
];



window.getRandomReflect = function(){
	var r = function(min = -200, max = 200){ return min + Math.random() * (max - min)};
	surface2d.context.clearRect(0,0, surface2d.canvas.width, surface2d.canvas.height);
	
	lines = [];
	
	var plane = {x:r(), y:r(), z:0};
	var p1 = {x:r(), y:r(), z:0}, p2 = {x:r(), y:r(), z:0};
	
	lines.push({x1:0, y1:0, x2:plane.x, y2:plane.y, c:"red"});
	lines.push({x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y});
	
	var mirrored = RayScene.Math.reflect3(plane, 1, p1, p2), otherPlane = RayScene.Math.getMirror(plane, {x:p2.x - p1.x, y:p2.y - p1.y, z:p2.z - p1.z});
	lines.push({x1:0, y1:0, x2:otherPlane.x, y2:otherPlane.y, c:'pink'});
	lines.push({x1:mirrored.l1.x, y1:mirrored.l1.y, x2:mirrored.l2.x, y2:mirrored.l2.y, c:"green"});
}

getRandomReflect();

window.update = function(){
	
	//we just need some draw visualization
	var l;
	for(var i =0; i < lines.length; i++){
		l = lines[i];
		
		surface2d.context.save();
		if(l.c) surface2d.context.strokeStyle = l.c;
		surface2d.context.beginPath();
	
		surface2d.context.moveTo(l.x1+200, l.y1+200);
		surface2d.context.lineTo(l.x2+200, l.y2+200);
		surface2d.context.stroke();
		
		
		surface2d.context.restore();
	}
}



});