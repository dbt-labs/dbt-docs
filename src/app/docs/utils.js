const _ = require('underscore');
export function getReferences(project, model) {
    let references = _.filter(project.nodes, function(node) {
        if (node.depends_on && node.depends_on.nodes && node.depends_on.nodes.length) {
            if (_.contains(node.depends_on.nodes, model.unique_id)) {
                return true;
            }
        }
        return false;
    });

    return _.groupBy(references, 'resource_type');
}

export function getParents (project, model) {
    let parents = _.filter(project.nodes, function(node) {
        if (model.depends_on && model.depends_on.nodes && model.depends_on.nodes.length) {
            if (_.contains(model.depends_on.nodes, node.unique_id)) {
                return true;
            }
        }
        return false;
    });

    let macroParents = _.filter(project.macros, function(macro) {
        if (model.depends_on && model.depends_on.macros && model.depends_on.macros.length) {
            if (_.contains(model.depends_on.macros, macro.unique_id)) {
                return true;
            }
        }
        return false;
    });
    

    return _.groupBy(parents.concat(macroParents), 'resource_type');
}