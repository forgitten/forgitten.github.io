function initUI(){
	//TODO maybeee have a universal elements list that are always there???
	function UIManager(){
		
		this.width=1000;
		this.height=750;
		
		var that=this;
		this.liveElements=[];
		this.elementsQueue={};
		this.update=function(){
			this.liveElements=this.elementsQueue[point.state];
			//TDDO maybe a switch case here that would make the UI match the game state
			for(var i=0;i<that.liveElements.length;i++){
				that.liveElements[i].update();
			};
			that.draw();
		};
		this.draw=function(){
			for(var i=0;i<that.liveElements.length;i++){
				that.liveElements[i].draw();
			};
		};
		this.addElement=function(settings){//TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!remember, add Element adds to the queue and is not a constructor!
			var newElement=new point.UIManager.baseUIElement(settings);
			this.liveElements.push(newElement);
		};
		this.baseUIElement=baseUIElement;
		
		this.importElementsQueue=function(input){//TODO
			var tempElement;
			for(var i in input){
				this.elementsQueue[i]=[];
				for (var j=0;j<input[i].length;j++){
					tempElement=new point.UIManager.baseUIElement(input[i][j]);
					this.elementsQueue[i].push(tempElement);
				};
			};
		};
};
	
	function baseUIElement(settings){
		this.xPos=settings.xPos;
		this.yPos=settings.yPos;
		this.text=settings.text;
		this.wasTouched=false;
		this.overSound=point.resourceCache.makeSound("menuRoll.mp3");
		
		(settings.fontSize)?this.fontSize=settings.fontSize:this.fontSize=30;
		(settings.fontName)?this.fontName=settings.fontName:this.fontName="Arial";
		this.font=this.fontSize+"px "+this.fontName;
	
		(settings.textColor)?this.textColor=settings.textColor:this.textColor="#3399ff";
		(settings.color)?this.color=settings.color:this.color="#ff9999";
		(settings.borderColor)?this.borderColor=settings.borderColor:this.borderColor="#3399ff";
		(settings.borderThickness)?this.borderThickness=settings.borderThickness:this.BorderThickness=10;
		(settings.downColor)?this.downColor=settings.downColor:this.downColor="#66ff33";
		
		if(settings.onPress){this.onPress=settings.onPress;};
	};
	
	baseUIElement.prototype.draw=function(){//note that the width and height are not scaled. this is because the font is scaled already, and the width and height are calculated every frame from the font.
		(this.isTouched())?point.sketchPad.gameFrontBuffer.addQuad({x:this.TSS(this.xPos).x,y:this.TSS(this.yPos).y,width:this.width,height:this.height,filled:true,color:this.downColor}):point.sketchPad.gameFrontBuffer.addQuad({x:this.TSS(this.xPos).x,y:this.TSS(this.yPos).y,width:this.width,height:this.height,filled:true,color:this.color});
		point.sketchPad.gameFrontBuffer.addText({text:this.text,x:this.TSS(this.xPos).x,y:this.TSS(this.yPos).y+this.height*3/4,color:this.textColor,font:this.font});
		point.sketchPad.gameFrontBuffer.addQuad({x:this.TSS(this.xPos).x,y:this.TSS(this.yPos).y,width:this.width,height:this.height,lineWidth:this.borderThickness,color:this.borderColor,filled:false});
	};
	baseUIElement.prototype.isTouched=function(){
		var maybe=false;
		var mouse=point.util.getGameMouse();
		if((mouse.xpos>this.TSS(this.xPos).x)&&(mouse.xpos<this.TSS(this.xPos).x+this.width)&&(mouse.ypos>this.TSS(this.yPos).y)&&(mouse.ypos<this.TSS(this.yPos).y+this.height)){maybe=true;};//if the mouse is On the button
		return maybe;
	};
	baseUIElement.prototype.isPressed=function(){
		return(this.isTouched()&&point.input.mouse.isPressed);
	};
	baseUIElement.prototype.isDown=function(){
		var maybe=false;
		if(this.isTouched()==true&&point.input.mouse.isDown==true)maybe=true;
		return maybe;
	};
	
	baseUIElement.prototype.isHovered=function(){//this fires only once for if it was moved into the hitbox this frame
		if(this.isTouched()==true&&this.wasTouched==false)return true;
		return false;
	};
	
	baseUIElement.prototype.update=function(){
		this.updateSizes();
		
		if(this.isPressed()==true){
			this.onPress();
		};
		if(this.isHovered())this.overSound.play();
		this.wasTouched=this.isTouched();
	};

	baseUIElement.prototype.toSketchSpace=baseUIElement.prototype.TSS=function(coord){
         var temp={};
         temp.x=(coord*point.sketchPad.gameAreaWidth)/point.UIManager.width;
         temp.y=(coord*point.sketchPad.gameAreaHeight)/point.UIManager.height;
         return temp;
	};
	
	baseUIElement.prototype.updateSizes=function(){
		
		this.font=Math.floor(this.TSS(this.fontSize).y)+"px "+this.fontName;
		
		point.sketchPad.context.font=this.font;
		this.width=point.sketchPad.context.measureText(this.text).width;
		this.height=this.TSS(this.fontSize).y;
	};
	
	point.UIManager=new UIManager();
};
