const port = 8080;
const hostname = "192.168.0.16";

//Express
var express = require('express');
const app = express();

//Cosas json
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Game
const Game = require('./game.js');
var game = new Game();

//Server socketio
const server = require('http').Server(app);
const socketio = require('socket.io');



//Peticion get de la web
app.get('/', function(req, res){ 
	res.sendFile(__dirname + '/index.html');
}); 


//Peticiones post de android

app.post('/connection',function(req,res){

	console.log('ANDROID');
	var json_req = JSON.parse(JSON.stringify(req.body));

	if (game.state == 'PREPARING')
	{
		var correcto = game.addPlayer(json_req.user);

		if (correcto)
		{
			var primero = game.primero();
			var json_res = createJson(primero,correcto,"CORRECTO");
			io.sockets.emit('actualizar_jugadores', game.getPlayers());
		}
		else
			var json_res = createJson(false,false,'Ese usuario ya existe');

	}
	else
		var json_res = createJson(false,false,'NO SE PUEDE ENTRAR AHORA');

	res.end(json_res);
});


app.post('/first',function(req,res){

	if (game.getPlayers().length >= 2)
	{
		var json_res = createJsonRoom (true,'EMPIEZA EL JUEGO');
		game.startGame();
		io.sockets.emit('actualizar_mensaje', game.msg);
		io.sockets.emit('actualizar_territorios',game.territories);
	}
	else
		var json_res = createJsonRoom(false,'SE NECESITAN AL MENOS 2 JUGADORES');

	res.end(json_res);
});

app.post('/room',function(req,res){
	
	if (game.state == 'PLAYING')
		var json_res = createJsonRoom(true,'EMPIEZA EL JUEGO');
	else
		var json_res = createJsonRoom(false,'TODAVÍA NO HA EMPEZADO LA PARTIDA');
	
	res.end(json_res);
});

app.post('/game', function(req,res){
	var json_req = JSON.parse(JSON.stringify(req.body));

	if (game.isTurn(json_req.user))
	{

		if (json_req.option == 'attack')
		{
			console.log (json_req.user + ' ha atacado');
			var json_res = createJsonGame("HAS ATACADO");
			if (game.exitsAdjacent(json_req.user,json_req.territory))
			{
				game.attack(json_req.user,json_req.territory);
				game.nextTurn();
				
			}
			else
			{
				var json_res = createJsonGame("TERRITORIO NO DISPONIBLE PARA ATACAR");	
			}
	
		}
		else if (json_req.option == 'defend')
		{
			var json_res = createJsonGame("HAS DEFENDIDO");
			game.defend(json_req.user);
			game.deleteRandomComunity('fede');
			game.nextTurn();
			
		}
	}
	else
	{
		var json_res = createJsonGame("NO ES TU TURNO");
	}

	io.sockets.emit('actualizar_mensaje', game.msg);
	io.sockets.emit('actualizar_territorios',game.getTerritories());


	res.end(json_res);
	
});

//Express escuchando en 8080
server.listen(port,hostname,()=> console.log(`Listening on port ${port}`));
//server.listen(port,()=> console.log(`Listening on port ${port}`));
var io = socketio.listen(server);

io.sockets.on('connection',function(client) {
	
	client.emit('actualizar_jugadores', game.getPlayers());
	client.emit('actualizar_territorios',game.getTerritories());
	client.emit('actualizar_mensaje',game.msg);
});


function createJsonGame (message)
{
	var obj = new Object();

	obj.message = message;
	var jsonString= JSON.stringify(obj);

	return jsonString;
}

function createJson (primero,correcto,message)
{
	var obj = new Object();
	obj.primero = primero;
	obj.correcto  = correcto;
	obj.message = message;
	var jsonString= JSON.stringify(obj);

	return jsonString;
}

function createJsonRoom (correcto,message)
{
	var obj = new Object();
	obj.correcto  = correcto;
	obj.message = message;
	var jsonString= JSON.stringify(obj);

	return jsonString;
}






