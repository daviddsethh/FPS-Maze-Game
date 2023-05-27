//************************************************************
//************************************************************
// Important game constants
const TWO_PI = Math.PI * 2;

// Game Map Cells
// Number determines cell color
// Negative numbers are floor for movement
// Positive numbers are walls that block movement
var map = [ 
	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
      [1,-1,2,1,-1,-1,-1,-1,2,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,3,-1,2,-1,2,3,1,-1,-1,1,1], 
      [1,-1,3,-1,2,-1,-1,-1,-1,1,-1,-1,-1,1,3,1], 
      [1,3,2,-1,1,3,2,3,-1,-1,-1,3,-1,3,2,1], 
      [1,-1,-1,-1,-1,2,-1,-1,-1,2,-1,2,-1,-1,3,1], 
      [1,-1,3,2,3,1,-1,3,-1,-1,2,1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,3,1], 
      [1,3,2,3,-1,2,-1,2,-1,-1,-1,2,-1,-1,2,1], 
      [1,2,-1,-1,2,1,-1,-1,-1,3,-1,2,3,-1,-1,1], 
      [1,1,-1,2,-1,-1,-1,2,1,-1,-1,-1,-1,-1,-1,1], 
      [1,2,-1,-1,-1,2,-1,-1,-1,-1,-1,2,-1,1,3,1], 
      [1,-1,-1,2,3,1,3,-1,-1,2,-1,1,-1,-1,2,1], 
      [1,-1,2,-1,-1,-1,1,3,-1,1,-1,2,3,-1,-1,1], 
      [1,-1,3,-1,2,-1,-1,-1,-1,2,-1,-1,-1,-1,-1,1], 
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

	
//************************************************************
//************************************************************
// Minimap Class Characteristics and Functionality
var minimap = {
	// initialize object
	init: function() {
		// Initialization of minimap characteristics
		this.element = document.getElementById('minimap');
        this.context = this.element.getContext("2d");
        this.element.width = 300;
        this.element.height = 300;
        this.width = this.element.width;
        this.height = this.element.height;
        this.cellsAcross = map[0].length;
        this.cellsDown = map.length;
        this.cellWidth = this.width/this.cellsAcross;
        this.cellHeight = this.height/this.cellsDown;
        this.colors = ["#ffff00", "#ff00ff", "#00ffff", "#0000ff"];
		
		// Draw minimap 
		this.draw = function() {
			 for(var y = 0; y < this.cellsDown; y++){
				for(var x = 0; x < this.cellsAcross; x++){
					var cell = map[y][x];
					if (cell === -1){
						this.context.fillStyle = "#ffffff"
					}
					else {
						this.context.fillStyle = this.colors[map[y][x]];
					};
					this.context.fillRect(this.cellWidth * x, this.cellHeight * y, this.cellWidth, this.cellHeight);
				};  // end for-cellsAcross
			};  // end for-cellsDown

		}; // end init.draw function
		
	} // end init function
}; // end minimap object


//************************************************************
//************************************************************
// Special helper function to determine if there is
// a wall block at this map location
function containsBlock(x,y) {
	return (map[Math.floor(y)][Math.floor(x)] !== -1); 
};


//************************************************************
//************************************************************
// Palette to set up wall, floor and sky colors
var palette = {
	// initialize object
	init: function() {
		this.ground = '#DFD3C3'; 
		this.sky = '#418DFB'; 
		this.shades = 300;
		var initialWallColors = [
					[85, 68, 102], 
					[255, 53, 91], 
					[255, 201, 52], 
					[118, 204, 159]
		];  // end wall colors
		
		this.walls = [];
		for(var i = 0; i < initialWallColors.length; i++) {
			this.walls[i] = [];
			for(var j = 0; j < this.shades; j++) {
				var red = Math.round(initialWallColors[i][0] * j / this.shades); 
				var green = Math.round(initialWallColors[i][1] * j / this.shades);
				var blue =  Math.round(initialWallColors[i][2] * j / this.shades);
				var color = "rgb("+red+","+green+","+blue+")";
				this.walls[i].push(color);
			};
		};

	} // end palette init
}; // end palette


// Canvas object to draw 3D View
var gameCanvas = {
	// initialize object
	init: function() {
		this.element = document.getElementById('gameCanvas');
		this.context = this.element.getContext("2d");
		this.width = this.element.width;
		this.height = this.element.height;
		this.halfHeight = this.height / 2;
		
		// blank out viewport before drawing
		this.blank = function() {
			this.context.clearRect(0, 0, this.width, this.height);
			this.context.fillStyle = palette.sky;
			this.context.fillRect(0, 0, this.width, this.halfHeight);
			this.context.fillStyle = palette.ground;
			this.context.fillRect(0, this.halfHeight, this.width, this.height);
			
		} // end blank function
		
		// draw a sliver of the viewport
		this.drawSliver = function(sliver, wallTop, wallBottom, color) {
			this.context.beginPath();
			this.context.strokeStyle = color;
			this.context.moveTo(sliver + .5, wallTop);
			this.context.lineTo(sliver + .5, wallBottom);
			this.context.closePath();
			this.context.stroke();			
		} // end drawSliver function
	} // end gameCanvas init
}; // end gameCanvas
  

//************************************************************
//************************************************************
// rayCaster Object
// Performs pseudo 3D rendering
var rayCaster = {
	// initialize object
	init: function() {
		// important object values
		this.maxDistance = Math.sqrt(minimap.cellsAcross * minimap.cellsAcross + minimap.cellsDown * minimap.cellsDown);
		var numberOfRays = 300;
		var angleBetweenRays = 0.2 * Math.PI / 180;

		
		// Draw the game view by drawing multiple "rays"
		this.castRays = function() {
			minimap.rays = [];			// for 2D minimap
			foregroundSlivers = [];     // for 3D view 
			backgroundSlivers = [];		// for 3D view 
						 
			for (var i = 0; i < numberOfRays; i++) {
			var rayNumber = -numberOfRays / 2 + i;
			var rayAngle = angleBetweenRays * rayNumber + player.angle;
			this.castRay(rayAngle, i);			 
			} //  end for number of rays
			
		} // end castRays
		
		// Draw a single ray based on location and view direction
		this.castRay = function(rayAngle, i) {
			rayAngle %= TWO_PI;
			if(rayAngle < 0) rayAngle += TWO_PI;
			var right = (rayAngle > TWO_PI * 0.75 || rayAngle < TWO_PI * 0.25);
			var up = rayAngle > Math.PI;
			var slope = Math.tan(rayAngle);
			var distance = 0;
			var xHit = 0;
			var yHit = 0;
			var dX = right ? 1 : -1; 
			var dY = dX * slope;  
			var x = right ? Math.ceil(player.x) : Math.floor(player.x);
			var y = player.y + (x - player.x) * slope; 
			var wallType = -1;
			var hitWall = false;  // for removing break statement
			
			while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown && !hitWall) {
				var wallX = Math.floor(x + (right ? 0 : -1));
				var wallY = Math.floor(y);
				hitWall = map[wallY][wallX] > -1;
				if (hitWall) {
					var distanceX = x - player.x;
					var distanceY = y - player.y;
					distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
						distance = blockDistance;
						xHit = x;  
						yHit = y;
						wallType = map[wallY][wallX];   // needed for 3D view									
				}  // end if hitWall
				else {
					if(dino.x === wallX && dino.y === wallY) {
						dino.show = true;
					};
				}  // end if-else check for dine in viewport
				
				x += dX; 
				y += dY;
			} // end while
			
			slope = 1 / slope;
			dY = up ? -1 : 1;
			dX = dY * slope;
			y = up ? Math.floor(player.y) : Math.ceil(player.y);
			x = player.x + (y - player.y) * slope;
			hitWall = false;   // for removing break statement
			
			while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown && !hitWall) {
				var wallY = Math.floor(y + (up ? -1 : 0));
				var wallX = Math.floor(x);
				hitWall = map[wallY][wallX] > -1
				if (hitWall) {
					var distanceX = x - player.x;
					var distanceY = y - player.y;
					var blockDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
					if(!distance || blockDistance < distance) {
						distance = blockDistance;
						xHit = x;  
						yHit= y;
						wallType = map[wallY][wallX];   // needed for 3D view
					}									
				}  // end if hitWall
				else {
					if(dino.x === wallX && dino.y === wallY) {
						dino.show = true;
					};
				}  // end if-else check for dine in viewport
				
				x += dX; 
				y += dY;
          } // end while
		  
		  if(dino.show){
			  var dinoDistanceX = dino.x + 0.5 - player.x;
			  var dinoDistanceY = dino.y + 0.5 - player.y;
			  dino.angle = Math.atan(dinoDistanceY / dinoDistanceX) - player.angle;
			  dino.distance = Math.sqrt(dinoDistanceX * dinoDistanceX + dinoDistanceY * dinoDistanceY);
		  };
		  
		  this.draw(xHit, yHit, distance, i, rayAngle, wallType);
      
		} // end castRay

		// Draw view angle for player in minimap
		this.draw = function(rayX, rayY, distance, i, rayAngle, wallType) { 
			// Draw minimap view
			// Render 2D view angle
			minimap.context.beginPath();
			minimap.context.moveTo(minimap.cellWidth * player.x, minimap.cellHeight * player.y);
			minimap.context.lineTo(rayX * minimap.cellWidth, rayY * minimap.cellHeight);
			minimap.context.closePath();
			minimap.context.stroke();
			
			// Draw 3D view
			var adjustedDistance = Math.cos(rayAngle - player.angle) * distance;
			var wallHalfHeight = gameCanvas.height / adjustedDistance / 2;
			var wallTop = Math.max(0, gameCanvas.halfHeight - wallHalfHeight);
			var wallBottom = Math.min(gameCanvas.height, gameCanvas.halfHeight + wallHalfHeight);
			
			// Determine wall color with shading
			var percentageDistance = adjustedDistance / this.maxDistance;
			var brightness = 1 - percentageDistance;
			var shade = Math.floor(palette.shades * brightness);
			var wallColor = palette.walls[wallType][shade];
			
			if(adjustedDistance < dino.distance) {
				foregroundSlivers.push([i, wallTop, wallBottom, wallColor]);
			}
			else {
				backgroundSlivers.push([i, wallTop, wallBottom, wallColor]);
			};
			
//			gameCanvas.drawSliver(i, wallTop, wallBottom, wallColor);
			
		} // end init
		
	} // end rayCaster init
	
}; // end rayCaster object


