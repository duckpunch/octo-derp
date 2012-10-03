import json
from datetime import datetime, timedelta
from django.http import HttpResponse
from django.views.decorators.http import require_http_methods
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.forms import ValidationError
from run_logger.models import RunningLog, WeeklyPlan

RAW_DATE_FORMAT = '%Y%m%d'

def json_response(data):
    return HttpResponse(json.dumps(data), mimetype='application/json')

def error_json(error_msg=None, extra_context=None):
    error_object = {
        'error': True,
        'msg': error_msg if error_msg is not None else '',
    }

    print extra_context
    if extra_context is not None:
        error_object.update(extra_context)

    return json_response(error_object)    

@login_required
def home(request):
    return render_to_response('index.html', {})

@login_required
def retrieve_logs(request, raw_date=None, days=28):
    days = int(days)

    if raw_date is None:
        raw_date = datetime.today().strftime(RAW_DATE_FORMAT)
    start_date = datetime.strptime(raw_date, RAW_DATE_FORMAT)
    end_date = start_date + timedelta(days=days)

    json_logs = []
    for running_log in RunningLog.objects.filter(date__gte=start_date, user=request.user, date__lte=end_date):
        json_logs.append(running_log.json_dict())

    return json_response(json_logs)

@login_required
def retrieve_weekly_plans(request, raw_date=None, days=28):
    days = int(days)

    if raw_date is None:
        raw_date = datetime.today().strftime(RAW_DATE_FORMAT)
    start_date = datetime.strptime(raw_date, RAW_DATE_FORMAT)
    end_date = start_date + timedelta(days=days)

    json_plans = []
    for weekly_plan in WeeklyPlan.objects.filter(monday__gte=start_date, user=request.user, monday__lte=end_date):
        json_plans.append(weekly_plan.json_dict())

    return json_response(json_plans)

@login_required
def delete_log(request, raw_date):
    return json_response({})

@require_http_methods(['GET','POST'])
@login_required
def create_update_log(request):
    param_dict = request.POST if request.method == 'POST' else request.GET

    raw_date = param_dict.get('date', None)
    if raw_date is None:
        return error_json('\'date\' is a required parameter')

    log_date = datetime.strptime(raw_date, RAW_DATE_FORMAT)

    try:
        running_log = RunningLog.objects.get(
            date=log_date, user=request.user
        )
    except RunningLog.DoesNotExist:
        running_log = RunningLog(
            date=log_date, user=request.user
        )

    for key in RunningLog.JSON_FIELDS:
        if key in param_dict:
            setattr(running_log, key, param_dict[key])

    try:
        running_log.save()
    except ValidationError as v:
        return error_json('Validation error', {'validation_messages': v.messages})

    return json_response({'msg':'Success!'})

@require_http_methods(['GET','POST'])
@login_required
def create_update_weekly_plan(request):
    param_dict = request.POST if request.method == 'POST' else request.GET

    raw_date = param_dict.get('monday', None)
    if raw_date is None:
        return error_json('\'monday\' is a required parameter')

    monday = datetime.strptime(raw_date, RAW_DATE_FORMAT)
    if monday.weekday() != 0:
        return error_json('Monday wasn\'t passed in')

    try:
        weekly_plan = WeeklyPlan.objects.get(
            monday=monday, user=request.user
        )
    except WeeklyPlan.DoesNotExist:
        weekly_plan = WeeklyPlan(
            monday=monday, user=request.user
        )

    for key in WeeklyPlan.JSON_FIELDS:
        if key in param_dict:
            setattr(weekly_plan, key, param_dict[key])

    try:
        weekly_plan.save()
    except ValidationError as v:
        return error_json('Validation error', {'validation_messages': v.messages})

    return json_response({'msg':'Success!'})
