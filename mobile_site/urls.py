from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('mobile_site.views',
    url(r'^index$', 'index'),
    url(r'^mobile$', 'mob_index'),
    url(r'^page$', 'page'),
    url(r'^purify$', 'purify_html'),
    url(r'^save$', 'save'),
    url(r'^login$', 'login_view'),
    url(r'^logout$', 'logout_view'),
    url(r'^loginAction$', 'login_action'),
    url(r'.*', 'test'),
)
