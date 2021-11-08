'use strict';

const template = require('./index.html');

angular
.module('dbt')
.directive('referenceList', ["$state", function($state) {
    return {
        scope: {
            references: '=',
            node: '=',
        },
        restrict: 'E',
        templateUrl: template,
        link: function(scope) {
            scope.selected_type = null;

            scope.setType = function(type) {
                scope.selected_type = type;
                scope.nodes = scope.references[scope.selected_type];
            }

            scope.getNodeUrl = function(node) {
                var state = 'dbt.' + node.resource_type;
                return $state.href(state, {
                    unique_id: node.unique_id,
                    '#': null
                })
            }

            scope.mapResourceType = function(type) {
                if (type == 'model') {
                    return 'Models';
                } else if (type == 'seed') {
                    return 'Seeds';
                } else if (type == 'test') {
                    return 'Tests';
                } else if (type == 'snapshot') {
                    return 'Snapshots'
                } else if (type == 'analysis') {
                    return 'Analyses';
                } else if (type == 'macro') {
                      return 'Macros';
                } else if (type == 'exposure') {
                      return 'Exposures';
                } else if (type == 'metric') {
                      return 'Metrics';
                } else {
                    return 'Nodes';
                }
            }

            scope.$watch('references', function(nv) {
                if (nv && _.size(nv) > 0) {
                    scope.selected_type = _.keys(nv)[0];
                    scope.has_references = true;
                    scope.nodes = scope.references[scope.selected_type];
                } else {
                    scope.has_references = false;
                }
            })
        }
    }
}]);
