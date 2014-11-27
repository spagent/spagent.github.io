
var Juego = new Juego();

function init() {
	Juego.init();
}
var imagenRepository = new function() {
	// imagennes
	this.fondo = new imagen();
	this.nave = new imagen();
	this.bala = new imagen();
	this.enemigo = new imagen();
	this.enemigobala = new imagen();

	// asegurar que se carguen las imagennes
	var numimagenes = 5;
	var numCar = 0;
	function imagenCar() {
		numCar++;
		if (numCar === numimagenes) {
			window.init();
		}
	}
	this.fondo.onload = function() {
		imagenCar();
	}
	this.nave.onload = function() {
		imagenCar();
	}
	this.bala.onload = function() {
		imagenCar();
	}
	this.enemigo.onload = function() {
		imagenCar();
	}
	this.enemigobala.onload = function() {
		imagenCar();
	}

	// rutas de imagennes
	this.fondo.src = "imgs/bg.jpg";
	this.nave.src = "imgs/ship.png";
	this.bala.src = "imgs/bullet.png";
	this.enemigo.src = "imgs/enemy.png";
	this.enemigobala.src = "imgs/bullet_enemy.png";
}


/**
 * funcion base para que se dibuje todo
 */
function Dibujo() {
	this.init = function(x, y, width, height) {
		// variables default
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.velocidad = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.Colisionn = false;
	this.type = "";

	this.draw = function() {
	};
	this.move = function() {
	};
	this.isCollidableWith = function(object) {
		return (this.collidableWith === object.type);
	};
}


/**
 crear el fondo
 */
function fondo() {
	this.velocidad = 1; // velocidad del fondo

	
	this.draw = function() {
		// mTerminado
		this.y += this.velocidad;
		
		this.context.drawimagen(imagenRepository.fondo, this.x, this.y);

		// dibujar otra imagenn despues de la primera
		this.context.drawimagen(imagenRepository.fondo, this.x, this.y - this.canvasHeight);

		// reset de la imagenn
		if (this.y >= this.canvasHeight)
			this.y = 0;
	};
}

fondo.Test1 = new Dibujo();


/**
 * crear las balas en canvas main
 */
function bala(object) {
	this.alive = false; // verdadero si la bala esta en uso
	var self = object;
	/*
	 * valores de la bala
	 */
	this.spawn = function(x, y, velocidad) {
		this.x = x;
		this.y = y;
		this.velocidad = velocidad;
		this.alive = true;
	};

	/*
	 * si la bala sale de la pantalla borrarla
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
		this.y -= this.velocidad;

		if (this.Colisionn) {
			return true;
		}
		else if (self === "bala" && this.y <= 0 - this.height) {
			return true;
		}
		else if (self === "enemigobala" && this.y >= this.canvasHeight) {
			return true;
		}
		else {
			if (self === "bala") {
				this.context.drawimagen(imagenRepository.bala, this.x, this.y);
			}
			else if (self === "enemigobala") {
				this.context.drawimagen(imagenRepository.enemigobala, this.x, this.y);
			}

			return false;
		}
	};

	/*
	 * resetear valores de la bala
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.velocidad = 0;
		this.alive = false;
		this.Colisionn = false;
	};
}
bala.Test1 = new Dibujo();


/**
 * .
 *
 * cuadrantes
 */
function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	/*
	 * Limpia el cuadrante y todos los nodos del nodo.
	 */
	this.clear = function() {
		objects = [];

		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}

		this.nodes = [];
	};

	/*
	 * obtener todos los objetos del cuadrante
	 */
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 * regresa los objetos con los que puede tener colision
	 */
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}

		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 * insertar objetos al cuadrante
	 */
	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}

		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}

			return;
		}

		if (this.nodes.length) {
			var index = this.getIndex(obj);
			
			if (index != -1) {
				this.nodes[index].insert(obj);

				return;
			}
		}

		objects.push(obj);

		// prevenir division infinita
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}

			var i = 0;
			while (i < objects.length) {

				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	
	this.getIndex = function(obj) {

		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

		// 
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// 
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		// Si los objetos entran correctamente en el cuadrante
		if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		// 
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	/*
	 * divide el nodo
	 */
	this.split = function() {
		
		var subWidth = (this.bounds.width / 2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}


function Pool(maxSize) {
	var size = maxSize; // numero maximo de balas permitido
	var pool = [];

	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	}

	
	this.init = function(object) {
		if (object == "bala") {
			for (var i = 0; i < size; i++) {
				// inicializar el objeto
				var bala = new bala("bala");
				bala.init(0,0, imagenRepository.bala.width,
										imagenRepository.bala.height);
				bala.collidableWith = "enemigo";
				bala.type = "bala";
				pool[i] = bala;
			}
		}
		else if (object == "enemigo") {
			for (var i = 0; i < size; i++) {
				var enemigo = new enemigo();
				enemigo.init(0,0, imagenRepository.enemigo.width,
									 imagenRepository.enemigo.height);
				pool[i] = enemigo;
			}
		}
		else if (object == "enemigobala") {
			for (var i = 0; i < size; i++) {
				var bala = new bala("enemigobala");
				bala.init(0,0, imagenRepository.enemigobala.width,
										imagenRepository.enemigobala.height);
				bala.collidableWith = "ship";
				bala.type = "enemigobala";
				pool[i] = bala;
			}
		}
	};

	
	this.get = function(x, y, velocidad) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, velocidad);
			pool.unshift(pool.pop());
		}
	};

	/*
	 * Dos balas
	 */
	this.getTwo = function(x1, y1, velocidad1, x2, y2, velocidad2) {
		if(!pool[size - 1].alive && !pool[size - 2].alive) {
			this.get(x1, y1, velocidad1);
			this.get(x2, y2, velocidad2);
		}
	};

	/*
	 * dibuja bala. si la bala sale de la pantalla la mete al arreglo
	 */
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// solo dibuja una bala que ya no este viva
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}


