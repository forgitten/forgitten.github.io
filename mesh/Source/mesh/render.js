//subsystem for rendering polygon models
//does not interact with HTML 5 canvas or the main engine directly, instead returns an array of pixels to draw. (an example canvas function is provided seperately )
//when complete could be altered to work with threejs maybe
//allows you to upscale a raster to a specific size. If you intend to use with normal html 5 canvas functions then do them BEFORE upscaling if you want to keep them at same resolution.
//must be conformant to the opengl style pipeline if not a direct mirror of it - must allow NDC style input and output
//I use planes defined by 3 points because thats how most things will be stored here. Saving planes as normals and dots might be more efficient for optimizing

/*this is how the system works:
* everything eventually calls a single point placement function. a single view holds a single 1d array of pixels, or a buffer of pixel values.
* no specific order of operations is enforced, however if you want to use all the supplied functionality it is assumed you will supply all triangles then draw each frame. This is especially important for alpha blending.
* when a point or point group is introduced into the pipeline it is assumed that it is in camera coordinates.
* the perspective divide matrix (or simple component) is used to convert from world space to viewport space. if you set the width of the perspective to -1 and 1 you will get an NDC conversion.
* when specific groups like triangles are added, the results are clipped to the view space. Because everything is done in software, doing things in batches doesnt really effect speed, though it is better for keeping track of the depth buffer.
*
* After perspective division and clipping is applied, geometry is rasterized into the pixel matrix using the current width and height. Keep in mind that the rasterization is dependent on your current projective components.
*
* The pixel matrix can be set to hold a depth buffer of a fixed or expanding size. Higher indices will be infront of lower ones.
* If alpha blending is turned on then a new matrix will be used containing one value per pixel position based on the blending rule.
* If a pixel is set without a z value it will be assumed  to have a z-index of 0, on the front plane.
*/


/* A note on NDC (normalized device coordinates)
* the GL pipeline uses a perspective matrix that is specifically built to cast values into the -1 to 1 range that are then converted back to the proper device pixels after completion.
* the advantages of NDC are:
* makes clip detection (and response) trivial
* allows scaling back up to target dimensions with pure floating point math
*/


/*A note on alpha blending
* Keeping track of translucency data can be nontrivial when dealing with nested graphics systems. 
* View3d maintains its own depth information, which is important for allowing different blend rules.
* If a View3d instance is set to keep depth information, a fragments z information will be used to 
* For simplicity right now 2d operations such as drawline will be put on the frontplane at z=0.
*/


/*constructor options
* screenHeight - (integer height of output render area)
* screenWidth - (integer width of output render area)
* depthBufferSize - (integer value for how many color values to keep in depth buffer for alpha blending, 1 means dont keep any depth information)
* clearColor - (what a pixel with no color value should be set to. if left undefined, then screen will not be refreshed every frame.)
* perspective - (a matrix needed for converting into 3d)
*drawMode - (which visualization to choose, wireframe, flat or shaded/textured)
*blendRule - (a function that can be used to replace the default alpha blending method)
*depthTesting - (a boolean value that determines whether overlapping fragments will be depth tested.)
*
*/

/*functions:
* batch( triangles, view )  (this takes an array of triangles in and rasterizes them to the current screen buffer with the current settings. )
* placePoint(x, y ,c)  (places the rgba color value c into the position x y, pushing it onto the list if a depthBuffer exists)
* drawTri(a, b, c, buffer)  (using the currently set perspective component renders the triangle defined by the point and color values in a, b, c to output a rendered version of the triangles to buffer, or the current view)
* blendAlpha() (returns the current 2d fragment array converted via the blending rule to a 1d array of rgba values)
*/


/*safe access (values that you can change after creation):
*
*/

function View3d( options ){
	this.safe = true;//if set to safe then stricter error checking may occur
	
	this.screen = {};//screen size data
	
	this.screen.w = options.screenWidth || 100;
	this.screen.h = options.screenHeight || 100;
	this.depthBufferSize = options.depthBufferSize || 0;
	
	this.clearColor = options.clearColor || [255,255,255,255];
	
	this.frameBuffer = new View3d.ListFrame(this.screen, this.depthBufferSize, options.blendRule);
	
	
	this.drawMode = options.drawMode || 'wireframe';//wireframe, flat, texture, aliased
	
	this.blendRule = options.blendRule ? options.blendRule : this.blendAlpha;
	this.depthTesting = (!options.depthTesting) ? false : true;
	
	this.perspective; //a 4d matrix needed for interpolating in 3d properly, or a single value from which a matrix can be composed
	
	this.normalizeRange;//not used yet ?/dont remember what this waas meant to be - maybe during texel conversion?
}


//dump output to canvas for debug
//must convert the format of my render engine, which is currently a 1d ( or 2d with a depth buffer ) array of pixels to the format of html 5 canvas imagedata, which is a 1d array of 0 - 255 values - r0, g0, b0, a0, r1, g1, b1, a1, ...rN, gN, bN, aN

//TODO this function specifically is performing very badly. It seems to cut the fps by a factor of 5 or more. I expect this to be expensive, but not that costly.
View3d.tempRender = function(context, pixels, screenArea, clearColor){
	
	
	//create an imageData object big enough to house the entire pixel array
	var imageData = context.createImageData(screenArea.w, screenArea.h);
	var p, i, maxI = screenArea.w * screenArea.h;
	
	
	//TODO it might be more efficient to paint the entire canvas with the clear color then return
	for(i = 0; i < maxI ; i++ ){
		
		p = pixels[i];
		
		
		//if(p && p[0] && Array.isArray(p[0])) p = p[0];//if a pixel is itself an array, assume its a depth buffer. Later there should be color mixing
		
		if(!p){
			//this line garuntees that the function spends just about the same amount of time on every frame. Its both a blessing and a curse....
			if(clearColor) imageData.data.set(clearColor, i * 4);
		}else{
			imageData.data.set(p, i * 4);
		}
	}
	
	//imageData should be in the correct format. Now push it into the context.
	
	//if a subrectangle of the screen is defined, then constraint it to that.
	context.putImageData(imageData, screenArea.x, screenArea.y, 0, 0, screenArea.w, screenArea.h);
}







