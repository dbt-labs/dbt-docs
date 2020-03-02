'use strict';

const template = require('./code_block.html');

angular
.module('dbt')
.directive('codeBlock', ['code', function(codeService) {
    return {
        scope: {
            versions: '=',
            default: '<',
        },
        restrict: 'E',
        templateUrl: template,
        link: function(scope) {
            scope.selected_version = scope.default;
            scope.raw_source = null;
            scope.source = null;

            function updateTo(name) {
                scope.raw_source = scope.versions[name];
                scope.source = codeService.highlightSql(scope.raw_source);
            }

            scope.setSelected = function(name) {
                scope.selected_version = name;
                updateTo(name);
            }

            scope.titleCase = function(name) {
                return name.charAt(0).toUpperCase() + name.substring(1);
            }

            scope.copied = false;
            scope.copy_to_clipboard = function() {
                codeService.copy_to_clipboard(scope.raw_source)
                scope.copied = true;
                setTimeout(function() {
                    scope.$apply(function() {
                       scope.copied = false;
                    })
                }, 1000);
            }

            scope.$watch('versions', function(nv, ov) {
                if (nv) {
                    scope.setSelected(scope.default);
                }
            })
        }
    }
}]);
