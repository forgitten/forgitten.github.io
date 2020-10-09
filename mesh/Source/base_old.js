function Orb(settings) {
	if (!settings)
		settings = {};

	this.defaultLayer = null;
	this.layers = {};
	//this.layerOrder = [];

	//defines when layers with unspecified indices should be drawn
	settings.unspecifiedLayerPlacement ? this.unspecifiedLayerPlacement = settings.unspecifiedLayerPlacement : this.unspecifiedLayerPlacement = Orb.Eorder.LAST;

	//TODO
	//this.canvas = defaultLayer.canvas;
	//this.elements = defaultLayer.elements;

};

Orb.Ealignments = {
	CENTER : "CENTER",
	LEFT : "LEFT",
	RIGHT : "RIGHT"
};
Orb.Eorder = {
	FIRST : "FIRST",
	MIDDLE : "MIDDLE",
	LAST : "LAST"
};

Orb.prototype.draw = function() {
	//TODO should iterate through layers and draw them. first I need to complete the table object which should use either a binary search tree or a combined array/object
};

Orb.prototype.log = function() {
	
};

Orb.prototype.assert = function(bool, message) {
	//TODO
	var text;
	if (!bool) {
		if ( typeof message === 'object' && message instanceof Error) {
			text = message.name + ":\n" + message.message;
		} else if ( typeof message === 'string') {
			text = "there was a fatal error:\n" + message;
		} else {
			text = "there was an unidentified fatal error";
		}
		;

		alert(text);

		Orb.draw = undefined;
	};
};

Orb.createLayer = function(options, name, inject){
	var layer = new this.Layer;
	
	
	
};

Orb.prototype.addLayer = function( layer, name ) {
	
	
	
};

Orb.prototype.removeLayer = function() {

};

Orb.defaultLayer = function(layer) {
	//TODO check if it's also actually attached to its parent?
	this.assert((layer instanceof Orb.prototype.layer), new Error("Orb.defaultLayer only takes in layer objects as parameters, other types of objects can't be added"));
	
	if (layer) {
		this.defaultLayer = layer;
		this.elements = layer.elements;
		//TODO add other default stuff
	};
	return this.defaultLayer;
};

/*Orb Layer Object represents
 *
 */

function Layer(options) {
	//TODO
	
	if (!options)
		options = {};
		
	options.canvas ? this.canvas = options.canvas : this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	(typeof options.alwaysFillScreen !== 'undefined') ? this.alwaysFillScreen = options.alwaysFillScreen : this.alwaysFillScreen = false;
	(typeof options.shouldSort !== 'undefined') ? this.shouldSort = options.shouldSort : this.shouldSort = true;
	(typeof options.shouldDiscardElements !== 'undefined') ? this.shouldDiscardElements = options.shouldDiscardElements : this.shouldDiscardElements = true;

	window.addEventListener('resize', this.resizeEventHandler.bind(this));

	this.elements = [];

	(typeof options.alwaysFillScreen!== 'undefined' )? this.alwaysFillScreen = options.alwaysFillScreen : this.alwaysFillScreen = false;

	this.resizeEventHandler();
};
Layer.prototype = new Object();

Layer.prototype.compareElements = function(a, b) {
	var x = a.z || 0;
	var y = b.z || 0;
	if (x > y) {
		return 1;
	} else if (x < y) {
		return -1;
	} else {
		return 0;
	};
};
Layer.prototype.shouldFillScreen = function(maybe) {
	if (maybe)
		this.shouldFillScreen = maybe;
	return this.shouldFillScreen;
};

Layer.prototype.isInDOM = function() {
	var maybe = document.getElementById(this.name);
	return (maybe === null) ? false : true;

};
Layer.prototype.addToDOM = function(parent) {
	if (this.isInDOM())
		;
	//TODO throw error
	if ( typeof parent !== 'undefined')
		parent.appendChild(this.canvas);
	//else document.appendChild(this.canvas);

};

Layer.prototype.resizeEventHandler = function() {
	if (this.alwaysFillScreen === true) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	};
};

Layer.prototype.changeCanvas = function(canvas) {
	this.canvas = canvas;
	this.context = this.canvas.getContext('2d');
	this.resizeEvenHandler();
};

Layer.prototype.draw = function() {
	
	Orb.prototype.assert((typeof this.canvas === 'object'), new Error("Layer.prototype.draw contains no canvas to draw to"));
	Orb.prototype.assert((this.context === this.canvas.getContext('2d')), new Error("in Layer.prototype.draw, this layer's context does not match its canvas"));
	
	
		//TODO sorting is destroying  this. its either a bug in the sorting or I'm sending in bad parameters 
	if (this.shouldSort)
		Orb.prototype.array.mergeSort(this.elements, this.compareElements);

	var e;
	for (var i = 0; i < this.elements.length; i++) {
		e = this.elements[i];

		e.draw(this.context);

	};

	if (this.shouldDiscardElements)
		this.elements = [];
};

Orb.prototype.Layer = Layer;

// a base class for screen objects
Orb.prototype.Element = Element = function(options) {
	if (!options)
		options = {};

	options.pos ? this.pos = options.pos : this.pos = {
		x : 0,
		y : 0
	};
	options.dim ? this.dim = options.dim : this.dim = {
		w : 0,
		h : 0
	};

	options.rot ? this.rot = options.rot : this.rot = 0;
	options.piv ? this.piv = options.piv : this.piv = {
		x : 0,
		y : 0
	};

	options.z ? this.z = options.z : this.z = 0;

	options.alignment ? this.alignment = options.alignment : this.alignment = Orb.Ealignments.CENTER;

	if (options.fillStyle)
		this.fillStyle = options.fillStyle;
	if (options.strokeStyle)
		this.strokeStyle = options.fillStyle;
};

Element.prototype.draw = function(context) {
	Orb.prototype.log();

};
