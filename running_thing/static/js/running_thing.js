var first_date = null;
var days_tracked = 0;
var full_data = null;
var date_hash = {};
var week_hash = {};

// in lieu of an actual date library...ugh
function date_to_str(date) {
    var day = date.getDate();
    day_str = day > 9? day.toString() : "0" + day.toString();

    var month = date.getMonth() + 1;
    month_str = month > 9? month.toString() : "0" + month.toString();

    return date.getFullYear() + month_str + day_str;
}

function str_to_date(str) {
    var date = new Date();
    date.setFullYear(str.substr(0,4));
    date.setMonth(
        parseInt(str.substr(4,2), 10) - 1
    );
    date.setDate(
        parseInt(str.substr(6,2), 10)
    );
    return date;
}

function equal_dates(d1, d2) {
    return d1.toDateString() == d2.toDateString();
}

function init_cal() {
    var first_date_offset = (new Date()).getDay() - 1;
    if (first_date_offset < 0) {
        first_date_offset += 7;
    }
    first_date = new Date();
    first_date.setDate(first_date.getDate() - first_date_offset);
    days_tracked = 28;

    full_data = build_month(first_date, days_tracked)
    $("#row-container").append(
        $("#row-template").jqote(full_data)
    );
}

function populate_results(logs) {
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        var log_date = str_to_date(log.date);
        if (log_date.toDateString() in date_hash) {
            var running_time = parseInt(log.running_time_seconds, 10);
            var mileage = parseInt(log.miles_ran, 10);
            var js_date_obj = date_hash[log_date.toDateString()];
            js_date_obj.miles_ran = log.miles_ran;
            js_date_obj.miles_planned = log.miles_planned;
            js_date_obj.total_seconds = log.running_time_seconds;
            js_date_obj.total_time_str = seconds_to_time_str(running_time);

            js_date_obj.pace = seconds_to_time_str(mileage > 0? running_time/mileage : 0);
            js_date_obj.pace += js_date_obj.pace? "/mi" : "";
        }
    }

    for (var i = 0; i < full_data.length; i++) {
        var week = full_data[i];
        week.total = 0;

        for (var j = 0; j < week.days.length; j++) {
            week.total += parseInt(week.days[j].miles_ran, 10);
        }
    }

    redraw();
}

function populate_weekly(plans) {
    for (var i = 0; i < plans.length; i++) {
        var plan = plans[i];
        var plan_date = str_to_date(plan.monday);
        if (plan_date.toDateString() in week_hash) {
            var js_week_obj = week_hash[plan_date.toDateString()];
            js_week_obj.goal = plan.planned_mileage;
        }
    }
    redraw();
}

function build_month(first_date, num_days) {
    var today = new Date();
    var moving_date = new Date(first_date);
    var weeks = [];
    var cur_week = null;

    retrieve_all();

    for (var i = 1; i <= num_days; i++) {
        if (!cur_week) {
            cur_week = {days: [], total: 0, goal: 0, time_total: 0};
            weeks.push(cur_week);
        } else {
            moving_date.setDate(moving_date.getDate() + 1);
        }

        date_hash[moving_date.toDateString()] = {
            date_uniq: moving_date.toDateString().replace(/ /g, ""),
            date_str: moving_date.toDateString(),
            date: moving_date.getDate(),
            date_obj: new Date(moving_date),
            today_class: equal_dates(moving_date, today)?"today":"",
            miles_ran: 0,
            miles_planned: 0,
            week: cur_week,
            pace: "",
            total_time_str: ""
        };

        if (cur_week.days.length == 0) {
            week_hash[moving_date.toDateString()] = cur_week;
            cur_week.monday_str = date_to_str(moving_date);
        }

        cur_week.days.push(date_hash[moving_date.toDateString()]);

        if (i % 7 == 0) {
            cur_week = null;
            moving_date.setDate(moving_date.getDate() + 1);
        }
    }

    return weeks;
}

function previous_month() {
    first_date.setDate(first_date.getDate() - 28);
    days_tracked += 28;

    var prepend_data = build_month(first_date, 28);
    full_data = prepend_data.concat(full_data);
    $("#row-container").prepend(
        $("#row-template").jqote(prepend_data)
    );
}

