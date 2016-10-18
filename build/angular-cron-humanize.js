"use strict";
var cronstrue = require('cronstrue');
var CronService = (function () {
    function CronService() {
    }
    CronService.prototype.toString = function (expression) {
        return cronstrue.toString(expression);
    };
    return CronService;
}());
angular
    .module('ngCronstrue', [])
    .service('ngCronstrue', CronService);
//# sourceMappingURL=angular-cron-humanize.js.map