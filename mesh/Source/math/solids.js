define(['math'], function(){
var M = Haze.meta.M;

M.to3d = function(points, plane ){
	//TODO maybe allow projection onto plane
	
	points.map(function(p){p.z = 0; return p});
}

//generates a 3d prism from a 2d closed shape
M.toPrism = function( points, height ){
	
	var newPoints = [], point, nextPoint;
	
	
	var startHeight;
	
	for(var i = 0; i < points.length; i++){
		
		
		point = points[i], nextPoint = points[(i + 1) % points.length];
		
		
		startHeight = point.z || 0;
		endHeight = height + startHeight;
		
		
		
		newPoints.push(new M.Point3(point.x, point.y, startHeight));
		
		newPoints.push(new M.Point3(nextPoint.x, nextPoint.y, startHeight));
		
		newPoints.push(new M.Point3(point.x, point.y, endHeight));
		
		newPoints.push(new M.Point3(nextPoint.x, nextPoint.y, endHeight));
		
		newPoints.push(new M.Point3(nextPoint.x, nextPoint.y, startHeight));
	}
	
	return newPoints;
};

var shape2d = {
	polygon:function(sides, radius, offset){
		
		var interval = Math.PI * 2 / sides, offset = offset || 0, sin, cos, angle, points = [];
		
		
		for(var i = 0; i < sides; i++){
			
			angle = i * interval + offset, sin = Math.sin( angle ), cos = Math.cos( angle );
			
			points.push(new M.Vec(sin * radius, cos * radius ));
			
		}
		
		
		return points;
	},
	
	star:function( vCount, radius, innerRadius){
		var interval = Math.PI * 2 / vCount, points = [], i = 0, sin, cos, angle, iSin, iCos, iAngle;
	
		if(!innerRadius ) innerRadius = radius / 2;
	
		while(i < vCount){
		
			angle = i * interval, sin = Math.sin( angle), cos = Math.cos( angle );
			iAngle = angle + interval / 2, iSin = Math.sin(iAngle), iCos = Math.cos(iAngle);
		
			points.push(new M.Vec(sin * radius, cos * radius  ));
			points.push(new M.Vec(iSin * innerRadius, iCos * innerRadius  ));
		
			i++;
		}
	
		return points;
	}
	
	
	
};



var shape3d = {
	cube:function( size ){
		var halfSize = size / 2;
		
		var points = [
			new M.Vec3( -halfSize, -halfSize, -halfSize ), //left top back
			new M.Vec3(  halfSize, -halfSize, -halfSize ), //right top back
			new M.Vec3(  halfSize,  halfSize, -halfSize ), //right bottom back
			new M.Vec3( -halfSize,  halfSize, -halfSize ), //left bottom back
			
			new M.Vec3( -halfSize,  halfSize, halfSize ), //left bottom front
			new M.Vec3( -halfSize, -halfSize, halfSize ), //left top front
			new M.Vec3(  halfSize, -halfSize, halfSize ), //right top front
			new M.Vec3(  halfSize,  halfSize, halfSize ), //right bottom front
		]
		
		
		var colors = ['red', 'green', 'blue', 'yellow', 'orange', 'aqua', 'pink', 'purple'];
		points.map(function(p, i){p.c = colors[i]});
		
		
		//TODO map poitns
		return ([0,1,2,0,3,2,7,1,6,7,3,4,7,  /*left known to work*/ 5,4,0,5,6,0 ]).map(function(v){var p = points[v].copy(); p.c = points[v].c; return p});
		
		
	},
	
	
	sphereUV:function(slices, rings, size){
		
		for(var i = 0; i < rings.length; i++){
			
		}
	}
	
};


M.shape2d = shape2d;
M.shape3d = shape3d;

})