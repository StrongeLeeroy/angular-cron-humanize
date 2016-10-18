/// <reference path="../typings/index.d.ts" />

import cronstrue = require('cronstrue');

interface Options {
    throwExceptionOnParseError?: boolean;
    verbose?: boolean;
    dayOfWeekStartIndexZero?: boolean;
    use24HourTimeFormat?: boolean;
    locale?: string;
}

class CronService {
    public toString(expression: string, options?: Options) {
        return cronstrue.toString(expression, options);
    }
}

angular
    .module('ngCronstrue', [])
    .service('ngCronstrue', CronService);