var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
io.set('transports', ['websocket']);
var port = process.env.PORT || 80;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get(["/*/", "/js/*","/css/*","/img/*",], function(req, res){
    console.log(req.url);
    res.sendFile((dir + '/' + req.params.id).replace(/\//g, '\\\\'));
});
app.get('/noise.wav', function(req, res) {
		res.sendFile(__dirname + '/noise.wav');
});

http.listen(port, function(){
  console.log('listening on ' + port);
});
var numClients = 0;
var Clients = {};

io.on('connection', function(socket) {
    var clientid = socket.id;
    numClients++;
  
    io.emit('stats', { numClients: numClients });

    console.log('Connected clients:', numClients);
  console.log('clientid:', socket.id);

        
    socket.on('disconnect', function() {
        numClients--;
        delete Clients[socket.id];
        io.emit('stats', { numClients: numClients });

        console.log('Connected clients:', numClients);
    });
socket.on('login', function(userobject) {
        console.log('login received: ' + JSON.stringify(userobject));
        for(var key in Clients) {
          if(Clients[key].callsign === userobject.callsign)
          {
            io.sockets.connected[clientid].emit('login', { logged:false, msg:"Callsign in use"});
            return;
          } 
        }
        io.sockets.connected[clientid].emit('login', { logged:true });
        Clients[socket.id] = userobject;
    });

    socket.on('time', function(msg) {
        io.sockets.connected[clientid].emit('time', { reqid:msg.reqid,clients:numClients });
    });
    socket.on('press', function() {
        io.emit('press', {clientid: clientid, freq: Clients[socket.id].freq});
        console.log(Clients[socket.id].callsign + ' has pressed ');
    });
socket.on('release', function() {
        io.emit('release', {clientid: clientid});
        console.log(Clients[socket.id].callsign + ' has released.');
  });
  socket.on('freq', function(msg) {
        Clients[socket.id].freq=msg.freq;
        console.log(Clients[socket.id].callsign + 'has changed freq to:' + msg.freq);
  });

});
	
