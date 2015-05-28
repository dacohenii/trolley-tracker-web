# Trolley Tracker - Web

**Webapp to display trolley locations on a map.**

_(Additional documentation to be added soon.)_

### Miscellaneous notes

`location.json` is a example of data from [the trolley tracker API](https://github.com/codeforgreenville/trolley-tracker-api).

Chrome does not support browser geolocation from file URLs, so to use this feature, you must view the page via HTTP using a web server, e.g. by running `python -m SimpleHTTPServer` and viewing it on `http://localhost:8000/`. Note that this is not a required feature; it is used to center the map and display a marker.