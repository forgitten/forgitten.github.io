//defines a simple overlay console for tracking the value of variables or outputting warning messages and running code


// the rjs optimizer wont recognize the class keyword so this is sortof not useful unless I refactor it
//I'm only doing it this way to test js classes
class DebugConsole{
	constructor( canvas ){
		this.visible = true;
		this.opacity = 1;
		
		this.active = false;
		this.lastActive = Date.now();
		
		this.messages = [];
		this.lastMessage;
		this.maxMessageCount = 200;
		this.maxVisibleMessageCount = 30;
		
		this.watchValues = [];
		
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');
		
		this.foregroundColor = "#00b300";
		
		this.promptText;
		this.promptCursor;
		
	}
	
	flip( choice ){
		
		this.visible = (typeof choice !== 'undefined') ? choice : !this.visible;
		
		return this.visible;
		
	}
	
	
	active( choice ){
		
	}
	
	
	draw(){
		if(!this.visible) return;
		
		
		
		this.context.save();
		this.context.lineWidth =1;
		this.context.opacity = this.opacity;
		this.context.strokeStyle = this.foregroundColor;
		
		this.context.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
		
		
		this.drawText('debugging enabled', {x:10,y:30});
		
		this.watchValues.forEach(
			function( w, i ){
				
			}
		);
		
		this.messages.forEach(function(m, i){
			
		});
		
		
		this.context.restore();
	}
	
	
	autoRun(){//updates the console on a set interval automatically
		var delta, lastTime = Date.now(), currentTime;
		
		this.intervalId = window.setInterval(function(){
			
			currentTime = Date.now();
			delta = currentTime - lastTime;
			
			
			
			this.update( delta );
			this.draw( delta );
			
			lastTime = currentTime;
		}, 100);
	}
	
	
	
	
	message( message ){
		
		
		
	}
	
	input( values ){
		
	}
	
	
	
	watch( value ){
		
	}
	
	unwatch( value ){
		
	}
	
	//this should be called once to make this console replace normal logging functions
	captureNative(){
		
	}
	
	
	drawText(t, position, opacity = 1, align){
		
		this.context.save();
		
		this.context.font = "15px verdana";
		this.context.shadowColor = "black";
		this.context.shadowBlur = 2;
		this.context.fillStyle = this.foregroundColor;
		this.context.opacity = opacity;
		
		
		this.context.fillText(t, position.x, position.y);
		
		this.context.restore();
	}
}