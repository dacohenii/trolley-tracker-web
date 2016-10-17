from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.clickjacking import xframe_options_exempt
import urllib.request
import json

#API_URL = 'http://tracker.wallinginfosystems.com/api/v1/'
API_URL='http://yeahthattrolley.azurewebsites.net/api/v1/' 



# Create your views here.
@xframe_options_exempt
def track(request):
	#get the list of currently active routes
	activeroutes = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Routes/Active")).read().decode('utf-8'))
	routes = []

	#get the list of schedules in case there's no trolleys running
	schedules = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "RouteSchedules")).read().decode('utf-8'))

	#sort schedules
	dayofweekorder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
	schedules.sort(key=lambda x: (dayofweekorder.index(x['DayOfWeek']), int(x['StartTime'][0:2].replace(':', '')) + (0 if 'AM' in x['StartTime'] else 12), int(x['EndTime'][0:2].replace(':', '')) + (0 if 'AM' in x['EndTime'] else 12)), reverse=True)
	#this sorting quickly became pretty ugly.  The api doesn't return clean datetimes, so I'm replacing the first two of the time (hours, e.g. '4:' or '12') and adding 12 if it's PM.
	#using tuples to sort by day of week, then start time, then end time.

	#have to make this call too in order to get the names of the routes
	routenames = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Routes")).read().decode('utf-8'))

	schedule = []
	for routeschedule in schedules:
		schedulename = "Route " + str(routeschedule['ID'])
		for route in routenames:
			if (route['ID'] == routeschedule['RouteID']):
				schedulename = route['LongName']
				break
		schedule.append('<b><a href="schedule/' + str(routeschedule['RouteID']) + '/">' + schedulename + ":</a></b><br>" + str(routeschedule['DayOfWeek']) + " " + str(routeschedule['StartTime']) + " - " + str(routeschedule['EndTime']))

	for route in activeroutes:
		#get the route definition for each active route
		routes.append(json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Routes/" + str(route['ID']))).read().decode('utf-8')))

	#get the active trolley data
	#trolleys = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Trolleys")).read().decode('utf-8'))

	context = {
		'routes': json.dumps(routes),
		'schedule': json.dumps(schedule)
	}
	return render(request, 'trolleytracker/index.html', context)

@xframe_options_exempt
def update(request):
	trolleys = []

	activetrolleys = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Trolleys/Running")).read().decode('utf-8'))

	for trolley in activetrolleys:
		trolleys.append(json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Trolleys/" + str(trolley['ID']))).read().decode('utf-8')))

	return HttpResponse(json.dumps(trolleys))

@xframe_options_exempt
def schedule(request, scheduleid):
	schedules = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "RouteSchedules")).read().decode('utf-8'))
	scheduleroute = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Routes/" + scheduleid)).read().decode('utf-8'))
	routenames = json.loads(urllib.request.urlopen(urllib.request.Request(API_URL + "Routes")).read().decode('utf-8'))

	routes = []
	routes.append(scheduleroute)

	dayofweekorder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
	schedules.sort(key=lambda x: (dayofweekorder.index(x['DayOfWeek']), int(x['StartTime'][0:2].replace(':', '')) + (0 if 'AM' in x['StartTime'] else 12), int(x['EndTime'][0:2].replace(':', '')) + (0 if 'AM' in x['EndTime'] else 12)), reverse=True)

	schedule = []
	runs = []
	for routeschedule in schedules:
		schedulename = "Route " + str(routeschedule['ID'])
		for route in routenames:
			if (route['ID'] == routeschedule['RouteID']):
				schedulename = route['LongName']
				break
		schedule.append('<b><a href="../' + str(routeschedule['RouteID']) + '/">' + schedulename + ":</a></b><br>" + str(routeschedule['DayOfWeek']) + " " + str(routeschedule['StartTime']) + " - " + str(routeschedule['EndTime']))
		if (int(routeschedule['RouteID']) == int(scheduleid)):
			runs.append(str(routeschedule['DayOfWeek']) + ": " + str(routeschedule['StartTime']) + " - " + str(routeschedule['EndTime']))

	context = {
		'routes': json.dumps(routes),
		'schedule': json.dumps(schedule),
		'runs_on': json.dumps(runs)
	}
	return render(request, 'trolleytracker/schedule.html', context)

	return HttpResponse()