/*
 * 
 * For the purposes of this project I do not use prototypes when only a handful of instances
 * of a certain class will be instantiated. This is because prototypical inheretence is the
 * handiwork of the devil.
 * 
 * why do I use that=this? well I actually don't know. I used to know but I've forgotten, and I use it for safety since there's no time 
 * atm to check whether it's a thing. I think that the implicit this parameter might not work if an object calls it or something. Edit, some of these
 * are necessary, and some are vestiges that I'll remove later
 * 
 * TODO an enormous todo right now is to get rid of all the "hardcoded" speeds, and start using delta for maintaining consisteng speed!!!
 */

/*-----------------------------------bugs-------------------
 * theres some issue about loading images....before the main loop starts...
 * it would appear that isPressed is ded :[ !now is fixed, very convoluted solution. basically "onkeydown" fires once, waits a bit, then fires
 * over and over again even if you just hold the key down.
 * 
 * 
 * Currently, if there's a really really long delta, things jump a long time instead of time-stepping ,or simply not executing the main loop for that frame
 * solved!
 * 
 * trying to implement sound.. the issue is a memory leak. each object needs its own stack
 * 
 * CALLBACK IS EXPERIMENTAL, USE WITH CAUTION! GIVEN ITS POSITION IN THE CALLSTACK IT MIGHT CAUSE ISSUES!
 * to add to that, right now actors added in a frame are processed in that frame. This may not be a good thing for laser fire, as it 
 * gets an "extra" frame.
 */

var point={};
point.debugMode=false;
var resources2Load=[
"control_mode.png",
"ship.png",
"sound.png",
"star.png",
"deepSpace.png",
"asteroid.png",
"laser.png",
"evil_laser.png",
"gun_cat.png",
"explosion.png",
"seeker_Missile.png",
"seeker_Token.png",
"evil_Ship.png",
"space_mine.png",
"space_mine_flash.png",
"burst_bubble.png",
"fireworkRed.png",
"fireworkGreen.png",
"fireworkBlue.png",
"planet.png",
"lightSpace.png",
"nebulaSpace.png",
"nebula.png",
"moon.png",
"cityBackground.png",

//"battle_scene2.wav",
//"gunshot.mp3",
//"explode.mp3",
//"menuRoll.mp3"


];
initPoint();
initUI();
point.state=point.util.enumState.loading;//discard the loading mark, nothing I do will load on a multithreading architecture, should happen in one shot
point.resourceCache.loadArray(resources2Load);

var xd=point.resourceCache.makeSound("battle_scene2.wav");
//xd.play();

//this is in a wrapper self invoked anonymous function just so I dont have to be afraid of window scope interference.

