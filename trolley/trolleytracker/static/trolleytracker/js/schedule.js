var showSchedules = false;
var oMap; // map object
var currentPosMarker; //user location via browser get location
var routes = []; //array of all routes
var stops = []; //array of all stops (for all routes)
var trolleys = {}; //dictionary of trolleys
var routecolors = [{css:"first", color:"#7659D1"}, {css:"second", color:"#9AB87A"}, {css:"third", color:"#FEDF66"}]; //used to set route and stop colors
var routeDisplay = [false, false]; //used for toggling route display - not currently toggleable
var checkTimer; //Timer object to check for trolley location updates

//custom control
var oMapControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    onAdd: function (map) {
      // create the control container with a particular class name
      var container = L.DomUtil.create('div', 'my-custom-control');
      // ... initialize other DOM elements, add listeners, etc.
      return container;
    }
});

var oScheduleControl = L.Control.extend({
    options: {
      position: 'bottomleft'
    },
    onAdd: function (map) {
      // create the control container with a particular class name
      var container = L.DomUtil.create('div', 'schedulecontrol');
      // ... initialize other DOM elements, add listeners, etc.
      return container;
    }
});

var oBackControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },
    onAdd: function (map) {
      // create the control container with a particular class name
      var container = L.DomUtil.create('div', 'backcontrol');
      // ... initialize other DOM elements, add listeners, etc.
      return container;
    }
});

function initMap(data){
  //console.log("lat: " + data.lat, "lng: " + data.lng);
  window.oMap = L.map('map', {
    scrollWheelZoom: false
  }).setView([data.lat, data.lng], 15);
  L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
  L.tileLayer('https://api.mapbox.com/styles/v1/linktheoriginal/ciom3jx8k0006bolzuqwm7o3m/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlua3RoZW9yaWdpbmFsIiwiYSI6IjFjODFkODU1NGVkNWJhODQ2MTk5ZTk0OTVjNWYyZDE0In0.ptQUIfB07dQrUwDM2uMgUw', {
    maxZoom: 18,
    id: 'examples.map-i875mjb7'
  }).addTo(oMap);

  oMap.addControl(new oMapControl());
  jQuery('.my-custom-control').append(jQuery('#controls').clone());

  oMap.addControl(new oScheduleControl());
  jQuery('.schedulecontrol').append(jQuery('#schedule').clone());

  oMap.addControl(new oBackControl());
  jQuery('.backcontrol').append(jQuery('#back').clone());
}

function buildRoute(data, route_name, color) {
  //data is an array of lat/lon objects
  //[{lat:1, lon:1}, {lat:2, lon:2}, ...]

  var pointList = [];
  data.forEach(function(loc, index, array){
    pointList.push(new L.LatLng(loc.Lat, loc.Lon));
  });

  var routePolyLine = new L.Polyline(pointList, {
    color: color.color,
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
  });

  //use the settext plugin to add directional arrows to the route.
  routePolyLine.setText('  ►  ', {repeat: true, attributes: {fill: color.color}});

  //store the new polyline in the routes object
  routes.push(routePolyLine);
}

function buildStops(stoplocs, color) {
	stoplocs.forEach(function(loc, index, array) {
		var stopMarker = L.divIcon({className: "trolley-stop-icon " + color.css});
		
		var oMapMarker = L.marker([loc.Lat, loc.Lon], {
			icon: stopMarker
		});

    oMapMarker.Name = loc.Name;
    oMapMarker.StopImageURL = loc.StopImageURL;

    bStopExists = false;

    stops.forEach(function(existloc, existindex, existarray) {
      if (existloc._latlng.lat == loc.Lat && existloc._latlng.lng == loc.Lon) {
        //then this stop is on two routes.  relying on setting the color name as the LAST class argument.  (first is trolley-stop-icon)
        //this will build color strings of all colors to show (red-green-blue if it's on three routes initialized in that order)
        existloc.options.icon.options.className = existloc.options.icon.options.className + "-" + color.css;
      }
    });

		stops.push(oMapMarker);
	});
}

function addStops() {
  stops.forEach(function(loc, index, array) {
    var sImageHTML = "";
    //the api currently has this set on some of the stops, but the data's wrong.
    /*if (loc.StopImageURL != null) {
      sImageHTML = "<br><img src='" + loc.StopImageURL + "'/>";
    }*/
    loc.addTo(oMap).bindPopup("<p><b>" + loc.Name + "</b>" + sImageHTML + "</p>");
  });
}

function addRoutes() {
  routes.forEach(function(route, routeIndex){
    route.addTo(oMap);
  });
}

function hideStops(map, hideStops) {
	//this is currently not used - left in for future use
	for (var stop in hideStops) {
		map.removeLayer(hideStops[stop]);			
	}
}

function hideTrolleyPaths(map) {
	routeDisplay.forEach(function(route, index, array) {
		if (route) {
			map.removeLayer(routes['route_' + index]);
		}
	});
}

/*
 * Attempt to geolocate the user through the browser, and, if 
 * successful, add a pin for the user's current location and
 * add a pin on it.  This only runs once on pageload.
 */
function getUserLocation(map){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      //console.log(position.coords.latitude + "," + position.coords.longitude);
      //oMap.setView([position.coords.latitude, position.coords.longitude], 16);
      var userPositionMarker = L.AwesomeMarkers.icon({
        icon: 'star',
        markerColor: 'green'
      });

      currentPosMarker = L.marker([position.coords.latitude, position.coords.longitude],{
        icon: userPositionMarker
      })
        .addTo(map)
        .bindPopup("<b>You are here!</b>");
    });
  }
}

function closeInfo() {
  if (showSchedules) {
    jQuery('#schedules').show();
  }
  jQuery('#info').hide(); 
  jQuery('#info-question').show();
  jQuery('#info-schedule').show();
}

function showInfo() {
  if (showSchedules) {
    jQuery('#schedules').hide();
  }
  jQuery('#info').show();
  jQuery('#info-question').hide();
  jQuery('#info-schedule').hide();
}

function closeSchedule() {
  jQuery('#schedules').hide();
  jQuery('#info-question').show();
  jQuery('#info-schedule').show();
}

function showSchedule() {
  jQuery('#schedules').show();
  jQuery('#info-question').hide();
  jQuery('#info-schedule').hide();
}

function addViewingRoute() {
  jQuery('#schedule_name').html('<b>Viewing Route:</b> <br>' + routedata[0].LongName);
}

function addViewingSchedule() {
  jQuery('#runs_when').html('<b>Runs on:</b><br>' + runson.join('<br>'));
}

(function($){
  scheduledata.forEach(function(schedule, scheduleIndex){
    $("<p>" + schedule + "</p>").insertAfter("#scheduletitle");
  });
    
  if (routedata.length == 0) {
    showSchedules = true;
    showSchedule();
  } else {
    routedata.forEach(function(route, routeIndex) {
      buildRoute(route.RouteShape, "route_" + routeIndex, routecolors[routeIndex]);
    });
  }

  routedata.forEach(function(route, routeIndex) {
    buildStops(route.Stops, routecolors[routeIndex]);
  });

  initMap({lat: 34.852432, lng: -82.398216});

  addRoutes();
  addStops();

  addViewingRoute();
  addViewingSchedule();

})(jQuery);