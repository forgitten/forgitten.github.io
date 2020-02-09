(function(){
	//TODO the biggest difficulty will be handling 
	//stacks
	//and multi collisions where 3 ore more objects are intersecting
	
		function ICollision(){
		
	};
	
	
	function CollisionManager(){
		this.colliders;
		this.collisions;
		
		
	};
	
	
	CollisionManager.hookNames = {
		
	};
	
	
	CollisionManager.prototype = {};
	
	
	
	function ICollider(settings){
		
		this.pos = settings.pos;
		this.speed = settings.speed;
		this.acc;
	};
	
	ICollider.prototype = {
		step:function(t){
			t = t||1;
			this.pos.x += this.speed.x * t, this.pos.y += this.speed.y * t;
			this.speed.x += this.acc.x * t, this.speed.y += this.acc.y * t;
		}
	};
	
	
	
	
	function Sphere(settings){
		ICollider.apply(this, arguments);
		
		this.radius = settings.radius;
		
	};
	
	
	//takes two spheres and moves them equal amounts so they arent colliding anymore
	//then applies friction
	Sphere.tempHandleSphere = function(s1, s2){
		var inside = s1.violation(s2);//how far they are inside eachother
		
		if(inside > 0) return; 
		
		
		var v = new Vec(s2.pos.x - s1.pos.x, s2.pos.y - s1.pos.y).normalize();//vector between them
		var vm = Math.sqrt(v.x * v.x + v.y *v.y);
		if (vm == 0 ) throw "0 division";
		s1.pos.x += v.x * inside / 2, s1.pos.y += v.y * inside / 2;
		s2.pos.x -= v.x * inside / 2, s2.pos.y -= v.y * inside / 2;
		
		//at this point they should no longer be contacting
		//TODO mirror their velocities
		var pv = new Vec(v.y,-v.x);//perpendicular to line between them, normalized
		
		s1.speed = new Vec(s1.speed.x, s1.speed.y).mirror(v);
		s2.speed = new Vec(s2.speed.x, s2.speed.y).mirror(v);
	};
	
	
	Sphere.prototype = {
		
		//returns how far the two object's colliders are from eachother.
		violation:function(sphere){
			
			//TODO handle special case of sqrt by 0!
			var dx = this.pos.x - sphere.pos.x, dy = this.pos.y - sphere.pos.y,
			d = Math.sqrt(dx * dx + dy * dy);
			
			return d - (this.radius + sphere.radius);
		},
		
		isColliding:function(sphere){//somethings wrong
			var dx = this.pos.x - sphere.pos.x, dy = this.pos.y - sphere.pos.y, d = dx * dx + dy * dy;
			return d < this.radius * this.radius  + sphere.radius * sphere.radius;
		}
		
	}
	window.Sphere = Sphere;
	
})()