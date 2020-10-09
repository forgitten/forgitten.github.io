define(['math'],function(){

function Quaternian(a, b, c, d){
	this.a = a || 0,
	this.b = b || 0,
	this.c = c || 0,
	this.d = d || 0;
}

Quaternian.prototype = {
	//so we can use rotation matrix
	toMatrix:function(){
		
	},
	
	
	//generates euler angles
	toEuler:function(){
		
	},
	
	//given a vector with an x y and z rotates by this euler
	rotate:function( v ){
		
	}
}



Haze.meta.M.Quaternian = Quaternian;
	
});