//************************************************************
//************************************************************
// Player is initialize here
var player = {
	// initialize our player
	init: function() {
		// Initialize player characteristics
		this.x = 14;
		this.y = 14;
		this.direction = 0;
		this.angle = 0;
		this.speed = 0;
		this.movementSpeed = 0.01;
		this.turnSpeed = 1 * Math.PI / 180;
		
		// Player position
		player.showPosition = function(iteration) {
			var playerX = this.x;
			var playerY = this.y;
			var totalDistance = Math.sqrt(13 * 13 + 13 * 13);
			var currentDistance = Math.sqrt((14 - playerX) * (14 - playerX) + (14 - playerY) * (14 - playerY));
			var percentageCompleted = 100 - Math.round((currentDistance / totalDistance) * 100);
			
			document.querySelector('.middle').innerHTML = 'Player X = ${playerX} &emsp;&emsp;&emsp; Player Y = ${playerY}';
			document.querySelector('.rside').innerHTML = 'Percentage Completed = ${percentageCompleted}% &emsp;&emsp;&emsp; Iteration = ${iteration}';
		};	
		
		// Establish player movement
		this.move = function() {
			var moveStep = this.speed * this.movementSpeed;
			this.angle += this.direction * this.turnSpeed;
			var newX = this.x + Math.cos(this.angle) * moveStep;
			var newY = this.y + Math.sin(this.angle) * moveStep;
			if (!containsBlock(newX, newY)){
				this.x = newX;
				this.y = newY;
			};
		}; // end player movement
		
		// How to draw the player
		this.draw = function() {
			var playerXOnMinimap = this.x * minimap.cellWidth;
			var playerYOnMinimap = this.y * minimap.cellHeight;
			
			minimap.context.fillStyle = "#000000";
			minimap.context.beginPath();
			minimap.context.arc(minimap.cellWidth * this.x, minimap.cellHeight * this.y, minimap.cellWidth / 2, 0, 2 * Math.PI, true); 
			minimap.context.fill();
			
			var projectedX = this.x + Math.cos(this.angle);
			var projectedY = this.y + Math.sin(this.angle);
			minimap.context.fillRect(minimap.cellWidth * projectedX - minimap.cellWidth / 4, minimap.cellHeight * projectedY - minimap.cellHeight / 4, minimap.cellWidth / 2, minimap.cellHeight / 2);
		}; // end player draw function
	} // end player init
}; // end player object


