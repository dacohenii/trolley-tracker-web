from django.shortcuts import render
from django.http import HttpResponse
import urllib.request

# Create your views here.
def track(request):
	return render(request, 'trolleytracker/index.html')
	
def update(request):
	datarequest = urllib.request.Request("http://104.131.44.166/api/v1/trolly/" + request.GET['id'].strip() + "/location")
	return HttpResponse(urllib.request.urlopen(datarequest).read())
