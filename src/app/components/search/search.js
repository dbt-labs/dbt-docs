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
                           if(
                           		   (show_names && match.key === "searchableName") 
                           		|| (show_descriptions && (match.key === "description" || match.key == "columns.description")) 
                           		|| (show_columns && match.key === "columns.name") 
                           		|| (show_code && match.key === "raw_sql") 
                           		|| (show_tags && (match.key === "tags" || match.key == "columns.tags"))
                           ) {
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
                if(text != null && text.length > 0){  
                    let modified = text.replace(/\s+/g, ' '); 
                    let indexOfInstance = modified.search(scope.query);
                    let startIndex = (indexOfInstance - 75) < 0? 0: indexOfInstance - 75;
                    let endIndex = (indexOfInstance + 75) > modified.length? modified.length: indexOfInstance + 75;
                    let shortened = "..." + modified.substring(startIndex, endIndex) + "...";
                    return shortened;
                 }
                return text;
            }

            scope.highlight = function(text) {
                if (!scope.query || !text) {
                    return $sce.trustAsHtml(text);
                }
                return $sce.trustAsHtml(text.replace(new RegExp(scope.query, 'gi'), '<span class="search-result-match">$&</span>'));
            }

            scope.highlight2 = function(result, key) {
            	const match = result.matches.find(m => m.key == key)

            	var modelName = result.model[key];
            	const start = '<span class="search-result-match">'
            	const end = '</span>'
            	//Work from end of string back to avoid offsetting charindex of ones we still need to touch
            	if (match && match.indices) {
					for (var i = match.indices.length - 1; i >= 0; i--){
						const bounds = match.indices[i];
						modelName = `${modelName.slice(0, bounds[0])}${start}${modelName.slice(bounds[0], bounds[1] + 1)}${end}${modelName.slice(bounds[1]+1)}`;
					}
				}
                return $sce.trustAsHtml(modelName)//text.replace(new RegExp(scope.query, 'gi'), '<span class="search-result-match">$&</span>'));
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
