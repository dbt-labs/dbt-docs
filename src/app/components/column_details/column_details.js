'use strict';

const template = require('./column_details.html');

const _ = require('underscore');

angular
.module('dbt')
.directive('columnDetails', ['project', function(projectService) {
    return {
        scope: {
            model: '=',
        },
        templateUrl: template,
        link: function(scope) {

            scope.has_test = function(col, test_name) {
                var test_types = _.pluck(col.tests, 'short');
                return test_types.indexOf(test_name) != -1;
            }

            scope.has_more_info = function(column) {
                var tests = (column.tests || []);
                var description = (column.description || "");
                var meta = (column.meta || {});

                return tests.length || description.length || !_.isEmpty(meta);
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

