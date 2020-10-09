define( ['main'], function(){


window.image = surface2d.add('Sprite', {src:"https://i.imgur.com/szaYYIq.jpg"});

window.cursor = surface2d.add('Sprite', {src: "https://i.imgur.com/uE5eD8T.jpg"});

window.update = function(delta){
	
	if(input.down('ArrowRight')) image.pos.x += 100 * delta;
	if(input.down('ArrowLeft')) image.pos.x -= 100 * delta;
	
	cursor.pos.x = input.mouse.x;
	
}




})