//************************************************************
//************************************************************
// Add Dinosuar to game
var dino = {
	// initialize object
	init: function() {
		// important dino characteristics
		this.sprite = new jaws.Sprite({image: "dino.png", x: 0, y: gameCanvas.height / 2, anchor: "center"});
		this.x = 1;
		this.y = 1;
		this.show = false;
		this.distance = 10000;
		
		// draw the dino
		this.draw = function() {
			this.scale = rayCaster.maxDistance / dino.distance / 2;
			this.sprite.scaleTo(this.scale);
			this.angle %= TWO_PI;
			if(this.angle < 0) {
				this.angle += TWO_PI;
			}
			this.angleInDegrees = this.angle * 180 / Math.PI;
			var potentialWidth = 300 * 0.2;
			var halfAngularWidth = potentialWidth / 2;
			this.adjustedAngle = this.angleInDegrees + halfAngularWidth;
			if(this.adjustedAngle > 180 || this.adjustedAngle < - 180) {
				this.adjustedAngle %= 180;
			};
			this.sprite.x = this.adjustedAngle / potentialWidth * gameCanvas.width;
			this.sprite.draw();
			
		}; // end draw function
	} // end dino init
}; // end dino




//************************************************************
//************************************************************
// Camera Object
var camera = {
	// initialize object
	init: function() {
		// initialize object characteristics.
		this.element = document.getElementById('screenshot');
		this.context = this.element.getContext('2d');
		var filtered = false;
		var filter;
		
		// Apple a filter on click
		$("#screenshot").on("click", function() {
			if(filtered) {
				filtered = false;
				var picture = filter.reset();
				picture.render();
			}
			else {
				filtered = true;
				filter = Filtrr2("#screenshot", function() {
					this.expose(50);
					this.sepia();
					this.render();
				}, {store: false});
			};
		});
	
		// snap a photo
		this.takePicture = function() {
			var image = new Image();
			image.src = gameCanvas.element.toDataURL('dino.png');
			image.onload = function() {
				camera.context.drawImage(image, 0, 0);
			}
			filtered = false;
			
		} // end take picture
		
	} //end camera init
}; // end camera object



