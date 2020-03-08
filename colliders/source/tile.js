(function(){
	//implements collision on tile maps of arbitrary sizes
	//unlike my current geometric primitive tests, will use the speed of the collider to manage response.
	
	var sanityChecks = {
		samePoint:function(p1, p2){
			
		}
	};
	
	
	
	
	
	
	
	
	function TileMap(data){
		this.offset;//you might want your internal coordinate system to have 0 0 point to the *middle* of the tile map
		
		
		this.types; //enumerator of what values represent what types
		this.tileSize = data.tileSize;
		//TODO maybe copy this?
		this.map = data.map;//2d array of numbers. map is reversed, so each entry in the main array is a row.
	};
	
	
	TileMap.prototype = {
		getTileIndex:function( point1){//given a point, return what tile indices that point intersects
			
			return {
				x:Math.floor(point1.x / this.tileSize),
				y:Math.floor(point1.y / this.tileSize)
			};
		},
		
		//TODO maybe reverse this
		place:function(x, y, type){
			if(Array.isArray(x)){
				for(var i = 0; i < x.length; i++){
					for(var j = 0; j < x[i].length; j++){
						this.place(i, j, x[i][j]);
					}
				}
			};
			
			//todo error checks to make sure tile is in range, and type is valid
			//we reverse when setting tiles.
			this.map[y][x] = type;
		},
		
		
		//for now assume aabb with b2 being difference not other point
		//return part of move that doesnt violate tiles as vector.
		resolve:function(b1, b2, v){//bounding box and attempted move
			//the line that it moves
			if(v.x == 0 && v.y == 0) throw "no motion vector";
			
			var x1 = (v.x > 0) ? b2.x : b1.x;
			var x2 = x1 + v.x;
			var y1 = (v.y > 0) ? b2.y : b1.y;
			var y2 = y1 + v.y;
			
			var index = this.getTileIndex({x:x2, y:y2});
			if(index.y < 0 || index.y > this.map.length) throw "out of bounds on y";
			if(index.x < 0 || index.x > this.map[index.y].length) throw "out of bounds on x";
			var tileType = this.map[index.y][index.x];
			
			if(tileType < 1) return v;
			
			var move = TileMap.DefaultTypes[tileType].resolve(
				{x:index.x * this.tileSize, y:index.y * this.tileSize},
				{x:index.x * this.tileSize + this.tileSize, y:index.y * this.tileSize + this.tileSize },
				{x:x1, y:y1},
				{x:x2, y:y2}
			);
			
			return move;
		}
	};
	
	TileMap.DefaultTypes = {};
	
	
	//types only operate on *rays* so the system that feeds data into them should figure out the directed ray, not send them primitives.
	TileMap.DefaultTypes.solid = TileMap.DefaultTypes["1"] = {
		resolve:function(b1, b2, p1, p2){//given a box and a  ray, cut that ray so that it is outside the box.
		
		//TODO what is the behavior of this in the case of a miss?
			var xExtent = (p2.x > p1.x) ? b1.x : b2.x;
			var yExtent = (p2.y > p1.y) ? b1.y : b2.y;
			
			var xTime = (xExtent - p1.x) / (p2.x - p1.x), yTime =(yExtent - p1.y) / (p2.y - p1.y);
			//find out which extent it actually hits, if any
			var time = (xTime < yTime) ? xTime : yTime;
			
			
			//TODO add an error bound if the endpoint is not in contact with the box.
			return {
				x:(p2.x - p1.x) * time,
				y:(p2.y - p1.y) * time
			};
		}
	};
	
	
	
	window.TileMap = TileMap;
})()