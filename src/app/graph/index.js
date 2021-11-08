'use strict';

const angular = require('angular');

angular
.module('dbt')
.controller('GraphCtrl', [
    '$scope', '$state', '$window', 'graph', 'project', 'selectorService',
    function($scope, $state, $window, graph, projectService, selectorService) {

        $scope.graph = graph.graph;
        $scope.graphService = graph;

        $scope.graphRendered = function(graph_element) {
            graph.setGraphReady(graph_element);
        }


        function getNodeSelector(node) {
            if (node && node.resource_type == 'source') {
                return 'source:' + node.source_name + "." + node.name;
            } else if (node && node.resource_type == 'exposure') {
                return 'exposure:' + node.name;
            } else if (node && node.resource_type == 'metric') {
                return 'metric:' + node.name;
            } else if (node.name)  {
                return node.name;
            } else {
                debugger
                return '*'
            }
        }

        $scope.$watch(function() {
            return $state.params.unique_id;
        }, function(nv, ov) {
            if (nv && nv != ov) {
                projectService.find_by_id(nv, function(node) {
                    if (!node) {
                        // pass - it's a macro or some other non-project resource
                    } else if (graph.orientation == 'sidebar') {
                        graph.showVerticalGraph(getNodeSelector(node), false);
                    } else {
                        graph.showFullGraph(getNodeSelector(node));
                    }
                });
            }

            if (!nv) {
                selectorService.clearViewNode();
            }
        });


}]);
