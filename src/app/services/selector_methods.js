
const _ = require('underscore');
const selectorMatcher = require('./selector_matcher')

var SELECTOR_AT = '@'
var SELECTOR_PARENTS = '+'
var SELECTOR_CHILDREN = '+'

var DELIM_UNION = ' ';
var DELIM_INTERSECTION = ',';


function splitSpecs(node_spec, delim) {
    if (!delim) {
        delim = DELIM_UNION;
    }

    return _.filter(_.uniq(node_spec.split(delim)), function(s) {
        return s.length > 0;
    });
}

function parseSpec(node_spec) {
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

    // TODO : we're going to need to catch this one
    if (select_children && select_at) {
        throw new Error('Selector is invalid');
    }

    var node_selector = node_spec.substring(index_start, index_end)

    var selector_type;
    var selector_val;

    if (node_selector.indexOf(':') != -1) {
        [selector_type, selector_val] = node_selector.split(':', 2);
    } else {
        selector_type = 'fqn';
        selector_val = node_selector;
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


function parseSpecs(selectorString) {
    var union = splitSpecs(selectorString, DELIM_UNION);

    var to_union = _.map(union, function(spec) {
        var intersects = splitSpecs(spec, DELIM_INTERSECTION);
        if (intersects.length > 1) {
            return {
                method: 'intersect',
                selectors: _.map(intersects, parseSpec)
            }
        } else {
            return {
                method: 'none',
                selectors: _.map([spec], parseSpec)
            }
        }
    })

    return to_union
}

function buildSpec(raw_include_specs, raw_exclude_specs, hops) {
    var include_specs = parseSpecs(raw_include_specs);
    var exclude_specs = parseSpecs(raw_exclude_specs);

    return {
        include: include_specs,
        exclude: exclude_specs,
        hops: hops
    }
}

function applySpec(selectorString, getMatchingNodes) {
    var selectorSets = parseSpecs(selectorString);

    // nodes that were explicitly matched
    var matched_nodes = null;
    // nodes that are tagging along via graph extenders (+, @)
    var selected_nodes = null;

    _.each(selectorSets, function(selectorList) {
        var setMethod = (selectorList.method == 'intersect') ? _.intersection : _.union

        _.each(selectorList.selectors, function(selector) {
            var nodes = getMatchingNodes(selector);
            if (matched_nodes === null) {
                matched_nodes = nodes.matched;
                selected_nodes = nodes.selected;
            } else {
                matched_nodes = setMethod(matched_nodes, nodes.matched);
                selected_nodes = setMethod(selected_nodes, nodes.selected);
            }
        });
    });

    return {
        matched: matched_nodes || [],
        selected: selected_nodes || []
    }
}

function selectNodes(dag, pristine, selected_spec) {

    var include = selected_spec.include;
    var exclude = selected_spec.exclude;

    var getter = _.partial(
        selectorMatcher.getNodesFromSpec,
        dag,
        pristine,
        selected_spec.hops
    )

    var pristine_nodes = _.values(pristine);
    var included;

    // if no selection, include all nodes
    if (selected_spec.include.trim().length == 0) {
        included = {selected: dag.nodes(), matched: []}
    } else {
        included = applySpec(selected_spec.include, getter);
    }

    var excluded = applySpec(selected_spec.exclude, getter);

    // add to selection / matches
    var nodes_to_include = included.selected;
    var matched_nodes = included.matched;

    // subtract from selection / matches
    nodes_to_include = _.difference(nodes_to_include, excluded.selected);
    matched_nodes = _.difference(matched_nodes, excluded.matched);

    // prune nodes by resource type / package name
    var nodes_to_prune = [];
    _.each(nodes_to_include, function(node_id) {
        var node = pristine[node_id];

        if (!node.data.tags) {
            node.data.tags = [];
        }

        var matched_package = _.includes(selected_spec.packages, node.data.package_name);
        var matched_tags = _.intersection(selected_spec.tags, node.data.tags).length > 0;
        // TODO : This is a special case for data tests :/
        if (node.data.resource_type == 'test') {
            var matched_untagged = _.includes(selected_spec.tags, null) && (node.data.tags.length == 1);
        } else {
            var matched_untagged = _.includes(selected_spec.tags, null) && (node.data.tags.length == 0);
        }
        var matched_types = _.includes(selected_spec.resource_types, node.data.resource_type);

        if (!matched_package || (!matched_tags && !matched_untagged) || !matched_types) {
            nodes_to_prune.push(node.data.unique_id);
        }
    })

    return {
        selected: _.difference(nodes_to_include, nodes_to_prune),
        matched: _.difference(matched_nodes, nodes_to_prune)
    }

}

module.exports = {
    splitSpecs,
    parseSpec,
    parseSpecs,
    buildSpec,
    applySpec,

    selectNodes,
}
