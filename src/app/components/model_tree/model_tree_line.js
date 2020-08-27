'use strict';

const model_template = require('./model_tree_line.html');
const _ = require('underscore');

require("./model_tree_line.css");

angular
.module('dbt')
.directive('modelTreeLine', ['$state', function($state) {
    var directive =  {
        scope: {
            item: '=',
            depth: '<',
            resourceType: '@',
        },
        replace: true,
        templateUrl: model_template,
        link: function linkFn(scope,element,attrs,ctrlFn) {
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

            scope.onFolderClick = function(item) {
                // toggle the folder
                item.active = !item.active;

                // for sources, show the source list view
                if (scope.resourceType == 'source') {
                    var source_name = item.name;
                    $state.go('dbt.source_list', {source: source_name});
                }
                else if (scope.depth === 0 && item.type !== 'database') {
                    $state.go('dbt.project_overview', { project_name: item.name });
                }
            }

            scope.activate = function(item) {
                scope.$emit('clearSearch');
                item.active = true;

                var controller = "dbt." + item.node.resource_type;
                $state.go(controller, {unique_id: item.unique_id});
            }

            scope.getIcon = function(type, onOff) {
                var icons = {
                    header: {
                        on: 'icn-down',
                        off: 'icn-right'
                    },
                    database: {
                        on: 'icn-db-on',
                        off: 'icn-db'
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

        },
    }

    return directive;
}]);
