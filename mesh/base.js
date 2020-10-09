/*by Percy 2017*/
//the idea is somewhat like jquery except with more persistent instances.
//having multiple Haze objects would be useful for independent graphical structures.
//even so, a single Haze instance can maintain for its use many seperate DOM objects.
//or you could grab a haze instance and simply use it to do other things as a library.
(function ( scope ){
	
	
	//TODO move all of this to a constructor function so that Haze can become
	function Haze( o ){
		//TODO maybe move all of this to a constructor so I have more options with what this can do
		
		if(!o) o = {};
		
		this.shouldSort = o.shouldSort || false;
		
		//sort is screwey right now
		this.sort = Haze.prototype.sort.mergeSort;
		
		//the lack of a iteratable key->value pair container makes me sad
		this.surfaces = [];
		
		this.surfaceNames = {};
	};
	
	
	Haze.meta = Haze.prototype;
	
	
	
	
	//in a JQuery like build workflow, everything below this point would be a seperate file except for the scope closure, and the minified source would be inserted here
	//its ok to not do this here, so long as I don't need to implement it as a factory
	
	
	
	
	Haze.meta.update = function(){
		
		this.sort && this.sort(this.surfaces, 'zIndex');
		
		this.surfaces && this.surfaces.forEach(function( s ){
			s.paint();
		});
	}
	
	
	
	Haze.meta.addSurface = function( settings, name ){
		
		//if the first argument is an already constructed surface, just use that, otherwise construct new one
		var s = (settings instanceof this.Surface) ? settings : this.getSurface(settings);
		
		this.surfaces.push( s );
		
		if(name) this.surfaceNames[name] = s;
		
		//TODO this does nothing
		this.sort(this.surfaces, 'zIndex');
		
		
		return s;
	};
	
	
	Haze.meta.getSurface = function( settings ){
		
		return new this.Surface( settings );
	};
	
	
	
	scope.Haze = Haze;
})(this);
//define("haze", function(){});

