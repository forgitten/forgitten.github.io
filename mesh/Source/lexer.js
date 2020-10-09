(function(scope, factory){
	
//this file should just return an AST not work on any execution
	
})(this, function(){
	
	
	//right now I'm going to harcode the lexigraphical conventions, at some point they could be defined in a different file.
	var operators = {
			"+":"plus",
			"-":"minus",
			"val":"value",
		}
	
	
	
	var program = function(){
		this.instructions = [];
	}
	
	
	
	
	var lexer = function(){
		this.pointer = 0;
		
		
		
		return;
	}
	
	lexer.prototype = lexer.f = {
		//compile should return a string of javascript code
		compile:function( code ){
			
			var program;
			
			var token;
			while(){
				
			}
			
			
		},
		//interpret should be more live
		interpret:function( code ){
			
		},
		
		//this is used for situations when the next character in the stream should determine whether this one ends.
		peek:function(){
			
		},
		
		
		//should handle the error situation that a token is found to be out of place, or cannot be completed
		choke:function(){
			
		},
		
		next:function(){
			
		}
	}
	
	
	var minicode = "
		val 
	";
});