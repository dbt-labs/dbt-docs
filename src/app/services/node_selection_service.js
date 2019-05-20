
const $ = require('jquery');
const _ = require('underscore');

var SELECTOR_AT = '@'
var SELECTOR_PARENTS = '+'
var SELECTOR_CHILDREN = '+'
var SELECTOR_GLOB = '*'
var SELECTOR_TYPE = {
    FQN: 'fqn:',
    TAG: 'tag:',
    SOURCE: 'source:'
}

angular
.module('dbt')
.factory('selectorService', ["$state", function($state) {

    var initial_selector = {
        include: '',
        exclude: '',
        packages: [],
        tags: [null],
        depth: 1,
    };

    var service = {
        view_node: null,

        selection: {
            clean: _.clone(initial_selector), // The selection we're rendering
            dirty: _.clone(initial_selector)  // The selection that's being edited
        },

        options: {
            packages: [],
            tags: [null],
        }
    };

    service.init = function(defaults) {
        _.each(defaults, function(value, attr) {
            service.options[attr] = value;
            initial_selector[attr] = value;
            service.selection.clean[attr] = value;
            service.selection.dirty[attr] = value;
        });

    }

    service.resetSelection = function(node) {
        var include_selection;
        if (node && node.resource_type == 'model') {
            include_selection = '+' + node.name + '+';
        } else if (node && node.resource_type == 'source') {
            include_selection = '+source:' + node.source_name + "." + node.name + '+';
        } else {
            include_selection = "";
        }

        var new_selection = {
            include: include_selection
        }

        var merged = _.assign({}, initial_selector, new_selection);
        service.selection.clean = _.clone(merged);
        service.selection.dirty = _.clone(merged);
        service.view_node = node;
    }

    service.getViewNode = function() {
        return service.view_node;
    }

    service.excludeNode = function(node, opts) {
        var exclude = service.selection.dirty.exclude;

        var pre = opts.parents ? "+" : "";
        var post = opts.children ? "+" : "";
        var spacer = exclude.length > 0 ? " " : "";

        var node_name;

        if (node.resource_type == 'source') {
            pre += "source:"
            node_name = node.source_name + "." + node.name;
        } else {
            node_name = node.name;
        }

        var new_exclude = exclude + spacer + pre + node_name + post;

        service.selection.dirty.exclude = new_exclude;

        return service.updateSelection();
    }

    service.selectSource = function(source, opts) {
        var post = opts.children ? "+" : "";
        var new_include = 'source:' + source + post;

        service.selection.dirty.include = new_include;
        return service.updateSelection();
    }

    service.clearViewNode = function() {
        service.view_node = null;
    }

    service.isDirty = function() {
        var keys = ['include', 'exclude', 'packages', 'tags']
        var res = _.isEqual(service.selection.clean, service.selection.dirty);
        return !res
    }

    /*
     * Updates "clean" to equal "dirty"
     */
    service.updateSelection = function() {
        service.selection.clean = _.clone(service.selection.dirty);
        return service.selection.clean;
    }

    // Returns all parents of all children of the node
    function select_at(dag, node) {
        var selected = [node];
        var children = _.union([node], descendents(dag, node));

        _.each(children, function(child) {
            var ancestor_nodes = ancestors(dag, child);
            selected = _.union(selected, ancestor_nodes, [child]);
        });

        return selected;
    }

    function ancestors(dag, node, max_hops, hop_index) {
        if (!hop_index) hop_index = 1;

        var up = dag.predecessors(node);
        return up.concat(up.reduce(function(sum, u) {
            if (hop_index >= max_hops && max_hops !== undefined) {
                return sum
            }
            return sum.concat(ancestors(dag, u, max_hops, hop_index + 1));
        }, []));
    }

    function descendents(dag, node, max_hops, hop_index) {
        if (!hop_index) hop_index = 1;

        var down = dag.successors(node);
        return down.concat(down.reduce(function(sum, u) {
            if (hop_index >= max_hops && max_hops !== undefined) {
                return sum
            }
            return sum.concat(descendents(dag, u, max_hops, hop_index + 1));
        }, []));
    }


    function split_specs(node_spec) {
        return _.filter(_.uniq(node_spec.split(" ")), function(s) {
            return s.length > 0;
        });
    }

    function parse_spec(node_spec) {
        var select_at = false;
        var select_children = false;
        var select_parents = false;
        var index_start = 0;
        var index_end = node_spec.length;

        // @+ is not a valid selector - one or the other is required
        if (node_spec.startsWith(SELECTOR_AT)) {
            select_at = true;
            index_start = 1;
        } else if (node_spec.startsWith(SELECTOR_PARENTS)) {
            select_parents = true;
            index_start = 1;
        }

        if (node_spec.endsWith(SELECTOR_CHILDREN)) {
            select_children = true;
            index_end -= 1;
        }

        var node_selector = node_spec.substring(index_start, index_end)

        var selector_type;
        var selector_val;
        if (node_selector.startsWith(SELECTOR_TYPE.TAG)) {
            selector_type = SELECTOR_TYPE.TAG;
            selector_val = node_selector.replace(selector_type, '');
        } else if (node_selector.startsWith(SELECTOR_TYPE.SOURCE)) {
            selector_type = SELECTOR_TYPE.SOURCE;
            selector_val = node_selector.replace(selector_type, '');
        } else {
            selector_type = SELECTOR_TYPE.FQN;
            selector_val = node_selector.replace(selector_type, '').split('.');
        }

        return {
            select_at: select_at,
            select_parents: select_parents,
            select_children: select_children,
            selector_type: selector_type,
            selector_value: selector_val,
            raw: node_spec
        }
    }

    function parse_specs(raw_include_specs, raw_exclude_specs, hops) {
        var specs = [];

        var split_include_specs = split_specs(raw_include_specs);
        var include_specs = _.map(split_include_specs, parse_spec);

        var split_exclude_specs = split_specs(raw_exclude_specs);
        var exclude_specs = _.map(split_exclude_specs, parse_spec);

        return {
            include: include_specs,
            exclude: exclude_specs,
            hops: hops
        }
    }

    function is_selected_node(real_node, node_selector) {
        for (var i=0; i<node_selector.length; i++) {

            var selector_part = node_selector[i];
            var is_last = (i == (node_selector.length - 1));

            var ret;
            if (selector_part == SELECTOR_GLOB) {
                ret = true;
            } else if (is_last && selector_part == _.last(real_node)) {
                ret = true;
            } else if (real_node.length <= i) {
                ret = false;
            } else if (real_node[i] == selector_part) {
                // pass
            } else {
                ret = false;
            }

            if (ret !== undefined) {
                return ret;
            }
        };
    }

    function get_nodes_by_qualified_name(elements, qualified_name) {
        var package_names = _.compact(_.uniq(_.map(elements, function(n) { return n.data['package_name'] })))

        var nodes = [];
        _.each(elements, function(node_obj) {
            var node = node_obj.data;
            var fqn_ish = node.fqn;

            if (!fqn_ish) {
                return;
            }

            if (qualified_name.length == 1 && _.last(fqn_ish) == qualified_name[0]) {

                nodes.push(node);

            } else if (_.includes(package_names, qualified_name[0])) {

                if (is_selected_node(fqn_ish, qualified_name)) {
                    nodes.push(node);
                }

            } else {
                _.each(package_names, function(package_name) {
                    var local_qualified_node_name = [package_name].concat(qualified_name);
                    if (is_selected_node(fqn_ish, local_qualified_node_name)) {
                        nodes.push(node);
                    }
                });
            }

        });

        return _.uniq(nodes);
    }

    function get_nodes_by_tag(elements, tag) {
        var nodes = [];
        _.each(elements, function(node_obj) {
            var present_tags = node_obj.data.tags;
            if (_.includes(present_tags, tag)) {
                nodes.push(node_obj.data);
            }
        })
        return nodes;
    }

    function get_nodes_by_source(elements, source) {
        var nodes = [];
        _.each(elements, function(node_obj) {
            var source_name = node_obj.data.source_name;
            var name = node_obj.data.name;
            if (source == source_name + "." + name) {
                nodes.push(node_obj.data);
            } else if (source == source_name) {
                nodes.push(node_obj.data);
            }
        })
        return nodes;
    }

    function get_nodes_from_spec(dag, pristine_nodes, hops, selector) {
        var nodes = [];
        if (selector.selector_type == SELECTOR_TYPE.SOURCE) {
            nodes = get_nodes_by_source(pristine_nodes, selector.selector_value);
        } else if (selector.selector_type == SELECTOR_TYPE.FQN) {
            nodes = get_nodes_by_qualified_name(pristine_nodes, selector.selector_value);
        } else if (selector.selector_type == SELECTOR_TYPE.TAG) {
            nodes = get_nodes_by_tag(pristine_nodes, selector.selector_value);
        }

        var selected_nodes = [];
        var matched_nodes = [];

        _.each(nodes, function(node) {
            var selected_node = node.unique_id;
            matched_nodes.push(node.unique_id);

            var upstream = [];
            var downstream = [];
            var both = []
            if (selector.select_at) {
                both = _.union(select_at(dag, selected_node));
            }

            if (selector.select_parents) {
                upstream = ancestors(dag, selected_node, hops);
            }

            if (selector.select_children) {
                downstream = descendents(dag, selected_node, hops)
            }

            selected_nodes = _.union([selected_node], selected_nodes, downstream, upstream, both);
        });

        return {
            nodes: selected_nodes,
            matches: matched_nodes
        }
    }

    function select_nodes(dag, pristine, selected_spec) {

        var include = selected_spec.include;
        var exclude = selected_spec.exclude;

        var selection = parse_specs(selected_spec.include, selected_spec.exclude, selected_spec.hops);

        var pristine_nodes = _.values(pristine);
        var include_nodes;

        // if no selection, include all nodes
        if (selection.include.length == 0) {
            include_nodes = [{nodes: dag.nodes(), matched: []}]
        } else {
            include_nodes = _.map(selection.include, _.partial(get_nodes_from_spec, dag, pristine_nodes, selected_spec.hops));
        }

        var exclude_nodes = _.map(selection.exclude, _.partial(get_nodes_from_spec, dag, pristine_nodes, selected_spec.hops));

        var nodes_to_include = [];
        var selected_nodes = [];

        // add to selection / matches
        _.each(include_nodes, function(res) {
            nodes_to_include = _.union(nodes_to_include, res.nodes);
            selected_nodes = _.union(selected_nodes, res.matches);
        })

        // subtract from selection / matches
        _.each(exclude_nodes, function(res) {
            nodes_to_include = _.difference(nodes_to_include, res.nodes);
            selected_nodes = _.difference(selected_nodes, res.matches);
        })

        // prune nodes by resource type / package name
        var nodes_to_prune = [];
        _.each(nodes_to_include, function(node_id) {
            var node = pristine[node_id];

            if (!node.data.tags) {
                node.data.tags = [];
            }

            var matched_package = _.includes(selected_spec.packages, node.data.package_name);
            var matched_tags = _.intersection(selected_spec.tags, node.data.tags).length > 0;
            var matched_untagged = _.includes(selected_spec.tags, null) && (node.data.tags.length == 0);

            if (!matched_package || (!matched_tags && !matched_untagged)) {
                nodes_to_prune.push(node.data.unique_id);
            }
        })

        var nodes_to_return = _.difference(nodes_to_include, nodes_to_prune);

        return {
            nodes: nodes_to_return,
            matched: selected_nodes
        }
    }

    service.parse_specs = parse_specs;
    service.get_nodes_by_qualified_name = get_nodes_by_qualified_name;
    service.select_nodes = select_nodes;
    service.ancestors = ancestors;
    service.descendents = descendents;

    return service;
}]);