//************************************************************
//************************************************************
// Main Game Object
var Game = function() {

	// Initialize all game objects
	this.setup = function() {
		minimap.init();
		palette.init();
		player.init();
		rayCaster.init();
		gameCanvas.init();
		dino.init(); // after rayCaster
		camera.init();
//		alert("Finished running setup."); // only for testing

	};
	
	// Draw each of the game objects
	this.draw = function() {
		minimap.draw();
		player.draw();
		gameCanvas.blank();
		rayCaster.castRays();
		
		for(var i = 0; i < backgroundSlivers.length; i++) {
			gameCanvas.drawSliver.apply(gameCanvas, backgroundSlivers[i]);
		};
		
		if(dino.show) {
			dino.draw();
		};
		
		for(var i = 0; i < foregroundSlivers.length; i++) {
			gameCanvas.drawSliver.apply(gameCanvas, foregroundSlivers[i]);
		};
	};
	
	// update characteristics of game objects
	// and handle keypresses
	this.update = function() {
		if(jaws.pressed("left")) {
			player.direction = -1};
		if(jaws.pressed("right")) {
			player.direction = 1};
		if(jaws.pressed("up")) { 
			player.speed = 1};
		if(jaws.pressed("down")) {
			player.speed = -1}; 

		// Stop movement if key is released
		if(jaws.on_keyup(["left", "right"], function() {
			player.direction = 0;
		})); 
		if(jaws.on_keyup(["up", "down"], function() {
			player.speed = 0;
		}));
		
		if(jaws.pressed("space")) {
			camera.takePicture();
		};
		
		// Move player
		player.move();
	};

	
}; // end game object
