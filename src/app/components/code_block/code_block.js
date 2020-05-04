'use strict';

const template = require('./code_block.html');
const $ = require('jquery');

const css = require("./code_block.css")

angular
.module('dbt')
.directive('codeBlock', ['code', '$timeout', function(codeService, $timeout) {
    return {
        scope: {
            versions: '=',
            default: '<',
        },
        restrict: 'E',
        templateUrl: template,
        link: function(scope, element) {
            scope.selected_version = scope.default;
            scope.source = null;

            scope.setSelected = function(name) {
                scope.selected_version = name;
                scope.source = scope.versions[name] || '';

                const sql = scope.source.trim();
                scope.highlighted = codeService.highlight(sql);

                $timeout(function() {
                    Prism.highlightAll();
                })
            }

            scope.titleCase = function(name) {
                return name.charAt(0).toUpperCase() + name.substring(1);
            }

            scope.copied = false;
            scope.copy_to_clipboard = function() {
                codeService.copy_to_clipboard(scope.source)
                scope.copied = true;
                setTimeout(function() {
                    scope.$apply(function() {
                       scope.copied = false;
                    })
                }, 1000);
            }

            scope.$watch('versions', function(nv, ov) {
                if (nv) {
                    if (scope.default) {
                        scope.setSelected(scope.default);
                    } else {
                        var opts = Object.keys(scope.versions);
                        if (opts.length > 0) {
                            scope.setSelected(opts[0]);
                        }
                    }
                }
            }, true)
        }
    }
}]);