/**
 * crea la nave del jugador
 */
function Ship() {
	this.velocidad = 5;
	this.balaPool = new Pool(30);
	var fireRate = 15;
	var counter = 0;
	this.collidableWith = "enemigobala";
	this.type = "ship";

	this.init = function(x, y, width, height) {
		// Dvariables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.Colisionn = false;
		this.balaPool.init("bala");
	}

	this.draw = function() {
		this.context.drawimagen(imagenRepository.nave, this.x, this.y);
	};
	this.move = function() {
		counter++;
		// mTerminado
		if (KEY_STATUS.left || KEY_STATUS.right ||
				KEY_STATUS.down || KEY_STATUS.up) {
			// mTerminado y redibujar
			this.context.clearRect(this.x, this.y, this.width, this.height);

			// actualizar x & y
			// redibujar nave
			
			if (KEY_STATUS.left) {
				this.x -= this.velocidad
				if (this.x <= 0) // Mantener al jugador en la pantalla
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.velocidad
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.velocidad
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			} else if (KEY_STATUS.down) {
				this.y += this.velocidad
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
		}

		// redibujar nave
		if (!this.Colisionn) {
			this.draw();
		}
		else {
			this.alive = false;
			Juego.JuegoTerminado();
		}

		if (KEY_STATUS.space && counter >= fireRate && !this.Colisionn) {
			this.fire();
			counter = 0;
		}
	};

	/*
	 * disparar dos balas
	 */
	this.fire = function() {
		this.balaPool.getTwo(this.x+6, this.y, 3,
		                       this.x+33, this.y, 3);
		Juego.laser.get();
	};
}
Ship.Test1 = new Dibujo();


/**
 * crear nave enemigo
 */
function enemigo() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bala";
	this.type = "enemigo";

	/*
	 * valores del enemigo
	 */
	this.spawn = function(x, y, velocidad) {
		this.x = x;
		this.y = y;
		this.velocidad = velocidad;
		this.velocidadX = 0;
		this.velocidadY = velocidad;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 90;
		this.bottomEdge = this.y + 140;
	};

	/*
	 * movimiento enemigo
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.velocidadX;
		this.y += this.velocidadY;
		if (this.x <= this.leftEdge) {
			this.velocidadX = this.velocidad;
		}
		else if (this.x >= this.rightEdge + this.width) {
			this.velocidadX = -this.velocidad;
		}
		else if (this.y >= this.bottomEdge) {
			this.velocidad = 1.5;
			this.velocidadY = 0;
			this.y -= 5;
			this.velocidadX = -this.velocidad;
		}

		if (!this.Colisionn) {
			this.context.drawimagen(imagenRepository.enemigo, this.x, this.y);

			// oportunidad de disparo 
			chance = Math.floor(Math.random()*101);
			if (chance/100 < percentFire) {
				this.fire();
			}

			return false;
		}
		else {
			Juego.playerScore += 10;
			Juego.explosion.get();
			return true;
		}
	};

	/*
	 * disparar bala
	 */
	this.fire = function() {
		Juego.enemigobalaPool.get(this.x+this.width/2, this.y+this.height, -2.5);
	};

	/*
	 * resetearvalores enemigo
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.velocidad = 0;
		this.velocidadX = 0;
		this.velocidadY = 0;
		this.alive = false;
		this.Colisionn = false;
	};
}
enemigo.Test1 = new Dibujo();


 /**
 * objeto de juego
 */
function Juego() {
	/*
	 * informacion canvas y contexto
	
	 */
	this.init = function() {
		// elemento canvas(3)
		this.bgCanvas = document.getElementById('fondo');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');

		
		// check canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			
			fondo.Test1.context = this.bgContext;
			fondo.Test1.canvasWidth = this.bgCanvas.width;
			fondo.Test1.canvasHeight = this.bgCanvas.height;

			Ship.Test1.context = this.shipContext;
			Ship.Test1.canvasWidth = this.shipCanvas.width;
			Ship.Test1.canvasHeight = this.shipCanvas.height;

			bala.Test1.context = this.mainContext;
			bala.Test1.canvasWidth = this.mainCanvas.width;
			bala.Test1.canvasHeight = this.mainCanvas.height;

			enemigo.Test1.context = this.mainContext;
			enemigo.Test1.canvasWidth = this.mainCanvas.width;
			enemigo.Test1.canvasHeight = this.mainCanvas.height;

			// inicializar fondo
			this.fondo = new fondo();
			this.fondo.init(0,0); // Set draw point to 0,0

			// inicializar nave
			this.ship = new Ship();
			
			this.shipStartX = this.shipCanvas.width/2 - imagenRepository.nave.width;
			this.shipStartY = this.shipCanvas.height/4*3 + imagenRepository.nave.height*2;
			this.ship.init(this.shipStartX, this.shipStartY,
			               imagenRepository.nave.width, imagenRepository.nave.height);

			
			this.enemigoPool = new Pool(30);
			this.enemigoPool.init("enemigo");
			this.spawnWave();

			this.enemigobalaPool = new Pool(50);
			this.enemigobalaPool.init("enemigobala");

			// 
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});

			this.playerScore = 0;

			// AUDIO
			this.laser = new SoundPool(10);
			this.laser.init("laser");

			this.explosion = new SoundPool(20);
			this.explosion.init("explosion");

			this.fondoAudio = new Audio("sounds/kick_shock.wav");
			this.fondoAudio.loop = true;
			this.fondoAudio.volume = .25;
			this.fondoAudio.load();

			this.JuegoTerminadoAudio = new Audio("sounds/Game_Over.wav");
			this.JuegoTerminadoAudio.loop = true;
			this.JuegoTerminadoAudio.volume = .25;
			this.JuegoTerminadoAudio.load();

			this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
		}
	};

	// nuevos enemigos
	this.spawnWave = function() {
		var height = imagenRepository.enemigo.height;
		var width = imagenRepository.enemigo.width;
		var x = 100;
		var y = -height;
		var spacer = y * 1.5;
		for (var i = 1; i <= 18; i++) {
			this.enemigoPool.get(x,y,2);
			x += width + 25;
			if (i % 6 == 0) {
				x = 100;
				y += spacer
			}
		}
	}

	// ciclo animacion
	this.start = function() {
		this.ship.draw();
		this.fondoAudio.play();
		animate();
	};

	// restart juego
	this.restart = function() {
		this.JuegoTerminadoAudio.pause();

		document.getElementById('Juego-Terminado').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

		this.quadTree.clear();

		this.fondo.init(0,0);
		this.ship.init(this.shipStartX, this.shipStartY,
		               imagenRepository.nave.width, imagenRepository.nave.height);

		this.enemigoPool.init("enemigo");
		this.spawnWave();
		this.enemigobalaPool.init("enemigobala");

		this.playerScore = 0;

		this.fondoAudio.currentTime = 0;
		this.fondoAudio.play();

		this.start();
	};

	// Juego Terminado
	this.JuegoTerminado = function() {
		this.fondoAudio.pause();
		this.JuegoTerminadoAudio.currentTime = 0;
		this.JuegoTerminadoAudio.play();
		document.getElementById('Juego-Terminado').style.display = "block";
	};
}