function next_month() {
    var next_start = new Date(first_date);
    next_start = next_start.setDate(next_start.getDate() + days_tracked);
    days_tracked += 28;

    var append_data = build_month(next_start, 28);
    full_data = full_data.concat(append_data)
    $("#row-container").append(
        $("#row-template").jqote(append_data)
    );
}

function seconds_to_time_str(seconds) {
    if (!seconds) {
        return "";
    }
    seconds = parseInt(seconds, 10);
    var hrs = Math.floor(seconds/3600);
    var min = Math.floor((seconds % 3600)/60);
    var sec = seconds % 60;

    var time_str = "";
    if (hrs > 0) {
        time_str += hrs + ":";
    }

    if (min == 0 && (hrs > 0 || sec > 0)) {
        time_str += "00:";
    } else if (min > 0 && min < 10) {
        time_str += "0" + min + ":";
    } else if (min > 9) {
        time_str += min + ":";
    }

    if (hrs == min && min == sec && sec == 0) {
        time_str = "";
    } else {
        time_str += sec > 9? sec : "0" + sec;
    }

    return time_str;
}

function time_str_to_seconds(time_str) {
    var time_arr = time_str.split(":");
    if (time_arr.length == 2) {
        return parseInt(time_arr[1], 10) + parseInt(time_arr[0], 10) * 60;
    } else if (time_arr.length == 3) {
        return parseInt(time_arr[2], 10) + parseInt(time_arr[1], 10) * 60 + parseInt(time_arr[0], 10) * 3600;
    } else {
        return '';
    }
}

function save_log(date_str) {
    var date_obj = date_hash[date_str].date_obj;
    var date_uniq = date_obj.toDateString().replace(/ /g, "");
    var $miles_entry = $("#miles-entry-" + date_uniq);

    var log_update = {
        miles_ran: $miles_entry.find("input[name='miles_ran']").val(),
        miles_planned: $miles_entry.find("input[name='miles_planned']").val(),
        date: date_to_str(date_obj),
        running_time_seconds: time_str_to_seconds(
            $miles_entry.find("input[name='running_time']").val()
        )
    };

    for (var k in log_update) {
        if (log_update[k] == '') {
            delete log_update[k];
        }
    }

    $.ajax({
        url: '/create-update-log/',
        data: log_update,
        success: function(data) {
            if (!data.error) {
                retrieve_all();
            }
        }
    });
}

function save_plan(mon_str) {
    var $goal_entry = $("#goal-entry-" + mon_str).find("input[name='goal']");
    if ($goal_entry.val()) {
        $.ajax({
            url: '/create-update-weekly-plan/',
            data: {
                monday: mon_str,
                planned_mileage: $goal_entry.val()
            },
            success: function(data) {
                if (!data.error) {
                    retrieve_all();
                }
            }
        });
    }
}

function retrieve_all() {
    $.ajax({
        url: "/retrieve-logs/" + date_to_str(first_date) + "/" + days_tracked,
        success: populate_results
    });

    $.ajax({
        url: "/retrieve-weekly-plans/" + date_to_str(first_date) + "/" + days_tracked,
        success: populate_weekly
    });
}

function redraw() {
    $("#row-container").html("").append(
        $("#row-template").jqote(full_data)
    );

    $(".day").click(function() {
        var $cur_miles_entry = $(this).find(".miles-entry");
        $(".miles-entry").each(function() {
            if ($cur_miles_entry.length > 0 && this != $cur_miles_entry[0]) {
                $(this).hide(200);
            }
        });
        if (!$cur_miles_entry.is(":visible")) {
            $cur_miles_entry.show(200);
        }
    });

    $(".total").click(function() {
        var $cur_goal_entry = $(this).find(".goal-entry");
        $(".goal-entry").each(function() {
            if ($cur_goal_entry.length > 0 && this != $cur_goal_entry[0]) {
                $(this).hide(200);
            }
        });
        if (!$cur_goal_entry.is(":visible")) {
            $cur_goal_entry.show(200);
        }
    });
}

$(init_cal);
