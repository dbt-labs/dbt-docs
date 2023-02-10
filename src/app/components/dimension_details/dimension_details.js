'use strict';

const template = require('./dimension_details.html');

const _ = require('underscore');

angular
.module('dbt')
.directive('dimensionDetails', ['project', function(projectService) {
    return {
        scope: {
            model: '=',
        },
        templateUrl: template,
        link: function(scope) {

            scope.has_test = function(dim, test_name) {
                var test_types = _.pluck(dim.tests, 'short');
                return test_types.indexOf(test_name) != -1;
            }

            scope.has_more_info = function(dimension) {
                var description = (dimension.description || "");
                var meta = (dimension.meta || {});

                return description.length || !_.isEmpty(meta);
            }

            scope.toggle_dimension_expanded = function(dimension) {
                if (scope.has_more_info(dimension)) {
                    dimension.expanded = !dimension.expanded
                }
            }

            scope.getState = function(node) {
                return 'dbt.' + node.resource_type;
            }

            scope.dim_name = function(dim_name) {
                return projectService.caseDimension(dim_name);
            }

            scope.get_dimensions = function(model) {
                var dimensions = _.chain(model.dimensions)
                        .values()
                        .sortBy('index')
                        .value();

                // re-number dimensions because index comes from the catalog, and index may not always be present
                // this prevents errors with the view's `track by dimension.index`
                _.each(dimensions, function(dim, i) {
                    dim.index = i;
                });

                return dimensions;
            }
        }
    }
}]);

