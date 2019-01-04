var SUTRO_LAT = 37.7552;
var SUTRO_LONG = -122.4528;
var SUTRO_HEIGHT = 274 + 298;
$(document).ready(function(){
    fixCling();
    $("button#tb").click(function(e){
        e.stopPropagation();
        $("input").prop('disabled', true);
        $(this).before("<br/><img id='load' src='https://raw.githubusercontent.com/r-e-stern/itunes.api.search/master/Rolling.gif'><br/>")
        $(this).off();
        var n = $("footer:nth-of-type(1) input").val();
        var w = $("footer:nth-of-type(2) input").val();
        // console.log(n,w);
        $.ajax({
            url: "https://api.open-elevation.com/api/v1/lookup?locations="+n+",-"+w,
            type: 'GET',
            crossDomain: true,
            dataType: 'json',
            success: function(result){calc(result)},
            error: function(){alert("The API returned an error.")}
        });
    });
    $("button#cl").click(function(e){
        e.stopPropagation();
        $("input").prop('disabled', true);
        $(this).before("<br/><img id='load' src='https://raw.githubusercontent.com/r-e-stern/itunes.api.search/master/Rolling.gif'><br/>")
        $(this).off();
        if(navigator.geolocation){
            var j = navigator.geolocation.getCurrentPosition(function(p){
                // console.log(p.coords);
                $("footer:nth-of-type(1) input").val(p.coords.latitude);
                $("footer:nth-of-type(2) input").val(0-p.coords.longitude);
                $.ajax({
                    url: "https://api.open-elevation.com/api/v1/lookup?locations="+p.coords.latitude+","+p.coords.longitude,
                    type: 'GET',
                    crossDomain: true,
                    dataType: 'json',
                    success: function(result){calc(result)},
                    error: function(){alert("The API returned an error.")}
                });
            });
        }else{
            alert("Location functionality is not available and/or allowed on your device.");
            $("img#load").remove();
        }
    });
    $(window).resize(fixCling);
    $("main").click(function(){
        SUTRO_LAT = 41.8789;
        SUTRO_LONG = -87.6359;
        SUTRO_HEIGHT = 527 + 181;
        $("#n input").attr("placeholder",SUTRO_LAT);
        $("#w input").attr("placeholder",SUTRO_LONG);
        $("body").addClass("chicago");
        $(this).off("click").click(function(){
            location.reload();
        });
    });
});
function fixCling(){
    if($(window).width() <= 882){
        $("nav").addClass("cling");
    }else{
        $("nav").removeClass("cling");
    }
}
function vertAngle(d,e,h){
    if(d==0){return 0}
    var o = h-e;
    return 90-Math.atan(o/d)*180;
}
function calc(result){
    var th = vertAngle(calculateDistance(result.results[0].latitude,result.results[0].longitude,SUTRO_LAT,SUTRO_LONG),result.results[0].elevation,SUTRO_HEIGHT);
    var br = calculateBearing(result.results[0].latitude,result.results[0].longitude,SUTRO_LAT,SUTRO_LONG);
    var rt = (180+Math.round(br,0))%360;
    $("img#load, header > br, button").remove();
    $("header").append("<aside><canvas id='can' width='100' height='50'></canvas><span><i>"+Math.round(th,0)+"°</i><br>with the ground</span></aside>");
    $("nav").append("<br/><br/><a href='.'>New Search</a>")
    var canvas = document.getElementById("can");
    var context = canvas.getContext('2d');
    context.fillStyle = "#000000";
    context.beginPath();
    context.moveTo(40,49);
    context.lineTo(60,49);
    context.stroke();
    context.beginPath();
    context.moveTo(40,49);
    context.lineTo(40+(50*Math.cos(th*Math.PI/180)),49-(48*Math.sin(th*Math.PI/180)));
    context.stroke();
    $("header").append("<aside><img src='https://www.stanthonyshs.org/wp-content/uploads/2018/08/Down-Arrow-PNG-Photos.png'><span><i>"+degToCompass(br)+"</i><br>Bearing "+Math.round(br,0)+"°</span></aside>");
    $("aside img").css("transform","rotate("+rt+"deg)");
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371e3;
    var φ1 = lat1*Math.PI/180;
    var φ2 = lat2*Math.PI/180;
    var Δφ = (lat2-lat1)*Math.PI/180;
    var Δλ = (lon2-lon1)*Math.PI/180;
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
    //output in meters
}
function calculateBearing(lat1, lon1, lat2, lon2){
    var φ1 = lat1*Math.PI/180;
    var φ2 = lat2*Math.PI/180;
    var λ1 = lon1*Math.PI/180;
    var λ2 = lon2*Math.PI/180;
    var y = Math.sin(λ2-λ1) * Math.cos(φ2);
    var x = Math.cos(φ1)*Math.sin(φ2) -
        Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
    var r= Math.atan2(y, x)/Math.PI*180;
    if(r>0){
        return r;
    }else{
        return 360+r;
    }
}
function degToCompass(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}