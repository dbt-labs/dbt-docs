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

            scope.highlight = function(result, key, shorten) {
            	const matches = result.matches.filter(m => m.key == key);
            	
            	if (!matches[0]){
            		//Non-nested values (name, description, sql) are shown regardless of whether they were a search match. 
            		//Getting them directly from the model avoids blanks where something else matched but not the name. 
            		//Tags are arrays and don't need to be shown, so we're skipping them
            		var resp = "";
            		if (typeof(result.model[key]) == "string") {
            			resp = result.model[key];
            		}
					return $sce.trustAsHtml(resp);
            	}
            	
				var finalText = "";
				
				for (var matchNum = 0; matchNum < matches.length; matchNum++){
					const isLast = matchNum == matches.length - 1;
					const match = matches[matchNum];
					
            		var text = match.value;
            	
					const start = '<span class="search-result-match">';
					const end = '</span>';
					if (match && match.indices) {
						//Ensure an array of arrays (when there's only one match, it comes as [0, 10] instead of [[0, 10]])
						var indicesToInclude = Array.isArray(match.indices[0]) ? match.indices : [match.indices];

						//Ensure the indices run from start to end of string 
						indicesToInclude = indicesToInclude.sort(function(a, b) {return a[0] - b[0]});
					
						if (shorten) {
							//Get only the longest match (the biggest difference between start and end character) as a proxy for most relevant. 
							//The fuzzy matching is very aggressive - this helps tone down the confusion from half the text being inexplicably highlighted 
							indicesToInclude = [ indicesToInclude.sort(function(a, b) {return (b[1] - b[0]) - (a[1] - a[0]) }) [0] ]
						}
					
						const numContextChars = 50;
						//Work from end of string backwards, to avoid offsetting charindex of parts of the string we still need to touch
						for (var i = indicesToInclude.length - 1; i >= 0; i--){
							var bounds = indicesToInclude[i];

							//With extendedSearch enabled, sometimes the end of one array 
							//is the start of its neighbour, e.g. [[7, 21], [21, 28], [32, 39]]
							//This causes all sorts of off-by-one drama, 
							//so we're combining them: [[7, 28], [32, 39]] 
							if (indicesToInclude[i - 1] && indicesToInclude[i - 1][1] == bounds[0]) {
								bounds = [ indicesToInclude[i - 1][0], bounds[1] ];
								
								//Decrement i early to avoid double-handling
								i--
							}
						
							const startIndex = shorten ? Math.max(bounds[0] - numContextChars, 0) : 0;

							const prefix = (startIndex == 0 ? "" : "...") + text.slice(startIndex, bounds[0]);
							const mainContent = text.slice(bounds[0], bounds[1] + 1);
							var suffix = text.slice(bounds[1] + 1);
						 	
							text = `${prefix}${start}${mainContent}${end}${suffix}`;
						}
						
						finalText += text + (isLast ? "" : ", ");
					}
				}
				
                return $sce.trustAsHtml(finalText)
            }

            scope.$watch("query", function(nv, ov) {
                if (nv.length == 0) {
                    scope.show_all = false;
                }
            });
            
            scope.anyRecords = function(result, key){
            	return _.some(result.matches.filter(m => m.key == key));
            }
        }
    }
}]);
