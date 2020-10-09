//creates an extra step in the object generating process to apply parent's values to children elements.


//remember that 3d object linking is different in a few ways, so this only handles 2d screen objects. a different routine would have to be applied to mesh data.
//since mesh data practically must utilize parenting, it should be a part of the base library anyway.


define(['../element', '../surface'],function(){
	
	
	//one thing I'm not sure about is if theres any advantage to child objects being also listed in the array
	Haze.meta.define(Haze.meta.Element.prototype, {
		applyChain:function(){//applies this element's transitive features to its children's computed
			if(this.children)
				
			//modifier that encapsulates the transform of this element so it can be added to another.
			var myModifier = Haze.meta.Modifier( this.pos, this.size, this.rot, this.piv );
				
			this.children.forEach(function( c ){
				//first recursively apply its children, THEN apply our modifier recursively so the top level ones remain top level
				
				c.applyChain();
				
				c.modifiers.push( myModifier );
				
			}, this);
				
			
		}
		
	});
	
	
	//??? what woulld this be used for, chaining screens?
	Haze.meta.define( Haze.meta.Surface.prototype,
		{
			
			//applies the parent factors to all children
			chain:function(){
				this.elements.forEach(function(e){
					
				});
			}
		}
	);
	
	
	
	
})