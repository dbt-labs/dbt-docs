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
            extras: '=',
            exclude: '<',
        },
        templateUrl: template,
        link: function(scope) {

            scope.details = [];
            scope.extended = [];
            scope.exclude = scope.exclude || [];
            scope.meta = null;
            scope._show_expanded = false;

            scope.show_expanded = function(v) {
                if (v!==undefined) {
                    scope._show_expanded = v;
                }
                return scope._show_expanded;
            }

            scope.hasData = function(data) {
                if (!data || _.isEmpty(data)) {
                    return false;
                } else if (data.length == 1 && data[0].include == false) {
                    return false;
                }

                return true;
            }

            function asBytes(bytes, precision) {
                if (bytes == 0) {
                    return '0 bytes';
                } else if (bytes < 1) {
                    // errantly reported in MBs
                    bytes = bytes * 1000000;
                }
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 0;
                var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
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

                var database;
                if (!model.database) { 
                    database = '' 
                } else {
                    database = model.database + '.'
                }

                var relation;
                if (is_ephemeral) {
                    relation = undefined;
                } else if (model.resource_type == 'source') {
                    relation = database + model.schema + "." + model.identifier;
                } else {
                    relation = database + model.schema + "." + model.alias;
                }

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
                        value: relation
                    },
                ]

                return _.filter(stats, function(s) { return s.value !== undefined })
            }

            function getExtendedStats(stats) {
                // TODO : This logic should be pushed into dbt's catalog generation
                var format = {
                    rows: asNumber, // Redshift
                    row_count: asNumber, // Snowflake
                    num_rows: asNumber, // BigQuery
                    max_varchar: asNumber,
                    pct_used: asPercent,
                    size: asBytes, // Redshift
                    bytes: asBytes, // Snowflake
                    num_bytes: asBytes, // BigQuery
                }

                var sorted_stats = _.sortBy(_.values(stats), 'label');
                var mapped = _.map(sorted_stats, function(stat) {
                    var copy = _.clone(stat);
                    var transform = format[stat.id];
                    if (transform) {
                        copy.value = transform(stat.value);
                        copy.label = stat.label.replace("Approximate", "~");
                        copy.label = stat.label.replace("Utilization", "Used");
                    }
                    return copy;
                })

                return mapped;
            }

            scope.$watch("model", function(nv, ov) {
                var get_type = _.property(['metadata', 'type'])
                var rel_type = get_type(nv);

                var sources_meta = nv.hasOwnProperty('sources') ? nv.sources[0] != undefined ? nv.sources[0].source_meta : null : null;
                scope.meta = nv.meta || sources_meta;
                
                scope.details = getBaseStats(nv);
                scope.extended = getExtendedStats(nv.stats);

                if (scope.extras) {
                    var extrasToAdd = _.filter(scope.extras, function(extra) {
                        return extra.value !== undefined && extra.value !== null;
                    });
                    scope.details = scope.details.concat(extrasToAdd);
                }

                scope.show_extended = _.where(scope.extended, {include: true}).length > 0;
            });

            scope.queryTag = function(tag) {
                scope.$emit('query', tag);
            }
        }
    }
}]);
