'use strict';

const template = require('./config_details.html');
require("./config_details.css");

const _ = require('underscore');
const { toEntries } = require('./config_utils');

angular
.module('dbt')
.directive('configDetails', [function() {
    return {
        scope: {
            config: '=',
        },
        templateUrl: template,
        link: function(scope) {

            scope.entries = [];

            scope.$watch("config", function(nv) {
                if (nv && _.isObject(nv)) {
                    scope.entries = toEntries(nv);
                } else {
                    scope.entries = [];
                }
            });
        }
    }
}]);
