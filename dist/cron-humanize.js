"use strict";
exports.CONSTANTS = {
    SEPARATOR: ' ',
    COMA: ',',
    DASH: '-',
    WILDCARD: '*',
    UNSPECIFIED: '?',
    SLASH: '/',
    TYPE_MULTI: 'multi',
    TYPE_RANGE: 'range',
    TYPE_SINGLE: 'single',
    TYPE_WILDCARD: 'wildcard',
    TYPE_UNSPECIFIED: 'unspecified',
    TYPE_INTERVAL: 'interval',
    SHORT_DAYS: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    FULL_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    SHORT_MONTHS: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    FULL_MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
var UnitDefinition = (function () {
    function UnitDefinition(rawData, names, indexBase) {
        this.rawData = rawData;
        this.names = names;
        this.indexBase = indexBase;
        this.type = this.setType(rawData);
        switch (this.type) {
            case exports.CONSTANTS.TYPE_MULTI:
                this.multi = this.getMultiDef(rawData);
                break;
            case exports.CONSTANTS.TYPE_RANGE:
                this.range = this.getRangeDef(rawData);
                break;
            case exports.CONSTANTS.TYPE_INTERVAL:
                this.interval = this.getIntervalDef(rawData);
                break;
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                this.unspecified = this.getDef(rawData);
                break;
            case exports.CONSTANTS.TYPE_WILDCARD:
                this.wildcard = this.getDef(rawData);
                break;
            case exports.CONSTANTS.TYPE_SINGLE:
                this.single = this.getSingleDef(rawData);
                break;
        }
    }
    UnitDefinition.prototype.setType = function (value) {
        if (value.indexOf(exports.CONSTANTS.COMA) > 0) {
            return exports.CONSTANTS.TYPE_MULTI;
        }
        else if (value.indexOf(exports.CONSTANTS.WILDCARD) >= 0) {
            return exports.CONSTANTS.TYPE_WILDCARD;
        }
        else if (value.indexOf(exports.CONSTANTS.UNSPECIFIED) >= 0) {
            return exports.CONSTANTS.TYPE_UNSPECIFIED;
        }
        else if (value.indexOf(exports.CONSTANTS.SLASH) > 0) {
            return exports.CONSTANTS.TYPE_INTERVAL;
        }
        else if (value.indexOf(exports.CONSTANTS.DASH) > 0) {
            return exports.CONSTANTS.TYPE_RANGE;
        }
        else {
            return exports.CONSTANTS.TYPE_SINGLE;
        }
    };
    UnitDefinition.prototype.checkForNamed = function (value) {
        return isNaN(parseInt(value)) ? this.getIndex(value) : parseInt(value);
    };
    UnitDefinition.prototype.getMultiDef = function (value) {
        var _this = this;
        var values = value.split(exports.CONSTANTS.COMA).map(function (current) { return _this.checkForNamed(current); }), last = values.pop();
        return { values: values, last: last };
    };
    UnitDefinition.prototype.getRangeDef = function (value) {
        var _this = this;
        var range = value.split(exports.CONSTANTS.DASH).map(function (current) { return _this.checkForNamed(current); });
        return {
            start: range[0],
            end: range[1]
        };
    };
    UnitDefinition.prototype.getIntervalDef = function (value) {
        var _this = this;
        var interval = value.split('/').map(function (current) { return _this.checkForNamed(current); });
        return {
            start: interval[0],
            step: interval[1]
        };
    };
    UnitDefinition.prototype.getDef = function (value) {
        return value;
    };
    UnitDefinition.prototype.getSingleDef = function (value) {
        return this.checkForNamed(value);
    };
    UnitDefinition.prototype.getIndex = function (value) {
        return this.names.indexOf(value) + this.indexBase;
    };
    return UnitDefinition;
}());
exports.UnitDefinition = UnitDefinition;
var CronExpression = (function () {
    function CronExpression(expressionString) {
        this.expressionString = expressionString;
        this.setDissection(expressionString);
        this.seconds = new UnitDefinition(this.dissection.seconds);
        this.minutes = new UnitDefinition(this.dissection.minutes);
        this.hours = new UnitDefinition(this.dissection.hours);
        this.dayOfMonth = new UnitDefinition(this.dissection.dayOfMonth);
        this.month = new UnitDefinition(this.dissection.month, exports.CONSTANTS.SHORT_MONTHS, 0);
        this.dayOfWeek = new UnitDefinition(this.dissection.dayOfWeek, exports.CONSTANTS.SHORT_DAYS, 1);
        this.year = new UnitDefinition(this.dissection.year);
    }
    CronExpression.prototype.getKey = function (key) {
        return this[key];
    };
    CronExpression.prototype.setDissection = function (expression) {
        if (!expression) {
            throw new Error('A valid cron expression or generated expression must be provided.');
        }
        else if (typeof expression === 'string') {
            var exprArray = expression.split(exports.CONSTANTS.SEPARATOR);
            if (exprArray.length > 7 || exprArray.length < 6) {
                throw new Error("Invalid cron expression: " + expression + ". Wrong length: " + exprArray.length + ".");
            }
            this.dissection = {
                seconds: exprArray[0],
                minutes: exprArray[1],
                hours: exprArray[2],
                dayOfMonth: exprArray[3],
                month: exprArray[4],
                dayOfWeek: exprArray[5],
                year: exprArray[6]
            };
        }
        else {
            try {
                this.dissection = expression;
            }
            catch (error) {
                throw new Error(error);
            }
        }
    };
    CronExpression.prototype.getDissection = function () {
        return this.dissection;
    };
    return CronExpression;
}());
exports.CronExpression = CronExpression;
var CronParser = (function () {
    function CronParser() {
    }
    CronParser.prototype.humanize = function (expression) {
        var cron = new CronExpression(expression), order = ['month', 'dayOfWeek', 'year'];
        var result = "Fire " + this.getTimeString(cron.seconds, cron.minutes, cron.hours), dayOfMonth = this.getDayOfMonthString(cron.dayOfMonth);
        if (dayOfMonth.length > 0) {
            result += ", " + dayOfMonth;
        }
        if (cron.dayOfMonth.type != exports.CONSTANTS.TYPE_WILDCARD && cron.dayOfMonth.type != exports.CONSTANTS.TYPE_UNSPECIFIED &&
            (cron.month.type === exports.CONSTANTS.TYPE_WILDCARD || cron.month.type === exports.CONSTANTS.TYPE_UNSPECIFIED)) {
            result += " of every month";
        }
        for (var _i = 0, order_1 = order; _i < order_1.length; _i++) {
            var key = order_1[_i];
            if (cron[key].type != exports.CONSTANTS.TYPE_WILDCARD && cron[key].type != exports.CONSTANTS.TYPE_UNSPECIFIED) {
                result += ", " + this.getString(key, cron[key]);
            }
        }
        return result + '.';
    };
    CronParser.prototype.getString = function (type, value) {
        switch (type) {
            case 'dayOfMonth':
                return this.getDayOfMonthString(value);
            case 'month':
                return this.getMonthString(value);
            case 'dayOfWeek':
                return this.getDayOfWeekString(value);
            case 'year':
                return this.getYearString(value);
            default:
                throw new Error('Something went wrong.');
        }
    };
    CronParser.prototype.getTimeString = function (seconds, minutes, hours) {
        if (seconds.type === exports.CONSTANTS.TYPE_SINGLE && minutes.type === exports.CONSTANTS.TYPE_SINGLE && hours.type === exports.CONSTANTS.TYPE_SINGLE) {
            return "at " + this.padZero(hours.single) + ":" + this.padZero(minutes.single) + (seconds.single === 0 ? '' : ':' + this.padZero(seconds.single));
        }
        else if (seconds.type === exports.CONSTANTS.TYPE_WILDCARD && minutes.type === exports.CONSTANTS.TYPE_WILDCARD && hours.type === exports.CONSTANTS.TYPE_WILDCARD) {
            return 'every second';
        }
        else if (seconds.type === exports.CONSTANTS.TYPE_INTERVAL && minutes.type === exports.CONSTANTS.TYPE_WILDCARD) {
            return this.getSecondsString(seconds) + ", " + this.getHoursString(hours);
        }
        else {
            return this.getSecondsString(seconds) + ", " + this.getMinutesString(minutes) + ", " + this.getHoursString(hours);
        }
    };
    CronParser.prototype.getSecondsString = function (seconds) {
        switch (seconds.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every second';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return '';
            case exports.CONSTANTS.TYPE_RANGE:
                return "every second from " + seconds.range.start + " through " + seconds.range.end;
            case exports.CONSTANTS.TYPE_MULTI:
                return "at seconds " + seconds.multi.values.join(', ') + " and " + seconds.multi.last;
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = seconds.interval.step === 1;
                return "every " + (isOne ? '' : seconds.interval.step + ' ') + "second" + (isOne ? '' : 's') + (seconds.interval.start === 0 ? '' : ' starting at second ' + seconds.interval.start);
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "at second " + seconds.single;
        }
    };
    CronParser.prototype.getMinutesString = function (minutes) {
        switch (minutes.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every minute';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return '';
            case exports.CONSTANTS.TYPE_RANGE:
                return "every minute from " + minutes.range.start + " through " + minutes.range.end;
            case exports.CONSTANTS.TYPE_MULTI:
                return "at minutes " + minutes.multi.values.join(', ') + " and " + minutes.multi.last;
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = minutes.interval.step === 1;
                return "every " + (isOne ? '' : minutes.interval.step + this.getOrdinal(minutes.interval.step) + ' ') + "minute" + (minutes.interval.start === 0 ? '' : ' starting at minute ' + minutes.interval.start);
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "at minute " + minutes.single;
        }
    };
    CronParser.prototype.getHoursString = function (hours) {
        switch (hours.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return 'every hour';
            case exports.CONSTANTS.TYPE_RANGE:
                return "during every hour from " + this.pad(hours.range.start) + " through " + this.pad(hours.range.end);
            case exports.CONSTANTS.TYPE_MULTI:
                return "during the hours " + hours.multi.values.map(this.pad).join(', ') + " and " + this.pad(hours.multi.last);
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = hours.interval.step === 1;
                return "past every " + (isOne ? '' : hours.interval.step + this.getOrdinal(hours.interval.step) + ' ') + "hour starting at " + this.pad(hours.interval.start);
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "at " + this.pad(hours.single);
        }
    };
    CronParser.prototype.getOrdinal = function (value) {
        var numString = value.toString();
        switch (parseInt(numString[numString.length - 1])) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };
    CronParser.prototype.pad = function (value) {
        var converted = typeof value === 'number' ? value.toString() : value;
        return converted.length === 1 ?
            "0" + value + ":00" :
            value + ":00";
    };
    CronParser.prototype.padZero = function (value) {
        var converted = typeof value === 'number' ? value.toString() : value;
        return converted.length === 1 ?
            "0" + value :
            "" + value;
    };
    CronParser.prototype.getDayOfMonthString = function (dayOfMonth) {
        switch (dayOfMonth.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every day';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return 'every day';
            case exports.CONSTANTS.TYPE_RANGE:
                return "between the " + (dayOfMonth.range.start + this.getOrdinal(dayOfMonth.range.start)) + " and " + (dayOfMonth.range.end + this.getOrdinal(dayOfMonth.range.end));
            case exports.CONSTANTS.TYPE_MULTI:
                return "during the " + dayOfMonth.multi.values.map(this.getOrdinal).join(', ') + " and " + dayOfMonth.multi.last;
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = dayOfMonth.interval.step === 1;
                return "every " + (isOne ? '' : dayOfMonth.interval.step + ' ') + "day" + (isOne ? '' : 's') + " starting on the " + (dayOfMonth.interval.start + this.getOrdinal(dayOfMonth.interval.start));
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "on the " + (dayOfMonth.single + this.getOrdinal(dayOfMonth.single));
        }
    };
    CronParser.prototype.getYearString = function (years) {
        switch (years.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every year';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return '';
            case exports.CONSTANTS.TYPE_RANGE:
                return "between " + years.range.start + " and " + years.range.end;
            case exports.CONSTANTS.TYPE_MULTI:
                return "during " + years.multi.values.join(', ') + " and " + years.multi.last;
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = years.interval.step === 1;
                return "every " + (isOne ? '' : years.interval.step + ' ') + "year" + (isOne ? '' : 's') + " starting on " + years.interval.start;
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "during " + years.single;
        }
    };
    CronParser.prototype.getMonthString = function (months) {
        switch (months.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every month';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return '';
            case exports.CONSTANTS.TYPE_RANGE:
                return "in the months of " + this.getMonthName(months.range.start) + " through " + this.getMonthName(months.range.end);
            case exports.CONSTANTS.TYPE_MULTI:
                return "in the months of " + months.multi.values.map(this.getMonthName).join(', ') + " and " + this.getMonthName(months.multi.last);
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = months.interval.step === 1;
                return "every " + (isOne ? '' : months.interval.step + ' ') + "month" + (isOne ? '' : 's') + " starting on " + this.getMonthName(months.interval.start);
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "in the month of " + this.getMonthName(months.single);
        }
    };
    CronParser.prototype.getMonthName = function (month) {
        return exports.CONSTANTS.FULL_MONTHS[month];
    };
    CronParser.prototype.getDayOfWeekString = function (days) {
        switch (days.type) {
            case exports.CONSTANTS.TYPE_WILDCARD:
                return 'every day';
            case exports.CONSTANTS.TYPE_UNSPECIFIED:
                return '';
            case exports.CONSTANTS.TYPE_RANGE:
                return "only from " + this.getDayOfWeekName(days.range.start) + " through " + this.getDayOfWeekName(days.range.end);
            case exports.CONSTANTS.TYPE_MULTI:
                return "only on " + days.multi.values.map(this.getDayOfWeekName).join(', ') + " and " + this.getDayOfWeekName(days.multi.last);
            case exports.CONSTANTS.TYPE_INTERVAL:
                var isOne = days.interval.step === 1;
                return "every " + (isOne ? '' : days.interval.step + ' ') + "day" + (isOne ? '' : 's') + " starting on " + this.getDayOfWeekName(days.interval.start);
            case exports.CONSTANTS.TYPE_SINGLE:
            default:
                return "only on " + this.getDayOfWeekName(days.single) + "s";
        }
    };
    CronParser.prototype.getDayOfWeekName = function (day) {
        return exports.CONSTANTS.FULL_DAYS[day - 1];
    };
    return CronParser;
}());
angular
    .module('cronHumanize')
    .service('CronHumanize', CronParser);
//# sourceMappingURL=cron-humanize.js.map