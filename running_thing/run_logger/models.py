from django.db import models
from django.contrib.auth.models import User

class JsonModel(models.Model):
    JSON_FIELDS = ()

    def json_dict(self):
        ''' Prep to be json serialized '''
        ready_for_json = { 
            key: str(getattr(self, key)) if getattr(self, key) is not None else None 
            for key in self.JSON_FIELDS
        }
        return ready_for_json

class RunningLog(JsonModel):
    JSON_FIELDS = ('miles_ran', 'miles_planned', 'running_time_seconds', 'planned_time_seconds')

    created = models.DateTimeField(auto_now_add=True)
    date = models.DateField()
    miles_ran = models.DecimalField(max_digits=7, decimal_places=3, null=True)
    miles_planned = models.DecimalField(max_digits=7, decimal_places=3, null=True)
    running_time_seconds = models.IntegerField(null=True)
    planned_time_seconds = models.IntegerField(null=True)

    user = models.ForeignKey(User)

    def json_dict(self):
        ready_for_json = super(RunningLog, self).json_dict()
        ready_for_json['date'] = self.date.strftime('%Y%m%d')
        return ready_for_json

class WeeklyPlan(JsonModel):
    JSON_FIELDS = ('planned_mileage',)

    created = models.DateTimeField(auto_now_add=True)
    monday = models.DateField()
    planned_mileage = models.DecimalField(max_digits=7, decimal_places=3)

    user = models.ForeignKey(User)

    def json_dict(self):
        ready_for_json = super(WeeklyPlan, self).json_dict()
        ready_for_json['monday'] = self.monday.strftime('%Y%m%d')
        return ready_for_json
