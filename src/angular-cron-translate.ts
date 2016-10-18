/// <reference path="../typings/index.d.ts" />

import cronstrue = require('cronstrue');

class CronService {
    public toString(expression: string) {
        return cronstrue.toString(expression);
    }
}

angular
    .module('ngCronstrue', [])
    .service('ngCronstrue', CronService);