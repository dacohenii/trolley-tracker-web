from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.track, name='track'),
	url(r'^update/$', views.update, name='update'),
	url(r'^schedule/([0-9]+)/$', views.schedule, name='schedule')
]