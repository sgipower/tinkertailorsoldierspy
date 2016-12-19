function FrontEnd()
{
	var pheight;
	var pwidth;
	var volume = 5;
	var on = false;
	var connected = false;
	var band = 0;

	var freql = [0,0,0,0];
	var freqh = [0,0,0,0];
	var freqhmax = [2000,3800,7300,14350];
	var freqhbase = [1800,3500,7000,14000];
	var step1mhz = false;
	  
	var canvas;
	var context;
	var volumefromlocation  = [[0.893,0.5533],[0.886,0.53],[0.8821,0.508],[0.8834,0.48],[0.8906,0.465],[0.901,0.455],[0.9134,0.4633],[0.9186,0.48166],[0.921,0.508],[0.91927,0.5316],[0.91276,0.545]]
	var volumetolocation  = [[0.89973,0.53],[0.8945,0.5216],[0.8958,0.508],[0.8932,0.4933],[0.8964,0.483],[0.901,0.4783],[0.9082,0.485],[0.9127,0.4916],[0.912,0.508],[0.9127,0.5233],[0.9082,0.5266]]
	var freqchange ;
	function redrawRadio()
	{
		pwidth = $(containername).width();
		pheight= pwidth /  2.56;
	   canvas.height = pheight;
	   canvas.width= pwidth;
	   
	   $('#img').height(pheight);
	   $('#img').width(pwidth);
	   drawControls();
	}

	function drawControls()
	{
		context.clearRect(0, 0, canvas.width, canvas.height);
		if(!on)return;
		context.lineWidth = 3;
		context.strokeStyle = "#FFFFFF";
		context.beginPath();
		context.moveTo(volumefromlocation[volume][0]*canvas.width,volumefromlocation[volume][1]*canvas.height);
		context.lineTo(volumetolocation[volume][0]*canvas.width,volumetolocation[volume][1]*canvas.height);
		context.stroke();
		if(step1mhz)
		{
			context.strokeStyle = "#FFFF00";
			context.lineWidth = 4;
			context.beginPath();
			context.moveTo(0.4632*canvas.width,0.298*canvas.height);
			context.lineTo(0.4762*canvas.width,0.298*canvas.height);
			context.stroke();
		}
		context.font = pwidth/25 +'px KulminoituvaRegular';
		context.fillStyle = 'lightblue';
		context.textBaseline = 'top';
		var freq = freqh[band] + freqhbase[band];
		context.fillText  (Math.floor(freq/1000) + '.' +   leftPad((freq % 1000),3) + '.' + freql[band], 0.420*canvas.width, 0.16*canvas.height);
		console.log(freqh[band] + freqhbase[band] + '.' + freql[band]);
	}
	function leftPad(number, targetLength) {
		var output = number + '';
		while (output.length < targetLength) {
			output = '0' + output;
		}
		return output;
	}
	function freqplus()
	{
		if(!step1mhz)
		{
			if(freql[band] + 1 != 10) freql[band]++;
			else if(freqh[band] + freqhbase[band] + 1 <= freqhmax[band])
			{
				freqh[band]++;
				freql[band]=0;
			}
		}
		else if(freqh[band] + freqhbase[band] + 1 <= freqhmax[band])
			{
				freqh[band]++;
			}
		else return;
		returnNewFreq();
	}

	function freqminus()
	{
		if(!step1mhz)
		{
			if(freql[band] - 1 != -1) freql[band]--;
			else if(freqh[band] + freqhbase[band] - 1 >= freqhbase[band])
			{
				freqh[band]--;
				freql[band]=9;
			}
		}
		else if(freqh[band] + freqhbase[band] - 1  >= freqhbase[band])
			{
				freqh[band]--;
			}
		else return;
		returnNewFreq();
	}
	function returnNewFreq(){
		freqchange((freqh[band] + freqhbase[band])*10 + freql[band]);
	}
	this.getfrequency = function ()
		{
			return (freqh[band] + freqhbase[band])*10 + freql[band];
		};
	function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}
	var interval;
	var containername;
	this.connect = function (){
		on=true;
		connected = true;
		redrawRadio();
	};
	this.disconnect = function (){
		on=false;
		connected = false;
		redrawRadio();
	};
	this.init = function (containerid,freqchangef) {
								freqchange = freqchangef;
								containername = '#' + containerid;
								$(window).resize(redrawRadio);
								//$(window).resize(redrawRadio);
								$(containername).prepend('<img id="img" src="img/ts440m.jpg" style="" alt=""/><canvas id="canvas"></canvas>');
								  canvas = document.getElementById("canvas");
								  context = canvas.getContext("2d");

								  $('#canvas').on('mousedown', function(e){
										var pos = getMousePos(canvas, e);
										x1 = pos.x;
										y1 = pos.y;
										var relx = pos.x/pwidth;
										var rely = pos.y/pheight;
										if(relx > 0.062 && relx < 0.106 && rely > 0.114 && rely < 0.165 ){if(connected) on = !on;}
										else if(relx > 0.4 && relx < 0.5 && rely > 0.33 &&  rely < 0.84) 
											{
												freqminus();
												interval = setInterval(function(){
													freqminus();
													drawControls();
												},250);
											}
										else if(relx > 0.5 && relx < 0.6 && rely > 0.33 && rely < 0.84)
																						{
												freqplus();
												interval = setInterval(function(){
													freqplus();
													drawControls();
												},250);
											}
										else if(relx > 0.615 && relx < 0.657 && rely > 0.739 && rely < 0.795){if(band > 0){band--;returnNewFreq();}}
										else if(relx > 0.658 && relx < 0.709 && rely > 0.739 && rely < 0.795){if(band < 3){band++;returnNewFreq();}}
										else if(relx > 0.614 && relx < 0.6533 && rely > 0.646 && rely < 0.686)step1mhz = !step1mhz;
										else if(relx > 0.903 && relx < 0.933 && rely > 0.435 && rely < 0.60){if(volume < 10)volume++;}
										else if(relx > 0.86 && relx < 0.903 && rely > 0.435 && rely < 0.60){if(volume > 0)volume--;}
										else return;
										drawControls();
								});
								$('#canvas').on('mouseup touchend',function(e) {
									clearInterval(interval);
								});
								
								redrawRadio();
							}
}