(function(){
	function World(settings){
		this.width=1000;
		this.height=750;
		
		this.score=0;
		this.lifeCount=5;
		this.missileCount=5;
		this.levelCount=1;
		this.shipSpeed=400;
		
		
		this.ship;
		
		this.starFieldSpeedX=0;
		this.starFieldSpeedY=0.1;
		
		this.starFieldWarpX=0;
		this.starFieldWarpY=1;
		
		this.actors=[];

		this.enumActorState=new enumActor();
		this.enumActorType={actor:"Actor",laser:"Laser",ship:"Ship",asteroid:"Asteroid",textLabel:"TextLabel",explosion:"Explosion",gameOver:"GameOver",seekerMissile:"SeekerMissile",seekerToken:"SeekerToken",enemyShip:"EnemyShip",
		newLevel:"NewLevel",evilLaser:"EvilLaser",mine:"Mine",firework:"Firework"};
		this.inputMode="keyboard";
		this.AI=new AIControl();
		var that = this;
		
		this.currentBackground;
		
		/* lets do some environment! stuff here is going to be like wind. each actor could react how it chooses, for the moment.*/
		
		this.wind=0;//will push all actors that want to be pushed!
		
		this.garbageCollect=function(){
			var tempArray=[];
			for(var i=0;i<this.actors.length;i++){
				if(this.actors[i].state!=this.enumActorState.garbage){
                   tempArray.push(this.actors[i]);
                }
                else{
                	if(this.actors[i].callBack)this.actors[i].callBack();
                };
             }
             this.actors=tempArray;
         };
         
         this.addActor=function(type,settings){//type should be a part of some enum??? specifying the individual type
         	var n=new that[type](settings);
         	that.actors.push(n);//if you get an error on this line, you forgot to make the constructor a property of this
         	return n;
         };
         
         this.update=function(){
         	this.garbageCollect();
         	(this.currentBackground)?this.currentBackground.update():console.log("the world has no background to update!");//this is probably the ugliest hack here.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
         	this.AI.update();
         	for(var i=0;i<this.actors.length;i++){
         		this.actors[i].update();
         	};
         	
         };

         this.getCollisions=function(){
         	for(var i=0;i<this.actors.length;i++){//first clear all collisions
         		this.actors[i].collisions=[];
         	};
         	for(var i=0;i<this.actors.length;i++){
         		for(var j=i+1;j<this.actors.length;j++){
         			if(this.isTouching(this.actors[i],this.actors[j])){
         				this.actors[i].collisions.push({name:this.actors[j].name});
         				this.actors[j].collisions.push({name:this.actors[i].name});
         			};
         		};
         	};
         	
         };
         
         this.isTouching=function(thing1,thing2){
         	var radii;
         	var distance;
         	var dy;
         	var dx;
         	radii=thing1.radius+thing2.radius;
         	dy=-thing2.y+thing1.y;
         	dx=thing2.x-thing1.x;
         	distance=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
         	if(distance<=radii){
         		return true;
         	};
         	return false; 
         };
         
         this.resolveCollisions=function(){
         	for(var i=0;i<this.actors.length;i++){
         		this.actors[i].resolveHit();
         	};
         };
         
         this.draw=function(){
         	(this.currentBackground)?this.currentBackground.draw():console.log("the world has no background to update!");
         	if(this.AI.currentState!="win")this.drawStats();
         	for(var i=0;i<this.actors.length;i++){
         		this.actors[i].draw();
         		if(point.debugMode==true)this.actors[i].drawCollision();
         	};
         	
         };
         

         this.drawStats=function(){
         	if(point.world.lifeCount>=0){
         		point.sketchPad.gameFrontBuffer.addText({text:"lives: "+this.lifeCount.toString()+"x",x:this.toSketchSpace(100).x,y:this.toSketchSpace(100).y,color:"#ff0000",font:this.toSketchSpace(40).x.toString()+"px Arial"});
         		point.resources["ship.png"].sliceHeight=point.resources["ship.png"].sliceWidth=point.resources["ship.png"].height;
         		point.sketchPad.gameFrontBuffer.addSlice({sprite:point.resources["ship.png"],x:point.world.toSketchSpace(250).x,y:point.world.toSketchSpace(60).y,width:50,height:50,slide:12});
         	};
         	if(this.levelCount>2){
         		point.sketchPad.gameFrontBuffer.addText({text:"seekers :"+this.missileCount.toString()+"x",x:this.toSketchSpace(100).x,y:this.toSketchSpace(200).y,color:"#ffff00",font:this.toSketchSpace(35).x.toString()+"px Arial"});
         		point.resources["seeker_Missile.png"].sliceHeight=point.resources["seeker_Missile.png"].sliceWidth=point.resources["seeker_Missile.png"].height;
         		point.sketchPad.gameFrontBuffer.addSlice({sprite:point.resources["seeker_Missile.png"],x:point.world.toSketchSpace(280).x,y:point.world.toSketchSpace(160).y,width:50,height:50,slide:12});
         	};
         	point.sketchPad.gameFrontBuffer.addText({text:"score: "+this.score.toString(),x:this.toSketchSpace(650).x,y:this.toSketchSpace(100).y,color:"#66ffcc",font:this.toSketchSpace(40).x.toString()+"px Courier New"});
         	if(point.world.AI.currentState=="normal")point.sketchPad.gameFrontBuffer.addText({text:"to next: "+(this.AI.scoreCaps[this.levelCount]-this.score).toString(),x:this.toSketchSpace(650).x,y:this.toSketchSpace(200).y,color:"#66ffcc",font:this.toSketchSpace(40).x.toString()+"px Courier New"});
         	
         	if(point.world.AI.currentState=="normal")point.sketchPad.gameFrontBuffer.addText({text:"level:"+this.levelCount.toString(),x:point.world.toSketchSpace(500).x,y:point.world.toSketchSpace(80).y,color:"#ff9a33",font:this.toSketchSpace(60).x.toString()+"px Arial Bold",alignment:"center"});
         	
         	if(this.AI.pauseMessageTimeLeft>0)point.sketchPad.frontBuffer.addText({text:"Press P to Pause",x:point.sketchPad.width/2,y:point.sketchPad.height/2,color:"#99003d",alignment:"center",font:"40px Arial"});
         };
         //returns both an x and y value but takes in only one coordinate. only use the relevant one.
         this.toSketchSpace=function(coord){
         	var temp={};
         	temp.x=(coord*point.sketchPad.gameAreaWidth)/this.width;
         	temp.y=(coord*point.sketchPad.gameAreaHeight)/this.height;
         	return temp;
         };
         this.fromSketchSpace=function(coord){
         	//this has to change mouse input to world coordinates
         	var temp={};
         	temp.x=(coord*this.width)/point.sketchPad.gameAreaWidth;
         	temp.y=(coord*this.width)/point.sketchPad.gameAreaHeight;
         	return temp;
         };
         //this is the startup process!
         this.commense=function(){
         	that.ship=that.addActor(that.enumActorType.ship,{x:that.width/2,y:600,xSpeed:400,ySpeed:that.shipSpeed});
         	
         };
         this.Actor=Actor;//wouldnt it have been easier to just make these properties in the first place? yes, I'm lazy.
         this.Ship=Ship;
         this.Asteroid=Asteroid;
         this.Laser=Laser;
         this.Explosion=Explosion;
         this.GameOver=GameOver;
         this.SeekerMissile=SeekerMissile;
         this.SeekerToken=SeekerToken;
         this.EnemyShip=EnemyShip;
         this.NewLevel=NewLevel;
         this.Mine=Mine;
         this.Firework=Firework;
         
         //this.commense();
	};
	
	
	/****************************************************************************************************************************************************/
	
	
	/*This is the base actor implementation which all other actor classes
	 * inheret from, and therefore must be heavily object oriented friendly
	 * 
	 * 
	 */
	function Actor(settings){
		(settings.x)?this.x=settings.x:alert("settings must contain an x coordinate");
		(settings.y)?this.y=settings.y:this.y=100;
		this.xSpeed=settings.xSpeed;
		this.ySpeed=settings.ySpeed;
		(this.state)?this.state=settings.state:this.state=enumActor.live;
		(settings.radius)?this.radius=settings.radius:this.radius=10;
		(settings.sprite)?this.sprite=settings.sprite:this.sprite="";
		this.rotation=0;
		this.alpha=1;
		this.collisions=[];
		this.name="Actor";
		
		this.callBack=settings.callBack;
	};
	Actor.prototype.update=function(){};
	Actor.prototype.draw=function(){};
	Actor.prototype.resolveHit=function(){console.log("you're calling a base implementation of a function that should be overwritten!");};
	Actor.prototype.drawCollision=function(){
		var circleShade="#66ff33";
		if(this.collisions.length>0)circleShade="#cc0000";
		point.sketchPad.gameFrontBuffer.addCircle({color:circleShade,x:point.world.toSketchSpace(this.x).x,y:point.world.toSketchSpace(this.y).y,radius:point.world.toSketchSpace(this.radius).x,thickness:5,filled:false});

	};
	Actor.prototype.callBack=function(){/*this would execute after the object was destroyed*/};
	Actor.prototype.distance=function(otherActor){//this returns the distance between current object and another objecct
		if(this===otherActor)alert("you're testing an object against itself");
		return Math.sqrt(Math.pow((this.x-otherActor.x),2)+Math.pow(this.y-otherActor.y,2));
		
	};
	Actor.prototype.isOne=function(query){//takes in a type or array of types that an actor could be
		var maybe=false;
		if( Object.prototype.toString.call( query ) === '[object Array]' ) {
			for(var i=0;i<query.length;i++){
				if (this.name===query[i])return true;
			};
		}else{
			if(this.name===query)return true;
		};
		return maybe;
	};
	/*the spaceship object
	 * 
	 * 
	 */
	function Ship(settings){
		Actor.call(this,settings);
		this.sprite=point.resources["ship.png"];
		this.currentFrame=12;
		this.width=this.height=100;
		this.coolTime=0.5;
		this.coolDown=0;
		this.radius=this.height/2;
		this.fluidCount=3;
		this.name="Ship";
		this.state="fluid";
		
		this.fireSound=point.resourceCache.makeSound("gunshot.mp3",this);
	};
	
	Ship.prototype=Object.create(Actor.prototype);
	Ship.prototype.update=function(){
		var fixedMouse=point.util.getGameMouse();
		this.coolDown-=point.slider.delta;
		this.fluidCount-=point.slider.delta;
		if(this.fluidCount<=0)this.state=point.world.enumActorState.live;
		switch (point.world.inputMode){
			case "keyboard":
			if(point.input.keyboard.leftDown==true&&this.x-this.radius>=0){
				this.x-=this.xSpeed*point.slider.delta;
				if(this.currentFrame<24)this.currentFrame++;
			};
			if(point.input.keyboard.rightDown==true&&this.x+this.radius<=point.world.width){
				this.x+=this.xSpeed*point.slider.delta;
				if(this.currentFrame>0)this.currentFrame--;
			}; 
			if((point.input.keyboard.leftDown==false&&point.input.keyboard.rightDown==false)||(this.x+this.radius>=point.world.width)||(this.x-this.radius<=0)){
				if(this.currentFrame>12)this.currentFrame--;
				if(this.currentFrame<12)this.currentFrame++;
			};
			if(point.input.keyboard.upDown&&this.y-this.width/2>=2*point.world.height/3)this.y-=this.ySpeed*point.slider.delta;
			if(point.input.keyboard.downDown&&(this.y+this.width/2<=point.world.height))this.y+=this.ySpeed*point.slider.delta;
			if((point.input.keyboard.spacePressed||point.input.keyboard.spaceDown||point.input.keyboard.xPressed||point.input.keyboard.xDown)&&this.coolDown<=0){this.shoot();this.coolDown=this.coolTime;};
			
			if(point.input.keyboard.zPressed&&point.world.levelCount>2)this.shootMissile();
			break;
			
			case "mouse":
			break;
		};
		
	};
	
	Ship.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		if(this.fluidCount<0||this.fluidCount-Math.floor(this.fluidCount)>0.5)point.sketchPad.gameFrontBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:this.currentFrame});
	};
	Ship.prototype.resolveHit=function(){
		if(this.state==point.world.enumActorState.live){
			for(var i=0;i<this.collisions.length;i++){
				
				switch(this.collisions[i].name){
					case point.world.enumActorType.asteroid:
					case point.world.enumActorType.evilLaser:
					case point.world.enumActorType.enemyShip:
					case point.world.enumActorType.mine:
					point.world.lifeCount--;
					point.world.addActor(point.world.enumActorType.explosion,{x:this.x,y:this.y,callBack:function(){if(point.world.lifeCount>=0)point.world.ship=point.world.addActor(point.world.enumActorType.ship,{x:point.world.width/2,y:600,xSpeed:400,ySpeed:400});}});
					if(point.world.lifeCount<=-1)point.world.addActor(point.world.enumActorType.gameOver,{x:this.x,y:this.y});
					this.state=point.world.enumActorState.garbage;
					break;
				};
			};
		};
	};
	Ship.prototype.shoot=function(){
		point.world.addActor(point.world.enumActorType.laser,{x:this.x,y:this.y-this.width/2,xSpeed:200,ySpeed:500});
		this.fireSound.noise.play();
	};
	Ship.prototype.shootMissile=function(){
		if(point.world.missileCount>0){point.world.addActor(point.world.enumActorType.seekerMissile,{x:this.x,y:this.y-this.width/2,totalSpeed:300});point.world.missileCount--;};	
	};
	
	function EnemyShip(settings){
		Actor.call(this,settings);
		this.sprite=point.resources["evil_Ship.png"];
		this.currentFrame=12;
		this.width=this.height=100;
		this.coolTime=0.5;
		this.coolDown=0;
		this.radius=this.height/2;
		this.name="EnemyShip";
		this.state="live";
		
		this.frameChangeSpeed=50;
		this.frameNum=24;
		
		this.smartness=settings.smartness;//1-100this should just be a global of how stupid it is. the greater the smartness, the more it dodges bullets, attacks, and changes direction
		this.minReactionChance=10;//this means that the lowest change in direction could be about 5 seconds between potential changes
		this.maxReactionChance=0.2;//at its smartest it changes every one second
		
		this.reactionChance=this.minReactionChance-((this.minReactionChance-this.maxReactionChance)*this.smartness*0.01);
		
		this.minShootLaserChance=5;
		this.maxShootLaserChance=0.2;
		this.shootLaserChance=this.minShootLaserChance-(this.minShootLaserChance-this.maxShootLaserChance)*(this.smartness*0.01);
		
		this.decisions={right:false,left:false,shootLaser:false};
		
		this.fireSound=point.resourceCache.makeSound("gunshot.mp3",this);
		
	};
	EnemyShip.prototype=Object.create(Actor.prototype);
	EnemyShip.prototype.makeDecisions=function(){
		var shouldChangeDirection=(Math.random()<((1/this.reactionChance)*point.slider.delta));
		if(shouldChangeDirection){
			var direction=Math.round(Math.random()*3);
			switch (direction){
				case 0:
				this.decisions.right=this.decisions.left=false;
				break;
				case 1:
				this.decisions.right=true;
				this.decisions.left=false;
				break;
				case 2:
				this.decisions.right=false;
				this.decisions.left=true;
				break;
			};
		};
		(Math.random()<((1/this.shootLaserChance)*point.slider.delta))?this.decisions.shootLaser=true:this.decisions.shootLaser=false;
	};
	
	EnemyShip.prototype.update=function(){
		this.makeDecisions();
		
		this.coolDown-=point.slider.delta;
		
		this.y+=this.ySpeed*point.slider.delta;
		if(this.decisions.left==true&&this.x>this.radius){
			this.x-=this.xSpeed*point.slider.delta;
			if(this.currentFrame<this.frameNum)this.currentFrame+=this.frameChangeSpeed*point.slider.delta;
		};
		if(this.decisions.right==true&&this.x<point.world.width-this.radius){
			this.x+=this.xSpeed*point.slider.delta;
			if(this.currentFrame>0){this.currentFrame-=this.frameChangeSpeed*point.slider.delta;};
			if(this.currentFrame<0)this.currentFrame=0;
		};
		
		if(this.x<this.radius&&this.currentFrame>12){this.currentFrame-=this.frameChangeSpeed*point.slider.delta;};
		if(this.x>point.world.width-this.radius&&this.currentFrame<12){this.currentFrame+=this.frameChangeSpeed*point.slider.delta;};
		
		
		if(this.decisions.shootLaser==true&&this.coolDown<0){this.shootLaser();this.coolDown=this.coolTime;};
		
		if(this.y>point.world.height)this.state="garbage";
	};
	EnemyShip.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		point.sketchPad.gameFrontBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:Math.floor(this.currentFrame),rotation:180});
	};
	EnemyShip.prototype.resolveHit=function(){
		if(this.state==point.world.enumActorState.live){
			for(var i=0;i<this.collisions.length;i++){
				
				switch(this.collisions[i].name){
					case point.world.enumActorType.laser:
					case point.world.enumActorType.seekerMissile:
					case point.world.enumActorType.mine:
					point.world.score+=50;
					case point.world.enumActorType.asteroid:
					case point.world.enumActorType.ship:
					point.world.addActor(point.world.enumActorType.explosion,{x:this.x,y:this.y});
					this.state=point.world.enumActorState.garbage;
					break;
				};
			};
		}
	};
	
	EnemyShip.prototype.shootLaser=function(){
		point.world.addActor(point.world.enumActorType.laser,{x:this.x,y:this.y+this.width/2,xSpeed:200,ySpeed:-500,evil:true});
		this.fireSound.noise.play();
	};
	/*the asteroid object
	 * 
	 * 
	 */
	function Asteroid(settings){
				Actor.call(this,settings);
				this.name="Asteroid";
				this.sprite=point.resources["asteroid.png"];
				this.currentFrame=12;
				this.width=this.height=80;
				this.radius=this.height/2;
				this.scoreValue=10;
	};
	Asteroid.prototype=Object.create(Actor.prototype);

	Asteroid.prototype.update=function(){
		if(this.y>point.world.height)this.state=point.world.enumActorState.garbage;
		this.y+=this.ySpeed*point.slider.delta;
		this.currentFrame++;
		if(this.currentFrame>23)this.currentFrame=0;
	};
	Asteroid.prototype.draw=function(){
			this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
			point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:this.currentFrame});
	};
	Asteroid.prototype.resolveHit=function(){
		var one;
		for(var i=0;i<this.collisions.length;i++){
			one=this.collisions[i];
			switch (one.name){
				case point.world.enumActorType.laser:
				case point.world.enumActorType.seekerMissile:
				point.world.score+=10;
				case point.world.enumActorType.enemyShip:
				case point.world.enumActorType.mine:
				
				this.state=point.world.enumActorState.garbage;
				
				point.world.addActor(point.world.enumActorType.explosion,{x:this.x,y:this.y});
				break;
			};
		};
	};
	function Laser(settings){//if a value evil is passed in, it's a red laser.
		Actor.call(this,settings);
		(settings.evil)?this.sprite=point.resources["evil_laser.png"]:this.sprite=point.resources["laser.png"];
		this.currentFrame=0;
		this.width=20;
		this.height=40;
		(settings.evil)?this.name="EvilLaser":this.name="Laser";
	};
	Laser.prototype=Object.create(Actor.prototype);
	Laser.prototype.update=function(){
		this.y-=this.ySpeed*point.slider.delta;
		if(this.y<0||this.y>point.world.width)this.state=point.world.enumActorState.garbage;
	};
	Laser.prototype.draw=function(){
		point.sketchPad.gameBuffer.addSprite({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,clipX:0,clipY:0,clipWidth:this.sprite.width,clipHeight:this.sprite.height});
	};
	Laser.prototype.resolveHit=function(){
		for(var i=0;i<this.collisions.length;i++){
			one=this.collisions[i];
			switch (one.name){
				case point.world.enumActorType.asteroid:
				case point.world.enumActorType.Mine:
				this.state=point.world.enumActorState.garbage;
				break;
				case point.world.enumActorType.enemyShip:
				if(this.sprite==point.resources["laser.png"])this.state=point.world.enumActorState.garbage;
			};
		};
	};
	
	
	function Mine(settings){
		
		point.testSubject=this;
		this.name="Mine";
		
		Actor.call(this,settings);
		this.sprite=point.resources["space_mine.png"];
		this.flashSprite=point.resources["space_mine_flash.png"];
		this.burstSprite=point.resources["burst_bubble.png"];
		
		this.currentFrame=12;
		this.frameCount=25;
		this.frameDuration=0.05;
		this.frameDurationLeft=0.05;
		
		this.value=20;
		
		this.time=0;
		this.flashTimes=[1,1.5,2,2.4,2.7];
		this.nextFlash=0;
		this.flashDuration=0.1;//the amount of time it flashes red
		this.flashDurationLeft;
		
		(settings.width)?this.width=this.height=settings.width:this.width=this.height=100;
		this.radius=this.minRadius=this.width/2;
		this.maxBlastRadius=this.radius*4;
		this.blastTime=this.blastTimeLeft=1;
		
		(settings.xSpeed)?this.xSpeed=settings.xSpeed:this.xSpeed=0;
		(settings.ySpeed)?this.ySpeed=settings.ySpeed:this.ySpeed=100;
		
		this.state="live";
		this.name="Mine";
		
		this.flashSound=point.resourceCache.makeSound("flash.mp3",this);
		this.explodeSound=point.resourceCache.makeSound("explode.mp3",this);
	};
	Mine.prototype=Object.create(Actor.prototype);
	Mine.prototype.update=function(){
		this.time+=point.slider.delta;
		
		this.x+=this.xSpeed*point.slider.delta;
		this.y+=this.ySpeed*point.slider.delta;
		
		if(this.state==point.world.enumActorState.live)this.liveUpdate();
		if(this.state==point.world.enumActorState.breaking)this.breakUpdate();
	};
	Mine.prototype.liveUpdate=function(){
		this.frameDurationLeft-=point.slider.delta;
		if(this.frameDurationLeft<=0){this.currentFrame++;this.frameDurationLeft=this.frameDuration;};
		if(this.currentFrame>=this.frameCount)this.currentFrame=0;
		
		if(this.time>this.flashTimes[this.nextFlash]){this.flashSound.play();this.nextFlash++;this.flashDurationLeft=this.flashDuration;};
		this.flashDurationLeft-=point.slider.delta;
		if(this.nextFlash>=this.flashTimes.length){this.state="breaking";};
		
		
		if(this.y<0||this.y>point.world.height){this.state="garbage";};
	};
	
	Mine.prototype.breakUpdate=function(){
		this.blastTimeLeft-=point.slider.delta;
		//alert(this.blastTimeLeft/this.blastTime);
		this.radius=this.minRadius+((this.maxBlastRadius-this.minRadius)*((this.blastTime-this.blastTimeLeft)/this.blastTime));
		
		if(this.blastTimeLeft<=0)this.state="garbage";
	};
	
	Mine.prototype.draw=function(){
		switch (this.state){
			case "live":
			var whichGraphic;
			(this.flashDurationLeft>0)?whichGraphic=this.flashSprite:whichGraphic=this.sprite;
		
		whichGraphic.sliceHeight=whichGraphic.sliceWidth=whichGraphic.height;
		
		point.sketchPad.gameBuffer.addSlice({sprite:whichGraphic,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:Math.floor(this.currentFrame)});
		break;
		    case "breaking":
		    this.burstSprite.sliceHeight=this.burstSprite.sliceWidth=this.burstSprite.height;
		    point.sketchPad.gameBuffer.addSlice({sprite:this.burstSprite,x:point.world.toSketchSpace(this.x-this.radius).x,y:point.world.toSketchSpace(this.y-this.radius).y,width:point.world.toSketchSpace(this.radius*2).x,height:point.world.toSketchSpace(this.radius*2).y,slide:0});
		};
	};
	Mine.prototype.resolveHit=function(){
		for(var i=0;i<this.collisions.length;i++){
			one=this.collisions[i];
			switch (one.name){
				case point.world.enumActorType.laser:
				point.world.score+=this.value;
				case point.world.enumActorType.ship:
				case point.world.enumActorType.enemyShip:
				case point.world.enumActorType.seekerMissile:
				case point.world.enumActorType.mine:
				if(this.state=="live")this.explodeSound.play();
				if(this.state!="garbage")this.state=point.world.enumActorState.breaking;
				//this.explodeSound.play();
				break;
			};
		};
		
	};
	
	
	
	function Explosion(settings){
		Actor.call(this,settings);
		this.sprite=point.resources["explosion.png"];
		this.currentFrame=0;
		this.spriteAlpha=1;
		this.frameCount=25;
		(settings.width)?this.width=settings.width:this.width=300;
		(settings.height)?this.height=settings.height:this.height=300;
		(settings.lifeSpan)?this.lifeSpan=settings.lifeSpan:this.lifeSpan=2;
		this.lifeLeft=this.lifeSpan;
		this.name="Explosion";
		this.state="fluid";
		
		this.sound=point.resourceCache.makeSound("explode.mp3",this);
		this.sound.noise.play();
	};
	Explosion.prototype=Object.create(Actor.prototype);
	Explosion.prototype.update=function(){
		this.lifeLeft-=point.slider.delta;
		this.spriteAlpha=(this.lifeLeft/this.lifeSpan);
		this.currentFrame=this.frameCount-Math.round((this.lifeLeft/this.lifeSpan)*this.frameCount);
		if(this.lifeLeft<=0)this.state=point.world.enumActorState.garbage;
	};
	Explosion.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:this.currentFrame,alpha:this.spriteAlpha});
	};
	
	function Firework(settings){
		Actor.call(this,settings);
		if(settings.color){
			this.color=settings.color;
		}else{
			var temp=Math.floor(Math.random()*3);
			switch(temp){
				case 0:
				this.color="Red";
				break;
				case 1:
				this.color="Green";
				break;
				case 2:
				this.color="Blue";
				break;
				
				
			};
		};
		this.sprite=point.resources["firework"+this.color+".png"];
		this.currentFrame=0;//and will remain such for a long time! this needs to fly
		this.frameCount=13;
		this.frameChangeTime=0.2;
		this.frameLeft=this.frameChangeTime;
		(settings.width)?this.width=settings.width:this.width=300;
		(settings.height)?this.height=settings.height:this.height=300;
		
		this.flightTime=1;
		this.flightTimeLeft=this.flightTime;
		this.flightDistance=750;
		this.lifeSpan=2;
		this.timeLeft=this.lifeSpan;
		
		this.name="Firework";
		this.state="fluid";
		
		this.rocketFrame=0;
		this.rocketX=this.x;
		this.rocketY;
		this.rocketWidth=this.width/6;
		this.rocketHeight=this.height/6;
		
		
		this.flightSound=point.resourceCache.makeSound("firework.mp3",this);
		this.explodeSound=point.resourceCache.makeSound("explode.mp3",this);
		this.flightSound.play();
	};
	
	Firework.prototype=Object.create(Actor.prototype);
	Firework.prototype.update=function(){
		this.timeLeft-=point.slider.delta;
		if(this.timeLeft<=0){this.state="garbage";};
		
		if(this.lifeSpan-this.timeLeft<this.flightTime){
			this.rocketY=this.y+this.flightDistance-(this.flightDistance*((this.lifeSpan-this.timeLeft)/this.flightTime));
		}else{
			//if(){};//if it just went from rocket to explode!
			this.currentFrame=Math.round(((this.lifeSpan-this.timeLeft-this.flightTime)/(this.lifeSpan-this.flightTime))*this.frameCount)+1;
		};
	};
	Firework.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		if(this.lifeSpan-this.timeLeft<this.flightTime)point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.rocketX-this.rocketWidth/2).x,y:point.world.toSketchSpace(this.rocketY-this.rocketHeight/2).y,width:this.rocketWidth,height:this.rocketHeight,slide:0});
		if(this.lifeSpan-this.timeLeft>=this.flightTime){point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:this.width,height:this.height,slide:Math.floor(this.currentFrame)});};
	};
	
	
	
	
	
	
	//this runs once at the end of the game
	function GameOver(settings){//this object's x and y should be the center
		Actor.call(this,settings);
		this.runTime=3;//this should match the explosion graphic;
		this.timeLeft=this.runTime;
		this.color="#000000";
		this.circleRadius=point.sketchPad.width;//the width of the zoomy circle
		this.name="GameOver";
		
		this.sound=point.resourceCache.makeSound("gameOver.mp3",this);
		this.sound.noise.play();
	};
	GameOver.prototype=Object.create(Actor.prototype);
	GameOver.prototype.update=function(){
		this.timeLeft-=point.slider.delta;
		this.circleRadius=2*Math.abs(point.sketchPad.gameAreaWidth*(1-(this.timeLeft/this.runTime)));
		//alert((point.sketchPad.gameAreaWidth*(this.timeLeft/this.runTime)).toString());
		if(this.timeLeft<=0){this.state=point.world.enumActorState.garbage;point.state="gameOver";};// this would make the game over!
	};
	GameOver.prototype.draw=function(){
		point.sketchPad.frontBuffer.addQuad({x:0,y:0,width:(point.sketchPad.width-point.sketchPad.gameAreaWidth)/2,height:point.sketchPad.height,color:this.color,filled:true,lineWidth:0});
		point.sketchPad.frontBuffer.addQuad({x:point.sketchPad.gameAreaX2,y:0,width:(point.sketchPad.width-point.sketchPad.gameAreaWidth)/2,height:point.sketchPad.height,color:this.color,filled:true,lineWidth:0});
		point.sketchPad.gameFrontBuffer.addCircle({x:point.world.toSketchSpace(this.x).x,y:point.world.toSketchSpace(this.y).y,color:this.color,radius:point.sketchPad.gameAreaWidth,filled:false,thickness:this.circleRadius});
	};
	
	function NewLevel(settings){//this is a graphic which displays a switch between levels!
		Actor.call(this,settings);
		this.movingTime=1;
		this.freezingTime=4;
		this.timeLeft=this.movingTime+this.freezingTime;
		
		this.text="entering sector "+point.world.levelCount;
		this.leftTextColor="#00cc00";
		this.rightTextColor="#ff0000";
		this.leftCenterX=this.leftBorderX=-point.world.width/4;
		this.leftY=this.y;
		this.rightCenterX=this.rightBorderX=point.world.width+point.world.width/4;
		this.rightY=this.y+10;
		
		if(settings.message)this.message=settings.message;
	
	};
	NewLevel.prototype=Object.create(Actor.prototype);
	NewLevel.prototype.update=function(){
		this.timeLeft-=point.slider.delta;
		if(this.timeLeft<0){this.state="garbage";};
		(this.timeLeft-this.freezingTime>0)?this.leftCenterX=point.world.width/2-(point.world.width/2)*((this.timeLeft-this.freezingTime)/this.movingTime):this.leftCenterX=point.world.width/2;
		(this.timeLeft-this.freezingTime>0)?this.rightCenterX=point.world.width/2+(point.world.width/2)*((this.timeLeft-this.freezingTime)/this.movingTime):this.leftrightX=point.world.width/2+10;
	};
	
	NewLevel.prototype.draw=function(){
		point.sketchPad.gameFrontBuffer.addText({text:this.text,x:point.world.toSketchSpace(this.rightCenterX).x,y:point.world.toSketchSpace(this.rightY).y,color:this.rightTextColor,alignment:"center",font:point.world.toSketchSpace(100).x+"px Arial"});//the right text
		point.sketchPad.gameFrontBuffer.addText({text:this.text,x:point.world.toSketchSpace(this.leftCenterX).x,y:point.world.toSketchSpace(this.leftY).y,color:this.leftTextColor,alignment:"center",font:point.world.toSketchSpace(100).x+"px Arial"});//the left text
		
		if(this.message&&this.timeLeft-this.freezingTime<0)point.sketchPad.gameFrontBuffer.addText({text:this.message,x:point.world.toSketchSpace(this.leftCenterX).x,y:point.world.toSketchSpace(this.leftY*1.2).y,color:this.leftTextColor,alignment:"center",font:point.world.toSketchSpace(40).x+"px Arial"});
	};
	
	
	
	function SeekerMissile(settings){//TODO this has tons of work to do!
		Actor.call(this,settings);
		this.sprite=point.resources["seeker_Missile.png"];
		this.currentFrame=12;
		this.frameCount=25;
		this.animationSpeed=2/25;
		this.width=this.height=50;
		this.rotation=0;
		this.maxSecondRotation=(Math.PI * 2)/2;
		this.targetAngle;
		this.seekRadius=1000;
		this.totalSpeed=settings.totalSpeed;
		this.lockOn;//this is the object that it's going towards
		this.lockOnTypes=[point.world.enumActorType.asteroid,point.world.enumActorType.mine,point.world.enumActorType.enemyShip];
		this.name="SeekerMissile";
	};
	SeekerMissile.prototype=Object.create(Actor.prototype);
	SeekerMissile.prototype.update=function(){
		if(!this.lockOn)this.look4LockOn();
		if(this.lockOn&&this.lockOn.state!=point.world.enumActorState.garbage){//TODO now seekers just fly off forever!
			if(Math.abs(this.rotation-this.getRotation())<this.maxSecondRotation*point.slider.delta){
				this.rotation=this.getRotation();
			}else{
				(this.getRotation()-this.rotation<0)?this.rotation-=this.maxSecondRotation*point.slider.delta:this.rotation+=this.maxSecondRotation*point.slider.delta;
			};
		};
		this.xSpeed=this.totalSpeed*Math.sin(this.rotation);
		this.ySpeed=this.totalSpeed*Math.cos(this.rotation);
		this.x+=this.xSpeed*point.slider.delta;
		this.y-=this.ySpeed*point.slider.delta;
	};
	SeekerMissile.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:this.currentFrame,rotation:point.util.radians2Degrees(this.rotation)});
		if(this.lockOn&&point.debugMode==true)point.sketchPad.gameBuffer.addLine({x1:point.world.toSketchSpace(this.x).x,y1:point.world.toSketchSpace(this.y).y,x2:point.world.toSketchSpace(this.lockOn.x).x,y2:point.world.toSketchSpace(this.lockOn.y).y,width:3,color:"#ff3300"});
		if(this.lockOn&&point.debugMode==true)point.sketchPad.gameFrontBuffer.addText({x:point.world.toSketchSpace(this.x).x,y:point.world.toSketchSpace(this.y-20).y,text:this.rotation+"->"+this.getRotation(),color:"#b30000",font:"30px Arial",alignment:"center"});
	};
	SeekerMissile.prototype.resolveHit=function(){
		for(var i=0;i<this.collisions.length;i++){
			one=this.collisions[i];
			switch (one.name){
				case point.world.enumActorType.asteroid:
				case point.world.enumActorType.mine:
				case point.world.enumActorType.seekerMissile:
				this.state=point.world.enumActorState.garbage;
				
				break;
			};
		};
	};
	
	SeekerMissile.prototype.look4LockOn=function(){
		var closest;
		var thisOne;
		for(var i=0;i<point.world.actors.length;i++){
			thisOne=point.world.actors[i];
			if(thisOne.isOne(this.lockOnTypes)&&this.distance(thisOne)<this.seekRadius){//if it's an asteroid and within the propper radius
				if((!closest||this.distance(thisOne)<this.distance(closest))&&thisOne.y<this.y)closest=thisOne;//if it's infront of the seeker, and the closest yet found
			};
		};
		this.lockOn=closest;
	};
	SeekerMissile.prototype.getRotation=function(){
		var rawAngle = Math.acos((this.y-this.lockOn.y)/this.distance(this.lockOn));
		if(this.lockOn.x>this.x)return rawAngle;
		return -rawAngle;
	};
	
	function SeekerToken(settings){
		Actor.call(this,settings);
		this.sprite=point.resources["seeker_Token.png"];
		this.width=this.height=75;
		this.radius=this.width/2;
		this.currentFrame=0;
		this.frameCount=24;
		this.animationSpeed=10;
		
		this.missileAmount=5;
		
		this.collectSound=point.resourceCache.makeSound("collect_token.mp3",this);
		
	};
	SeekerToken.prototype=Object.create(Actor.prototype);
	SeekerToken.prototype.update=function(){
		this.currentFrame+=this.animationSpeed*point.slider.delta;
		if(this.currentFrame>24){this.currentFrame=0;};
		this.y+=this.ySpeed*point.slider.delta;
		if(this.y>point.world.height)this.state=point.world.enumActorState.garbage;
	};
	SeekerToken.prototype.draw=function(){
		this.sprite.sliceHeight=this.sprite.sliceWidth=this.sprite.height;
		point.sketchPad.gameBuffer.addSlice({sprite:this.sprite,x:point.world.toSketchSpace(this.x-this.width/2).x,y:point.world.toSketchSpace(this.y-this.height/2).y,width:point.world.toSketchSpace(this.width).x,height:point.world.toSketchSpace(this.height).y,slide:Math.floor(this.currentFrame)});
	};
	SeekerToken.prototype.resolveHit=function(){
			for(var i=0;i<this.collisions.length;i++){
				
				switch(this.collisions[i].name){
					case point.world.enumActorType.ship:
					point.world.missileCount+=5;
					this.collectSound.play();
					this.state=point.world.enumActorState.garbage;
					break;
				};
			};
		
	};
	

	
	
     /*possible Actor states 
      * 
      */
	function enumActor(){
		this.live="live";//the actor is in normal play
		this.garbage="garbage";//the actor is garbage
		this.fluid="fluid";//the actor is taking invincibility frames
		this.breaking="breaking";//the object is blowing apart before becoming garbage
    }
    
	point.makeWorld=World;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//TODO this entire thing is a bloody rig! anything that is very rigged and messy should go here!
	function AIControl(){//the AI control may hold references to things it created, such as enemy ships
		this.scoreCaps=[0,30,150,300,500,750,1100,1500,2000,2500,3000];//this is the list of amounts of points to level up!
		
		this.types2WaitFor=["EnemyShip","Asteroid","Mine"];//this is a list of things that this should let get rekt before advancing to another level
		
		this.onChangeLevel=false;//very single use, only is used in the two lines
		this.isWaiting4Actors=false;//if this is true, it means that not all the actors are off the field
		this.isWaitingToNext=false;//this should only be false when no actors are present, and the level graphic has finished
		this.points2LevelUp;
		
		this.asteroidTime=this.asteroidTimeLeft=1;
		this.asteroidYSpeed=100;
		this.minAsteroidTime=0.3;//these values represent the minimum it will reach in freeplay mode!
		this.maxAsteroidTime=0.1;
		this.asteroidKPen=0.05;//the minimum is subtracted by this!
		this.minAsteroidYSpeed=400;
		this.maxAsteroidYSpeed=800;
		this.asteroidYSpeedKPen=50;
		
		
		this.seekerTokenRandomTime=10;//the chance that in a given 10 second period this will be dropped
		this.enemyShipRandomTime=20;
		this.enemyShipSmartness=10;
		this.minEnemyShipRandomTime=7;
		this.maxEnemyShipRandomTime=1;
		this.enemyShipRandomTimeKPenalty=1;
		this.minEnemySmartness=70;
		this.maxEnemySmartness=100;
		this.enemySmartnessKPen=5;
		
		this.mineChance;
		this.mineTime=0;
		this.mineTimeleft;
		this.minMineRandomTime=5;
		this.maxMineRandomTime=1;
		
		this.mineRandomTimeKPen=0.3;
		
		this.fireworkTime=2;
		this.fireworkTimeLeft=this.fireworkTime;
		//TODO this needs to be in control of spawning elements
		
		this.pauseMessageTime=2;
		this.pauseMessageTimeLeft=this.pauseMessageTime;
		
		this.windX;
		this.windY;
		
		this.backGround;
		var that=this;
		//TODO has won is not implemented!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		
		this.possibleStates={normal:"normal",win:"win",endless:"endless"};
		this.currentState=this.possibleStates.normal;
		this.didWin=false;//if the player had won the last frame!
		this.isWinning=false;//this would just signify if it should be playing the win graphics
		this.currentBackground;
		this.gameBackground=new Background(this.width,this.height);
		this.winBackground=new winBackground(this.width,this.height);
		
		
		
		this.newLevelCallBack=function(){
			point.world.AI.isWaitingToNext=false;
			point.starBackground.xSpeed=point.world.starFieldSpeedX;
			point.starBackground.ySpeed=point.world.starFieldSpeedY;
			point.world.AI.pauseMessageTimeLeft=point.world.AI.pauseMessageTime;
		};
		
		this.initNewLevel=function(){this.onChangeLevel=false;
			point.world.addActor(point.world.enumActorType.newLevel,{x:point.world.width/2,y:point.world.height/2,callBack:this.newLevelCallBack,message:levelData[point.world.levelCount].message});
			if(this.backgroundImage){this.gameBackground.backImage=point.resources[this.backgroundImage];};
			
			point.starBackground.xSpeed=point.world.starFieldWarpX;
			point.starBackground.ySpeed=point.world.starFieldWarpY;
			
			
		};
		
		this.update=function(){
			point.world.currentBackground=this.currentBackground;
			switch(this.currentState){
				case this.possibleStates.normal:
				this.normalUpdate();
				break;
				case this.possibleStates.win:
				this.winUpdate();
				break;
				case this.possibleStates.endless:
				this.endlessUpdate();
				break;
			};
		};
		
		this.endlessUpdate=function(){
			this.currentBackground=this.gameBackground;
			
			this.updateEndlessValues();
			this.spawnThings();
		};
		
		this.normalUpdate=function(){
			if(this.pauseMessageTimeLeft>0)this.pauseMessageTimeLeft-=point.slider.delta;
			
			(this.isWaitingToNext&&!this.shouldStillWait4Actors())?this.currentBackground=undefined:this.currentBackground=this.gameBackground;
			
			
			if(point.world.score>=this.scoreCaps[point.world.levelCount]&&point.world.levelCount+1<this.scoreCaps.length){point.world.levelCount++;this.loadLevel(point.world.levelCount);this.isWaitingToNext=this.onChangeLevel=true;};
			if(point.world.score>=this.scoreCaps[point.world.levelCount]&&point.world.levelCount+1>=this.scoreCaps.length){this.currentState=this.possibleStates.win;};
			if(this.shouldStillWait4Actors()==false&&this.onChangeLevel==true){this.initNewLevel();};
			if(!this.isWaitingToNext)this.spawnThings();
		};
		
		this.winUpdate=function(){
			this.currentBackground=this.winBackground;
			if(point.world.currentBackground.blackOutTimeLeft<0){this.fireworkTimeLeft-=point.slider.delta;point.state=point.util.enumState.gameComplete;};
			if(this.fireworkTimeLeft<=0){this.fireworkTimeLeft=this.fireworkTime;point.world.addActor(point.world.enumActorType.firework,{x:point.util.rangedRand(0,point.world.width),y:50});};
			
		};
		
		this.loadLevel=function(number){//every property of this array element replaces the property of this globally.
			this.mineChance=undefined;
			this.mineTime=undefined;
			this.mineTimeleft=undefined;
			
			var thisLevelData=levelData[number];
			for(var prop in thisLevelData){
				this[prop]=thisLevelData[prop];
				
			};
			
			this.asteroidTimeLeft=this.asteroidTime;
		if(this.backgroundImage&&number==1){this.gameBackground.backImage=point.resources[this.backgroundImage];};
		
		};
		
		this.updateEndlessValues=function(){//this should callibrate the values of things to the score!
			var kMetric=(point.world.score-this.scoreCaps[10])/1000;
			
			
			this.asteroidTime=this.minAsteroidTime-this.asteroidKPen*kMetric;
			if(this.asteroidTime<this.maxAsteroidTime)this.asteroidTime=this.maxAsteroidTime;
			
			this.mineChance=this.minMineRandomTime-this.mineRandomTimeKPen*kMetric;
			if(this.mineChance<this.maxMineRandomTime)this.mineChance=this.maxMineRandomTime;
			
			this.enemyShipRandomTime=this.minEnemyShipRandomTime-this.enemyShipRandomTimeKPenalty*kMetric;
			if(this.enemyShipRandomTime<this.maxEnemyShipRandomTime)this.enemyShipRandomTime=this.maxEnemyShipRandomTime;
			
			this.enemyShipSmartness=this.minEnemySmartness+this.enemySmartnessKPen*kMetric;
			if(this.enemyShipSmartness>this.maxEnemyShipSmartness)this.enemyShipSmartness=this.maxEnemyShipSmartness;
			
			this.asteroidYSpeed=this.minAsteroidYSpeed+this.asteroidYSpeedKPen*kMetric;
			if(this.asteroidYSpeed>this.maxAsteroidYSpeed)this.asteroidYSpeed=this.maxAsteroidYSpeed;
			
		};
		
		this.spawnThings=function(){
			if(this.mineChance&&this.timeChance(this.mineChance)){point.world.addActor(point.world.enumActorType.mine,{x:point.util.rangedRand(0,point.world.width),y:0});};
			if(this.mineTime)this.mineTimeLeft-=point.slider.delta;
			if(this.mineTime&&this.mineTimeLeft<0){point.world.addActor(point.world.enumActorType.mine,{x:point.util.rangedRand(0,point.world.width),y:0});this.mineTimeLeft=this.mineTime;};
			
			if(this.timeChance(this.seekerTokenRandomTime)){point.world.addActor(point.world.enumActorType.seekerToken,{x:point.util.rangedRand(0,point.world.width),y:0,ySpeed:300});};

			
			if(this.asteroidTimeLeft<=0){this.asteroidTimeLeft=this.asteroidTime;point.world.addActor(point.world.enumActorType.asteroid,{x:Math.random()*1000,y:0,ySpeed:this.asteroidYSpeed,xSpeed:0});};
			if(this.timeChance(this.enemyShipRandomTime)){point.world.addActor(point.world.enumActorType.enemyShip,{x:point.util.rangedRand(0,point.world.width),y:0,ySpeed:150,xSpeed:400,smartness:this.enemyShipSmartness});};
			this.asteroidTimeLeft-=point.slider.delta;
		};
		
		this.timeChance=function(theoryTime){
			var maybe=false;
			if(Math.random()<=point.slider.delta*(1/theoryTime))maybe=true;
			return maybe;
		};
		this.shouldStillWait4Actors=function(){//this checks for the types of actors that should be waited for
			var maybe = false;
			for(var i=0;i<point.world.actors.length;i++){
				if(point.world.actors[i].isOne(this.types2WaitFor)){
					maybe=true;
					break;
				};
			};
			return maybe;
		};
	};
	
	function Background(width,height){//new idea! make this always a square? work on it. 
		this.width;
		this.height;
		this.x1;
		this.y1;
		this.x2;
		this.y2;
		
		this.incrementX=1000;
		this.incrementY=1000;
		
		this.backImageX=500;
		this.backImageY=500;
		this.backImageXSpeed=0;
		this.backImageYSpeed=100;
		
		this.update=function(){
			if(point.sketchPad.width>point.sketchPad.height){
				this.width=this.height=point.sketchPad.width;
				this.x1=0;
				this.y1=(point.sketchPad.height-this.height)/2;
			}else{
				this.width=this.height=point.sketchPad.height;
				this.x1=(point.sketchPad.width-this.width)/2;
				this.y1=0;
			};
			
			this.backImageX+=this.backImageXSpeed*point.slider.delta;
			this.backImageY+=this.backImageYSpeed*point.slider.delta;
			
			if(this.backImageX>this.incrementX)this.backImageX=1;
			if(this.backImageY>this.incrementY)this.backImageY=1;
			if(this.backImageX<=0)this.backImageX=999;
			if(this.backImageY<=0)this.backImageY=999;
			
		};
		this.draw=function(){
			//point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1,y:this.y1,width:this.width,height:this.height,clipX:0,clipY:0,clipWidth:this.backImage.width,clipHeight:this.backImage.height});
			var fractionX=this.backImageX/this.incrementX;
			var fractionY=this.backImageY/this.incrementY;
			
			var imageSplitX=this.backImage.width-this.backImage.width*fractionX;
			var imageSplitY=this.backImage.width-this.backImage.height*fractionY;
			var imageSplitWidth=this.backImage.width-imageSplitX;
			var imageSplitHeight=this.backImage.height-imageSplitY;
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1,y:this.y1,width:this.width*fractionX,height:this.height*fractionY,clipX:imageSplitX,clipY:imageSplitY,clipWidth:imageSplitWidth,clipHeight:imageSplitHeight});//top left
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1+this.width*fractionX,y:this.y1,width:this.width-this.width*fractionX,height:this.height*fractionY,clipX:0,clipY:imageSplitY,clipWidth:imageSplitX,clipHeight:imageSplitHeight});//top right
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1+this.width*fractionX,y:this.y1+this.height*fractionY,width:this.width-this.width*fractionX,height:this.height-this.height*fractionY,clipX:0,clipY:0,clipWidth:imageSplitX,clipHeight:imageSplitY});//bottom left
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1,y:this.y1+this.height*fractionY,width:this.width*fractionX,height:this.height-this.height*fractionY,clipX:imageSplitX,clipY:0,clipWidth:imageSplitWidth,clipHeight:imageSplitY});
		};
		
	};
	
	function winBackground(width,height){
		this.width;
		this.height;
		this.x1;
		this.y1;
		this.x2;
		this.y2;
		
		this.incrementX=1000;
		this.incrementY=1000;
		
		this.backImageLimit=333; //the highest these go
		this.backImage=point.resources["cityBackground.png"];
		this.backImageX=[];//this will draw the image 3 times
		this.backImageY=[];
		this.backImageXSpeed=0;
		this.backImageYSpeed=[];
		
		this.moonImage=point.resources["moon.png"];
		this.planetImage=point.resources["planet.png"];
		
		this.startTime=5;//the length of the flying in graphic!
		this.blackOutTime=2;
		this.startTimeLeft=this.startTime;
		this.blackOutTimeLeft=this.blackOutTime;
		
		this.planetImageX=0;
		this.planetImageY=0;
		this.planetImageWidth=0;
		this.planetImageHeight=0;
		
		this.moonImageX;
		this.moonImageY;
		this.moonImageWidth;
		this.moonImageHeight;
		
		
		this.setFrames=function(number){//this should space this number of frames equally apart TODO
			var myInc=(this.incrementY-this.backImageLimit)*2/number;
			var myY;
			var mySpeed;
			
			for (var i=0;i<number;i++){
				this.backImageX.push(1);
				myY=this.backImageLimit+i*myInc;
				mySpeed=100;
				if(myY>this.incrementY){myY=this.incrementY-(myY-this.incrementY);mySpeed=-100;};
				this.backImageY.push(myY);
				this.backImageYSpeed.push(mySpeed);
				
			};
		};

		this.setFrames(7);//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!WARNING EXECUTION HAPPENS HERE NOT FUNCTION DECLEARATION	
		
		this.update=function(){
			if(point.sketchPad.width>point.sketchPad.height){
				this.width=this.height=point.sketchPad.width;
				this.x1=0;
				this.y1=(point.sketchPad.height-this.height)/2;
			}else{
				this.width=this.height=point.sketchPad.height;
				this.x1=(point.sketchPad.width-this.width)/2;
				this.y1=0;
			};
			if(this.startTimeLeft>0){
				this.startUpdate();
			}else if(this.blackOutTimeLeft>0){
				this.blackOutUpdate();
			}else{
				this.normalUpdate();
			};
			
		};
		
		this.startUpdate=function(){
			this.startTimeLeft-=point.slider.delta;
			this.planetImageX=this.width/2;
			this.planetImageY=this.height/2;
			this.planetImageWidth=((this.startTime-this.startTimeLeft)/this.startTime)*this.width;
			this.planetImageHeight=((this.startTime-this.startTimeLeft)/this.startTime)*this.height;
		};
		
		this.blackOutUpdate=function(){
			this.blackOutTimeLeft-=point.slider.delta;
		};
		
		this.normalUpdate = function(){
			for (var i=0;i<this.backImageX.length;i++){
				this.updateFrame(i);
			};
		};
		
		
		
		this.addFrame=function(){
			this.backImageX.splice(0,0,(Math.floor(Math.random()*1000)));
			this.backImageY.splice(0,0,999);
			this.backImageYSpeed.splice(0,0,-100);
		};
		
		this.removeFrame=function(i){
			this.backImageX.splice(i,1);
			this.backImageY.splice(i,1);
			this.backImageYSpeed.splice(i,1);
		};
		
		this.updateFrame=function(frameNumber){
			this.backImageX[frameNumber]+=this.backImageXSpeed*point.slider.delta;
			this.backImageY[frameNumber]+=this.backImageYSpeed[frameNumber]*point.slider.delta;
			if(this.backImageX[frameNumber]>this.incrementX)this.backImageX[frameNumber]=1;
			if(this.backImageY[frameNumber]>this.incrementY){this.removeFrame(frameNumber);this.addFrame();};
			
			if(this.backImageX[frameNumber]<0)this.backImageX[frameNumber]=999;
			if(this.backImageY[frameNumber]<333){this.backImageYSpeed[frameNumber]*=-1;this.backImageY[frameNumber]=333;};
			
			
		};
		
		//TODO I need to rewrite these to draw them differently
		
		this.draw=function(){
			if(this.startTimeLeft>0){
				this.startDraw();
			}else if(this.blackOutTimeLeft>0){
				this.blackOutDraw();
			}else{
				this.normalDraw();
			};
		};
		
		this.blackOutDraw= function(){
			point.sketchPad.frontBuffer.addQuad({x:0,y:0,width:point.sketchPad.width,height:point.sketchPad.height,color:"#00b300",filled:true});
		};
		
		this.startDraw=function(){
			point.sketchPad.backBuffer.addSprite({sprite:this.planetImage,x:this.planetImageX-this.planetImageWidth/2,y:this.planetImageY-this.planetImageHeight,width:this.planetImageWidth,height:this.planetImageHeight,clipX:0,clipY:0,clipWidth:this.planetImage.width,clipHeight:this.planetImage.height});
			//alert("x:"+this.planetImageX+" y:"+this.planetImageY+" width"+this.planetImageWidth+" height:"+this.planetImageHeight+" clipWidth"+this.planetImage.width+" clipHeight:"+this.planetImage.height);
		};
		
		this.normalDraw=function(){
			point.sketchPad.backBuffer.addSprite({sprite:this.moonImage,x:point.sketchPad.gameAreaX1,y:point.sketchPad.gameAreaY1,width:point.sketchPad.gameAreaWidth,height:point.sketchPad.gameAreaHeight,clipX:0,clipY:0,clipWidth:this.moonImage.width,clipHeight:this.moonImage.height});//this is the moon sprite
			for (var i=0;i<this.backImageX.length;i++){
				this.drawFrame(i);
			};
			point.sketchPad.gameBuffer.addText({x:point.sketchPad.gameAreaWidth/2,y:point.world.toSketchSpace(50).y,color:"#0079cc",text:"Congratulations",alignment:"center"});
			point.sketchPad.gameBuffer.addText({x:point.sketchPad.gameAreaWidth/2,y:point.world.toSketchSpace(75).y,color:"#39e600",text:"You Win!",alignment:"center"});
			point.sketchPad.gameBuffer.addText({x:point.sketchPad.gameAreaWidth/2,y:point.world.toSketchSpace(100).y,color:"#ff3300",text:"Thanks for playing!",alignment:"center"});
		};
		
		this.drawFrame=function(frame){
			//point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1,y:this.y1+this.width/4,width:this.width,height:this.height,clipX:0,clipY:0,clipWidth:this.backImage.width,clipHeight:this.backImage.height});
			
			var fractionX=this.backImageX[frame]/this.incrementX;
			var fractionY=this.backImageY[frame]/this.incrementY;
			
			var imageSplitX=this.backImage.width-this.backImage.width*fractionX;
			var imageSplitY=this.backImage.width-this.backImage.height*fractionY;
			var imageSplitWidth=this.backImage.width-imageSplitX;
			var imageSplitHeight=this.backImage.height-imageSplitY;
			
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1+this.width*fractionX,y:this.y1+this.height*fractionY,width:this.width-this.width*fractionX,height:this.height-this.height*fractionY,clipX:0,clipY:0,clipWidth:imageSplitX,clipHeight:imageSplitY});//bottom left
			point.sketchPad.backBuffer.addSprite({sprite:this.backImage,x:this.x1,y:this.y1+this.height*fractionY,width:this.width*fractionX,height:this.height-this.height*fractionY,clipX:imageSplitX,clipY:0,clipWidth:imageSplitWidth,clipHeight:imageSplitY});
			
			
		};
		
		this.returnSorted=function(){//given my draw system, the image in the front should be put in the queue first!
			var temp=[];
			
			
		};
	};
	
	
})();
/***********/

