var first_date = null;
var days_tracked = 0;
var full_data = null;
var date_hash = {};

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

function equal_dates(d1, d2) {
    return d1.toDateString() == d2.toDateString();
}

function populate_results(logs) {}

function build_month(first_date, num_days) {
    var today = new Date();
    var moving_date = new Date(first_date);
    var weeks = [];
    var cur_week = null;

    // ajax call, populate_results callback

    for (var i = 1; i <= num_days; i++) {
        if (!cur_week) {
            cur_week = {days: [], total: 0, goal: 0, time_total: 0};
            weeks.push(cur_week);
        } else {
            moving_date.setDate(moving_date.getDate() + 1);
        }

        date_hash[moving_date.toDateString()] = {
            date_str: moving_date.toDateString(),
            date: moving_date.getDate(),
            when: equal_dates(moving_date, today)?'today':'',
            miles_ran: 0,
            hrs: 0,
            min: 0,
            sec: 0,
            week: cur_week
        };
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

function redraw() {
    $("#row-container").html("").append(
        $("#row-template").jqote(full_data)
    );
}

$(init_cal);
