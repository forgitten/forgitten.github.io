(function(){
	//requires vec2.js
	
	
	
	//TODO ball on wall collision behaves funny because mass doesnt work correctly.
	//TODO kindof lacks structure
	

	
	
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
		this.pos = new Vec(settings.pos.x, settings.pos.y);
		this.speed = new Vec(settings.speed.x, settings.speed.y);
		this.acc;
	};
	
	ICollider.prototype = {
		step:function(t){
			t = t||1;
		},
		
		move:function(xAmount, yAmount, abs = false){
			//some objects like polygons have a lot of points, and its not safe to just edit their positions
			//in theory its possible to always recalculate an object's properties on every part of the tests
			//-for example in the case of a polygon you could regenerate its vertices from its position every frame
			//but this is not efficient
			if (abs){
				this.pos = new Vec(xAmount, yAmount);
			}else{
				this.pos = this.pos.add(new Vec(xAmount, yAmount));
			}
			
		}
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//TODO right now POS does nothing
	
	//Lines are theoretically jank because if they rotate then they can fast travel - probably better used statically
	//if you want long rigid shapes use polygons.
	function Line(x1, y1, x2, y2, settings){
		ICollider.apply(this, [settings]);
		this.p1 = new Vec(x1, y1), this.p2 = new Vec(x2, y2);
		
		this.filled  = 0; //-1 for left, 1 for right
		this.capped = true;
	}
	Line.prototype = Object.create(ICollider);
	
	extend (Line.prototype, {
		violation:function( s ){
			if(s instanceof Sphere){
				return this.violationSphere( s );
			}else if(s instanceof Line){
				return this.violationLine( s );
			}else{
				throw "unknown collider type";
			}
		},
		
		
		
		//TODO write test
		violationSphere:function(c){
			//to check if the circle intersects the line, perform a dot product on a ray perpendicular to the circle
			//and see if the distance between the circle center and projected point is smaller than the radius
			
			//if the line is capped then also poll for the distance to the endpoints incase it needs to be moved out that direction
			//if the line is filled on one side then always move it out that way
			var normalized = this.p2.subtract(this.p1).normalize(), perpendicular = new Vec(normalized.y, -normalized.x);
			var myShadow = perpendicular.dot(this.p2), intersectPoint = perpendicular.multiply(myShadow);//doesn't matter which point
			var cShadow = perpendicular.dot(c.pos), cPoint = perpendicular.multiply(cShadow);
			
			return cShadow - myShadow - c.radius;
		},
		violationLine:function(){},
		
		move(x, y, static = false){
			this.p1 = this.p1.add(new Vec(x, y));
			this.p2 = this.p2.add(new Vec(x, y));
		}
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	function Sphere(settings){
		ICollider.apply(this, arguments);
		
		this.radius = settings.radius;
		
	};
	Sphere.prototype = Object.create(ICollider.prototype);
	
	
	//takes two spheres and moves them equal amounts so they arent colliding anymore
	//then applies friction
	//TODO this could be applied to any primitive test as long as it returns the same format of violation.
	Sphere.tempHandleSphere = function(s1, s2){
		if(s2 instanceof Line){
			var temp = s2;
			s2 = s1;
			s1 = temp;
			
			
		};		
		var inside = s1.violation(s2);//how far they are inside eachother
		var massDiff = s1.mass / (s1.mass + s2.mass);
		
		if(inside > 0) return; 
		
		
		var v = new Vec(s2.pos.x - s1.pos.x, s2.pos.y - s1.pos.y).normalize();//vector between them
		
		
		//TODO I may have the mass reversed. need unit test.
		ICollider.prototype.move.call(s1, v.x * inside * (1 - massDiff), v.y * inside * (1 - massDiff));
		ICollider.prototype.move.call(s2, -v.x * inside * massDiff, -v.y * inside * massDiff);
		
		//at this point they should no longer be contacting
		//TODO mirror their velocities
		var pv = new Vec(v.y,-v.x);//perpendicular to line between them, normalized
		
		var velMag = s1.speed.magnitude() + s2.speed.magnitude();
		
		//todo this is not actually adding their velocities or whatever just guessing
		s1.speed = new Vec(s1.speed.x, s1.speed.y).mirror(v).normalize().multiply(velMag * (1 - massDiff));
		s2.speed = new Vec(s2.speed.x, s2.speed.y).mirror(v).normalize().multiply(velMag * massDiff);
	};
	
	
	extend( Sphere.prototype, {
		
		//returns how far the two object's colliders are from eachother.
		violation:function(sphere){
			if(dx == dy == 0) return 0;
			var dx = this.pos.x - sphere.pos.x, dy = this.pos.y - sphere.pos.y,
			d = Math.sqrt(dx * dx + dy * dy);
			
			return d - (this.radius + sphere.radius);
		},
		
		isColliding:function(sphere){//somethings wrong
			var dx = this.pos.x - sphere.pos.x, dy = this.pos.y - sphere.pos.y, d = dx * dx + dy * dy;
			return d < this.radius * this.radius  + sphere.radius * sphere.radius;
		},
		move:ICollider.prototype.move
		
	});
	
	
	
	
	
	window.Sphere = Sphere;
	window.Line = Line;
})()