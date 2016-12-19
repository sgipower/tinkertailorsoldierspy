function Audio()
{
	var context;
	var bufferLoader;
	var generalGain;

	var noise;
	var noisegain;

	var beat;
	var beatgain;

	function finishedLoading(bufferList) {
		noise = context.createBufferSource();
		noisegain = context.createGain();
		noise.buffer = bufferList[0];
		noise.loop = true;
		noise.connect(noisegain);
		noisegain.connect(context.destination);
		
		noise.start(0);
		generalGain.gain.value = 0;
		// beat
		beat = context.createOscillator();
		beat.type = 'sine';
		beat.frequency.value = 800; // value in hertz
		beatgain = context.createGain();
		beat.connect(beatgain);
		beatgain.connect(context.destination);
		beat.start();
		beatgain.gain.value = 0;
		}
	this.init = function () {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
  		context = new AudioContext();	
		generalGain = context.createGain();
		bufferLoader = new BufferLoader(context,['sound/noise.wav'],finishedLoading);
		bufferLoader.load();
	};
	this.setVolume = function(vol) // 0 to 1
	{
		if(vol>=0.0 && vol <= 1.0) generalGain.gain.value = vol;
	};
	this.keyreleased = function() // 0 to 1
	{
		//noisegain.gain.value = 1;
		beatgain.gain.value = 0;
	};
	
	this.keypressed = function() // 0 to 1
	{
		//noisegain.gain.value = 0;
		beatgain.gain.value = 1;
	};
	

}