(function(){
	
	
	//TODO kindof lacks structure
	
	//requires vec2.js
	
	
	//TODO the biggest difficulty will be handling 
	//stacks
	//and multi collisions where 3 or more objects are intersecting
	
	
		//unused right now
		function ICollision(){
			//remember an intersection doesnt always happen point to point, it could be full wall to wall!
			this.point;
			//how far they were inside eachother
			this.insideDistance;
			this.normal;
			this.actors;
			//intended to match the combined collision speeds, can be used for e.g. how loud the sound is, how much particle effect
			this.volume;
		};
	
	
	function CollisionManager(){
		this.colliders;
		this.collisions;
		
		
	};
	
	
	CollisionManager.hookNames = {
		//these are parts of the collision manager that are expected to be user overwritten.
		//the important one is how collisions are handled, by default they will just bounce.
	};
	
	
	CollisionManager.prototype = {
		filter(){//generate a list of potential pair intersections while removing impossible ones
			
		},
		
		
		
		bounce:function(a, b, data){//assuming the collision is resolved, flip the two object's velocities and apply friction
			
		
			
		}
		
	};
	
	
	
	function ICollider(settings){
		
		this.friction;
		this.mass = settings.mass || 1;
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
	
	
	
	
	function Line(){
		
	}
	
	Line.prototype = {
		
	};
	
	
	
	
	
	function Sphere(settings){
		ICollider.apply(this, arguments);
		
		this.radius = settings.radius;
		
	};
	
	
	//takes two spheres and moves them equal amounts so they arent colliding anymore
	//then applies friction
	Sphere.tempHandleSphere = function(s1, s2){
		var inside = s1.violation(s2);//how far they are inside eachother
		var massDiff = s1.mass / (s1.mass + s2.mass);
		
		if(inside > 0) return; 
		
		
		var v = new Vec(s2.pos.x - s1.pos.x, s2.pos.y - s1.pos.y).normalize();//vector between them
		var vm = Math.sqrt(v.x * v.x + v.y *v.y);
		if (vm == 0 ) throw "0 division";
		
		
		//TODO add Mass calculations
		s1.pos.x += v.x * inside * massDiff, s1.pos.y += v.y * inside * massDiff;
		s2.pos.x -= v.x * inside * (1 - massDiff), s2.pos.y -= v.y * inside * (1 - massDiff);
		
		//s1.pos.x += v.x * inside / 2, s1.pos.y += v.y * inside / 2;
		//s2.pos.x -= v.x * inside / 2, s2.pos.y -= v.y * inside / 2;
		
		
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