startup();
point.slider.setLoop(updateLoop);

/***********/
function startup(){//this should be invoked before the main loop for UI starts running
		point.UIManager.importElementsQueue(menus);
		point.UIManager.liveElements=point.UIManager.elementsQueue.mainMenu;
		//the issue here was that the UI was replacing the world with a new one. now all the world construction happens in the UI.
		//this may not be ideal, but it's easiest for now
		
		
		point.sketchPad.resize();
		point.starBackground=new StarBackground();
		
		point.dump={};//this is just a place to dump any objects that are in use by a menu, so they're out of the global scope
		
};

function updateLoop(){
	point.sketchPad.update();
	point.input.pollData();
	point.UIManager.update();
	point.sketchPad.test();
	//point.input.test();
	point.resourceCache.update();
	programFlow();

};
function programFlow(){//remember that the UI module actually deals with its own states
	point.sketchPad.backBuffer.addQuad({x:0,y:0,width:point.sketchPad.width,height:point.sketchPad.height,color:"#000000",filled:true});
	if(point.lastState!==point.state){point.dump={};};
	point.lastState=point.state;
	switch(point.state){
		case point.util.enumState.loading:
		if(point.resourceCache.isReady())point.state=point.util.enumState.mainMenu;
		point.sketchPad.gameFrontBuffer.addText({text:"loading...",x:point.sketchPad.gameAreaWidth/2,y:point.sketchPad.gameAreaHeight/2,color:"#3399ff",font:"200px bold Arial",alignment:"center"});
		point.sketchPad.gameFrontBuffer.addText({text:"processed "+point.resourceCache.loaded+"/"+point.resourceCache.number2Load,x:point.sketchPad.gameAreaWidth/2,y:point.sketchPad.gameAreaHeight*4/5,color:"#ffffff",font:"100px bold Arial",alignment:"center"});
		case point.util.enumState.mainMenu:
		point.starBackground.update();
		point.starBackground.draw();
		point.sketchPad.backBuffer.addQuad({x:0,y:0,width:point.sketchPad.width,height:point.sketchPad.height,color:"#000000",filled:true});
		break;
		case point.util.enumState.world:
		if(point.input.keyboard.pPressed==true&&point.world.lifeCount>=0){point.state=point.util.enumState.paused;};
		
		case point.util.enumState.gameComplete:
		point.world.update();
		point.world.getCollisions();
		point.world.resolveCollisions();
		point.world.draw();
		
		point.starBackground.update();
		point.starBackground.draw();
		
		break;
		case point.util.enumState.paused:
		if(point.input.keyboard.pPressed==true){point.state=point.util.enumState.world;};
		point.world.draw();
		break;
		case point.util.enumState.youSure:
		
		point.world.draw();
		break;
		case point.util.enumState.about:
		aboutGame();
		point.starBackground.update();
		point.starBackground.draw();
		break;
		case point.util.enumState.gameOver:
		gameOver();
		break;
		
		case point.util.enumState.gameComplete:
		gameComplete();
		break;
		
	};
};

