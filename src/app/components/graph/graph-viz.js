'use strict';

const styles = require("./graph-viz.css");
const template = require('./graph-viz.html');

const _ = require('underscore');
const $ = require('jquery');
const cytoscape = require('cytoscape');

const cytoscape_ctx_menu = require('cytoscape-context-menus');
cytoscape_ctx_menu(cytoscape, $);

const dagre = require('cytoscape-dagre');
cytoscape.use(dagre);


angular
.module('dbt')
.directive('graphViz', ['$q', '$state', 'graph', 'selectorService', 'project', '$timeout',
           function($q, $state, graph, selectorService, project, $timeout) {
    var directive = {
        restrict: 'EA',
        replace: true,
        scope: {
            vizElements: '=',
            vizLayout: '=',
            vizOptions: '=',
            vizStyle: '=',
            vizReady: '=',
            vizExtensions: '=',
            vizHideOptions: '=',
            vizSize: '=',
            vizRendered: '=',
        },
        link: linkFn,
        templateUrl: template
    };

    return directive;

    function __rerender(scope, cy) {
        if (scope.vizLayout && scope.vizLayout.name) {
            var layout = cy.layout(scope.vizLayout);
            var res = layout.run();
            scope.vizRendered(cy);
        }
    }

    function linkFn(scope,element,attrs,ctrlFn){

        //var rerender = _.debounce(__rerender, 0);
        var rerender = __rerender;

        scope.$watch('vizSize', function(nv,ov){
            $timeout(function() {
                cy.resize();
                if (nv == 'fullscreen') {
                    cy.fit(100);
                } else {
                    cy.fit(25);
                }
            });
        });

        $(".viz-option").on('changed.bs.select', function (e) {
            var option = $(e.target).data("option");
            var selected = $(e.target).val()
        })

        // initialize cytoscape
        var cy = cytoscape(_.assign({}, scope.vizOptions, {
            container: document.getElementById('cy'),
            style: scope.vizStyle || [],
            elements: scope.vizElements || [],
            layout: scope.vizLayout || {name: "circle"}
        }));

        if (!window.graph) {
            window.graph = cy;
        }

        if(scope.graphReady){
          $(window).on("load", function() {
              cy.ready(scope.graphReady);
          })
        }

        cy.on('select', function(e) {
            var node = e.target;

            scope.$apply(function() {
                graph.selectNode(node.id());
                cy.forceRender()
            });
        });

        cy.on('unselect', function(e) {
            var node = e.target;

            scope.$apply(function() {
                graph.deselectNodes();
                cy.forceRender()
            });
        });

        scope.$watch('vizElements', function(nv,ov){
            cy.remove(cy.elements());
            cy.add(nv);
            rerender(scope, cy);
            console.log('elements changed, UPDATE');
        });

        scope.$watch('vizLayout', function(nv,ov){
            if(nv !== ov){
                rerender(scope, cy);
            }
        }, true);

        scope.$watch('vizOptions', function(nv,ov){
            if(nv !== ov){
                _.each(nv, function(val, key) {
                    if (!cy[key]) {
                        debugger
                    }
                    cy[key](val);
                })
            }
        }, true);

        scope.$watch('vizStyle', function(nv,ov){
            if(nv !== ov) {
                console.log("Setting styles");
                cy.setStyle(nv);
            }
        }, true);

        scope.$on('$destroy', function(){
            cy.destroy();
        });

        // initialize ctx menu plugin
        var contextMenu = cy.contextMenus({
            menuItems: [
                {
                    id: 'jump',
                    content: 'Refocus on Node',
                    selector: 'node',
                    tooltipText: 'Focus on the lineage for this node',
                    onClickFunction: function(event) {
                        var target = event.target || event.cyTarget
                        var unique_id = target.id();
                        $state.go('dbt.' + target.data('resource_type'), {unique_id: unique_id});
                    },
                    show: true,
                },
                {
                    id: 'docs',
                    content: 'View documentation',
                    selector: 'node',
                    tooltipText: 'Jump to the documentation for this node',
                    onClickFunction: function(event) {
                        var target = event.target || event.cyTarget
                        var unique_id = target.id();
                        $state.go('dbt.' + target.data('resource_type'), {unique_id: unique_id});
                        graph.hideGraph();
                    },
                    show: true,
                },
                {
                    id: 'hide-before-here',
                    content: 'Hide this and parents',
                    selector: 'node',
                    onClickFunction: function(event) {
                        var target = event.target || event.cyTarget
                        var unique_id = target.id();

                        var node = project.node(unique_id);
                        if (node) {
                            var spec = selectorService.excludeNode(node, {parents: true});
                            graph.updateGraph(spec)
                        }
                    },
                    show: true,
                },
                {
                    id: 'hide-after-here',
                    content: 'Hide this and children',
                    selector: 'node',
                    onClickFunction: function(event) {
                        var target = event.target || event.cyTarget
                        var unique_id = target.id();

                        var node = project.node(unique_id);
                        if (node) {
                            var spec = selectorService.excludeNode(node, {children: true});
                            graph.updateGraph(spec)
                        }
                    },
                    show: true,
                },
                {
                    id: 'export-png',
                    content: 'Export PNG',
                    selector: 'node',
                    coreAsWell: true,
                    onClickFunction: function(event) {
                        var options = {
                            bg: '#005e7a'
                        };
                        var png64 = cy.png(options);
                        var link = document.createElement('a');
                        link.download = 'dbt-dag.png';  // sets the filename for the download
                        link.href = png64;
                        link.click();
                    },
                    show: true,
                },
            ],
            menuItemClasses: ['graph-node-context-menu-item'],
            contextMenuClasses: ['graph-node-context-menu']
        });

    }

}]);
