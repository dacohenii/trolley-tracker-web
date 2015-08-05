from django.shortcuts import render
from django.http import HttpResponse
import urllib.request

# Create your views here.
def track(request):
	context = {
		'datarequest': urllib.request.urlopen(urllib.request.Request("http://yeahthattrolley.azurewebsites.net/api/v1/Stops")).read()
	}
	return render(request, 'trolleytracker/index.html', context)
	
def update(request):
	datarequest = urllib.request.Request("http://yeahthattrolley.azurewebsites.net/api/v1/Trolleys")
	return HttpResponse(urllib.request.urlopen(datarequest).read())
