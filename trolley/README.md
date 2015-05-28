# Trolley Tracker - Web

**Webapp to display trolley locations on a map.**

_(Additional documentation to be added soon.)_

### Miscellaneous notes

This uses the trolley tracker api to retrieve the locations to display (https://github.com/codeforgreenville/trolley-tracker-api).

This django setup is using Python 3.  "py manage.py runserver" will run it locally.

Chrome does not support browser geolocation from file URLs, so to use this feature, you must view the page via HTTP using a browser against the django web server.  Note that this is not a required feature; it is used to center the map and display a marker.