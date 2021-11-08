
const $ = require('jquery');
const _ = require('underscore');

const graphlib = require('graphlib');
const selectorGraph = require('./selector_graph');

angular
.module('dbt')
.factory('graph', [
    '$state', '$window', '$q', 'selectorService', 'project', 'locationService',
    function($state, $window, $q, selectorService, projectService, locationService) {

    var graph_options = {
        vertical: {
            userPanningEnabled: false,
            boxSelectionEnabled: false,
            maxZoom: 1.5,
        },
        horizontal: {
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            maxZoom: 1,
            minZoom: 0.05,
        }
    }

    var layouts = {
        none: {
            name: 'null',
        },
        left_right: {
            name: 'dagre',
            rankDir: 'LR',
            rankSep: 200,
            edgeSep: 30,
            nodeSep: 50,
        },
        top_down: {
            name: 'preset',
            positions: function(node) {
                var primary_node_id = $state.params.unique_id;
                if (!primary_node_id) {
                    return {x: 0, y: 0};
                }

                var dag = service.graph.pristine.dag;
                var parents = _.sortBy(selectorGraph.ancestorNodes(dag, primary_node_id, 1));
                var children = _.sortBy(selectorGraph.descendentNodes(dag, primary_node_id, 1));

                var is_parent = _.partial(_.includes, parents);
                var is_child = _.partial(_.includes, children);

                var parent_subgraph = dag.filterNodes(is_parent)
                var child_subgraph  = dag.filterNodes(is_child)

                var parent_nodes = graphlib.alg.topsort(parent_subgraph);
                var child_nodes = graphlib.alg.topsort(child_subgraph).reverse();

                return getNodeVertPosition(primary_node_id, parent_nodes, child_nodes, node.data('id'))
            }
        },
    }

    var service = {
        loading: true,
        loaded: $q.defer(),

        graph_element: null,
        orientation: 'sidebar',
        expanded: false,
        graph: {
            options: graph_options.vertical,
            pristine: {
                nodes: {},
                edges: {},
                dag: null
            },
            elements: [],
            layout: layouts.none,
            style: [
                {
                    selector: 'edge.vertical',
                    style: {
                        'curve-style': 'unbundled-bezier',

                        'target-arrow-shape': 'triangle-backcurve',
                        'target-arrow-color': '#027599',
                        'arrow-scale': 1.5,

                        'line-color': '#027599',
                        'width': 3,

                        'target-distance-from-node': '5px',

                        'source-endpoint': '0% 50%',
                        'target-endpoint': '0deg',
                    }
                },
                {
                    selector: 'edge.horizontal',
                    style: {
                        'curve-style': 'unbundled-bezier',

                        'target-arrow-shape': 'triangle-backcurve',
                        'target-arrow-color': '#006f8a',
                        'arrow-scale': 1.5,

                        'target-distance-from-node': '10px',
                        'source-distance-from-node': '5px',

                        'line-color': '#006f8a',
                        'width': 3,

                        'source-endpoint': '50% 0%',
                        'target-endpoint': '270deg'
                    }
                },
                {
                    selector: 'edge[selected=1]',
                    style: {
                        'line-color': '#bd6bb6',
                        'target-arrow-color': '#bd6bb6',

                        'z-index': 1, // draw on top of non-selected nodes
                    }
                },
                {
                    selector: 'node[display="none"]',
                    style: {
                        display: 'none'
                    }
                },
                {
                    selector: 'node.vertical',
                    style: {
                        'text-margin-x': '5px',
                        'background-color': '#0094b3',
                        'font-size': '16px',
                        'shape': 'ellipse',
                        'color': '#fff',
                        'width': '5px',
                        'height': '5px',
                        'padding': '5px',
                        'content': 'data(label)',
                        'font-weight': 300,
                        'text-valign': 'center',
                        'text-halign': 'right',
                    }
                },
                {
                    selector: 'node.horizontal',
                    style: {
                        'background-color': '#0094b3',
                        'font-size': '24px',
                        'shape': 'roundrectangle',
                        'color': '#fff',
                        'width': 'label',
                        'height': 'label',
                        'padding': '12px',
                        'content': 'data(label)',
                        'font-weight': 300,
                        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'ghost': 'yes',
                        'ghost-offset-x': '2px',
                        'ghost-offset-y': '4px',
                        'ghost-opacity': 0.5,

                        'text-outline-color': '#000',
                        'text-outline-width': '1px',
                        'text-outline-opacity': 0.2
                    }
                },
                {
                    selector: 'node[resource_type="source"]',
                    style: {
                        'background-color': '#5fb825',
                    }
                },
                {
                    selector: 'node[resource_type="exposure"]',
                    style: {
                        'background-color': '#ff694b',
                    }
                },
                {
                    selector: 'node[resource_type="metric"]',
                    style: {
                        'background-color': '#ff5688',
                    }
                },
                {
                    selector: 'node[selected=1]',
                    style: {
                        'background-color': '#bd6bb6',
                    }
                },
                {
                    selector: 'node.horizontal[selected=1]',
                    style: {
                        'background-color': '#88447d'
                    }
                },
                {
                    selector: 'node.horizontal.dirty',
                    style: {
                        'background-color': '#919599',
                    }
                },
                {
                    selector: 'node[hidden=1]',
                    style: {
                        'background-color': '#919599',
                        'background-opacity': 0.5,
                    }
                },
            ],
            ready: function(e) {
                console.log("graph ready");
            },
        }
    }

    service.setGraphReady = function(graph_element) {
        service.loading = false;
        service.loaded.resolve();

        service.graph_element = graph_element;
    }

    service.ready = function(cb) {
        service.loaded.promise.then(function() {
            cb(service);
        });
    }

    function getNodeVertPosition(primary_node, parents, children, this_node) {
        console.log("Getting position for ", this_node, ". Primary: ", primary_node);

        var num_nodes = 1 + Math.max(parents.length, children.length);
        var scale_x = 100 / num_nodes;
        var scale_y = 100;

        var config;
        if (primary_node == this_node) {
            return {x: 0, y: 0}
        } else if (_.includes(parents, this_node)) {
            config = {set: parents, index: _.indexOf(parents, this_node), factor: -1, type:'parent'}
        } else if (_.includes(children, this_node)) {
            config = {set: children, index: _.indexOf(children, this_node), factor: 1, type: 'child'}
        } else {
            return {x: 0, y: 0}
            console.log('oops');
            debugger
        }

        var size = config.set.length;
        if (config.type == 'parent') {
            var res = {
                x: (0 + config.index) * scale_x,
                y: -(2 * scale_y) - (size - config.index - 1) * scale_y
            }
        } else {
            var res = {
                x: (0 + config.index) * scale_x,
                y: (2 * scale_y) + (size - config.index - 1) * scale_y
            }
        }

        return res
    }

    function setNodes(node_ids, highlight, classes) {
        var nodes = _.map(node_ids, function(id) { return service.graph.pristine.nodes[id] });
        var edges = [];
        _.flatten(_.each(node_ids, function(id) {
            var node_edges = service.graph.pristine.edges[id]
            _.each(node_edges, function(edge) {
                if (_.includes(node_ids, edge.data.target) && _.includes(node_ids, edge.data.source)) {
                    edges.push(edge);
                }
            });
        }));

        var elements = _.compact(nodes).concat(_.compact(edges));

        _.each(service.graph.elements, function(el) {
            el.data['display'] = 'none';
            el.data['selected'] = 0;
            el.data['hidden'] = 0;
            el.classes = classes;
        });

        _.each(elements, function(el) {
            el.data['display'] = 'element';
            el.classes = classes;

            if (highlight && _.includes(highlight, el.data.unique_id)) {
                el.data['selected'] = 1;
            }

            if (el.data.docs && el.data.docs.show === false) {
                el.data['hidden'] = 1;
            }
        });
        service.graph.elements = _.filter(elements, function(e) { return e.data.display == 'element'});

        return node_ids;
    }

    service.manifest = {};
    service.packages = [];

    service.selected_node = null;

    service.getCanvasHeight = function() {
        return ($window.innerHeight * 0.8) + "px"
    }

    projectService.ready(function(project) {
        service.manifest = project;

        service.packages = _.uniq(_.map(service.manifest.nodes, 'package_name'));
        //
        // TODO : Update selector service with options
        //_.each(service.packages, function(pkg) {
        //    service.show_hide.packages[pkg] = true;
        //});
        //var resource_types = _.uniq(_.map(service.manifest.nodes, 'resource_type'));
        //_.each(resource_types, function(resource_type) {
        //    service.show_hide.node_types[resource_type] = true;
        //});


        _.each(_.filter(service.manifest.nodes, function(node) {
            var is_graph_type = _.includes(['model', 'seed', 'source', 'snapshot', 'analysis', 'exposure', 'metric'], node.resource_type);
            var is_singular_test = node.resource_type == 'test' && !node.hasOwnProperty('test_metadata');
            return is_graph_type || is_singular_test;
        }), function(node) {
            var node_obj = {
                group: "nodes",
                data: _.assign(node, {
                    parent: node.package_name,
                    id: node.unique_id,
                    is_group: 'false'
                })
            }

            service.graph.pristine.nodes[node.unique_id] = node_obj;
        });

        _.each(service.manifest.parent_map, function(parents, child) {
            _.each(parents, function(parent) {
                var parent_node = service.manifest.nodes[parent];
                var child_node = service.manifest.nodes[child];

                if (!_.includes(['model', 'source', 'seed', 'snapshot'], parent_node.resource_type)) {
                    return;
                } else if (child_node.resource_type == 'test' && child_node.hasOwnProperty('test_metadata')) {
                    return;
                }


                var unique_id = parent_node.unique_id + "|" + child_node.unique_id;

                var edge = {
                    group: "edges",
                    data: {
                        source: parent_node.unique_id,
                        target: child_node.unique_id,
                        unique_id: unique_id,
                    }
                };

                var edge_id = child_node.unique_id;
                if (!service.graph.pristine.edges[edge_id]) {
                    service.graph.pristine.edges[edge_id] = [];
                }

                service.graph.pristine.edges[edge_id].push(edge);
            })
        });


        var dag = new graphlib.Graph({directed: true});
        _.each(service.graph.pristine.nodes, function(node) {
            dag.setNode(node.data.unique_id, node.data.name);
        });

        _.each(service.graph.pristine.edges, function(edges) {
            _.each(edges, function(edge) {
                dag.setEdge(edge.data.source, edge.data.target);
            });
        });

        service.graph.pristine.dag = dag;
        service.graph.elements = _.flatten(_.values(service.graph.pristine.nodes).concat(_.values(service.graph.pristine.edges)));
        setNodes(dag.nodes())
    });

    function updateGraphWithSelector(selected_spec, classes, should_highlight) {
        var dag = service.graph.pristine.dag;
        if (!dag) return;

        // good: "+source:quickbooks.invoices+"

        var pristine = service.graph.pristine.nodes;
        var selected = selectorService.selectNodes(dag, pristine, selected_spec);
        var highlight_nodes = should_highlight ? selected.matched : [];

        return setNodes(selected.selected, highlight_nodes, classes);
    }

    service.hideGraph = function() {
        service.orientation = 'sidebar';
        service.expanded = false;
    }

    service.showVerticalGraph = function(node_name, force_expand) {
        service.orientation = 'sidebar'
        if (force_expand) {
            service.expanded = true;
        }

        var selected_spec = _.assign({}, selectorService.options, {
            include: "+" + node_name + "+",
            exclude: '',
            hops: 1
        });

        var nodes = updateGraphWithSelector(selected_spec, 'vertical', true);
        service.graph.layout = layouts.top_down;
        service.graph.options = graph_options.vertical;

        return nodes;
    }

    service.showFullGraph = function(node_name) {
        service.orientation = 'fullscreen'
        service.expanded = true;
        var selected_spec = _.assign({}, selectorService.options);

        if (node_name) {
            selected_spec.include = "+" + node_name + "+";
            selected_spec.exclude = "";
        } else {
            selected_spec.include = "";
            selected_spec.exclude = "";
        }

        var nodes = updateGraphWithSelector(selected_spec, 'horizontal', true);
        service.graph.layout = layouts.left_right;
        service.graph.options = graph_options.horizontal;

        // update url with selection
        locationService.setState(selected_spec);

        return nodes;
    }

    service.updateGraph = function(selected_spec) {
        service.orientation = 'fullscreen'
        service.expanded = true;

        var nodes = updateGraphWithSelector(selected_spec, 'horizontal', false);
        service.graph.layout = layouts.left_right;
        service.graph.options = graph_options.horizontal;

        // update url with selection
        locationService.setState(selected_spec);

        return nodes;
    }

    service.deselectNodes = function() {
        if (service.orientation != 'fullscreen') {
            return;
        }

        var g = service.graph_element;
        g.elements().data('selected', 0);
    }

    service.selectNode = function(node_id) {
        if (service.orientation != 'fullscreen') {
            return;
        }

        var node = service.graph.pristine.nodes[node_id];

        // get all edges that pass through this node
        var dag = service.graph.pristine.dag;
        var parents = _.indexBy(selectorGraph.ancestorNodes(dag, node_id));
        var children = _.indexBy(selectorGraph.descendentNodes(dag, node_id));

        parents[node_id] = node_id;
        children[node_id] = node_id;

        var g = service.graph_element;

        _.each(service.graph.elements, function(el) {
            var graph_el = g.$id(el.data.id);
            if (parents[el.data.source] && parents[el.data.target]) {
                graph_el.data('selected', 1);
            } else if (children[el.data.source] && children[el.data.target]) {
                graph_el.data('selected', 1);
            } else if (el.data.unique_id == node_id) {
                graph_el.data('selected', 1);
            } else {
                graph_el.data('selected', 0);
            }
        });
    }

    service.markDirty = function(node_ids) {
        service.markAllClean();
        _.each(node_ids, function(node_id) {
            service.graph_element.$id(node_id).addClass('dirty');
        })
    }

    service.markAllClean = function() {
        if (service.graph_element) {
            service.graph_element.elements().removeClass('dirty');
        }
    }

    return service;

}]);
