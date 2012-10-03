from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'run_logger.views.home'),

    url(r'^retrieve-logs/$', 'run_logger.views.retrieve_logs'),
    url(r'^retrieve-logs/(?P<raw_date>\d{8})/$', 'run_logger.views.retrieve_logs'),
    url(r'^retrieve-logs/(?P<raw_date>\d{8})/(?P<days>\d+)/$', 'run_logger.views.retrieve_logs'),
    url(r'^retrieve-weekly-plans/(?P<raw_date>\d{8})/(?P<days>\d+)/$', 'run_logger.views.retrieve_weekly_plans'),

    url(r'^delete-log/(?P<raw_date>\d{8})/$', 'run_logger.views.delete_log'),

    url(r'^create-update-log/$', 'run_logger.views.create_update_log'),
    url(r'^create-update-weekly-plan/$', 'run_logger.views.create_update_weekly_plan'),
)
