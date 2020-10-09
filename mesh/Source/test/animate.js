/*tests animations
*/
require(['main'], function(){

window.x = 5;
window.t = graphSystem.tween(window, 'x', {min:-10, max:10, onLoop:"restart", increment: -1 });

window.rect = surface2d.add('Rect', {pos:{x:100, y:30}, size:{x:20,y:20},fillStyle:"orange", borderStyle:"yellow"});
window.r = graphSystem.tween(rect.size, 'y', {increment:5});

window.shape = surface2d.add('Polygon', {pos:{x:200,y:100}, fillStyle:"green", borderStyle:"purple",points:[{x:0,y:0},{x:10,y:-30},{x:40,y:40},{x:20,y:30}]});

window.s = graphSystem.tween(shape.pos, 'x', {min:0, max:400, increment:200, onLoop:"reverse"});

window.update = function( delta ){
	t.update( delta );
	s.update(delta );
	r.update(delta);
}

})