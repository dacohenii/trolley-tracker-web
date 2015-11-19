var shownotrolley = false;
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

function initMap(data){
  //console.log("lat: " + data.lat, "lng: " + data.lng);
  window.oMap = L.map('map', {
    scrollWheelZoom: false
  }).setView([data.lat, data.lng], 15);
  L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
  L.tileLayer('http://api.tiles.mapbox.com/v4/linktheoriginal.44f8689d/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibGlua3RoZW9yaWdpbmFsIiwiYSI6IjFjODFkODU1NGVkNWJhODQ2MTk5ZTk0OTVjNWYyZDE0In0.ptQUIfB07dQrUwDM2uMgUw', {
    maxZoom: 18,
    id: 'examples.map-i875mjb7'
  }).addTo(oMap);

  getTrolleyLocations(oMap);
  getUserLocation(oMap);

  oMap.addControl(new oMapControl());
  jQuery('.my-custom-control').append(jQuery('#controls').clone());
}

function getTrolleyLocations(map){
  var $ = jQuery;
  clearTimeout(checkTimer);
  //$('#getupdate').show();
  $.ajax({
      url: '/trolley/update/',
      type: 'get',
      dataType: 'json',
      cache: false,
      crossDomain: true,
      success: function (trolleydata) {
        //console.log("success!", data);
        trolleydata.forEach(function(data){
          var popupText = "<p>Last Seen: <b>" + moment(data.LastBeaconTime).fromNow() + "</b></p>";

          // create a marker for new trolleys, or update info on existing maker
          if (!trolleys[data.ID]) {
            //currently no way to tie trolleys to routes - so they're all one color
            var trolleyIcon = L.AwesomeMarkers.icon({
              icon: 'bus',
              markerColor: 'red'
            });

            var oMapMarker = L.marker([data.CurrentLat, data.CurrentLon], {
              icon: trolleyIcon
            }).addTo(oMap).bindPopup(popupText);

            //add the data to the trolleys object
            trolleys[data.ID] = {
              agentData: data,
              mapMarker: oMapMarker
            };
          } else {
              // existing trolley: update location and popup
              trolleys[data.ID].mapMarker
                .setLatLng([data.CurrentLat, data.CurrentLon])
                .setPopupContent(popupText);
          }
        });
      },
      complete: function(data) {
        //set the next call for 5 seconds
        checkTimer = setTimeout(function(){getTrolleyLocations(oMap);}, 5000);
      }
    });
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
    if (loc.StopImageURL != null) {
      sImageHTML = "<br><img src='" + loc.StopImageURL + "'/>";
    }
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
  if (shownotrolley) {
    jQuery('#notrolley').show();
  }
  jQuery('#info').hide(); 
  jQuery('#info-question').show();
}

function showInfo() {
  if (shownotrolley) {
    jQuery('#notrolley').hide();
  }
  jQuery('#info').show();
  jQuery('#info-question').hide();
}

function closeNoTrolley() {
  jQuery('#notrolley').hide();
}

(function($){

  if (routedata.length == 0) {
    scheduledata.forEach(function(schedule, scheduleIndex){
      $("<p>" + schedule + "</p>").insertAfter("#scheduletitle");
    });
    jQuery('#notrolley').show();
    shownotrolley = true;
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
  getTrolleyLocations(oMap);

})(jQuery);