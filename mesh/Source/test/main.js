//sets up a test environment that can be used for smaller examples
requirejs.config({
    baseUrl: ''
});

define(['haze', 'debug/console'], function(){
	
	window.screenSize = new Haze.meta.M.Vec(0,0);
	
	var canvas2d = document.getElementById("view-2d").firstChild, canvas3d = document.getElementById("view-3d").firstChild, canvasMap;
	

	window.graphSystem = new Haze();
	
	
	//you can use a Haze handler function to add a surface and get a reference
	window.surface2d = graphSystem.addSurface({canvas:canvas2d, keepElements:true}, 'view-2d');
	
	//or create one yourself then register it
	window.surface3d = new Haze.meta.Surface({canvas:canvas3d, keepElements:true});
	graphSystem.addSurface(surface3d, 'view-3d');
	
	
	window.surfaceUI = graphSystem.addSurface({canvas:canvas2d, keepElements:true}, 'surfaceUI');
	
	
	window.debugConsole = new DebugConsole( surface2d.canvas );
	
	window.scaleFactor = 1;
	
	function onWindowResize( e ){
		canvas2d.width = canvas2d.offsetWidth / scaleFactor, canvas2d.height = canvas2d.offsetHeight / scaleFactor;
		
		window.screenSize = new Haze.meta.M.Vec(canvas2d.width, canvas2d.height);
	};
	
	window.onWindowResize = onWindowResize;
	
	
	var timeBefore, timeNow, delta;
	function loop( timeStamp ) {
		if(!timeBefore) timeBefore = timeStamp;
		timeNow = timeStamp;
		delta =  (timeNow - timeBefore) / 1000;
		
		
		
		if( typeof update !== 'undefined')update(delta);
		surface2d.paint();
		//debugConsole.draw();
		
		timeBefore = timeNow;
		requestAnimationFrame(loop);
	}
	window.loop = loop;
	
	var exampleInput = {mouse:{x:0,y:0, down:true, clicked:true, released: false}};
	window.input = {mouse:{x:0,y:0,down:false, clicked:false, released:false}};
	input.keys = {};
	
	//a map of keys in their corresponding keycode position
	input.keyCodes = [];
	
	input.keys = {};
	input.keyCodes.forEach(function(k){
		//set all keys to off
		
		input.keys[k];
	});
	
	input.down = function( key ){
		return this.keys[key] === true;
	}
	input.pressed = function( key ){
		//TODO
	}
	
	input.onKeyDown = function( e ){
		if (!this.keys[e.key]) this.keys[e.key] = true;
	}
	
	input.onKeyUp = function( e ){
		if(this.keys[e.key]) delete this.keys[e.key];
	}
	
	input.onMouseMove = function( e ){
		
		this.mouse = {
			x: e.clientX,
			y: e.clientY
		}
		
	}
	
	window.addEventListener('keydown', input.onKeyDown.bind(input));
	window.addEventListener('keyup', input.onKeyUp.bind(input));
	window.addEventListener('mousemove', input.onMouseMove.bind(input));
	//window.addEventListener('');
	window.addEventListener('resize', onWindowResize);
	requestAnimationFrame(loop);
	onWindowResize();
	

});