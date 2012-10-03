from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout_then_login', name='logout'),
    url(r'^signup/$', 'vanilla_auth.views.signup', name='signup'),
    url(r'^validate/(?P<username>\w+)/(?P<digest>\w+)$', 'vanilla_auth.views.validate', name='validate'),
)
