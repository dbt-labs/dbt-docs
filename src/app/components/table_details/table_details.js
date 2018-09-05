'use strict';

const template = require('./table_details.html');
require("./table_details.css");

const _ = require('underscore');

angular
.module('dbt')
.directive('tableDetails', ["$sce", "$filter", function($sce, $filter) {
    return {
        scope: {
            model: '=',
        },
        templateUrl: template,
        link: function(scope) {

            scope.details = [];
            scope.extended = [];
            scope._show_expanded = false;

            scope.show_expanded = function(v) {
                if (v!==undefined) {
                    scope._show_expanded = v;
                }
                return scope._show_expanded;
            }

            function asBytes(bytes, precision) {
                if (bytes < 1) {
                    // errantly reported in MBs
                    bytes = bytes * 1000000;
                }
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 0;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
            }

            function asPercent(input, decimals) {
                if (typeof decimals === 'undefined') decimals = 2;
                return $filter('number')(input * 100, decimals) + '%';
            };

            function asNumber(input, decimals) {
                if (typeof decimals === 'undefined') decimals = 0;
                return $filter('number')(input, decimals)
            }

            function translateRelationType(type) {
                if (type == 'BASE TABLE') {
                    return {type: 'table', name: 'table'}
                } else if (type == 'LATE BINDING VIEW') {
                    return {type: 'view', name: 'late binding view'}
                } else {
                    return {type: type.toLowerCase(), name: type.toLowerCase()}
                }
            }

            function getBaseStats(model) {
                var is_ephemeral = !model.metadata;
                var metadata = model.metadata || {};

                var stats = [
                    {
                        name: "Owner",
                        value: metadata.owner
                    },
                    {
                        name: "Type",
                        value: is_ephemeral ? undefined : translateRelationType(metadata.type).name
                    },
                    {
                        name: "Package",
                        value: model.package_name
                    },
                    {
                        name: "Relation",
                        value: is_ephemeral ? undefined : (model.schema + "." + model.alias)
                    },
                ]

                return _.filter(stats, function(s) { return s.value !== undefined })
            }

            function getExtendedStats(stats) {
                var format = {
                    rows: asNumber,
                    max_varchar: asNumber,
                    pct_used: asPercent,
                    size: asBytes,
                }

                var sorted_stats = _.sortBy(_.values(stats), 'label');
                _.each(sorted_stats, function(stat) {
                    var transform = format[stat.id];
                    if (transform) {
                        stat.value = transform(stat.value);
                        stat.label = stat.label.replace("Approximate", "~");
                        stat.label = stat.label.replace("Utilization", "Used");
                    }
                })

                return sorted_stats;
            }

            scope.$watch("model", function(nv) {
                var get_type = _.property(['metadata', 'type'])
                var rel_type = get_type(nv);

                scope.details = getBaseStats(nv);
                scope.extended = getExtendedStats(nv.stats);
                scope.show_extended = _.where(scope.extended, {include: true}).length > 0;
            });
        }
    }
}]);