//a massive source of confusion for me with HTML 5 canvas is that a <canvas>'s 'width' and 'height' properties are distinct from its actual screen size.
//a <canvas> that takes up 200 pixels of the screen can have its .'width' set to 50. This sounds like it could be used for "low resolution" however
// html 5 gives you no control at all as to how it upscales content (besides images) so you will be stuck with default anti-aliasing, not allowing crisp
// representation of "low resolution" pixel content, which is especially necessary during debugging visuals.
//this function allows mapping of a pixel array to a higher resolution canvas with simple rounding rules. it may do anything on lower resolution canvases.
View3d.tempRenderScale = function(context, pixels, pixelArea, screenArea, clearColor){
	var newPixels = [];
	var stepRatio = {w:pixelArea.w / screenArea.w, h:pixelArea.h / screenArea.h};
	var x, y, p;
	
	//for every point in screenArea, sample the corresponding point in the pixels array
	for(var i = 0; i < screenArea.w; i++){
		for(var j = 0; j< screenArea.h; j++){
			x = Math.floor (i * stepRatio.w) , y = Math.floor(j * stepRatio.h), p = pixels[y * pixelArea.w + x];
			//TODO you could do the same thing with less iterations by going from original pixels to view pixels maybe
			//the biggest issue is how to efficiently fill in the area of an upscaled pixel
			if(p)newPixels[j *screenArea.w + i] = p;
			//this could also be done with calls to fillRect
		}
	}
	
	//pass the upscaled data to the more straightforward one
	View3d.tempRender(context, newPixels, screenArea, clearColor);
}

//places color data in an image, which can be used for texturing or even upscaling with images.
View3d.renderToImage = function(pixels, area, fillColor){
	
	var canvas = document.createElement('canvas'), image = new Image(), context = canvas.getContext('2d');
	canvas.width = area.w, canvas.height = area.h;
	
	View3d.tempRender(canvas.getContext('2d'), pixels, {x:0, y:0, w:area.w, h:area.h}, fillColor);
	
	image.src = canvas.toDataURL();
	return image;
}


//an attempt at upscaling which is less expensive. start by using drawrect on output canvas maybe?
View3d.quickScale = function(context, pixels, pixelArea, screenArea, clearColor){
//TODO

	//instead of going through each 

}

//this is functionally equivalent to tempRenderScale, but uses a dataUrl. It allows html 5 canvas to handle upscaling, which is presumably faster
//but it requires the use of an event listener for when the image "loads" which seems to create inconsistent frame load and render times.
View3d.renderWithImageData = function(context, pixels, pixelArea, screenArea, clearColor){
	var i = View3d.renderToImage(pixels, pixelArea, clearColor);
	
	
	function draw(){
		context.save();
		
		
		context.clearRect(screenArea.x, screenArea.y, screenArea.w, screenArea.h);
		
		//TODO make image upscaling pixelated
		context.imageSmoothingEnabled = false;
		context.drawImage(i, screenArea.x, screenArea.y, screenArea.w, screenArea.h);
		context.restore();
	}
	
	if(i.width > 0 )draw();//a loaded image will have a width
	else i.onload = draw;
	
	
}


