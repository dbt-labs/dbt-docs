const angular = require('angular');
const hljs = require('highlight.js/lib/highlight.js');
hljs.initHighlightingOnLoad();
hljs.initLineNumbersOnLoad();

angular
.module('dbt')
.factory('code', ['$sce', function($sce) {

    var service = {}

    // big hack
    service.copied = false;

    service.highlightSql = function(sql) {
        if (!sql) {
            return $sce.trustAsHtml('')
        }
        var res = hljs.highlight('sql', sql, true)

        // dumb fix for bug in highlighter line-no plugin:
        // https://github.com/wcoder/highlightjs-line-numbers.js/issues/42
        var fixed = res.value.replace(/^$/gm, '<span></span>');
        var trusted = $sce.trustAsHtml(fixed)
        return trusted
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
