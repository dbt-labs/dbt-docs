'use strict';

const template = require('./column_details.html');

const _ = require('underscore');

angular
.module('dbt')
.directive('columnDetails', ['project', '$location', function(projectService, $location) {
    return {
        scope: {
            model: '=',
        },
        templateUrl: template,
        link: function(scope) {

            scope.column_anchor = function(column, $event) {
                $event.stopPropagation();
                $location.hash('column-' + column.name);
                if (scope.has_more_info(column)) {
                    column.expanded = true;
                }
            }

            scope.$watch('model.columns', function(columns) {
                if (!columns || _.isEmpty(columns)) return;
                var hash = $location.hash();
                if (!hash || hash.indexOf('column-') !== 0) return;
                var col_name = hash.substring('column-'.length);
                var target = _.find(columns, function(col) {
                    return col.name === col_name || col.name.toLowerCase() === col_name.toLowerCase();
                });
                if (target && scope.has_more_info(target)) {
                    target.expanded = true;
                }
                // Adjust scroll after model controller's $anchorScroll() completes
                // Use native setTimeout to avoid triggering an Angular digest cycle
                setTimeout(function() {
                    var el = document.getElementById(hash);
                    if (!el) return;
                    var appScroll = el.closest('.app-scroll');
                    var stickyHeader = appScroll && appScroll.querySelector('.app-sticky');
                    if (appScroll && stickyHeader) {
                        appScroll.scrollTop -= stickyHeader.offsetHeight;
                    }
                }, 200);
            });

            scope.has_test = function(col, test_name) {
                var test_types = _.pluck(col.tests, 'short');
                return test_types.indexOf(test_name) != -1;
            }

            scope.has_constraint = function(col, constraint_name) {
                if (!col.hasOwnProperty('constraints')) {
                    return false;
                }

                return col.constraints.some(constraint => constraint.type === constraint_name);
            }

            scope.has_more_info = function(column) {
                var tests = (column.tests || []);
                var description = (column.description || "");
                var meta = (column.meta || {});
                var constraints = (column.constraints || []);

                return tests.length || description.length || constraints.length || !_.isEmpty(meta);
            }

            scope.toggle_column_expanded = function(column) {
                if (scope.has_more_info(column)) {
                    column.expanded = !column.expanded
                }
            }

            scope.getState = function(node) {
                return 'dbt.' + node.resource_type;
            }

            scope.get_col_name = function(col_name) {
                return projectService.caseColumn(col_name);
            }

            scope.get_columns = function(model) {
                var columns = _.chain(model.columns)
                        .values()
                        .sortBy('index')
                        .value();

                // re-number columns because index comes from the catalog, and index may not always be present
                // this prevents errors with the view's `track by column.index`
                _.each(columns, function(col, i) {
                    col.index = i;
                });

                return columns;
            }
        }
    }
}]);
