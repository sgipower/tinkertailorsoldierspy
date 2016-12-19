function getLocation(f,e) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(f,e,{maximumAge:600000, timeout:5000, enableHighAccuracy: false});
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getNumberfromCookie(cname, defaultvalue) {
  var cookie = getCookie(cname);
  if(cookie == "" || isNaN(parseInt(cookie))) return defaultvalue;
  else return parseInt(cookie);
}

function changeSignalLevel(level)
{
	switch(level)
	{
        case 0: $('#imgs1').hide();$('#imgs2').hide();$('#imgs3').hide();$('#imgs4').hide();$('#imgs5').hide();break;
		case 1: $('#imgs1').show();$('#imgs2').hide();$('#imgs3').hide();$('#imgs4').hide();$('#imgs5').hide();break;
		case 2: $('#imgs1').hide();$('#imgs2').show();$('#imgs3').hide();$('#imgs4').hide();$('#imgs5').hide();break;
		case 3: $('#imgs1').hide();$('#imgs2').hide();$('#imgs3').show();$('#imgs4').hide();$('#imgs5').hide();break;
		case 4: $('#imgs1').hide();$('#imgs2').hide();$('#imgs3').hide();$('#imgs4').show();$('#imgs5').hide();break;
		case 5: $('#imgs1').hide();$('#imgs2').hide();$('#imgs3').hide();$('#imgs4').hide();$('#imgs5').show();break;
		default:$('#imgs1').hide();$('#imgs2').hide();$('#imgs3').hide();$('#imgs4').hide();$('#imgs5').hide();break;
	}
}