from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^', include('run_logger.urls')),
    url(r'^a/', include('vanilla_auth.urls')),
)