//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
//convert a hex color value to rgb 255, 255, 255
View3d.toRGB = function(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



View3d.prototype = {
	
	
	
	
	
	warn:function( m ){
		console.log( m );
	},
	
	
	
	
	
	assert:function(assertion, failureMessage){
		if(safe && !assertion) throw failureMessage ? failureMessage : "assert failed";
	},
	
	
	
	
	
	getState:function(){//TODO should display and return all mutable state variables.
		
		var state = "Right now \n" + 
		
		"safer debug is " + (this.safe ? "on" : "off" ) + "\n" +
		
		"the output screen size is" + this.screen.w + " by " + this.screen.h + "\n" +
		
		"the frame buffer is configured to save " + this.depthBufferSize + " values per screen location"
		;
		
		console.log(state);
		
		return state;
	},
	
	
	placePoint:function(x, y, c, z){
		this.frameBuffer.set(x, y, c, z);
	},
	
	
	
	clear:function(x, y){
		this.frameBuffer.clear(x, y);
	},
	
	
	//places a visual indicator on the viewport to help demonstrate the edges to test the output visual. relies only on placePoint
	//should draw both the edges of the viewport and a square in the center to  test whether the edges are in the right place and whether squares are sized correctly
	drawTest:function(){
		
		//define the lines that make up the viewport
		var w = this.screen.w, h = this.screen.h, quarterWidth = Math.round( (w  - 1)/ 4 ), quarterHeight = Math.round( (h  - 1)/ 4 ),//rounding prevents non integers
		lines = [
			{x1:0, y1:0, x2:w - 1, y2:0},
			{x1:w - 1, y1:0, x2:w - 1, y2:h - 1},
			{x1:w - 1, y1:h - 1, x2:0, y2:h - 1},
			{x1:0, y1:h - 1, x2:0, y2:0},
			
			{x1:0, y1:0, x2:w - 1, y2:h - 1},
			{x1:0, y1:h - 1, x2:w - 1, y2:0},
		],
		red = [255, 0, 0, 255],
		green = [0, 255, 0, 255],
		blue = [0, 0,255,255];
		
		//add lines to mark square
		if( w >= h){
			lines.push(
				{x1: quarterWidth, y1:0, x2: quarterWidth, y2: h},
				{x1:Math.round ( w * 3 / 4), y1:0, x2: Math.round ( w * 3 / 4), y2: h}
			);
		}else{
			lines.push(
				{x1:0, y1:quarterHeight, x2: w - 1, y2: quarterHeight},
				{x1:0, y1:quarterHeight * 3, x2: w - 1, y2: quarterHeight * 3}
			);
		}
		
		//draw all the lines
		
		var l, a, aMax, b, e, de, step, plot;//independent min value, independent max value, dependent min value, error, error change, direction of step
		
		for(var i = 0; i < lines.length; i++){
			l = lines[i];
			
			
			
			
			
			//flip values so x1 is smaller
			//! I suspect that this line actually is saving me because it accounts for the case that x values are equal - my vertical line exception handler doesnt deal with horizontal lines
			if((l.x2 < l.x1 && (Math.abs(l.x2 - l.x1) >= Math.abs(l.y2 - l.y1))) || (l.y2 < l.y1 && (Math.abs(l.x2 - l.x1) <= Math.abs(l.y2 - l.y1)))){
				temp = {x:l.x1, y:l.y1};
				l.x1 = l.x2, l.y1 = l.y2, l.x2 = temp.x, l.y2 = temp.y;
			}
			
		if(l.x1 === l.x2){//handle vertical lines
		
			var x = l.x1, y, ym;
			(l.y1 < l.y2) ? (y = l.y1, ym = l.y2):(y = l.y2, ym = l.y1);
			while (y <= ym){
				this.placePoint(x, y, green);
				y++;
			}
			
			continue;
		}
			
			
			//set up variables
			e = 0;
			
			(l.x2 - l.x1 > l.y2 - l.y1)?
			(
				a = l.x1, aMax = l.x2, b = l.y1, de = Math.abs ( (l.y2 - l.y1) / (l.x2 - l.x1) ), step = Math.sign(l.y2 - l.y1), plot = this.placePoint.bind(this)
			):(
				a = l.y1, aMax = l.y2, b = l.y1, de = Math.abs ( (l.x2 - l.x1) / (l.y2 - l.y1) ), step = Math.sign(l.x2 - l.x1), plot = (function(y, x, c){this.placePoint(x, y , c)}).bind(this)
			)
			
			
			
			while(a <= aMax){
				
				//actual function to plot, preset to flip x and y if necessary
				plot(a, b, red);
				
				e += de;
				a++;
				if(e > 0.5){
					e--;
					b += step;
				}
			}
			
			
		}
		
		
	},
	
	
	
	
	
	drawTri:function(a, b, c, buffer, fragment){//using the current settings rasterize a triangle to the current buffer
		//inbetween the 3 vertices
		
		//steps should be:
		//error check that a b and c are integer valued points and corresponding color or texture values
		//use the w component to supply both divided vertices and an equation to traverse the vertices to sample from
		
		//the end result should be, for each vertex in the affected raster area, a "weight" from each vertex to be used for texture picking
		
		
		
		
		
	},
	
	
	
	
	//more standard breshenham line algorithm
	drawLine:function(x1, y1, x2, y2, c){
	
		//if anything breaks its probably this, easiest debug method is to reverse input points and see if it works then. if it does then this is probably it.
		var tmp;//if necessary swap points in direction of step
		
		//TODO a line with a slope of one does not get reversed
		//I am not sure why the absolute value line requires just a greater than for the first scenario, but a greater than or equal to for the second.
		//it does seem to work, but I don't understand
		if((x2 < x1 && (Math.abs(x2 - x1) > Math.abs(y2 - y1))) || (y2 < y1 && (Math.abs(x2 - x1) <= Math.abs(y2 - y1)))){
			temp = {x:x1, y:y1};
			x1 = x2, y1 = y2, x2 = temp.x, y2 = temp.y;
		}
		
		
		if(x1 === x2){//handle vertical lines
		
			var x = x1, y, ym;
			(y1 < y2) ? (y = y1, ym = y2):(y = y2, ym = y1);
			while (y <= ym){
				this.placePoint(x, y, c);
				y++;
			}
			
			return;
		}
		
		
		//v allows pass by reference essentially - first value is independent, second is dependent
		//figure which is bigger
		
		var a, aMax, b, e = 0, db, de, draw;//db is kept as seperate variable because it determines which "direction" the step takes place in.
		
		 ( Math.abs ( x2 - x1 ) > Math.abs( y2 - y1 ) ) ?(
			a = x1,
			aMax = x2,
			b = y1,
			db = (y2 - y1),
			de = Math.abs ( db / (x2 - x1) ),
			draw = this.placePoint.bind(this)
		 ):(
			a = y1,
			aMax = y2,
			b = x1,
			db = (x2 - x1),
			de = Math.abs (db / (y2 - y1)),
			draw = (function(a, b, c){ this.placePoint(b, a, c) }).bind(this)//if we are stepping through y, swap vars
		 );
		
		
		while( a <= aMax ){
			draw(a, b, c);//draw has already been set to flip variables if necessary
			e += de;
			
			if(e > 1.5) throw "error bound should never get that big!";
			
			if(e > 0.5){
				e--;
				b+= Math.sign(db);
			}
			a++;
		}
		
	},
	
	
	
	
	//this kindof works but is still finicky and inconsistent especially with the length of the end cap portions
	//draws specified line and color, experimental error algorithm
	//the idea is valid but it fails for two reasons - firstt because it requires a damning "if" block on every loop, and second because you have to play around a lot to get the error bound to be set properly in the first place
	drawLine1:function(x1, y1, x2, y2, c){
		//if the points are given in decreasing order just flip them lmao
		var tmp;
		if(x2 < x1){
			temp = {x:x1, y:y1};
			x1 = x2, y1 = y2, x2 = temp.x, y2 = temp.y;
		}
		
		
		
		if(x1 === x2){//handle vertical lines
		
			var x = x1, y, ym;
			(y1 < y2) ? (y = y1, ym = y2):(y = y2, ym = y1);
			while (y <= ym){
				this.placePoint(x, y, c);
				y++;
			}
			
			return;
		}
		
		
		var x = x1, y = y1, dy = (y2 - y1), e = 0, de = dy / (x2 - x1);
		
		
		//this line ensures that if the slope is positive, and the y step is greater than the x step, y is begun on center.
		
		//if(Math.abs ( de )> 1) e += de/2;
		
		//because y behaves separately, I need something to constrain it as well as x, otherwise it might go too far in y
		
		//TODO instead of using an if block, just alternate these values
		var yi, xi;
		
		while(x <= x2 &&  ( (y2 <= y <= y1) || (y2 => y => y1 ))){
			
			
			if(e >= 0.5){
				
				//this is where multiple y points are possibly mapped to a single x one
				e--;
				y+= Math.sign(dy);
				this.placePoint(x, y, c);
				//move to new x
			}else{
				this.placePoint(x, y, c);
				e += Math.abs ( de );
				x++;
			}
		}
		
		
		
	},
	
	
	
	
	
	drawRect:function(x1, y1, x2, y2, size, c){//allows for the drawing of an oriented rectangle by defining a thick line
	
	
		
		
	},
	
	
	//http://www.songho.ca/opengl/gl_projectionmatrix.html
	createProjectionMatrix:function(){//given a far and back plane defined by a width and height assumed to be centered at 0 0 horizontally and vertically, return a matrix that projects a 3d point onto that frustrum's back plane. Does not normalize, or clip at this time. A test at this point.
		//TODO
		
		
		var x;
		
		
	},
	
	
	getPixels:function(){
		return this.frameBuffer.getArray();
	},
	
	
	
	//should be able to return a binary projection of what points are visible form a certain area
	shadowMap:function(){
		
	},
	
	
	//takes in and draws an array of triangles with the currently set projection and buffer settings
	batch:function( tris ){
		//TODO
		
		
	},
	
	mode:function(){//switches draw mixins
		
	}
}














//math utility functions specific to View3d
View3d.math = {
	tolerance: 0.0001,
	
	equals:function(/*a, b, c*/){//applies a tolerance value to equality to account for roundoff error
		
		if(arguments.length <= 0) return;
		
		var l = arguments[0], v;
		for (var i = 1; i < arguments.length; i++){
			v = arguments[i];
			
			if (!isNaN(l) && !isNaN(v) && (Math.abs(v-l) > this.tolerance) )  return false;
			else if((isNaN(l) || isNaN(v)) && l!= v) return false;
			
			
			l = v;
		}
		
	
		return true;
	},
	
	//checks to see if two points are the same
	pointEquals:function(a, b){
		//TODO apply tolerance
		return (a.x === b.x && a.y === b.y);
	},
	
	collinear : function( a, b, c ){//checks if 3 points are on the same line by seeing if their perpendicular dot product is 0
	
		if(this.pointEquals(a,b)||this.pointEquals(b, c)|| this.pointEquals(c, a))throw "at least two points are the same so no line can be formed!";
		
		//change frame of reference, and find perpendicular
		var v0 = {x: b.x - a.x, y:b.y - a.y}, v1 = {x:c.y - a.y, y:-(c.x - a.x)};
		
		//check of dot product of result vectors is within a limit
		
		
		return this.equals(v0.x * v1.x + v0.y * v1.y, 0);
	},
	
	
	//given a triangle defined by 3 noncolinear points,
	//returns one or two triangles with one side horizontal. The return triangles will be both in the same winding as original
	//will not necessarily return same triangle vertex order
	getFlatTriangles:function(a, b, c){
		var tris = [], intersectPoint, top, middle, bottom, winding = this.isClockwise(a, b, c);
		
		//test for degenerate triangles
		if(this.collinear(a, b, c)) throw('triangle points appear to be collinear!');
		
		//test if it already is flat on one side
		if(this.equals(a.y, b.y) || this.equals(b.y, c.y)|| this.equals(c.y, a.y)){
			tris.push([a, b, c]);
		}else{
			//find middle vertex vertically
			(a.y<b.y) ? ((b.y < c.y) ? (bottom = a, middle = c, top = b): (a.y < c.y) ? (bottom = a, middle = c, top = b) : (bottom = c, middle = a, top = b) ) : ((c.y < b.y) ? (bottom = c, middle = b, top = a) : (a.y < c.y) ? (bottom = b, middle = a, top = c) : (bottom = b, middle = c, top = a));
			
			
			//find the point opposite the middle vertex on the line formed by the remaining two points
			//seems to work, needs verification
			var t =  (middle.y - bottom.y) / (top.y - bottom.y );
			intersectPoint = {x: bottom.x + t * (top.x - bottom.x) ,y:middle.y};
			
			
			//reconstruct two new tris keeping in mind winding order
			//though this now does respect winding order, there might be a more elegant way to maintain it than a brute force function call
			tris.push(this.setClockwise(bottom, intersectPoint, middle, this.isClockwise));
			tris.push(this.setClockwise (top, intersectPoint, middle, this.isClockwise));
			
		}
		//TODO test winding order
		
		return tris;
	},
	
	
	
	
	//given 3 points that define a triangle, returns a boolean value, true if clockwise, false if not
	isClockwise:function(a, b, c){
		if(this.collinear(a, b, c))throw "triangle points must not be collinear";
		
		
		//check if c is on the right or left of the line defined by a and b
		
		//find perpendicular vector of ab in 0 centered coordinate system
		var vx = {x:b.y - a.y, y:- (b.x - a.x)}, v0 = {x:c.x - a.x, y:c.y - a.y};
		
		//if the third point is on the right side of the line, it will have a positive dot product and is therefore clockwise
		if((v0.x * vx.x + v0.y * vx.y) > 0 ){
			return true;
		}else{
			return false;
		}
	},
	
	//given a triangle defined by 3 points, returns the same points reordered so that they are in the correct winding, with the original first point the same. for example a triangle a < b < c will become a > c > b.
	setClockwise:function(a, b, c, cw = true){
		
		var iscw = this.isClockwise(a, b, c), t;
		
		if( (iscw && cw ) || (!iscw && !cw)) return {a:a, b:b, c:c};
		
		//if the winding of the triangle does not match the requested winding, then simply swap the two points.
		return {a:a, b:c, c:b};
		
	},
	
	
	
	
	//could be used for raytrace style collision against planes
	//TODO there is a line against triangle intersection test that is much faster based on distance to the triangle vertices, but I don't know if it provides enough information to mirror
	reflect3:function(a, b, c, l1, l2, isPlane){//given a triangle defined by the points a b and c, and a line defined by two points, returns the time along the line and angle of reflection against the triangle. isPlane flag will skip a containment test, in other words its a reflection against a plane not a triangle.
		
		//generate plane
		
		var plane, ab = {x:b.x - a.x, y:b.y - a.y, z:b.z - a.z}, ac = {x:c.x - a.x, y:c.y - a.y, z:c.z - a.z};
		
		plane.normal = {x: ab.y * ac.z - ab.z * ac.y, y: - (ab.z * ac.x - ab.x * ac.z), z: ab.x * ac.y - ab.y * ac.x};
		plane.magnitude = Math.sqrt(plane.normal.x * plane.normal.x + plane.normal.y * plane.normal.y + plane.normal.z * plane.normal.z);
		
		plane.normal.x /= plane.magnitude, plane.normal.y /= plane.magnitude, plane.normal.z /= plane.magnitude;
		
		plane.distance = c.x * plane.normal.x + c.y * plane.normal.y + c.z * plane.normal.z;
		
		
		
		
		//determine the point along the time along the line that it intersects the plane
		var diff  = {x: l2.x - l1.x, y:l2.y - l1.y, z:l2.z - l1.z}, denom = (plane.normal.x * diff.x + plane.normal.y * diff.y + plane.normal.z * diff.z);
		
		if(denom === 0) return false;//line is parallel to plane so doesnt bounce at all
		
		t = (plane.distance - plane.normal.x * p1.x + plane.normal.y * p1.y + plane.normal.z * p1.z) / denom;
		
		
		var intersection = {x: p1.x + t * diff.x, y: p1.y + t * diff.y, z:p1.z + t * diff.z},
		
		
		lm1 = {}, lm2 = {};//these two points define the line around which to reflect
		
		
		var clockwise;//boolean value, must be the same for all lines of triangle
		
		if( !isPlane ){//TODO do a containment test based on winding if against triangle.
			
			//generate a plane perpendicular to plane < a b intersect > passing through a b and test which side intersect is on
			
			
		}
		
		
		//TODO how to mirror a point in terms of a given plane
		
		//find the line perpendicular to the plane normal that intersects a point on the plane and flip it
		
		
		//the method I think could work is to find the point of intersection, project one line point onto the plane normal, then flip the point along the line defined by intersection and projection by subtracting the vector defined by p1 - projection.
		
		
		return{
		}
	},
	
	
	
	
	//instead of reflecting returns a raytrace that is distorted by a factor and the plane normal
	refract3:function(a, b, c, l1, l2, factor, isPlane){
		
	},
	
	
	
	
	//TODO the method for choosing the correct splitting plane for a given line isnt right, and it doesnt handle situations of full encapsulation
	//very similar to if not equivalent to the Cohen-Southerland clipping algorithm.
	//starts by forming lines between each vertex and testing if portions lie outside the viewport. 
	
	clipTriangle:function(a, b, c, box, decompose = false){//given a triangle defined by a b and c returns an array of triangles whos values are clipped to the bounding volume defined by box
		//decompose flag decides if the return value is a polygon or an array of triangles
		
		//if box isn't defined assume normalized device coordanates
		if (!box) box = {x:0, y:0, z:0, l:2, h:2, w:1}; //length is considered in x, height y and width zIndex
		
		//create a list of each side to test for
		var ext = {
			x1: box.x - box.l / 2,
			x2: box.x + box.l / 2,
			y1: box.y - box.h / 2,
			y2: box.y + box.h / 2,
			z1: box.z - box.w / 2,
			z2: box.z + box.w / 2
		};
		
		//for each line check if its endpoint is outside the box, and if it is, replace it with the point where it exits that 
		 
		 var points = [a, b, c];
		
		//each individual line could be seperated from its original start and endpoint, producing a maximum of six vertices
		
		var newPoints = [], dir, newTris, p, np, mp, t1, t2, tx, ty, tz, q, c;//only two will be used on a specific run
		
		//t1 and t2 represent the closest entry or exit point of the line, tx ty and tz represent each variable in terms of t
		
		
		//tests which parametric time value is closer to a given line's defining segment. Has undefined value if t is in 0-1 range
		function closer(t, pt){//TODO simply testing proximity to the segment is not sufficient to find the best possible plane. One possible solution to this is that the test should actually check for the LARGEST value if the line is outside the box or facing a direction
			if(!t) return pt;
			//TODO direction represents if the line is going "toward" or "away from" the viewport, which determines if we are looking for biggest or smallest segment possible
			
			if(t < 0) t--;
			if(pt < 0) t--;
			
			//if the direction is positive
			
		}
		
		
		
		
		for(var i = 1; i < 4; i++){//traverse each line and see when it enters and exits each extent
			lp = points[i - 1], p = points[i % points.length];//points for current line
			t1 = false, t2 = false, tx = p.x - lp.x, ty = p.y - lp.y, tz = p.z - lp.z;
			
			//for each dimension check if both points lie outside the plane, and if so the entire line is discarded. remember that both points could lie outside the line in different planes but still enter and re exit.
			//if( ( lp.x < ext.x1 && p.x < ext.x1) ||  ( lp.x > ext.x2 && p.x > ext.x2) || ( lp.y < ext.y1 && p.y < ext.y1) || ( lp.y > ext.y2 && p.y > ext.y2) || (lp.z < ext.z1 && p.z < ext.z1) || (lp.z > ext.z2 && p.z > ext.z2))continue;
			

			//each point relates to 6 possible clipping planes resulting in 12 possible necessary containment tests. Because a point should never both be less than d1 and greater than d2 for a dimension d, a true result on one makes the other uncessary.
			//for each possible clipping plane test the t along the line where that intersection occurs and if its the smallest yet then replace the old one
			//each line should only ever need to be clipped along a single dimension for each of its points.
			//TODO this algorithm does not detect lines that lie entirely outside the clip area yet not in the same partition
			if(lp.x < ext.x1) t1 = (ext.x1 - lp.x) / tx;
			else if(lp.x > ext.x2) t1 = (ext.x2 - lp.x) / tx;
			
			
			//p.d + <t> * td = i  ->  i - p.d = <t> * td  ->  t = (i - p.d) / td  -- where i equals 
			
			if(lp.y < ext.y1) t1 = closer(t1, (ext.y1 - lp.y) / ty, Math.sign(ty) === 1);
			else if (lp.y > ext.y2) t1 = closer(t1, (ext.y2 - lp.y) / ty, Math.sign(ty) === 1);
			
			
			//if(lp.z < ext.z1) t1 = closer(t1, (ext.z1 - lp.z) / tz);
			//else if(lp.z > ext.z2) t1 = closer(t1, (ext.z2 - lp.z) / tz);
			
			//if(p.x < ext.x1) t2 = (ext.x1 - lp.x) / tx;
			//else if(p.x > ext.x2) t2 = (ext.x2 - lp.x) / tx;
			
			//if(p.y < ext.y1) t2 = closer(t2, (ext.y1 - lp.y) / ty);
			//else if(p.y > ext.y2) t2 = closer(t2, (ext.y2 - lp.y) / ty);
			
			//if(p.z < ext.z1) t2 = closer(t2, (ext.z1 - lp.z) / tz);
			//else if(p.z > ext.z2) t2 = closer(t2, (ext.z2 - lp.z) / tz);
			
			
			if(!t1 && !t2){//both points lie fully inside clipping region so point can be used as is
				newPoints.push({x:p.x, y:p.y, z:p.z});
				console.log('inside');
			}else if(t1 || t2){//if the algorithm has gotten this far it means that at least one point must lie outside the clipping plane, and the line does intersect the clip area at some time
				
				//TODO because in my method there is no garuntee that points will be in the viewport, at this point I need to retest to make sure
				if (t1) newPoints.push({x:lp.x + t1 * tx, y:lp.y + t1 * ty, z:lp.z + t1 * tz});
				(t2) ? newPoints.push({x:lp.x + t2 * tx, y:lp.y + t2 * ty, z:lp.z + t2 * tz}) : newPoints.push({x:p.x,y:p.y, z:p.z});
			}
			
			
		
		}
		
		if(!decompose) return newPoints;
		
		//return an array of triangles with the windings matched
		
		newTris = [];
		
		//generate triangles
	},
	
	
	
	
	
	Plane:function(v, d, c){//returns a 3d plane defined by a normalized vector and dot product along vector. useful for collision tests
	//all points on the plane satisfy the equation p (dot) V = d;
	
		var a, b, cross, n;
		
		if (arguments.length > 2 ){//assume a plane defined by 3 points
			a = {x:d.x - v.x, y:d.y - v.y, z:d.z - v.z}, b = {x:c.x - v.x, y:c.y - v.y, z:c.z - v.z};
			
			//cross product contains plane normal
			cross = this.cross = {x: a.y * b.z - a.z * b.y, y: -(a.z * b.x - a.x * b.z), z: a.x * b.y - a.y * b.x};
			
			n = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
			this.v = {x : cross.x / n, y: cross.y / n, z:cross.z / n};//normalized cross product of vectors produced by points
			this.d = this.v.x * d.x + this.v.y * d.y + this.v.z * d.z;//dot product of any coplanar point and plane normal
			
		}else{//assume already in vector dot format, just normalize
			if(!d ) d = 1;
			
			n = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
			this.v = {x:v.x / n, y:v.y / n, z:v.z / n};//normalize
			
			this.d = d * n;//scale the dot value up to match the amount the vector was scaled down
		}
		
		
		//TODO functions should be moved to prototype
		this.test = function(p, r){//simple test for plain containment with range
			range = r || 0.000001;//arbitrary range
			
			console.log(this.v.x * p.x + this.v.y * p.y + this.v.z * p.z);
			
			return Math.abs((this.v.x * p.x + this.v.y * p.y + this.v.z * p.z) - this.d) < range;
		},
		
		
		//has been somewhat tested along unit vectors
		this.intersectLine = function(p1, p2){//TODO handle zero division
			//assuming a plane P in normal/dot product form (P.v, P.d), and a line defined by two points (l1, l2), a slope (ls), and an optional pametric (t) value, the intersection (i) can be found at
			//the point along the line where the dot product equals the plane distance in terms of parametric t is
			// P.v (dot) l = p.d, l = l1 + ls * t     ->    P.v (dot) (l1 + ls * t) = p.d  ->  P.v (dot) l1 + t * P.v (dot) (ls) = p.d  ->
			// t * P.v (dot) (l.s) = p.d - P.v (dot) l1    ->     t = (p.d - P.v (dot) l1) / (P.v (dot) (l.s)) 
			
			//expanding for individual dimensions in 3d this becomes t = (p.d - P.v.x * l1.x + p.v.y * l1.y + p.v.z * l1.z) / (P.v.x * l.s.x + P.v.y * l.s.y + P.v.z * l.s.z);
			
			//any error would probably be in the t calculation if any
			
			if(p1.x === p2.x && p1.y === p2.y && p1.z === p2.z) throw "points to form line are identical";
			//detect parallel lines this test duplicates 
			//if(this.v.x * (p2.x - p1.x) + this.v.y * (p2.y - p1.y) + this.v.z * (p2.z - p1.z) === 0) throw "lines are parallel";
			
			var diff = {x:p2.x - p1.x, y: p2.y - p1.y, z:p2.z - p1.z}, denom = (this.v.x * diff.x + this.v.y * diff.y + this.v.z * diff.z), t;
			
			if(denom === 0) throw "lines are parallel";
			//TODO why does this work since the negation group should mean all sub expressions of the dot product should be also subtracted
			t = (this.d - this.v.x * p1.x + this.v.y * p1.y + this.v.z * p1.z) / denom;//t is distance along line
			
			return {
				x:p1.x + diff.x * t,
				y:p1.y + diff.y * t,
				z:p1.z + diff.z * t,
				
				inSegment: (t > 0 && t < 1) //represents if the point of intersection is between the points used to define the line.
			};
		}
	}
}



//how you map the values of a matrix is a matter of convention, but its standard practice to align the values so that multiplied against a column vector you would map consecutive indices
//what in a traditional matrix would be considered values 0, 4, 8, 12 are considered 0, 1, 2, 3 for efficient multiplication.
View3d.math.Mat = function( s ){
	
	if(typeof s === 'string') this.values = View3d.math.Mat[s];//allow for identity
	else this.values =  this.copyArray(  (arguments.length > 0 && Array.isArray(arguments[0])) ? arguments[0] : arguments );//TODO actually copy arguments
	
	if(this.values.length !== 16 ) throw "a 4x4 matrix requires 12 values";
	
	//PIN this takes in array values the way it stores them - but this may not be the most intuitive way to define it. In general though I expect the user to not manually define these values
}

View3d.math.Mat.identity = [1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1];


View3d.math.Mat.getPerspectiveMatrix = function(w, h, fp, bp, vf, vfy){//generates a perspective matrix with the provided width, height, front and back plane, and field of view values
	
	//the 4th "w" component used in projection is an entirely different kind of value. It represents the distance each 3d point is from the "origin", and each point is divided by it to produce the final point. Since the distance each point is in the projective plane is based on its distance in the z plane, the w component is based on its z value. You can think of the w component as a scalar of how far a z value is towards the front or back plane.
	
	//for example View3d.math.mat.getPerspectiveMatrix( 10, 5, 20, 29, 12) produces a matrix for an area with width of 10, height of 5, a front plane at 20, a back plane at 29, and a 
	
	return [
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0
	];
	
	
	
	
}



View3d.math.Mat.prototype = {
	times:function( matrix ){//multiply against another matrix
	//ifError:I believe the base concept is quite functional, but the conventions might be wrong, i.e. if it outputs wrong results check that it is not either crossstitching the wrong way or multiplying in the wrong order...
		
		
		
		var n = [], v = this.values, m = matrix.values, j = 0;
		//there are 16 rowXcolumn pairs to consider
		
		while(j < 16){//remember that we are traversing the new array through keys in the opposite orientation of traditional arrays
			
			
			//TODOMAYBE save values for each of these keys to avoid addition duplication
			n[j]     = v[j] * m[0] + v[j + 1] * m[4] + v[j + 2] * m[8] + v[j + 3] * m[12];
			n[j + 1] = v[j] * m[1] + v[j + 1] * m[5] + v[j + 2] * m[9] + v[j + 3] * m[13];
			n[j + 2] = v[j] * m[2] + v[j + 1] * m[6] + v[j + 2] * m[10] + v[j + 3] * m[14];
			n[j + 3] = v[j] * m[3] + v[j + 1] * m[7] + v[j + 2] * m[11] + v[j + 3] * m[15];
			
			
			j+=4;//j is row increment
		}
		
		
		return new View3d.math.Mat( n );
		
	},
	
	timesVec:function( v ){//multiply against vector 3d with w component
		var m = this.values;
		return [
			v[0] * m[0] + v[0] * m[1] + v[0] * m[2] + v[0] * m[3],
			v[1] * m[4] + v[1] * m[5] + v[1] * m[6] + v[1] * m[7],
			v[2] * m[8] + v[2] * m[9] + v[2] * m[10] + v[2] * m[11],
			v[3] * m[12] + v[3] * m[13] + v[3] * m[14] + v[3] * m[15]
		];
	},
	
	copyArray:function( a ){
		//arguments is an array-like value not an array
		return Array.prototype.slice.call(a);
	}
}



//functions that draw in 3d space
View3d.draw = {
	
	drawTri:function(){
		
	},
	
	//I include a z value because its needed for correctly interpolating the color in 3d
	drawLine:function(x1, y1, z1, x2, y2, z2, c1, c2){
		
		
		//TODO this needs to draw a line in 3d by generating x y z and color values between the points.
		
		//first projective divide the coordinates based on the current matrix.
		
		//herein lies the issue: The projection matrix step only works on vertices, not on texels
		
	},
	
	drawRect:function(){
		
	}
	
	
}





//functions that draw wiremesh in 3d space
View3d.drawMesh = {
	
}








//framebuffer with standard javascript arrays
//right now even if only 1 value is intended for each location a 2d array is used. The process could be optimized instead to be a 1d array if only one value per location is needed
View3d.ArrayFrame = function( screen, depth, blend ){
	
	this.screen = {w:screen.w, h:screen.h}, this.depth = depth;
	this.pixels = Array(this.screen.w * this.screen.h);
	
	//override blend rule if you want
	if( blend ) this.blend = blend;
}


View3d.ArrayFrame.prototype = {
	set:function( x, y, c, z = 0 ){//remember right handed coordinate system means that higher z values are closer to camera
	
		if(x < 0 || x >= this.screen.w || y < 0 || y >= this.screen.h) return;
		var index = y * this.screen.w + x, c = {z:z, c:c.slice()};
		
		//if depth is negative no depth testing just overwrite in all cases
		if(this.depth <= 0) this.setFragment(index, c);
		
		
		//if we are only supposed to save one pixel, and there is no pixel at that location already, or its closer to the screen, it becomes the new one.
		else if(this.depth === 1 && ( !this.pixels[index] || z < this.pixels[index].z)) this.setFragment(index, c);
		
		else{
			//in this block we handle situations where we need to find the right z
			this.setFragment(index, c);
		}
	},
	
	
	
	
	
	
	clear:function(x, y){
		if (!x && !y) this.pixels = Array(this.screen.w * this.screen.h);
		else delete this.pixels[y * this.screen.w + x];
	},
	
	
	
	
	blend:function(b, f){
		var fWeight = f[3] / 255, bWeight = 1 / fWeight;
		
		return[
			bWeight * b[0] + f[0] * fWeight,
			bWeight * b[1] + f[1] * fWeight,
			bWeight * b[2] + f[2] * fWeight,
			Math.min(255, b[3] + f[3])
		];
	},
	
	
	//if you make the depth bigger than it already is, then the data will remain the same but more room will be available.
	//if you shrink it, then data will be cut starting with the furthest back.
	setDepth:function( d ){
		if(d < this.depth){
			this.pixels.forEach(function(p){
				p.splice( something );
			}, this);
		}
			
		
		this.depth = d;
	},
	
	
	getArray:function(){
		
		var a = this.pixels.map(function(p, i){
			var mixed = p[0].c;
			
			if(p.length === 1) return p[0].c;
			
			//TODO mix pixels
			
			for(var i = 1; i < p.length; i++){
				mixed = this.blend ( mixed, p[i].c);
			}
			
			
			return mixed;
		}, this);
		
		
		return a;
	},
	
	getBuffer:function(){//TOTEST untested but should work
		var buffer = new Int8Array( this.screen.w * this.screen.h * 4 ); // we need 4 color values for each pixel
		
		this.pixels.forEach(function(p, i){
			var mixed = p[0].c;
			
			if(p.length === 1) return p[0].c;
			
			//TODO mix pixels
			
			for(var i = 1; i < p.length; i++){
				mixed = this.blend ( mixed, p[i].c);
			}
			
			buffer.set(mixed, i * 4);
		}, this);
		
		return buffer;
	},
	
	//private:
	
	//a fragment has a z value as well as a color
	setFragment:function(index, fragment){
		
		var i;
		
		if(this.depth <= 1 && (!this.pixels[index] || fragment.z > this.pixels[index].z)) this.pixels[index] = [fragment];
		else if(!this.pixels[index]) this.pixels[index] = [fragment];
		
		else{
			
			i = this.pixels[index].length;
			
			
			while(i > 0 && this.pixels[index][i - 1].z > fragment.z){ i--; };
			
			if( !this.pixels[index] ) {throw "I'm here for breakpoint"};
			
			this.pixels[index].splice(i, 0, fragment);
			
			
		}
		
		
		
		if(this.pixels[index].length >  this.depth && this.depth > 0)  this.pixels[index].shift();//of the samples at this pixel location exceed the max amount we need to get rid of the last one. Since this function only takes one fragment its safe to assume we will only have to remove one.
			
		
		
	}
	
}











//framebuffer with linked list
//because we arent relying on a resize this might be faster.
View3d.ListFrame = function(screen, depth, blend){
	this.screen = {w:screen.w, h:screen.h}, this.depth = depth;
	if( blend ) this.blend = blend;
	
	//array of linked lists, each element represents the first item
	this.pixels = [];
	
}

//here we use a linked list
View3d.ListFrame.Pixel = function(c, z, next, last){
	//next should point back into the screen, because in cases of 
	this.z = z, this.c = c, this.next = next, this.last = last;
	
}




View3d.ListFrame.prototype = {
	
	//in the array based structure higher indexes mean forward into the screen, because 
	set:function( x, y, c, z = 0 ){
		if(x < 0 || x >= this.screen.w || y < 0 || y >= this.screen.h) return;
		
		var index = y * this.screen.w + x, newNode = new View3d.ListFrame.Pixel( c, z ), current;
		
		if( !this.pixels[index] ) this.pixels[index] = newNode;
		
		//handle situation where the added one has to become new start node
		else if( z < this.pixels[index].z ){
			this.link(newNode, this.pixels[index] );
			
			this.pixels[index] = newNode;
		}
		
		else{//start at the first and keep going until we find the LAST element in the array with the correct z
			
			current = this.pixels[index];
			
			while( current.next && (current.next.z < z)){
				
				current = current.next;	
				
				
			}
			
			
			
			//now insert at this location
			
			this.link(current, newNode);
		}
	},
	
	
	clear:function(x, y){
		//in theory with a javascript linked list we should be able to destroy it by simply discarding the main reference.
		
		if(!x && !y) this.pixels = [];
		else delete this.pixels[y * this.screen.w + x];
		
	},

	blend:View3d.ArrayFrame.prototype.blend,
	
	
	setDepth:function( d ){
		
		
		this.pixels.forEach(function( p, i ){
			var c = 0, node = p, earliest;
			
			while(node.next){//basically we just find the end of  the linked list, and if theres more nodes than depth kill the first few
				c++;
				
				if(c === d - 1) earliest = p; 
				
				node = node.next;
				if(earliest)earliest = earliest.next;//basically earliest should trail node by c in the list
			}
			
			//jetison first ones
			if(earliest) {
				this.pixels[i] = earliest;
				delete earliest.last;
			}
		}, this);
	},
	
	
	getArray:function(){
		
		return this.pixels.map(function(p, i){
			
			var node = p, c = p.c;
			
			while(node.next){
				
				node = node.next;
				
				c = this.blend(c, node.c);
			}
			
			return c;
			
		}, this);
		
		
	},
	
	
	getBuffer:function(){
		
	},
	
	
	//private:
	
	//places a new link after or before a reference link in a chain
	link:function(node, newNode, front = true){
		//get the node that was the next one before, its going to be linked at the end with the new node in the middle
		var endNode;
		
		if(front){
			endNode = node.next;
			
			node.next = newNode;
			newNode.last = node;
			
			if(endNode) newNode.next = endNode;
			
		}else{
			
			endNode = node.last;
			
			node.last = newNode;
			newNode.next = node;
			
			if(endNode) newNode.last = endNode;
		}
	}
}










//framebuffer that uses rigid 1d array
View3d.Frame = function(screen, depth, blend){
	
	this.screen = {w:screen.w, h:screen.h};
	
	this.depth = depth;
	
	this.pixels = new Uint32Array( screen.w * screen.h * depth * 5 );
	
	this.pixels.fill(0);
	
	
}


View3d.Frame.prototype = {
	
	set:function( x, y, c, z ){
		
		
	},
	
	clear:function(x, y){
		if (!x && !y) this.pixels.fill(0);
		else this.pixels.set([0,0,0,0,0], y * this.screen.width + x);
		
	},
	
	
	blend:function(){
		
	},
	
	depth:function( d ){
		
	},
	
	
	getArray:function(){
		
	},
	
	getBuffer:function(){
		
	},
	
	
	
	
	
	setDepth:function(){
		
	}
}