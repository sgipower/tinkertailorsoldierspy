function Comms(onConnect,onDisconnect,onSignalChange,SetClients,onFreq,offFreq)
{
	var currentFrequency;
	var userinfo;
	var socket;

	var connectionOptions =  {
    "force new connection" : true,
    "reconnection": true,
    "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
    "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
    "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
    "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"]                //forces the transport to be only websocket. Server needs to be setup as well/
}
//cwradio.init({callsign:callsign, location:{lat:locationlat, long:locationlong}, level:cwlevel });
var txmode = false;
var txrefresh = (function () {
    var timeout ;
	txmode = false;
	$('#txmode').text('NOTX');
    return function () {
		$('#txmode').text('TX');
		if(timeout !== undefined)  clearInterval(timeout);
		timeout = setInterval(function(){
			txmode = false;
			$('#txmode').text('NOTX');
	},3000);
	}
})();



 	this.keyreleased = function () {socket.emit('release');txrefresh();};
 	this.keypressed = function () {socket.emit('press');txrefresh();};
	this.freqChange = function (freq){socket.emit('freq',{freq:freq});};
	this.init = function (info,success,failure) {
			 socket = io(connectionOptions);
			 socket.on('connect', function(){
				var timetime;
				var reqid = 0;
				// check if the callsign is in user
				
				var timeoutInterval = setInterval(function(){
					failure("timeout");			
					clearInterval(timeoutInterval);
				},10000);
				socket.emit('login',info);
				socket.on('login', function(data) {
						clearInterval(timeoutInterval);
						if(data.logged == true) 
						{
							success();
							onConnect();
							userinfo = info;
						}
						else 
						{
							failure(data.msg);
							onDisconnect();
						}
				});

				function heartbeat()
						{
								reqid++;
								socket.emit('time',{ reqid:reqid});
								timetime = new Date();
						}
				heartbeat();
				timecheckinterval = setInterval(heartbeat,3000);
				socket.on('release', function(data) {
					offFreq();
				});
				socket.on('press', function(data) {
					onFreq();
				});
				
				socket.on('time', function(data) {
						var now   = new Date();
						var ms  = (now.getTime() - timetime.getTime());
						if(ms < 20)onSignalChange(5);
						else if(ms < 40)onSignalChange(4);
						else if(ms < 60)onSignalChange(3);
						else if(ms < 80)onSignalChange(2);
						else onSignalChange(1);
						SetClients(data.clients);
				});

				socket.on('disconnect', function() {
						onDisconnect();
						onSignalChange(0);
						clearInterval(timecheckinterval );
						socketConnectTimeInterval = setInterval(function ()
						{
							//socket.socket.reconnect();
							if(socket.connected) clearInterval(socketConnectTimeInterval);
						}, 3000);
				});
				
			});
	}
}