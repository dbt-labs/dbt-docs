'use strict';

const source_template = require('./source_tree_line.html');
const model_template = require('./model_tree_line.html');
const _ = require('underscore');

require("./model_tree_line.css");

function wrapLinkFn($state) {
    function linkFn(scope,element,attrs,ctrlFn) {
        if (!scope.depth) {
            scope.depth = 0;
        }

        // end = take last 15 chars from string
        // start = everything up to end

        var name = scope.item.name;
        var end_chars = 15;
        var end = _.last(name, end_chars).join('');
        var start = _.initial(name, end.length).join('');

        scope.name = {
            name: name,
            start: start,
            end: end
        }

        scope.name_start = start;
        scope.name_end = end;

        scope.toggle = function(item) {
            item.active = !item.active;
        }

        scope.toggleAndSelectSource = function(item) {
            var source_name = item.name;
            $state.go('dbt.source_list', {source: source_name});
            scope.toggle(item);
        }

        scope.activate = function(item) {
            item.active = true;
        }

        scope.getIcon = function(type, onOff) {
            var icons = {
                header: {
                    on: 'icn-down',
                    off: 'icn-right'
                },
                schema: {
                    on: 'icn-tree-on',
                    off: 'icn-tree'
                },
                table: {
                    on: 'icn-doc-on',
                    off: 'icn-doc'
                },
                folder: {
                    on: 'icn-dir-on',
                    off: 'icn-dir'
                },
                file: {
                    on: 'icn-doc-on',
                    off: 'icn-doc'
                }
            }

            return "#" + icons[type][onOff]
        }

        scope.getClass = function(item) {
            return {
                "active": item.active,
                "menu-tree": (item.type == 'header' || item.type == 'schema' || item.type == "folder"),
                "menu-main": (item.type == 'header'),
                "menu-node": (item.type == "file" || item.type == "table")
            }
        }

    }

    return linkFn;
}

angular
.module('dbt')
.directive('modelTreeLine', ['$state', function($state) {
    var directive =  {
        scope: {
            item: '=',
            depth: '<',
        },
        link: wrapLinkFn($state),
        replace: true,
        templateUrl: model_template
    }

    return directive;
}]);

angular
.module('dbt')
.directive('sourceTreeLine', ['$state', function($state) {
    var directive =  {
        scope: {
            item: '=',
            depth: '<',
        },
        link: wrapLinkFn($state),
        replace: true,
        templateUrl: source_template
    }

    return directive;
}]);
