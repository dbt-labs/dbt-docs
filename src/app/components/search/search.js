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
            scope.max_results = 20;
            scope.show_all = false;

            scope.limit_search = function(res, index, results) {
                return (index < scope.max_results || scope.show_all);
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
                }
            });
        }
    }
}]);
