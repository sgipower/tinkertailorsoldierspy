
var debugmode = true;
var cookieexpdays = 1;
var callsign = getCookie('callsign');
var refusedlocate = getNumberfromCookie('refusedlocate',0);
var locationlat = getNumberfromCookie('lat',0);
var locationlong = getNumberfromCookie('long',0);
var freq = getNumberfromCookie('freq',7000);
var cwlevel = getNumberfromCookie('cwlevel',0);
var cwkey = getNumberfromCookie('cwkey', -1);
var cwhkeyspeed = getNumberfromCookie('cwhkeyspeed', 180);
var levels = ['Beginner','Amateur','Expert'];
var keys = [['horizontal','hkey.jpg'],['vertical','vkey.jpg']];



$(function () {
// this needs to go first DO NOT MOVE
	 $('#cwhkeyspeed').slider();
//////
function onFreq()
{
audio.keypressed();
console.log('pressed');
}
function offFreq()
{
	console.log('released');
audio.keyreleased(); 
}
	//inits
	fe = new FrontEnd();
	audio = new Audio();
	audio.init();
	commsradio = new Comms(OnConnect,OnDisconnect,changeSignalLevel,SetNumberOfClients,onFreq,offFreq);
	fe.init('container',function(freq)
	{
		commsradio.freqChange(freq);
	});
	changeSignalLevel(0);
	
	// functions
	function hkeypressed(key)
	{
		audio.keypressed();
		//commsradio.keypressed(key,cwhkeyspeed);
	}
	function vkeypressed()
	{
		//audio.keypressed();
		commsradio.keypressed(null);
	}
	function keyreleased()
	{
		//audio.keyreleased();
		commsradio.keyreleased(null);
	}


	function OnConnect()
	{
		$('#connection').text('Connected');
		fe.connect();
	}
	function OnDisconnect()
	{
		$('#connection').text('Disconnected');
		fe.disconnect();
	}
	function SetNumberOfClients(activeusers)
	{
		$('#actusers').text(activeusers);
	}

	function changekey()
	{
		$('#cwkeyimg').attr("src", 'img/' + keys[cwkey][1] );
		if(cwkey == 1) $('#cwhkeyspeeddiv').hide();
		else $('#cwhkeyspeeddiv').show();
		$("#cwhkeyspeedspan").text(cwhkeyspeed);
		$("#cwhkeyspeed").slider('setValue', cwhkeyspeed);
	}
	
	function getAllSettings()
	{
		if(callsign == '')
			{
				$('#getCallsignModal').modal('show');
				return;
			}
		else $('#callsign').text(callsign);
		
		//geolocation
		if(!navigator.geolocation)
		{
			$('#location').text('Not available');
		}
		else if(refusedlocate == 1)
		{
			$('#location').text('Not provided');
		}
		else if( locationlat == 0 && locationlong == 0 )
			{
				$('#geoLocationModal').modal('show');
				return;
			}
		else $('#location').text(locationlat/10 + ' , ' + locationlong/10);

		if(cwlevel == 0)
			{
				$('#LevelModal').modal('show');
				return;
			}
		else $('#level').text(levels[cwlevel-1]);
		if(cwkey == -1)
		{
			setCookie('cwkey', 0, cookieexpdays);
			cwkey = 0;
			changekey();
		} else changekey();

		// if we reach this area, it means that everything is set up
		//info,success,failure

		commsradio.init({callsign:callsign, location:{lat:locationlat, long:locationlong}, level:cwlevel,freq:fe.getfrequency() }, function()
		{
			fe.connect();	
		},function(msg)
		{
			fe.disconnect();	
			alert('Problem' + msg);	
		});
	}
	// UI init
	if(debugmode == false)
	{
		$('#intro1Modal').modal('show');
		document.addEventListener('contextmenu', event => event.preventDefault());
	}
	else 
	{	getAllSettings();
	}
	// DELETE COOKIES
	$('#clickmebutton').click(function() {
		setCookie('callsign', 'buf', -1);
		setCookie('refusedlocate', 'buf', -1);
		setCookie('lat', 'buf', -1);
		setCookie('long', 'buf', -1);
		setCookie('cwlevel', 'buf', -1);
		setCookie('cwkey', -1, -1);
		location.reload(); 
	});

	$('#cwkeyimg').mousedown(function(k) {
		if(cwkey == 0) 
		{
			if(f.which == 1 || f.which == 2)hkeypressed(f.which);
		}
		else if(cwkey == 1)vkeypressed();
	}).mouseup(function(k) {
			keyreleased();
	});

	$('#intro1Modal button').click(function() {
		$('#intro1Modal').modal('hide');
		getAllSettings();
	});

	$('#geoLocationModal #buttonYesGeo').click(function() {
		setCookie('refusedlocate', '0', cookieexpdays);
		var ret = getLocation(function(position){
			locationlat = (position.coords.latitude * 10).toFixed(0);
			locationlong= (position.coords.longitude * 10).toFixed(0);
			setCookie('lat', locationlat, cookieexpdays);
			setCookie('long', locationlong, cookieexpdays);
			//$('#location').text(locationlat/10 + ' , ' + locationlong/10);
			getAllSettings();
		},function(){
			//alert('We run into problems. Maybe your browser doesnt provide geolocation, Please use another browser like Firefox');
			refusedlocate = 1;
			setCookie('refusedlocate', '1', cookieexpdays);
		});
		$('#geoLocationModal').modal('hide');
	});
 
	$('#geoLocationModal #buttonNoGeo').click(function() {
		setCookie('refusedlocate', '1', cookieexpdays);
		refusedlocate = 1;
		$('#geoLocationModal').modal('hide');
		getAllSettings();
	});	

	$('#getCallsignModal button').click(function() {
			var callsigninputvalue = $('#getCallsignModal #callsigninput').val();
			if(callsigninputvalue == "")$('#getCallsignModal #errormsg').text('You need to enter a valid Callsign');
			else if(callsigninputvalue.length < 4 || callsigninputvalue.length > 8)$('#getCallsignModal #errormsg').text('Callsign must contain from 4 to 8 characters.');
			else if(!callsigninputvalue.match(/^[a-zA-Z0-9]+$/))$('#getCallsignModal #errormsg').text('Your callsign contains invalid characters. Don\'t use symbols. Try again.');
			else 
			{
				$('#getCallsignModal #errormsg').text('');
				callsign = callsigninputvalue;
				setCookie('callsign', callsign, cookieexpdays);
				$('#getCallsignModal').modal('hide');
				getAllSettings();
			}
	});
	$('#levelselect').on('change',function() { 
		var selectedvalue = $(this).val()
		if(selectedvalue > 0 && selectedvalue < 4)
		{
				cwlevel = selectedvalue;
				setCookie('cwlevel', cwlevel, cookieexpdays);
				$('#LevelModal').modal('hide');
				getAllSettings();
		}
	});
	jQuery("#vdpm").click(function(e){
		setCookie('cwkey', 1, cookieexpdays);
		cwkey = 1;
		changekey();
		e.preventDefault();
	});
	jQuery("#hdpm").click(function(e){
		setCookie('cwkey', 0, cookieexpdays);
		cwkey = 0;
		changekey();
		e.preventDefault();
	});
   
	$('#levelselect').barrating({ theme: 'fontawesome-stars'});

	$('#cwhkeyspeed').on( "slideStop", function( event ) {
			if( event.value >= 60 && event.value <= 240) 
			{
				setCookie('cwhkeyspeed', event.value, cookieexpdays);
				cwhkeyspeed = event.value;
				$("#cwhkeyspeedspan").text(event.value);
			}
	});
});