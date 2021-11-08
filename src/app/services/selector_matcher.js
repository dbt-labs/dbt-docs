const _ = require('underscore');
const selectorGraph = require('./selector_graph');

var SELECTOR_GLOB = '*'
var SELECTOR_TYPE = {
    IMPLICIT: 'implicit',
    FQN: 'fqn',
    TAG: 'tag',
    SOURCE: 'source',
    EXPOSURE: 'exposure',
    METRIC: 'metric',
    PATH: 'path',
    PACKAGE: 'package',
    CONFIG: 'config',
    TEST_NAME: 'test_name',
    TEST_TYPE: 'test_type',
}

var NODE_MATCHERS = {}
NODE_MATCHERS[SELECTOR_TYPE.IMPLICIT] = getNodesByImplicitSelection;
NODE_MATCHERS[SELECTOR_TYPE.FQN] = getNodesByFQN;
NODE_MATCHERS[SELECTOR_TYPE.TAG] = getNodesByTag;
NODE_MATCHERS[SELECTOR_TYPE.SOURCE] = getNodesBySource;
NODE_MATCHERS[SELECTOR_TYPE.EXPOSURE] = getNodesByExposure;
NODE_MATCHERS[SELECTOR_TYPE.METRIC] = getNodesByMetric;
NODE_MATCHERS[SELECTOR_TYPE.PATH] = getNodesByPath;
NODE_MATCHERS[SELECTOR_TYPE.PACKAGE] = getNodesByPackage;
NODE_MATCHERS[SELECTOR_TYPE.CONFIG] = getNodesByConfig;
NODE_MATCHERS[SELECTOR_TYPE.TEST_NAME] = getNodesByTestName;
NODE_MATCHERS[SELECTOR_TYPE.TEST_TYPE] = getNodesByTestType;


function isFQNMatch(node_fqn, qualified_name) {

    // if qualified_name matches exactly model name (fqn's leaf), this is a match
    if (qualified_name === _.last(node_fqn)) {
        return true;
    }

    /*
    * Flatten FQN to allow dots in model names as namespace separators, eg:
    *
    *     FQN: ['snowplow', 'pageviews', 'namespace.snowplow_pageviews']
    *     SELECTOR: ['snowplow', 'pageviews', 'namespace', 'snowplow_pageviews']
    *
    * Should match
    */
    var node_flat_fqn = node_fqn.reduce((r, i) => r.concat(i.split('.')), [])
    var node_selector = qualified_name.split(".");

    if (node_flat_fqn.length < node_selector.length) {
        return false;
    }

    for (var i=0; i<node_selector.length; i++) {

        var selector_part = node_selector[i];

        if (selector_part == SELECTOR_GLOB) {
            return true;
        } else if (node_flat_fqn[i] == selector_part) {
            // pass
        } else {
            return false;
        }
    };
    return true;
}

function getNodesByFQN(elements, qualified_name) {
    var nodes = [];

    _.each(elements, function(el) {
        var node = el.data;
        var fqn = node.fqn;

        if (
          !fqn || 
          node.resource_type == 'source' || 
          node.resource_type == 'exposure' || 
          node.resource_type == 'metric'
        ) {
            return;
        }

        /*
         * Allow fqn selectors that omit the parent package name, eg:
         *
         *     FQN: ['snowplow', 'pageviews', 'snowplow_pageviews']
         *     SELECTOR: ['pageviews', 'snowplow_pageviews']
         *
         * Should match
         */
        var unscoped_fqn = _.rest(fqn);

        if (isFQNMatch(fqn, qualified_name)) {
            nodes.push(node);
        } else if (isFQNMatch(unscoped_fqn, qualified_name)) {
            nodes.push(node);
        }
    });

    return _.uniq(nodes);
}

function getNodesByPath(elements, path) {
    var nodes = [];

    var path_parts = path.split("/");
    _.each(elements, function(node) {
        var node_path = (node.data.original_file_path || '').split("/");
        var matched = true;
        _.each(path_parts, function(path_part, i) {
            if (path_part == SELECTOR_GLOB || path_part == '') {
                // pass
            } else if (path_part != node_path[i]) {
                matched = false;
            }
        });

        if (matched) {
            nodes.push(node.data);
        }
    })
    return nodes;
}

function getNodesByImplicitSelection(elements, selector) {
    var fqn_matched = getNodesByFQN(elements, selector);
    var path_matched = getNodesByPath(elements, selector);

    var node_ids = _.uniq(
        _.map(fqn_matched, 'unique_id')
        .concat(
            _.map(path_matched, 'unique_id')
        )
    )

    return _.map(node_ids, (id) => elements[id].data);
}

