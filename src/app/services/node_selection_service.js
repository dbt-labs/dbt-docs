
const $ = require('jquery');
const _ = require('underscore');
const selectorMethods = require('./selector_methods');

angular
.module('dbt')
.factory('selectorService', ["$state", function($state) {

    var initial_selector = {
        include: '',
        exclude: '',
        packages: [],
        tags: [null],
        resource_types: [
            'model',
            'seed',
            'snapshot',
            'source',
            'test',
            'analysis',
            'exposure',
            'metric',
        ],
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
            resource_types: ['model', 'seed', 'snapshot', 'source', 'test', 'analysis', 'exposure', 'metric'],
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
        if (node && _.includes(['model', 'seed', 'snapshot'], node.resource_type)) {
            include_selection = '+' + node.name + '+';
        } else if (node && node.resource_type == 'source') {
            include_selection = '+source:' + node.source_name + "." + node.name + '+';
        } else if (node && node.resource_type == 'exposure') {
            include_selection = '+exposure:' + node.name;
        } else if (node && node.resource_type == 'metric') {
            include_selection = '+metric:' + node.name;
        } else if (node && _.includes(['analysis', 'test'], node.resource_type)) {
            include_selection = '+' + node.name;
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
        } else if (['exposure', 'metric'].indexOf(node.resource_type) > -1) {
            pre += node.resource_type + ":"
            node_name = node.name;
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
        var keys = ['include', 'exclude', 'packages', 'tags', 'resource_types']
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

    service.selectNodes = function(dag, pristine, selectedSpec) {
        return selectorMethods.selectNodes(dag, pristine, selectedSpec);
    }

    return service;
}]);
