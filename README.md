[![Travis](https://img.shields.io/travis/StrongeLeeroy/cron-humanize.svg?style=flat-square)](https://travis-ci.org/StrongeLeeroy/cron-humanize)
[![SemVer](http://img.shields.io/:semver-1.0.4-brightgreen.svg?style=flat-square)](http://semver.org)

## angular-cron-humanize

Angular service that transforms cron expressions into human speech.

**NOTE**
Currently under development. Not feature complete.

### Installation:

Download the bower package:

    bower install --save angular-cron-humanize

Add the module as a dependency of your application. E.g.:

    angular.module('myApp', ['cronHumanizer']);
    
To use the service, inject the **CronHumanizer** service anywhere that you'd like. Example written in TypeScript:

    class MyController {
        public parsedExpression: string;
        
        static $inject = ['CronHumanizer];
        constructor(private cronHumanizer) {}
        
        public test() {
            this.parsedExpression = this.cronHumanizer.humanize('0 0 0 ? 2-3 1,2 *');
            // Fire at 00:00, every day, in the months of March through April, only on Monday and Tuesday.
        }
    }