/**
 * asegurar sonido cargado
 */
function checkReadyState() {
	if (Juego.JuegoTerminadoAudio.readyState === 4 && Juego.fondoAudio.readyState === 4) {
		window.clearInterval(Juego.checkAudio);
		document.getElementById('loading').style.display = "none";
		Juego.start();
	}
}


/**
 * sonidos
 */
function SoundPool(maxSize) {
	var size = maxSize; // Cantidad maxima de balas
	var pool = [];
	this.pool = pool;
	var currSound = 0;

	
	this.init = function(object) {
		if (object == "laser") {
			for (var i = 0; i < size; i++) {
				//inicializar objeto
				laser = new Audio("sounds/laser.wav");
				laser.volume = .12;
				laser.load();
				pool[i] = laser;
			}
		}
		else if (object == "explosion") {
			for (var i = 0; i < size; i++) {
				var explosion = new Audio("sounds/explosion.wav");
				explosion.volume = .1;
				explosion.load();
				pool[i] = explosion;
			}
		}
	};

	/*
	 * play sonido
	 */
	this.get = function() {
		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			pool[currSound].play();
		}
		currSound = (currSound + 1) % size;
	};
}



function animate() {
	document.getElementById('score').innerHTML = Juego.playerScore;

	// insertar objetos
	Juego.quadTree.clear();
	Juego.quadTree.insert(Juego.ship);
	Juego.quadTree.insert(Juego.ship.balaPool.getPool());
	Juego.quadTree.insert(Juego.enemigoPool.getPool());
	Juego.quadTree.insert(Juego.enemigobalaPool.getPool());

	detectarCollision();

	// no mas enemigos
	if (Juego.enemigoPool.getPool().length === 0) {
		Juego.spawnWave();
	}

	// animar objetos
	if (Juego.ship.alive) {
		requestAnimFrame( animate );

		Juego.fondo.draw();
		Juego.ship.move();
		Juego.ship.balaPool.animate();
		Juego.enemigoPool.animate();
		Juego.enemigobalaPool.animate();
	}
}

function detectarCollision() {
	var objects = [];
	Juego.quadTree.getAllObjects(objects);

	for (var x = 0, len = objects.length; x < len; x++) {
		Juego.quadTree.findObjects(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++) {

			// detectarar colision
			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].Colisionn = true;
				obj[y].Colisionn = true;
			}
		}
	}
};

KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}


KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Eventos tecla
 */
document.onkeydown = function(e) {
	// Firefox y opera ultizan charCode en lugar de keyCode también
	
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
		e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* funcion */ callback, /* Elemento */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();