function getNodesByTag(elements, tag) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var present_tags = node_obj.data.tags;
        if (_.includes(present_tags, tag)) {
            nodes.push(node_obj.data);
        }
    })
    return nodes;
}

function getNodesByPackage(elements, package_name) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        if (node_obj.data.package_name == package_name) {
            nodes.push(node_obj.data);
        }
    });
    return nodes;
}

function getNodesByConfig(elements, config) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;
        if (!node.config) {
            return;
        } else if (node.config[config.config] == config.value) {
            nodes.push(node);
        }
    });
    return nodes;
}

function getNodesByTestName(elements, test_name) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;

        if (node.test_metadata && node.test_metadata.name == test_name) {
            nodes.push(node);
        }
    });
    return nodes;
}

function getNodesByTestType(elements, test_type) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;

        if (node.resource_type != 'test') {
            return false;
        // generic tests have `test_metadata`, singular tests do not
        // for backwards compatibility, keep supporting old test_type names
        } else if (node.hasOwnProperty('test_metadata') && ['schema', 'generic'].indexOf(test_type) > -1) {
            nodes.push(node);
        } else if (!node.hasOwnProperty('test_metadata') && ['data', 'singular'].indexOf(test_type) > -1) {
            nodes.push(node);
        }
    });
    return nodes;
}

function getNodesBySource(elements, source) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;

        if (node.resource_type != 'source') {
            return;
        }

        var source_name = node.source_name;
        var name = node.name;

        var selected_source_name;
        var selected_source_table;
        if (source.indexOf('.') != -1) {
            [selected_source_name, selected_source_table] = source.split('.', 2);
        } else {
            selected_source_name = source;
            selected_source_table = null;
        }

        if (selected_source_name == '*') {
            nodes.push(node_obj.data);
        } else if (selected_source_name == source_name && selected_source_table === '*') {
            nodes.push(node_obj.data);
        } else if (selected_source_name == source_name && selected_source_table === name) {
            nodes.push(node_obj.data);
        } else if (selected_source_name == source_name && selected_source_table === null) {
            nodes.push(node_obj.data);
        }
    })
    return nodes;
}

function getNodesByExposure(elements, exposure) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;

        if (node.resource_type != 'exposure') {
            return;
        }

        var exposure_name = node.name;
        var selected_exposure_name = exposure;

        if (selected_exposure_name == '*') {
            nodes.push(node_obj.data);
        } else if (selected_exposure_name == exposure_name) {
            nodes.push(node_obj.data);
        }
    })
    return nodes;
}

function getNodesByMetric(elements, metric) {
    var nodes = [];
    _.each(elements, function(node_obj) {
        var node = node_obj.data;

        if (node.resource_type != 'metric') {
            return;
        }

        var metric_name = node.name;
        var selected_metric_name = metric;

        if (selected_metric_name == '*') {
            nodes.push(node_obj.data);
        } else if (selected_metric_name == metric_name) {
            nodes.push(node_obj.data);
        }
    })
    return nodes;
}

function getNodesFromSpec(dag, pristine_nodes, maxHops, selector) {
    const matcher = NODE_MATCHERS[selector.selector_type];
    if (!matcher) {
        console.log("Node matcher for selector", selector.selector_type, "is invalid");
        return {
            selected: [],
            matched: [],
        };
    }

    var nodes = matcher(pristine_nodes, selector.selector_value);

    var selected_nodes = [];
    var matched_nodes = [];

    _.each(nodes, function(node) {
        var selected_node = node.unique_id;
        matched_nodes.push(node.unique_id);

        var upstream = [];
        var downstream = [];
        var both = []
        if (selector.select_at) {
            both = _.union(selectorGraph.selectAt(dag, selected_node));
        }

        if (selector.select_parents) {
            var hops = maxHops || selector.parents_depth;
            upstream = selectorGraph.ancestorNodes(dag, selected_node, hops);
        }

        if (selector.select_children) {
            var hops = maxHops || selector.children_depth;
            downstream = selectorGraph.descendentNodes(dag, selected_node, hops)
        }

        selected_nodes = _.union([selected_node], selected_nodes, downstream, upstream, both);
    });

    return {
        selected: selected_nodes,
        matched: matched_nodes
    }
}

module.exports = {
    isFQNMatch,
    getNodesByFQN,
    getNodesByTag,
    getNodesBySource,
    getNodesByPath,
    getNodesByPackage,
    getNodesByConfig,
    getNodesByTestName,
    getNodesByTestType,

    getNodesFromSpec,
}
