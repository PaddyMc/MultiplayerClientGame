// Simple Networked Game

//Place javaScriptgame inside nested HTML
var canvas = document.getElementById("gameCanvas");

//Game width,height and placing content 
canvas.width = 1200;
canvas.height = 800;
var ctx = canvas.getContext("2d");

//List of connected players 
var connectedSessions = {};

//Key Presses
var keysDown = {};

//Creating the socket to communitate with the server // {ip}:{port}
var socket = new WebSocket("ws://{ip}:{port}/ServerWebSocketTest/hello");

createPlayerImage = function(){
	
	var boxImage = new Image();
	boxImage.src = "img/hero.png";	
	return boxImage;
					
};

createPlayerBox = function(xvalue,yvalue){
	var box = {
		speed: 10, // movement
		x: xvalue,
		y: yvalue 
	};
	return box;
};

//Function that is called to update the client game
var updateClientGame = function(keyPress,sessionID){
			if (keyPress === "w") { 
				connectedSessions[sessionID].y -= connectedSessions[sessionID].speed;
			}
			else if (keyPress === "s") { 
				connectedSessions[sessionID].y += connectedSessions[sessionID].speed;
			}
			else if ('a' === keyPress) { 
				connectedSessions[sessionID].x -= connectedSessions[sessionID].speed;
			}
			else if ('d' === keyPress) { // Player holding right
				connectedSessions[sessionID].x += connectedSessions[sessionID].speed;
			}
			
			ctx.clearRect(connectedSessions[sessionID].x - 10, connectedSessions[sessionID].y - 10, connectedSessions[sessionID + "i"].width + 20, connectedSessions[sessionID + "i"].height + 20);
			ctx.drawImage(connectedSessions[sessionID + "i"],connectedSessions[sessionID].x,connectedSessions[sessionID].y);
			
};

//When the socket recieves a message this function is called
socket.onmessage = function(event){
 	var message = event.data;
 	var sessionIdOtherPlayers;
 	
 	if(message.indexOf("Create,") !== -1){
 		var sessionIdOtherPlayersSplit = message.split(",");
 		
 		var box;
 		var boxImage;
 		
 		if(sessionIdOtherPlayersSplit.length > 3){
 			sessionIdOtherPlayers = sessionIdOtherPlayersSplit[1].toString();
 			box = createPlayerBox(Number(sessionIdOtherPlayersSplit[2]),Number(sessionIdOtherPlayersSplit[3]));
 			boxImage = createPlayerImage();
 			ctx.drawImage(boxImage,box.x,box.y);
 			
 			connectedSessions[sessionIdOtherPlayers] = box;
 			connectedSessions[sessionIdOtherPlayers + "i"] = boxImage;
 		}else{
 			sessionIdOtherPlayers = sessionIdOtherPlayersSplit[1].toString();
 			box = createPlayerBox(0,0);
 			boxImage = createPlayerImage();
 			ctx.drawImage(boxImage,box.x,box.y);
 			
 			connectedSessions[sessionIdOtherPlayers] = box;
 			connectedSessions[sessionIdOtherPlayers + "i"] = boxImage;
 		}
	}else{
 		var keyPress;
 		if(message.indexOf("Down") !== -1){
 			sessionIdOtherPlayers = message.substring(21);
 			keyPress = "s";
 		}else if(message.indexOf("Up") !== -1){
 			sessionIdOtherPlayers = message.substring(19);
 			keyPress = "w";
 		}else if(message.indexOf("Left") !== -1){
 			sessionIdOtherPlayers = message.substring(21);
 			keyPress = "a";
 		}else if(message.indexOf("Right") !== -1){
 			sessionIdOtherPlayers = message.substring(22);
 			keyPress = "d";
 		}
 	}
 	updateClientGame(keyPress,sessionIdOtherPlayers);
};

//Handle movement
window.addEventListener("keydown", function (event) {
	keysDown[event.key]=true;
}, false);

window.addEventListener("keyup", function (e) {
	delete keysDown[event.key];
}, false);

//Create player image
var boxImage = createPlayerImage();

//Create player box
var box = createPlayerBox(0,0);

//Send location of player box
ifSocketIsReadySendLocation = function(boxUpdate){
	if(socket.readyState === 1){
		socket.send(boxUpdate.x + "," + boxUpdate.y);
	}else{
		console.log("socket not ready");
	}
};

//Runs the game called every 75 ms
var update = function (boxUpdate,boxImageUpdate) {
	//setTimeout
	if ('w' in keysDown) { // Player holding up
		boxUpdate.y -= boxUpdate.speed;
		socket.send("Up");
	}
	if ('s' in keysDown) { // Player holding down
		boxUpdate.y += boxUpdate.speed;
		socket.send("Down");
	}
	if ('a' in keysDown) { // Player holding left
		boxUpdate.x -= boxUpdate.speed;
		socket.send("Left");
	}
	if ('d' in keysDown) { // Player holding right
		boxUpdate.x += boxUpdate.speed;
		socket.send("Right");
	}
	
	setTimeout( function() { ifSocketIsReadySendLocation(boxUpdate); }, 50);
	
	ctx.clearRect(boxUpdate.x - 10, boxUpdate.y - 10, boxImageUpdate.width + 20, boxImageUpdate.height + 20);
	ctx.drawImage(boxImageUpdate,boxUpdate.x,boxUpdate.y);
};

//Call this function to start the game
runThread = function(boxUpdate,boxImageUpdate){
	setInterval( function() { update(boxUpdate, boxImageUpdate); }, 75 );
};