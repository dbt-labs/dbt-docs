'use strict';

const angular = require('angular');
const template = require('./search.html');
const $ = require('jquery');

require('./../../services/project_service.js');

angular
.module('dbt')
.directive('docsSearch', ["$sce", 'project', function($sce, projectService) {
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

            scope.checkboxStatus = {
                show_names : false,
                show_descriptions: false,
                show_columns: false,
                show_code: false,
                show_tags: false
            };

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
                } else if (model.resource_type == 'metric') {
                    return model.label;
                } else {
                    return model.name;
                }
            }

            function filterResults(results, checkboxStatus){
                if(!_.some(_.values(checkboxStatus))){
                    return results;
                }
                
                let finalResults = [];
                let fileIDs = [];
                
                const {show_names, show_descriptions, show_columns, show_code, show_tags} = checkboxStatus;
                _.each(results, function(result){
                    _.each(result.matches, function(match){
                       if(!fileIDs.includes(result.model['unique_id'])){
                           const nameMatch = show_names && (match.key === "name" || match.key == 'label');
                           const descriptionMatch = show_descriptions && match.key == "description";
                           const columnsMatch = show_columns && match.key === "columns";
                           const codeMatch = show_code && match.key === "raw_code";
                           const tagsMatch = show_tags && match.key === "tags";

                           if(nameMatch || descriptionMatch || columnsMatch || codeMatch || tagsMatch) {
                            fileIDs.push(result.model['unique_id']);
                            finalResults.push(result);
                           }
                       }
                    });
               });
               return finalResults;
            }

            var watchExpressions = ['query', 'checkboxStatus.show_names', 'checkboxStatus.show_descriptions', 'checkboxStatus.show_columns', 'checkboxStatus.show_code', 'checkboxStatus.show_tags'];
            scope.$watchGroup(watchExpressions, function() {
                scope.results = filterResults(projectService.search(scope.query), scope.checkboxStatus);
            });

            scope.shorten = function(text) {
                if(text != null && text.trim().length > 0 && scope.query != null && scope.query.trim().length > 0){  
                    let modified = text.replace(/\s+/g, ' '); 
                    //choose the first word in the search as the anchor for shortening. 
                    //Escaping in case the first token is "*" or another reserved regex character
                    let first_token = escapeRegExp(getQueryTokens(scope.query)[0]); 
                    let indexOfInstance = modified.search(new RegExp(first_token));
                    let startIndex = (indexOfInstance - 75) < 0 ? 0 : indexOfInstance - 75;
                    let endIndex = (indexOfInstance + 75) > modified.length ? modified.length : indexOfInstance + 75;
                    let shortened = "..." + modified.substring(startIndex, endIndex) + "...";
                    return shortened;
                 }
                return text;
            }

            scope.highlight = function(text) {
                if (!scope.query || !text) {
                    return $sce.trustAsHtml(text);
                }
                //wrap each word in a capturing group with a pipe between them, to allow any of the matches to highlight
                //e.g. "hello WORLD" changes to "(hello)|(world)"
                let query_segments = getQueryTokens(scope.query);
                let escaped_segments = query_segments.map(segment => escapeRegExp(segment));
                let highlight_words = "(" + escaped_segments.join(")|(") + ")"; 
                return $sce.trustAsHtml(text.replace(new RegExp(highlight_words, 'gi'), '<span class="search-result-match">$&</span>'));
            }

            scope.$watch("query", function(nv, ov) {
                if (nv.length == 0) {
                    scope.show_all = false;
                    scope.limit_columns = {};
                }
            });

            scope.columnFilter = function(columns) {
                var matches = [];
                let query_segments = getQueryTokens(scope.query);

                for (var column in columns) {
                    if (query_segments.every(segment => column.toLowerCase().indexOf(segment) != -1)) {
                        matches.push(column);
                    }
                }
                return matches;
            }

            scope.limitColumns = function(id) {
                return scope.limit_columns[id] !== undefined ? scope.limit_columns[id] : 3;
            }

            //from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            function escapeRegExp(string) {
                return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            }

            function getQueryTokens(query){
                return _.words(query.toLowerCase());
            }
        }
    }
}]);
