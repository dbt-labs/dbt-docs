'use strict';

const angular = require('angular');

angular
.module('dbt')
.controller('SourceListCtrl', ['$scope', '$state', 'project',
    function($scope, $state, projectService) {
        $scope.source = $state.params.source;
        $scope.model = {}
        $scope.extra_table_fields = [];

        $scope.has_more_info = function(source) {
            var description = (source.description || "");
            return description.length;
        }

        $scope.toggle_source_expanded = function(source) {
            if ($scope.has_more_info(source)) {
                source.expanded = !source.expanded
            }
        }

        projectService.ready(function(project) {
            var sources = _.filter(project.nodes, function(node) {
                return node.source_name == $scope.source;
            });

            if (sources.length == 0) {
                return;
            }
            
            // sort sources by sources.name
            sources.sort((a,b) => a.name.localeCompare(b.name));

            var source = sources[0];

            $scope.model = {
                name: $scope.source,
                source_description: source.source_description,
                sources: sources
            }

            var owners = _.uniq(_.map(sources, 'metadata.owner'));
            var databases = _.uniq(_.map(sources, 'database'));
            var schemas = _.uniq(_.map(sources, 'schema'));

            $scope.extra_table_fields = [
                {
                    name: "Loader",
                    value: source.loader,
                },
                {
                    name: owners.length == 1 ? "Owner" : "Owners",
                    value: owners.join(", ")
                },
                {
                    name: databases.length == 1 ? "Database" : "Databases",
                    value: databases.join(", ")
                },
                {
                    name: schemas.length == 1 ? "Schema" : "Schemas",
                    value: schemas.join(", ")
                },
                {
                    name: "Tables",
                    value: sources.length
                },
            ];
        });
}]);
