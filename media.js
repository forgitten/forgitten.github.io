/*This file is reponsible for creating an environment in which sound and images can be easily displayed and a viable resource cache
 
 * 
 * 
 * 
 * */


//TODO make a loading graphic
/*The sketchPad object has 2 different draw areas; the playArea and the standard space
 *the standard space should be used for background and maybeee score
 * 
 * 
 * the buffer object holds all frame dependent information.
 * 
 * since only one instance or very few instances of this will exist, I don't use prototypes
 */

function initPoint(){
	
	/*retrieves unchanging info about the environment such as browser
	 * 
	 * 
	 */
function Info(){
	this.browserName="ddd";
	
	
};
	
	
	/*the sketchpad object is the graphical broker
	 * 
	 * 
	 */
function SketchPad(canvasName){
	this.screenRatio=(3/4);
	this.canvas=document.getElementById(canvasName);
	this.context=this.canvas.getContext("2d");
	this.width=this.canvas.width;
	this.height=this.canvas.height;
	this.centerX=this.width/2;
	this.centerY=this.height/2;
	this.relativeScale=0;//this is going to be some sort of numerical constant for graphics that fill the screen

	this.gameAreaX1;
	this.gameAreaY1;
	this.gameAreaX2;
	this.gameAreaY2;
	this.gameAreaWidth;
	this.gameAreaHeight;
	
	this.gameBuffer=new GraphicBuffer({xPos:this.gameAreaX1,yPos:this.gameAreaY1,canvas:this.canvas,context:this.context});
	this.gameFrontBuffer=new GraphicBuffer({xPos:this.gameAreaX1,yPos:this.gameAreaY1,canvas:this.canvas,context:this.context});
	this.backBuffer=new GraphicBuffer({xPos:0,yPos:0,canvas:this.canvas,context:this.context});
	this.frontBuffer=new GraphicBuffer({xPos:0,yPos:0,canvas:this.canvas,context:this.context});

	this.nextSounds=[];
	this.playingSounds=[];
	
	this.isChangingSize=false;
	var that=this;
	
	this.addSound=function(sound){//sound to be played in the next frame
		
	};
	
	this.resize=function(){
				var that=point.sketchPad;
		that.width=that.canvas.width=that.width=window.innerWidth;
		that.height=that.canvas.height=that.height=window.innerHeight;
		that.centerX=that.width/2;
		that.centerY=that.height/2;
		
		if(that.width*that.screenRatio>that.height){
			that.gameAreaHeight=that.height;
			that.gameAreaWidth=that.height/that.screenRatio;
			that.gameAreaX1=(that.width-that.gameAreaWidth)/2;
			that.gameAreaY1=0;
			that.gameAreaX2=that.gameAreaX1+that.gameAreaWidth;
			that.gameAreaY2=that.gameAreaY1+that.gameAreaHeight;
		}
		else{
			that.gameAreaWidth=that.width;
			that.gameAreaHeight=that.screenRatio*that.gameAreaWidth;
			that.gameAreaX1=0;
			that.gameAreaY1=(that.height-that.gameAreaHeight)/2;
			that.gameAreaX2=that.gameAreaX1+that.gameAreaWidth;
			that.gameAreaY2=that.gameAreaY1+that.gameAreaHeight;
		};
	};
	
	this.flushFrame=function(){//this will reset the content of this sketchPad
		if(this.backBuffer){this.backBuffer.flush();};
		if(this.gameBuffer){this.gameBuffer.flush();};
		if(this.gameFrontBuffer){this.gameFrontBuffer.flush();};
		if(this.frontBuffer){this.frontBuffer.flush();};
		
		this.gameBuffer=new GraphicBuffer({xPos:this.gameAreaX1,yPos:this.gameAreaY1,canvas:this.canvas,context:this.context});
		this.backBuffer=new GraphicBuffer({xPos:0,yPos:0,canvas:this.canvas,context:this.context});
		this.frontBuffer=new GraphicBuffer({xPos:0,yPos:0,canvas:this.canvas,context:this.context});
		this.gameFrontBuffer= new GraphicBuffer({xPos:this.gameAreaX1,yPos:this.gameAreaY1,canvas:this.canvas,context:this.context});
	};
	this.test=function(){
		
		this.context.beginPath();
		this.context.strokeStyle="red";
		this.context.lineWidth=20;
		this.context.rect(0,0,this.width, this.height);
		this.context.stroke();
		
		this.context.beginPath();
		this.context.strokeStyle="green";
		this.context.lineWidth=20;
		this.context.rect(this.gameAreaX1,this.gameAreaY1,this.gameAreaWidth,this.gameAreaHeight);
		this.context.stroke();


	};
	
	this.update=function(){
		//TODO implement is changing size
		this.flushFrame();
		//TODO this part deals with sound
		
	};
	window.addEventListener("resize",function(){point.sketchPad.resize();});
};

/*The graphic buffer object is one graphical layer, of which the sketchpad has many
 * it is created anew every draw frame and maintains a certain size
 * It always draws styles, then lines, then sprites, then texts
 * 
 * bad code is bad, but with only 3 instances of this at a time i wont be messing with prototypical hellspawn
 * 
 * lines should have 2 sets of cartesian coordinates, color, width
 * sprites should have a caresian coordinate for position, clipstart, and widths and lengths for clipping and position
 * quads should have x,y,length, width, color, thickness, and a boolean for filled which will be set to false by default
 */
function GraphicBuffer(settings){
	this.canvas=settings.canvas;
	this.context=settings.context;
	
	this.xPos=settings.xPos;
	this.yPos=settings.yPos;
	
	this.styles=[];
	this.lines=[];
	this.quads=[];
	this.circles=[];
	this.sprites=[];
	this.texts=[];
	
	this.addCustomStyle=function(style){
		this.styles.push(style);
	};
	
	this.addLine=function(line){
		this.lines.push(line);
	};
	
	this.addQuad=function(quad){
		this.quads.push(quad);
	};
	
	this.addSprite=function(sprite){
		this.sprites.push(sprite);
	};
	
	this.addCircle= function(circle){
		this.circles.push(circle);
	};
	/* addslice takes in a graphic, and a number, and uses the numbers for that imageA object for spritewidth and height to retrieve that portion of the spritesheet,
	starting at top right to bottom left
	*/
	this.addSlice=function(pic){
		pic.xSlicesCount=pic.sprite.width/pic.sprite.sliceWidth;
		pic.ySlicesCount=pic.sprite.height/pic.sprite.sliceHeight;
		(pic.sprite.sliceWidth)?pic.clipWidth=pic.sprite.sliceWidth:alert("you must define a sprite's sliceWidth before using addSlice");
		(pic.sprite.sliceHeight)?pic.clipHeight=pic.sprite.sliceHeight:alert("you must define a sprite's sliceHeight before using addSlice");
		
		pic.clipX=(pic.slide%pic.xSlicesCount)*pic.clipWidth;
		pic.clipY=(Math.floor(pic.slide/pic.xSlicesCount))*pic.clipHeight;
		//alert("x:"+pic.x+" y:"+pic.y+" width:"+pic.width+" height:"+pic.height+" clipX:"+pic.clipX+" clipY"+pic.clipY+" clipWidth:"+pic.clipWidth+" clipHeight:"+pic.clipHeight);
		this.sprites.push(pic);
	};
	//text Elements should have font, x, y, color
	this.addText=function(text){
		this.texts.push(text);
	};
	
	this.flush=function(){
		var thisOne;
		//TODO write code for fillstyle subs
		for(var i=0;i<this.lines.length;i++){
			thisOne=this.lines[i];
			(thisOne.color)?this.context.strokeStyle=thisOne.color:this.context.strokeStyle="#cc0066";
			(thisOne.width)?this.context.lineWidth=thisOne.width:this.context.lineWidth=5;
			this.context.beginPath();
			this.context.moveTo(thisOne.x1+this.xPos,thisOne.y1+this.yPos);
			this.context.lineTo(thisOne.x2+this.xPos,thisOne.y2+this.yPos);
			this.context.stroke();
		};
		
		for (var i=0;i<this.quads.length;i++){
			thisOne=this.quads[i];
			(thisOne.color)?this.context.fillStyle=thisOne.color:this.context.fillStyle="#0033cc";
			(thisOne.color)?this.context.strokeStyle=thisOne.color:this.context.strokeStyle="#ffffcc";
			if(thisOne.filled==true){
				this.context.fillRect(thisOne.x+this.xPos,thisOne.y+this.yPos,thisOne.width,thisOne.height);
			}else{
				(thisOne.lineWidth)?this.context.lineWidth=thisOne.lineWidth:this.context.lineWidth=5;
				this.context.strokeRect(thisOne.x+this.xPos,thisOne.y+this.yPos,thisOne.width,thisOne.height);
			};
		};
		
		for(var i=0;i<this.circles.length;i++){
			thisOne=this.circles[i];
			(thisOne.color)?this.context.fillStyle=this.context.strokeStyle=thisOne.color:alert("no color set");//this.context.fillStyle=this.context.strokeStyle="#ff9900";
			(thisOne.thickness)?this.context.lineWidth=thisOne.thickness:this.context.lineWidth=5;
			this.context.beginPath();
			this.context.arc(thisOne.x+this.xPos,thisOne.y+this.yPos,thisOne.radius,0,2*Math.PI);
			(thisOne.filled==true)?this.context.fill():this.context.stroke();
		};
		
		for(var i=0;i<this.sprites.length;i++){
			this.context.save();
			thisOne=this.sprites[i];
			if(!thisOne.alpha)thisOne.alpha=1;
			if(!thisOne.rotation)thisOne.rotation=0;
			this.context.translate(thisOne.x+this.xPos+thisOne.width/2,thisOne.y+this.yPos+thisOne.height/2);
			this.context.rotate(thisOne.rotation * Math.PI / 180);
			point.sketchPad.context.globalAlpha=thisOne.alpha;
			this.context.drawImage(thisOne.sprite.graphic,thisOne.clipX,thisOne.clipY,thisOne.clipWidth,thisOne.clipHeight,-thisOne.width/2,-thisOne.height/2,thisOne.width,thisOne.height);
			this.context.restore();
			point.sketchPad.context.globalAlpha=1;
		};
		
		for(var i=0;i<this.texts.length;i++){
			thisOne=this.texts[i];
			if(!thisOne.alignment)thisOne.alignment="start";
			(thisOne.color)?this.context.fillStyle=thisOne.color:this.context.strokeStyle="#ccff66";
			(thisOne.font)?this.context.font=thisOne.font:this.context.font="20px Arial";
			switch(thisOne.alignment){
				case "start":
				this.context.textAlign="start";
				break;
				case "center":
				this.context.textAlign="center";
				break;
			};
			this.context.fillText(thisOne.text,thisOne.x+this.xPos,thisOne.y+this.yPos);
		};
		
	};
}

/* The slider module will allow for framerate; it must be the actual controller of program flow
 *It takes in only one function at a time, and is always running. replacing that function with an empty function is the only way to break execution short of demolishing the object
 * 
 * 
 * 
 * 
 * 
 * 
 */
function Slider(){
	this.frameCount=0;
	this.lastTimeCount=0;
	this.timeCount=0;
	this.delta=0;
	this.targetFps=60;
	this.targetInterval=1/this.targetFps;
	this.maxDelta=0.06;//if the delta is larger than this, the frame is skipped
	this.mainLoop=function(){};
	(function(){
		//TODO maybe polyfil this but not for my demo
	})();

	
	var that=this;
	this.setLoop=function(mainLoop){
		that.mainLoop=mainLoop;
	};
	this.clearLoop=function(mainLoop){
		that.mainLoop=undefined;
	};
	this.myLoop=function(time){
		that.interval=1/that.targetFps;
		that.timeCount=time;
		that.delta=((that.timeCount-that.lastTimeCount)*0.001);
		if(that.delta>that.targetInterval){
			if(that.delta<that.maxDelta)that.mainLoop();
			that.lastTimeCount=that.timeCount;
			if(point.debugMode){
				var canvas=point.sketchPad.canvas;
				var context=point.sketchPad.context;
				context.font="30px Arial";
				context.fillText("time: "+parseInt(time*0.001).toString(),10,30);
				context.fillText("delta: "+that.delta,point.sketchPad.width-150,30);
			};
		};
		requestAnimationFrame(that.myLoop);
	};
	this.myLoop();//upon loading the loop starts executing every frame
}


/*The world object is the simulation module that controls the generation of entitites
 * 
 * 
 */


/*
 * 
 * 
 */
function ResourceCache(){//the game will give an array of urls to make resources
	this.resources={};
	point.resources=this.resources;//shortcircuits having to call point.ResourceCache.resources
	this.number2Load;
	this.processed=0;
	this.loaded=0;
	this.currentSounds=[];
	this.globalVolume=1;
	this.baseFolder="scaled-resources";
	this.loadArray=function(rezArray){
		var that=this;
		this.number2Load=rezArray.length;
		var currentRez;
		var dataType="";
		for(var i=0;i<rezArray.length;i++){
			currentRez=rezArray[i];
			datatype=currentRez.substring(currentRez.length-3,currentRez.length);
			switch (datatype){
				case "png":
				this.resources[currentRez]=new ImageA({source: this.baseFolder + "/"+currentRez,callBack:function(){that.loaded++;}});
				break;
				case"wav":
				case"ogg":
				this.resources[currentRez]=new SoundA({source:this.baseFolder + "/"+currentRez,callBack:function(){that.loaded++;}});
				
			};
			this.processed++;
		}
	};
	
	this.makeSound=function(soundName,link){//TODO right now there is a major sound memory leak. Sounds are not freed when their objects are destroyed.
		//the link is an optional object that will free the sound when the link is freed but it's not implemented
		var sound=new SoundA({source:soundName,link:link});
		this.currentSounds.push(sound);
		return sound;
		
	};//this should load and start a new sound
	
	this.muteSound=function(){
		for(var i=0;i<this.currentSounds.length;i++){
			this.currentSounds[i].noise.volume=0;
		};
		this.globalVolume=0;
	};
	
	this.unMuteSound=function(){
		for(var i=0;i<this.currentSounds.length;i++){
			this.currentSounds[i].noise.volume=1;
		};
		this.globalVolume=1;
	};
	
	this.getRez= function(handle){
		if(this[handle]){return this[handle];};
	};
	this.isReady=function(){
		if((this.resources)&&(this.loaded>=this.number2Load)){
			return true;
		}
		return false;
	};
	this.update=function(){
		this.updateSounds();
	};
	
	this.updateSounds=function(){
		var newSoundArray=[];
		for(var i=0;i<this.currentSounds.length;i++){
			if(this.currentSounds[i].link!=undefined&&this.currentSounds[i].noise.ended==false){newSoundArray.push(this.currentSounds[i]);}else{console.log("discarded a sound");};
		};
		this.currentSounds=newSoundArray;
	};//this will discard sounds who's link is broken (object that created it removed)
	
};

	function ImageA(settings){

	if(settings.callBack)this.callBack=settings.callBack;
	
	this.loadSuccess=false;
	this.loadFailure=false;
	this.width;
	this.height;
	this.sliceWidth;
	this.sliceHeight;
	this.spriteNum;
	this.graphic;
	this.source=settings.source;
	this.loadImage();
     }
     ImageA.prototype.loadImage=function(){
			this.graphic=new Image();
			var temp=this;
			this.graphic.addEventListener("load",function(){
				temp.loadSuccess=true;
				temp.width=temp.graphic.width;
				temp.height=temp.graphic.height;
				if(temp.callBack)temp.callBack();
			},false);
			this.graphic.addEventListener("error",function(){
				temp.loadFailure=true;
			},false);
			this.graphic.src=this.source;
	};
/*The sound object
 * 
 * 
 * 
 */
     function SoundA(settings){
     	
     	if(settings.callBack)this.callBack=settings.callBack;
     	
     	if(settings.link){this.link=settings.link;}
     	else{this.link="no link";//a new sound a object always has a link.
     	console.log("creating a sound with no link creates a memory leak!");
     	};
     	this.noise=new Audio();
     	this.noise.src="resources\\"+settings.source;
     	this.noise.volume=point.resourceCache.globalVolume;
     	};
     /*Input object 
      *
      * 
      * 
      * */
     SoundA.prototype.play=function(){
     	this.noise.play();
     };
     
     function Input(){
     	this.mouse=this.nextMouse={xpos:0,ypos:0,isDown:false,isPressed:false};
     	this.keyboard=this.nextKeyboard={leftDown:false,leftPressed:false,
     			rightDown:false,rightPressed:false,
     			upDown:false,upPressed:false,
     			downDown:false,downPressed:false,
     			spaceDown:false,spacePressed:false,
     			xDown:false,xPressed:false,
     			zDown:false,zPressed:false,
     			pDown:false,pPressed:false
     };
     			
     	var that=this;
     	point.sketchPad.canvas.addEventListener("mousemove",function(event){that.nextMouse.xpos=event.clientX;that.nextMouse.ypos=event.clientY;});
     	point.sketchPad.canvas.addEventListener("mousedown",function(event){that.nextMouse.isDown=true;that.nextMouse.isPressed=true;});
     	point.sketchPad.canvas.addEventListener("mouseup",function(event){that.nextMouse.isDown=false;});
     	document.addEventListener("keydown",function(event){
     		var that=point.input;
     		switch(event.keyCode){
     			case 37:
     			that.nextKeyboard.leftDown=true;
     			if(that.keyboard.leftDown==false)that.nextKeyboard.leftPressed=true;
     			break;
     			case 38:
     			that.nextKeyboard.upDown=true;
     			if(that.keyboard.upDown==false)that.nextKeyboard.upPressed=true;
     			break;
     			case 39:
     			that.nextKeyboard.rightDown=true;
     			if(that.keyboard.rightDown==false)that.nextKeyboard.rightPressed=true;
     			break;
     			case 40:
     			that.nextKeyboard.downDown=true;
     			if(that.keyboard.downDown==false)that.nextKeyboard.downPressed=true;
     			break;
     			case 32:
     			that.nextKeyboard.spaceDown=true;
     			if(that.keyboard.spaceDown==false)that.nextKeyboard.spacePressed=true;
     			break;
     			case 88:
     			that.nextKeyboard.xDown=true;
     			if(that.keyboard.xDown==false)that.nextKeyboard.xPressed=true;
     			break;
     			case 90:
     			that.nextKeyboard.zDown=true;
     			if(that.keyboard.zDown==false)that.nextKeyboard.zPressed=true;
     			break;
     			case 80:
     			that.nextKeyboard.pDown=true;
     			if(that.keyboard.pDown==false)that.nextKeyboard.pPressed=true;
     		}
     	});
     	document.addEventListener("keyup",function(event){
     			switch(event.keyCode){
     			case 37:
     			that.nextKeyboard.leftDown=false;
     			break;
     			case 38:
     			that.nextKeyboard.upDown=false;
     			break;
     			case 39:
     			that.nextKeyboard.rightDown=false;
     			break;
     			case 40:
     			that.nextKeyboard.downDown=false;
     			break;
     			case 32:
     			that.nextKeyboard.spaceDown=false;
     			break;
     			case 88:
     			that.nextKeyboard.xDown=false;
     			break;
     			case 90:
     			that.nextKeyboard.zDown=false;
     			break;
     			case 80:
     			that.nextKeyboard.pDown=false;
     			break;
     		}
     	});
     	
     	this.pollData=function(){
     		this.mouse=this.nextMouse;
     		this.keyboard=this.nextKeyboard;
     		this.nextMouse={xpos:this.mouse.xpos,ypos:this.mouse.ypos,isDown:this.mouse.isDown,isPressed:false};
     		this.nextKeyboard={leftDown:this.keyboard.leftDown,leftPressed:false,rightDown:this.keyboard.rightDown,rightPressed:false,upDown:this.keyboard.upDown,upPressed:false,downDown:this.keyboard.downDown,downPressed:false,spaceDown:this.keyboard.spaceDown,spacePressed:false,xDown:this.keyboard.xDown,xPressed:false,zDown:this.keyboard.zDown,zPressed:false,pDown:this.keyboard.pDown,pPressed:false};
     	};
     	
     	this.test=function(){
     		this.canvas=point.sketchPad.canvas;
     		this.context=point.sketchPad.context;
     		this.context.fillStyle="#009933";
     		(this.mouse.isDown)?this.context.strokeStyle="pink":this.context.strokeStyle="blue";
     		this.context.beginPath();
     		this.context.arc(this.mouse.xpos,this.mouse.ypos,50,0,2*Math.PI);
     		this.context.stroke();
     		
     		this.context.lineWidth=10;
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.leftDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(20,point.sketchPad.height-100,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.downDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(80,point.sketchPad.height-100,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.rightDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(140,point.sketchPad.height-100,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.upDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(80,point.sketchPad.height-160,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.spaceDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(200,point.sketchPad.height-100,80,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.zDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(20,point.sketchPad.height-220,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.xDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(80,point.sketchPad.height-220,40,40);
     		this.context.stroke();
     		
     		this.context.strokeStyle="#cc0000";
     		if (this.keyboard.pDown){this.context.strokeStyle="#005b99";};
     		this.context.strokeRect(140,point.sketchPad.height-220,40,40);
     		this.context.stroke();     		

     };
     };

     
     /* 
      * 
      * */
     
     function Util(){
     	this.cutElement=function(array,key){
     		//TODO write a sub to remove an array element
     	};
     	this.enumState={mainMenu:"mainMenu",loading:"loading",world:"world",paused:"paused",youSure:"youSure",about:"about",gameOver:"gameOver",gameComplete:"gameComplete"};
     	
     	this.getGameMouse=function(){
     		if(!point.input.mouse){alert("you can't manipulate a mouse before the input module loads");};
     		var realMouse=point.input.mouse;
     		var xOffset=point.sketchPad.gameAreaX1;
     		var yOffset=point.sketchPad.gameAreaY1;
     		var fixedMouse={
     			xpos:realMouse.xpos-xOffset,
     			ypos:realMouse.ypos-yOffset,
     			isDown:realMouse.isDown,
     			isPressed:realMouse.isPressed  			
     		};
     		
     		return fixedMouse;
     	};
     	
     	this.degrees2Radians=function(angle){
     		return angle * Math.PI / 180;
     	};
     	this.radians2Degrees=function(angle){
     		return angle *180 / Math.PI;
     	};
     	this.rangedRand=function(low,high){
     		return Math.random()*(high-low)+low;
     	};
     	
     	this.hex2RGB=function(hex){//should take in an array such as [0,255,255],and return a hex value such as "#00ffff"
     		
     		
     		
     		
     	};
     	
     	this.RGB2Hex=function(c){//does the reverse of hex2RGB
     		r=c[0];
     		g=c[1];
     		b=c[2];
     		
     		return "#"+this.color2Hex(r)+this.color2Hex(g)+this.color2Hex(b);
     	};
     	
     	this.color2Hex=function(c){
     		c=c.toString(16);
     		if(c.length==1)c="0"+c;
     		return c;
     	};
     	
     };
     point.util=new Util();
     point.resourceCache= new ResourceCache();
     point.sketchPad=new SketchPad("gameCanvas");
     point.slider=new Slider();
     point.addImage=ImageA;
     point.addSound=SoundA;
     point.resources=point.resourceCache.resources;
     point.input=new Input();
     
};     