function aboutGame(){
	point.sketchPad.backBuffer.addCircle({x:point.sketchPad.width/2,y:point.sketchPad.height/2,radius:point.sketchPad.height,filled:true,color:"#ffffff",thickness:1});
	point.sketchPad.backBuffer.addCircle({x:point.sketchPad.width/2,y:point.sketchPad.height/2,radius:point.sketchPad.height/2,filled:true,color:"#000000",thickness:1});
	point.sketchPad.gameBuffer.addSprite({sprite:point.resources["gun_cat.png"],x:point.sketchPad.gameAreaWidth*1/8,y:20,width:point.resources["gun_cat.png"].width/5,height:point.resources["gun_cat.png"].height/5,clipX:0,clipY:0,clipWidth:point.resources["gun_cat.png"].width,clipHeight:point.resources["gun_cat.png"].height});
	point.sketchPad.gameFrontBuffer.addText({text:"a game by Percy Rocca",x:point.sketchPad.gameAreaWidth/2,y:80,color:"#3399ff",font:"50px bold Arial"});
	//point.sketchPad.gameFrontBuffer.addText({text:"2016 application demo",x:point.sketchPad.gameAreaWidth/2,y:150,color:"#3399ff",font:"50px bold Arial"});
};

function gameOver(){//remember, since the AI always deals with the menus independently, this is just a graphic.
	if(!point.dump){
		
		
	};//this signals this is the first loop of execution!
	point.sketchPad.backBuffer.addQuad({x:0,y:0,width:point.sketchPad.width,height:point.sketchPad.height,color:"#800000",filled:true});
	
	
	point.sketchPad.frontBuffer.addText({text:"MISSION FAILURE",x:point.sketchPad.width/2,y:point.sketchPad.height/2,color:"#00cc00",alignment:"center",font:"60px bold Arial"});
	
};

