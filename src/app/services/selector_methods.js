
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
    var spec = {
        raw: node_spec,
        select_at: false,
        select_children: false,
        children_depth: null,
        select_parents: false,
        parents_depth: null,
    }

    var selector_regex = new RegExp(''
        + /^/.source
        + /(?<childs_parents>(\@))?/.source
        + /(?<parents>((?<parents_depth>(\d*))\+))?/.source
        + /((?<method>([\w.]+)):)?/.source
        + /(?<value>(.*?))/.source
        + /(?<children>(\+(?<children_depth>(\d*))))?/.source
        + /$/.source
    );

    const parsed = selector_regex.exec(node_spec).groups;

    spec.select_at = parsed.childs_parents == '@';
    spec.select_parents = !!parsed.parents;
    spec.select_children = !!parsed.children;

    if (parsed.parents_depth) {
        spec.parents_depth = parseInt(parsed.parents_depth);
    }

    if (parsed.children_depth) {
        spec.children_depth = parseInt(parsed.children_depth);
    }

    var selector_method = parsed.method;
    var selector_value = parsed.value;

    // TODO : We should probably make select_at and select_parents/select_children
    // mutually exclusive. It would be nice if this could raise and show an error
    // message in the UI if a user inputs an invalid selector definition....

    if (!selector_method) {
        // Support unspecified selector type, eg: --models my_model
        // The implicit selector matches FQN + Path on the CLI
        selector_method = 'implicit';
    } else if (selector_method.indexOf('.') != -1) {
        // Support config.materialized:table ==> {
        //  selector_type: config
        //  selector_value: {
        //    config: materialized,
        //    value: table
        //  }
        [selector_method, selector_modifier] = selector_method.split('.', 2);
        selector_value = {
            config: selector_modifier,
            value: selector_value
        }
    }

    spec.selector_type = selector_method;
    spec.selector_value = selector_value;

    return spec
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
        var matched_untagged = _.includes(selected_spec.tags, null) && (node.data.tags.length == 0);
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
