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

        projectService.ready(function(project) {
            var styles = $scope.styles;

            _.each(projectService.project.nodes, function(node, node_id) {
                if (node.docs) {
                    var style = {
                        selector: 'node[id="' + node_id + '"]',
                        style: {
                            'background-color': node.docs.color
                        }
                    }
                    styles.push(style);
                }
            });

            graph.graph_element.setStyle(styles);
        });

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
