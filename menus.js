var menus={
	loading:[
	],
	
	mainMenu:[
	{xPos:200,yPos:200,text:"start game",color:"#660066",borderColor:"#ff9900",textColor:"#000099",fontSize:100,fontName:"Arial",borderThickness:14,onPress:function(){point.world=new point.makeWorld();point.world.commense();point.world.AI.loadLevel(1);point.state=point.util.enumState.world;},downColor:"#ff0066"},
	{xPos:275,yPos:400,text:"about the game",color:"#ffff00",borderColor:"#ff9900",fontSize:50,fontName:"sans-serif",borderThickness:14,onPress:function(){point.state=point.util.enumState.about;},downColor:"#ff0066"}
	],
	
	paused:[{xPos:80,yPos:200,text:"return to the game",color:"#ffff00",borderColor:"#ff9900",fontSize:60,fontName:"px Arial",borderThickness:14,onPress:function(){point.state=point.util.enumState.world;},downColor:"#ff0066"},
	{xPos:80,yPos:600,text:"Quit Game",color:"#e60000",borderColor:"#ff9900",fontSize:100,fontName:"Arial",textColor:"#6600cc",borderThickness:14,onPress:function(){point.state=point.util.enumState.youSure;},downColor:"#ff0066"}
	],
	
	youSure:[{xPos:50,yPos:650,text:"Yes, Quit",color:"#ff9999",textColor:"#b30000",downColor:"#ffff00",fontSize:60,fontName:"Arial",onPress:function(){point.state=point.util.enumState.mainMenu;}},
	{xPos:360,yPos:650,text:"No, Keep Playing",color:"#000099",textColor:"#33ccff",downColor:"#ace600",fontSize:60,fontName:"Arial",onPress:function(){point.state=point.util.enumState.world;}}
	],
	
	world:[],
	
	about:[{xPos:80,yPos:600,text:"back to main",color:"#000099",borderColor:"#009933",fontSize:100,fontName:"Arial",borderThickness:4,onPress:function(){point.state=point.util.enumState.mainMenu;}}],
	
	gameOver:[{xPos:100,yPos:400,text:"back to main",color:"#000099",borderColor:"#009933",fontSize:100,fontName:"Arial bold",borderThickness:4,onPress:function(){point.state=point.util.enumState.mainMenu;}},
	{xPos:100,yPos:600,text:"keep playing!",color:"#b2ff1a",borderColor:"#4dffff",fontSize:100,fontName:"Arial bold",borderThickness:4,onPress:function(){point.world.lifeCount=3;point.state=point.util.enumState.world;point.world.actors=[];point.world.commense();}}
	],
	
	gameComplete:[{xPos:200,yPos:500,fontSize:100,fontName:"Arial Bold",text:"back to main",onPress:function(){point.state=point.util.enumState.mainMenu;}},
	{xPos:200,yPos:650,fontSize:100,fontName:"Arial Bold",text:"endless mode",onPress:function(){point.world.AI.currentState="endless";point.state=point.util.enumState.world;}}
	]
};

var levelData=[
{/*each of these is the values for a level. array element zero is not a level, and does not have any data*/},
{asteroidYSpeed:100,asteroidTime:3.0,windX:10,windY:0,seekerTokenRandomTime:"nan",enemyShipRandomTime:"nan",enemyShipSmartness:"nan",mineChance:"nan",backgroundImage:"nebula.png"},//level 1
{asteroidYSpeed:200,asteroidTime:2.0,windX:10,windY:0,seekerTokenRandomTime:"nan",enemyShipRandomTime:   10,enemyShipSmartness:   10,mineChance:"nan",backgroundImage:"deepSpace.png",message:"watch out for enemy ships!"},//level 2
{asteroidYSpeed:200,asteroidTime:2.0,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:   10,enemyShipSmartness:   10,mineChance:"nan",backgroundImage:"lightSpace.png",message:"press z to fire missiles!"},//level 3
{asteroidYSpeed:250,asteroidTime:1.0,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:   10,enemyShipSmartness:   20,mineChance:"nan",backgroundImage:"nebula.png",message:"collect yellow seeker tokens for more seekers!"},//level 4
{asteroidYSpeed:250,asteroidTime:1.0,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:    7,enemyShipSmartness:   30,mineChance:    5,backgroundImage:"deepSpace.png",message:"beware of mines!"},//level 5
{asteroidYSpeed:250,asteroidTime:0.5,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:    7,enemyShipSmartness:   40,mineChance:    4,backgroundImage:"lightSpace.png"},//level 6
{asteroidYSpeed:300,asteroidTime:0.5,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:"nan",enemyShipSmartness:"nan",mineChance:  0.5,backgroundImage:"nebula.png"},//level 7
{asteroidYSpeed:300,asteroidTime:0.3,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:    7,enemyShipSmartness:   50,mineChance:    3,backgroundImage:"deepSpace.png"},//level 8
{asteroidYSpeed:300,asteroidTime:0.3,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:    5,enemyShipSmartness:   60,mineChance:    2,backgroundImage:"nebula.png"},//level 9
{asteroidYSpeed:350,asteroidTime:0.3,windX:10,windY:0,seekerTokenRandomTime:   15,enemyShipRandomTime:    5,enemyShipSmartness:   70,mineChance:    2,backgroundImage:"deepSpace.png"},//level 10
];