function gameComplete(){
	
};


function StarBackground(){//use this for the main menu
	this.stars=[];
	this.width=point.sketchPad.width;
	this.height=point.sketchPad.height;
	this.starLife=5;
	this.starDensity=1/5000;
	this.starAmount=this.starDensity*this.width*this.height;
	this.xSpeed=0;
	this.ySpeed=0.1;
	
	this.Star=function(settings){
		this.x=settings.x;
		this.y=settings.y;
		this.brightness=Math.random();
		this.isDed=false;
	};
	
	for(var i=0;i<this.starAmount;i++){
		this.stars.push(new this.Star({x:Math.random()*this.width,y:Math.random()*this.height}));
	};
	
	this.update=function(){
		this.width=point.sketchPad.width+this.xSpeed;
		this.height=point.sketchPad.height+this.ySpeed;
		this.starAmount=this.starDensity*this.width*this.height;
		for(var i=0;i<this.stars.length;i++){
			star=this.stars[i];
			star.x+=this.xSpeed*point.slider.delta*this.width;
			star.y+=this.ySpeed*point.slider.delta*this.height;
			star.brightness-=(1/this.starLife)*point.slider.delta;
			if(!star.brightness||star.brightness<=0||this.x<0||this.y<0||this.x>this.width||this.y>this.height){this.stars[i]=new this.Star({x:Math.random()*this.width,y:Math.random()*this.height});};
		};
	};
	this.draw=function(){
		for(var i=0;i<this.stars.length;i++){
			star=this.stars[i];
			point.sketchPad.frontBuffer.addCircle({x:star.x+this.xSpeed,y:star.y-this.ySpeed,filled:true,radius:2,thickness:1,color:"#ffffff"});
		};
	};
};

