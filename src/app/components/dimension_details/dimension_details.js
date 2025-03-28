'use strict';

const template = require('./dimension_details.html');

const _ = require('underscore');

angular
    .module('dbt')
    .directive('dimensionDetails', ['project', function (projectService) {
        return {
            scope: {
                model: '=',
            },
            templateUrl: template,
            link: function (scope) {

                console.log(scope);

                scope.getState = function (node) {
                    return 'dbt.' + node.resource_type;
                }

                scope.get_dim_name = function (dim_name) {
                    return projectService.caseColumn(dim_name);
                }


                var dimensions = _.chain(scope.model.dimensions)
                    .values()
                    .sortBy('name')
                    .value();

                // re-number dimensions because index comes from the catalog, and index may not always be present
                // this prevents errors with the view's `track by dimension.index`
                _.each(dimensions, function (col, i) {
                    col.index = i;
                });

                scope.dimensions = dimensions;

            }
        }
    }]);

