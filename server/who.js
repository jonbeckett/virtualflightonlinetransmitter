
var map;

function urlify(text) {

    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    return text.replace(urlRegex, function(url,b,c) {
        var url2 = (c == 'www.') ?  'http://' +url : url;
        return '<a href="' +url2+ '" target="_blank">' + url + '</a>';
    });

}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function fetch_aircraft(set_bounds){

  console.log(who_json_url);

  $.ajax({
    url:who_json_url,
    dataType:"json",
    success:function(locations){
      render_aircraft(locations);
    },
    error:function(xhr, status, error){
      var errorMessage = xhr.status + ': ' + xhr.statusText
      console.log('Error - ' + errorMessage);
    }
  });

}


function render_aircraft(locations){

    var map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles'
    }).addTo(map);

    $("#aircraft_count").text(locations.length);

    $("#aircraft_table tr").slice(1).remove();

    // loop through the locations of aircraft
    for (i = 0; i < locations.length; i++) {

	ac = locations[i];

	$("#aircraft_table").append("<tr>"
			+ "<td class='l'>"
				+ "<a class='callsign' location_index='" + i + "' href='#' >" + ((ac["airspeed"] > 20)?"&#128747;":"&#127760;") + "</a>"
			+ "</td>"
			+ "<td class='l'>"
				+ "<strong><a class='callsign' id='callsign_" + i + "' href='#' longitude='" + ac["longitude"] + "' latitude='" + ac["latitude"] + "'>" + ac["callsign"] + ((ac["notes"] != "" ) ? " *" : "" ) + ((locations[i]["notes"].includes("#invite")) ? "&nbsp;<span style='font-size:18px !important;' title='Invitation - fly with me!'>&#128075;</span>": "" ) + "</a></strong>"
			+ "</td>"
			+ "<td class='l'>" + ac["pilot_name"] + "</td>"
			+ "<td class='l'>" + ac["aircraft_type"] + "</td>"
			+ "<td class='l'>" + ac["group_name"] + "</td>"
			+ "<td class='l'>" + ac["msfs_server"] + "</td>"
			+ "<td class='r'>" + ac["altitude"].toFixed(0) + "</td>"
			+ "<td class='r'>" + ac["heading"].toFixed(0) + "</td>"
			+ "<td class='r'>" + ac["airspeed"].toFixed(0) + "</td>"
			+ "<td class='r'>" + ac["groundspeed"].toFixed(0) + "</td>"
			+ "<td class='r'>" + ac["touchdown_velocity"].toFixed(0) + "</td>"
			+ "<td class='r'>" + ac["time_online"] + "</td>"
			+ "<td class='r'>" + ac["version"] + "</td>"
		+ "</tr>\r\n");

	$("#callsign_" + i).click(function(){
		map.closePopup();
		map.flyTo([ $(this).attr("latitude") , $(this).attr("longitude") ],10);
	});
	
	var icon_hdg = ac["heading"] - 90;
	if (icon_hdg < 0) icon_hdg += 360;

	var marker = L.marker([ac["latitude"],ac["longitude"]],{
		rotationAngle: icon_hdg,
		icon: L.divIcon({
		        	className: 'plane-icon',
		        				iconSize:[20,20],
                		html: '<i class="fa fa-light fa-plane" style="color:#224466;font-size:1.5em;"></i>',
                    iconAnchor: [5, 7]
		})
	});

	var popup = L.popup()
		.setLatLng(marker.getLatLng())
		.setContent("<div class='info'>"
			+ "<div style='font-size:2em;'>" + ac["callsign"] + "</div>"
			+ "<div style='color:#555;'>" + ac["pilot_name"] + ", " + ac["group_name"] + "</div>"
			+ "<table border='0' cellpadding='0' cellspacing='0' style='margin:0px;padding:0px;margin-top:5px;'>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Type</td><td style='color:#333;'>" + ac["aircraft_type"] + "</td>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Altitude</td><td style='color:#333;'>" + Math.round(ac["altitude"],0) + " ft</td>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Heading</td><td style='color:#333;'>" + Math.round(ac["heading"],0) + " deg</td>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Airspeed</td><td style='color:#333;'>" + Math.round(ac["airspeed"],0) + " kts</td>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Groundspeed</td><td style='color:#333;'>" + Math.round(ac["groundspeed"],0) + " kts</td>"
		 	+ "<tr><td style='color:#777;padding:0px;'>Time Online</td><td style='color:#333;'>" + ac["time_online"] + "</td>"
		 	+ "</table>"
			+ "<div>" + ac["notes"] + "</div>");

	marker.popup = popup;

	marker.addEventListener("click", function (e){
		map.closePopup();
		map.panTo(this.getLatLng());
		map.openPopup(this.popup);
	});

	marker.addTo(map);

    }


}

function comparer(index) {
  return function(a, b) {
    var valA = getCellValue(a, index), valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB);
  }
}

var who_json_url = "https://virtualflight.online/who_json.php";


function getCellValue(row, index){ return $(row).children('td').eq(index).text() }

$(document).ready(function(){
  fetch_aircraft(true);

  $('th').click(function(){

  
    var table = $(this).parents('table').eq(0);
    var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
    this.asc = !this.asc;
    if (!this.asc){
      rows = rows.reverse()
    }
    for (var i = 0; i < rows.length; i++){
      table.append(rows[i])
    }

  });

});


