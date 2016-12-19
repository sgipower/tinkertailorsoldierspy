var app = require('express')();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);
var path = require('path');
var fileSystem = require('fs');
io.set('transports', ['websocket']);

app.get('/noise.wav', function(req, res) {  
	console.log('entra en noise');
	var filePath = path.join('/home/jorge/test', 'noise.wav');
    	var stat = fileSystem.statSync(filePath);
   	 res.writeHead(200, {
        'Content-Type': 'audio/wav',
        'Content-Length': stat.size
    });
	var readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
});



app.get('/', function(req, res) {  
var html = `
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>The HTML5 Herald</title>
  <meta name="description" content="The HTML5 Herald">
  <meta name="author" content="SitePoint">


  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->
</head>

<body>
	<script src="https://code.jquery.com/jquery-3.1.1.js"></script>
  	<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>  
	<script src="https://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js"></script>  


Status: <span id="status1">Connecting...</span><br>
ID sent: <span id="test"></span><br>
delay: <span id="status2"></span><br><br>
1: <span id="count1">0</span><br>
2: <span id="count2">0</span><br>
<script>  
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

//var context = new AudioContext();
var context;
var bufferLoader;

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

 source1.loop = true;
 // source1.connect(context.destination);
  source2.connect(context.destination);

var filter = context.createBiquadFilter();
// Create the audio graph.
source1.connect(filter);
filter.connect(context.destination);
// Create and specify parameters for the low-pass filter.
filter.type = 'bandpass'; // Low-pass filter. See BiquadFilterNode docs
filter.frequency.value = 600; // Set cutoff to 440 HZ
filter.Q.value = 6; // Set cutoff to 440 HZ
// Playback the sound.
source1.start(0);

 // source1.start(0);
 // source2.start(0);
}

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      '/noise.wav',
      '/noise.wav',
    ],
    finishedLoading
    );

  bufferLoader.load();
}


init();


    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
//oscillator.start();

 var  status1 = $('#status1');
 var  status2 = $('#status2');
 var  test= $('#test');
 var count1 = $('#count1');
 var count2 = $('#count2');
 var c1 =0;
 var c2 =0;
 var reqidlast =0;
var connectionOptions =  {
    "force new connection" : true,
    "reconnection": true,
    "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
    "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
    "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
    "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"]                //forces the transport to be only websocket. Server needs to be setup as well/
}
    var socket = io.connect(connectionOptions );

status1.text('Test');
    socket.on('announcements', function(data) {
        console.log('Got announcement:', data.message);
    });
var timecheckinterval ;
socket.on('connect', function(){
status1.text('Connected. ');
var timetime;
var reqid = 0; 
function foo() 
	{
		reqid++;
		test.text('Enviamos con id:' + reqid );
		socket.emit('time',{ reqid:reqid});
		timetime = new Date();
	}
foo();
socket.on('release', function(data) { 
	$('#status1').css("background-color","white");
oscillator.stop();
});
socket.on('press', function(data) { 
oscillator.stop();
	if(data.button == 0) $('#status1').css("background-color","green");
	if(data.button == 1) $('#status1').css("background-color","yellow");
	if(data.button == 2) $('#status1').css("background-color","blue");
});
timecheckinterval = setInterval(foo,3000);
socket.on('time', function(data) { 
	var now   = new Date();
	var ms  = (now.getTime() - timetime.getTime());
	status2.text(ms);
	if(reqidlast != data.reqid)
	{
	reqidlast = data.reqid;
	if(data.seq == 1) c1++;
	if(data.seq == 2) c2++; 
	}
	count1.text(c1);
	count2.text(c2);
}
);

	socket.on('disconnect', function() {
		clearInterval(timecheckinterval );
		status1.text('Disconnected.');
    		socketConnectTimeInterval = setInterval(function () 
			{
      			socket.socket.reconnect();
      			if(socket.connected) clearInterval(socketConnectTimeInterval);
    			}, 3000);
 	 });

});

$(document).mouseup(function(e) {socket.emit('release');});
$(document).mousedown(function(e) {socket.emit('press',{ button:e.button});});

//document.addEventListener('contextmenu', event => event.preventDefault());

</script>  

</body>
</html>
`;
    res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html);
        res.end();
});

server.listen(80); 

var numClients = 0;

io.on('connection', function(socket) {  
    numClients++;
    io.emit('stats', { numClients: numClients });

    console.log('Connected clients:', numClients);
console.log('clientid:', socket.id);

	var clientid = socket.id;
    socket.on('disconnect', function() {
        numClients--;
        io.emit('stats', { numClients: numClients });

        console.log('Connected clients:', numClients);
    });
socket.on('press', function(msg) {
	io.emit('press', { button: msg.button });
        console.log('button pressed ',  msg.button);
    });
socket.on('time', function(msg) {
	io.sockets.connected[clientid ].emit('time', { reqid:msg.reqid, seq:1 });
	io.sockets.connected[clientid ].emit('time', { reqid:msg.reqid, seq:2 });
    });
socket.on('release', function() {
	io.emit('release');
        console.log('button released ');
    });
   

});


