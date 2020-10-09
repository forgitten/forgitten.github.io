//tests default transparency mixing

//Results: my method right now is too slow. It requires possible array resizing on each request. It may be faster though less memory efficient to hold everything in one large array buffer
require(['../main'], function(){


window.mixer = new View3d({
	screenWidth:25,
	screenHeight:25,
	
	depthBufferSize:5,
	
	clearColor:[255, 255, 255, 255]
})

//this one is z test enabled.
window.zMixer = new View3d({
	screenWidth:10,
	screenHeight:10,
	depthBufferSize:5,
	depthTest:true,
	clearColor:[255, 255, 255, 255]
});


//at the time I wrote this text rectangles werent supported by my horrible hack engine so I have to write a thing here
window.drawRect = function(screen, x1, y1, x2, y2, c){
	for(var i = x1; i < x2; i++){
		for(var j = y1; j < y2; j++){
			screen.placePoint(i, j, c, c[4]);
		}
	}
}




window.update = function( delta ) {
	//console.log(Math.round(1 / delta ));
mixer.clear();
zMixer.clear();	
drawRect(mixer, 10, 10, 20, 20, [0, 0, 255, 100]);
drawRect(mixer, 5, 5, 15, 15, [255, 0, 0, 100]);
drawRect(mixer, 12, 12, 14, 14, [0, 255, 0, 255]);


//because zMixer has depth testing enabled, it should reverse the order of these.

drawRect(zMixer, 3, 0, 8, 5, [255, 0, 0, 255/3, 5]);
drawRect(zMixer, 0, 3, 5, 8, [0, 255, 0, 255/3, 5]);//greater z values are considered closer to the camera
drawRect(zMixer, 2, 2, 6, 6, [0, 0, 255, 255/3, 15]);	
	
	View3d.renderWithImageData(surface2d.canvas.getContext('2d'), mixer.getPixels(), {x:50, y:50, w:25, h:25}, {x:50, y:50, w:500, h:500}, mixer.clearColor);
	View3d.renderWithImageData(surface2d.canvas.getContext('2d'), zMixer.getPixels(), {x:400, y:90, w:10, h:10}, {x:750, y:50, w:500, h:500}, zMixer.clearColor);
}
//window.addEventListener();
});