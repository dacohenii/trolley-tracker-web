from django.shortcuts import render
from django.http import HttpResponse
import urllib.request
import json

# Create your views here.
def track(request):
	#get the list of currently active routes
	activeroutes = json.loads(urllib.request.urlopen(urllib.request.Request("http://tracker.wallinginfosystems.com/api/v1/Routes/Active")).read().decode('utf-8'))
	routes = []

	for route in activeroutes:
		#get the route definition for each active route
		routes.append(json.loads(urllib.request.urlopen(urllib.request.Request("http://tracker.wallinginfosystems.com/api/v1/Routes/" + str(route['ID']))).read().decode('utf-8')))

	#get the active trolley data
	#trolleys = json.loads(urllib.request.urlopen(urllib.request.Request("http://tracker.wallinginfosystems.com/api/v1/Trolleys")).read().decode('utf-8'))

	context = {
		'routes': json.dumps(routes)
	}
	return render(request, 'trolleytracker/index.html', context)
	
def update(request):
	datarequest = urllib.request.Request("http://tracker.wallinginfosystems.com/api/v1/Trolleys")
	return HttpResponse(urllib.request.urlopen(datarequest).read())
