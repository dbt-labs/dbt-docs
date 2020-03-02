'use strict';

const template = require('./index.html');

angular
.module('dbt')
.directive('macroArguments', [function() {
    return {
        scope: {
            macro: '=',
        },
        templateUrl: template,
        link: function(scope) {

            _.each(scope.macro.arguments, function(arg) {
                arg.expanded = false;
            })
        }
    }
}]);

