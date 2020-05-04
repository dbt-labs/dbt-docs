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

        var rel = [model.database, model.schema, model.identifier || model.alias || model.name].join(".");
        query.push("from " + rel)
        return query.join("\n");
    }

    return service;

}]);
