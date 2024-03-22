'use strict';

const template = require('./code_block.html');
const $ = require('jquery');

const css = require("./code_block.css")

function getLanguageClass(language) {
    return language === 'python'
        ? 'language-python'
        : 'language-sql';
}

angular
.module('dbt')
.directive('codeBlock', ['code', '$timeout', function(codeService, $timeout) {
    return {
        scope: {
            versions: '=',
            default: '<',
            language: '=',
        },
        restrict: 'E',
        templateUrl: template,
        link: function(scope, element) {
            scope.selected_version = scope.default;
            scope.language_class = getLanguageClass(scope.language);
            scope.source = null;

            scope.setSelected = function(name) {
                scope.selected_version = name;
                scope.source = scope.versions[name] || '';

                const code = scope.source.trim();
                scope.highlighted = codeService.highlight(code, scope.language);

                $timeout(function() {
                    // for good measure, also use Prism's built-in mechanism to identify and
                    // highlight all `code` elements based on their `language-xxxx` class
                    Prism.highlightAll();

                    // Call to Prism above turns <pre><code class="lang-mermaid"></code></pre>
                    // into <pre><code class="language-mermaid"></code></pre>.
                    mermaid.init({}, 'code.language-mermaid');
                })
            }

            scope.titleCase = function(name) {
                return name.charAt(0).toUpperCase() + name.substring(1);
            }

            scope.copied = false;
            scope.copy_to_clipboard = function() {
                codeService.copy_to_clipboard(scope.source)
                scope.copied = true;
                setTimeout(function() {
                    scope.$apply(function() {
                       scope.copied = false;
                    })
                }, 1000);
            }

            scope.$watch('language', function(nv, ov) {
                if (nv && nv != ov) {
                    scope.language_class = getLanguageClass(nv);
                }
            }, true)

            scope.$watch('versions', function(nv, ov) {
                if (nv) {
                    if (scope.default) {
                        scope.setSelected(scope.default);
                    } else {
                        var opts = Object.keys(scope.versions);
                        if (opts.length > 0) {
                            scope.setSelected(opts[0]);
                        }
                    }
                }
            }, true)
        }
    }
}]);
