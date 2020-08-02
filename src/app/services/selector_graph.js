const _ = require('underscore');

function _isDefined(value) {
    return !_.isNull(value) && !_.isUndefined(value);
}

// Returns all parents of all children of the node
function selectAt(dag, node) {
    var selected = [node];
    var children = _.union([node], descendentNodes(dag, node));

    _.each(children, function(child) {
        var ancestor_nodes = ancestorNodes(dag, child);
        selected = _.union(selected, ancestor_nodes, [child]);
    });

    return selected;
}

function ancestorNodes(dag, node, max_hops, hop_index) {
    if (!hop_index) hop_index = 1;

    var up = dag.predecessors(node);
    // node is not in the dag
    if (!up || max_hops == 0) {
        return [];
    }

    var ancestors = up.concat(up.reduce(function(sum, u) {
        if (hop_index >= max_hops && _isDefined(max_hops)) {
            return sum
        }
        return sum.concat(ancestorNodes(dag, u, max_hops, hop_index + 1));
    }, []));

    return _.uniq(ancestors);
}

function descendentNodes(dag, node, max_hops, hop_index) {
    if (!hop_index) hop_index = 1;

    var down = dag.successors(node);
    if (!down || max_hops == 0) {
        return [];
    }

    var descendents = down.concat(down.reduce(function(sum, u) {
        if (hop_index >= max_hops && _isDefined(max_hops)) {
            return sum
        }
        return sum.concat(descendentNodes(dag, u, max_hops, hop_index + 1));
    }, []));

    return _.uniq(descendents);
}

module.exports = {
    selectAt,
    ancestorNodes,
    descendentNodes,
}
