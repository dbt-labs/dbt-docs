const angular = require('angular');
const $ = require("jquery");
const _ = require('underscore');

import Prism from 'prismjs';
window.Prism = Prism;

import 'prismjs/components/prism-sql';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prism-themes/themes/prism-ghcolors.css';

angular
.module('dbt')
.factory('code', ['$sce', function($sce) {

    var service = {}

    // big hack
    service.copied = false;

    service.highlight = function(sql) {
        var highlighted = Prism.highlight(sql, Prism.languages.sql, 'sql')
        return $sce.trustAsHtml(highlighted);
    }

    service.copy_to_clipboard = function(text) {
        var el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };

    service.generateSourceSQL = function(model) {
        var query = ["select"]

        var num_columns = _.size(model.columns);
        var cols = _.keys(model.columns);
        _.each(cols, function(name, i) {
            var line = "    " + name;
            if (i + 1 != num_columns) {
                line += ",";
            }
            query.push(line);
        });

        const database = model.database ? model.database + '.' : '';
        const rel = database + model.schema + "." + model.identifier;

        query.push("from " + rel)
        return query.join("\n");
    }

    service.generateMetricSQL = function(metric) {
        if (metric.type == 'expression') {
            return metric.sql
        } else {
            let query_parts = [
                `select ${metric.type}(${metric.sql})` ,
                `from {{ ${metric.model} }}`,
            ]

            if (metric.filters.length > 0) {
                let filter_exprs = _.map(metric.filters, (filter) => {
                    return `${filter.field} ${filter.operator} ${filter.value}`
                })

                let filters = filter_exprs.join(" AND ")
                query_parts.push(`where ${filters}`)
            }

            return query_parts.join("\n")
        }
    }

    return service;

}]);
