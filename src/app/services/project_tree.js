
const _ = require('lodash');

function recursiveFlattenItems(tree) {
    var res = [];

    var subtrees = _.values(tree);
    _.each(subtrees, function(subtree) {
        if (subtree.items) {
            var flattened = recursiveFlattenItems(subtree.items);
            var sorted = _.sortBy(flattened, 'name')
            subtree.items = sorted;
        }
        res.push(subtree);
    })

    return res;
}

function buildProjectTree(nodes, macros, select) {
    var tree = {};

    var nodes = nodes || [];
    var macros = macros || [];

    _.each(nodes.concat(macros), function(node) {
        var show = _.get(node, ['docs', 'show'], true);
        if (node.resource_type == 'source' || node.resource_type == 'exposure' || node.resource_type == 'metric' || node.resource_type == 'semantic_model' || node.resource_type == 'saved_query' || node.resource_type == 'function') {
            // no sources in the model tree, sorry
            return;
        } else if (!show) {
            return;
        }

        if (node.original_file_path.indexOf("\\") != -1) {
            var path_parts = node.original_file_path.split("\\");
        } else {
            var path_parts = node.original_file_path.split("/");
        }

        var path = [node.package_name].concat(path_parts);
        var is_active = node.unique_id == select;

        var dirpath = _.initial(path);

        if (node.resource_type == 'model' && node.version != null) {
            var display_name = node.name + "_v" + node.version;
        } else {
            var display_name = node.name;
        }

        var cur_dir = tree;
        _.each(dirpath, function(dir) {
            if (!cur_dir[dir]) {
                cur_dir[dir] = {
                    type: 'folder',
                    name: dir,
                    active: is_active,
                    items: {}
                };
            } else if (is_active) {
                cur_dir[dir].active = true;
            }
            cur_dir = cur_dir[dir].items;
        })
        // One file can define several nodes (eg. multiple snapshots in a single
        // YAML file) so key on unique_id, prefixed to keep node keys out of the
        // folder key namespace above.
        cur_dir['node:' + node.unique_id] = {
            type: 'file',
            name: display_name,
            node: node,
            active: is_active,
            unique_id: node.unique_id,
            node_type: node.resource_type
        }
    });

    var flat = recursiveFlattenItems(tree);
    return flat;
}

module.exports = { buildProjectTree };
