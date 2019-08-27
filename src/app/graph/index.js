'use strict';

const angular = require('angular');

angular
.module('dbt')
.controller('GraphCtrl', [
    '$scope', '$state', '$window', 'graph', 'project', 'selectorService',
    function($scope, $state, $window, graph, projectService, selectorService) {

        $scope.graph = graph.graph;
        $scope.graphService = graph;
        $scope.styles = graph.graph.style;

        $scope.graphRendered = function(graph_element) {
            graph.setGraphReady(graph_element);
        }

        $scope.$watch(function() {
            return $state.params.unique_id;
        }, function(nv, ov) {
            if (nv && nv != ov) {
                projectService.find_by_id(nv, function(node) {
                    if (graph.orientation == 'sidebar') {
                        graph.showVerticalGraph(node.name, false);
                    } else {
                        graph.showFullGraph(node.name);
                    }
                });
            }

            if (!nv) {
                selectorService.clearViewNode();
            }
        });


}]);
