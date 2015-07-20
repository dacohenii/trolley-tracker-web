# Trolley Tracker - Web

**Webapp to display trolley locations on a map.**

_(Additional documentation to be added soon.)_

### Miscellaneous notes

`location.json` is a example of data from [the trolley tracker API](https://github.com/codeforgreenville/trolley-tracker-api).

Chrome does not support browser geolocation from file URLs, so to use this feature, you must view the page via HTTP using a web server, e.g. by running `python -m SimpleHTTPServer` and viewing it on `http://localhost:8000/`. Note that this is not a required feature; it is used to center the map and display a marker.

@thedanfields created the Web API:

I finally eeked out some time today to deploy the code for endpoint updates.

They are as follows:

http://104.131.44.166/api/v1/trollies -> Gets status and current stops for all known vehicles.

http://104.131.44.166/api/v1/trollies/:id/stops -> Gets current stops for vehicle with given :id

I haven't but any security on theses new endpoints for testing purposes. Additionally the phonetester trolley (:id 5) hits all stops 24/7. Again testing purposes.

The scheduling is setup so that we should be able to have a default schedule for each day of the week for each trolley. If a different one off / special schedule is needed that is also handled.

Scheduling data is stored in a json column expecting data in the following format:

[ { "startTime": "12:00:00", "endTime": "16:00:00", "stops": [ 1, 2 ] } , { "startTime": "20:00:00", "endTime": "24:00:00", "stops": [ 3, 4, 5 ] } ]
