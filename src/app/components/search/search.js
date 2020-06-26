'use strict';

const template = require('./search.html');

angular
.module('dbt')
.directive('docsSearch', ["$sce", function($sce) {
    return {
        scope: {
            query: '=',
            results: '=',
            onSelect: '&',
        },
        replace: true,
        templateUrl: template,

        link: function(scope) {
            scope.max_results = 20;                                             //# of results on the page at once
            scope.show_all = false;
            scope.max_results_columns = 3;
            scope.limit_columns = {};

            scope.limit_search = function(res, index, results) {
                return (index < scope.max_results || scope.show_all);
            }

            scope.getState = function(node) {
                return 'dbt.' + node.resource_type;
            }

            scope.getModelName = function(model) {
                if (model.resource_type == 'source') {
                    return model.source_name + "." + model.name;
                } else if (model.resource_type == 'macro') {
                    return model.package_name + "." + model.name;
                } else {
                    return model.name;
                }
            }

            scope.highlight = function(text) {
                if (!scope.query || !text) {
                    return $sce.trustAsHtml(text);
                }
                return $sce.trustAsHtml(text.replace(new RegExp(scope.query, 'gi'), '<span class="search-result-match">$&</span>'));
            }

            scope.$watch("query", function(nv, ov) {
                if (nv.length == 0) {
                    scope.show_all = false;
                    scope.limit_columns = {};
                }
            });

            scope.columnFilter = function(columns) {
                var matches = [];
                for (var column in columns) {
                    if (column.toLowerCase().indexOf(scope.query.toLowerCase()) != -1) {
                        matches.push(column);
                    }
                }
                return matches;
            }

            scope.limitColumns = function(id) {
                return scope.limit_columns[id] !== undefined? scope.limit_columns[id] : 3;
            }
        }
    }
}]);
