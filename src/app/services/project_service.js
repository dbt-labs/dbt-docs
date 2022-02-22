
const angular = require('angular');
const $ = require('jquery');
const _ = require('lodash');

import merge from 'deepmerge';

angular
.module('dbt')
.factory('project', ['$q', '$http', function($q, $http) {

    var TARGET_PATH = '';

    var service = {
        project: {},
        tree: {
            project: [],
            database: [],
            sources: []
        },
        files: {
            manifest: {},
            catalog: {},
        },
        loaded: $q.defer(),
    }

    service.find_by_id = function(uid, cb) {
        service.ready(function() {
            if (uid) {
                var node = service.node(uid);
                cb(node);
            }
        });
    }

    service.node = function(unique_id) {
        return _.find(service.project.nodes, {unique_id: unique_id});
    }

    function match_dict_keys(dest_keys, obj) {
        var new_obj = {};
        _.each(obj, function(value, key) {

            var desired_key = _.find(dest_keys, function(k) {
                return k.toLowerCase() == key.toLowerCase();
            });

            if (!desired_key) {
                new_obj[key] = value;
            } else {
                new_obj[desired_key] = value;
            }

        })

        return new_obj;
    }

    function incorporate_catalog(manifest, catalog) {
        // Re-combine sources and nodes
        _.each(catalog.sources, function(source, source_id) {
            catalog.nodes[source_id] = source;
        })

        // later elements are preferred in the merge, but it
        // shouldn't matter, as these two don't clobber each other
        _.each(manifest.nodes, function(node, node_id) {
            var catalog_entry = catalog.nodes[node_id];
            if (!catalog_entry) {
                return
            }

            var catalog_column_names = _.keys(catalog_entry.columns);
            var manifest_columns = node.columns;

            var new_columns = match_dict_keys(catalog_column_names, manifest_columns);
            node.columns = new_columns;

        });

        return merge(catalog, manifest)
    }

    function loadFile(label, path) {
        return $http({
            method: 'GET',
            url: path
        }).then(function(response) {
            return {
                label: label,
                data: response.data
            }
        }, function onError(e) {
            console.error(e);
            alert("dbt Docs was unable to load the "
                  + label
                  + " file at path: \n  "
                  + path
                  + "\n\nError: " + e.statusText + " (" + e.status + ")"
                  + "\n\nThe dbt Docs site may not work as expected if this file cannot be found."
                  + "Please try again, and contact support if this error persists.");
        })
    }

    service.loadProject = function() {
        var cache_bust = "?cb=" + (new Date()).getTime();
        var promises = [
            loadFile('manifest', TARGET_PATH + "manifest.json" + cache_bust),
            loadFile('catalog', TARGET_PATH + "catalog.json" + cache_bust),
        ]

        $q.all(promises).then(function(files) {
            _.each(files, function(file) {
                if (file) {
                    service.files[file.label] = file.data
                } else {
                    console.error("FILE FAILED TO LOAD!");
                }
            });

            // Set node labels
            _.each(service.files.manifest.nodes, function(node) {
                node.label = node.name;
            });

            // Add sources back into nodes to make site logic work
            _.each(service.files.manifest.sources, function(node) {
                node.label = "" + node.source_name + "." + node.name;
                service.files.manifest.nodes[node.unique_id] = node;
            });

            // Add exposures back into nodes to make site logic work
            _.each(service.files.manifest.exposures, function(node) {
                node.label = node.name;
                service.files.manifest.nodes[node.unique_id] = node;
            });
            
            // Add metrics back into nodes to make site logic work
            _.each(service.files.manifest.metrics, function(node) {
                node.label = node.name;
                service.files.manifest.nodes[node.unique_id] = node;
            });

            var adapter = service.files.manifest.metadata.adapter_type;
            var macros = clean_project_macros(service.files.manifest.macros, adapter);
            service.files.manifest.macros = macros;

            var project = incorporate_catalog(service.files.manifest, service.files.catalog);


            var models = project.nodes
            var model_names = _.keyBy(models, 'name');

            var tests = _.filter(project.nodes, {resource_type: 'test'})
            _.each(tests, function(test) {

                if (!test.hasOwnProperty('test_metadata')) {
                    return;
                }

                var test_name;
                if (test.test_metadata.namespace) {
                    test_name = test.test_metadata.namespace + "." + test.test_metadata.name;
                } else {
                    test_name = test.test_metadata.name;
                }

                var test_info = {
                    test_name: test_name
                }
                if (test.test_metadata.name == 'not_null') {
                    test_info.short = 'N';
                    test_info.label = 'Not Null';
                } else if (test.test_metadata.name == 'unique') {
                    test_info.short = 'U';
                    test_info.label = 'Unique';
                } else if (test.test_metadata.name == 'relationships') {
                    var rel_model_name = test.refs[0];
                    var rel_model = model_names[rel_model_name];
                    if (rel_model && test.test_metadata.kwargs.field) {
                        // FKs get extra fields
                        test_info.fk_field = test.test_metadata.kwargs.field;
                        test_info.fk_model = rel_model;
                    }

                    test_info.short = 'F';
                    test_info.label = 'Foreign Key';
                } else if (test.test_metadata.name == 'accepted_values') {
                    if (Array.isArray(test.test_metadata.kwargs.values)) {
                        var values = test.test_metadata.kwargs.values.join(", ")
                    } else {
                        var values = JSON.stringify(test.test_metadata.kwargs.values);
                    }
                    test_info.short = 'A';
                    test_info.label = 'Accepted Values: ' + values;
                } else {
                    var kwargs = _.omit(test.test_metadata.kwargs, 'column_name');
                    test_info.short = '+';
                    test_info.label = test_name + '(' + JSON.stringify(kwargs) + ')';
                }

                var depends_on = test.depends_on.nodes;
                var test_column = test.column_name || test.test_metadata.kwargs.column_name || test.test_metadata.kwargs.arg;
                if (depends_on.length && test_column) {
                    if (test.test_metadata.name == 'relationships') {
                        var model = depends_on[depends_on.length - 1];
                    } else {
                        var model = depends_on[0]
                    }
                    var node = project.nodes[model];
                    var column = _.find(node.columns, function(col, col_name) {
                        return col_name.toLowerCase() == test_column.toLowerCase();
                    });

                    if (column) {
                        column.tests = column.tests || [];
                        column.tests.push(test_info);
                    }
                }
            });

            service.project = project;

            // performance hack
            var search_macros = _.filter(service.project.macros, function(macro) {
                return !macro.is_adapter_macro_impl;
            });

            var search_nodes = _.filter(service.project.nodes, function(node) {
                return _.includes(['model', 'source', 'seed', 'snapshot', 'analysis', 'exposure', 'metric'], node.resource_type);
            });

            service.project.searchable = _.filter(search_nodes.concat(search_macros), function(obj) {
                // It should not be possible to search for hidden documentation
                return !obj.docs || obj.docs.show;
            });
            service.loaded.resolve();
        });
    }

    service.ready = function(cb) {
        service.loaded.promise.then(function() {
            cb(service.project);
        });
    }

    function fuzzySearchObj(val, obj) {
        var objects = [];
        var search_keys = {
            'name':'string',
            'description':'string',
            'raw_sql':'string',
            'columns':'object',
            'tags': 'array',
            'arguments': 'array',
        };
        var search = new RegExp(val, "i")

        for (var i in search_keys) {
            if (!obj[i]) {
               continue;
            } else if (search_keys[i] === 'string' && obj[i].toLowerCase().indexOf(val.toLowerCase()) != -1) {
                objects.push({key: i, value: val});
            } else if (search_keys[i] === 'object') {
                for (var column_name in obj[i]) {
                    if (obj[i][column_name]["name"].toLowerCase().indexOf(val.toLowerCase()) != -1) {
                        objects.push({key: i, value: val});
                    }
                }
            } else if (search_keys[i] === 'array') {
                for (var tag of obj[i]) {
                    if (JSON.stringify(tag).toLowerCase().indexOf(val.toLowerCase()) != -1) {
                        objects.push({key: i, value: val});
                    }
                }
            }
        }

        return objects
    }

    service.search = function(q) {
        if (q.length == 0) {
            return _.map(service.project.searchable, function(model) {
                return {
                    model: model,
                    matches: []
                }
            })
        }

        var res = [];
        _.each(service.project.searchable, function(model) {
            var matches = fuzzySearchObj(q, model);
            if (matches.length) {
                res.push({
                    model: model,
                    matches: matches,
                });
            }
        });
        return res;
    }

    function clean_project_macros(macros, adapter) {
        var all_macros = macros || [];

        var package_macros = {};
        _.each(all_macros, function(macro) {
            if (!package_macros[macro.package_name]) {
                package_macros[macro.package_name] = {}
            }

            package_macros[macro.package_name][macro.name] = macro
        });

        var macros = [];
        _.each(package_macros, function(package_macros, package_name) {
            if (package_name == 'dbt' || package_name == 'dbt_' + adapter) {
                return
            }
            var pkg_macros = consolidateAdapterMacros(package_macros, adapter);
            macros = macros.concat(pkg_macros);
        });

        return _.keyBy(macros, 'unique_id');
    }

    service.getModelTree = function(select, cb) {
        service.loaded.promise.then(function() {
            var macros = _.values(service.project.macros);
            var nodes = _.filter(service.project.nodes, function(node) {
                // only grab custom singular tests
                if (node.resource_type == 'test' && !node.hasOwnProperty('test_metadata')) {
                    return true;
                }

                var accepted = ['snapshot', 'source', 'seed', 'model', 'analysis', 'exposure', 'metric'];
                return _.includes(accepted, node.resource_type);
            })

            service.tree.database = buildDatabaseTree(nodes, select);
            service.tree.project = buildProjectTree(nodes, macros, select);

            var sources = _.values(service.project.sources);
            service.tree.sources = buildSourceTree(sources, select);

            var exposures = _.values(service.project.exposures);
            service.tree.exposures = buildExposureTree(exposures, select);
            
            var metrics = _.values(service.project.metrics);
            service.tree.metrics = buildMetricTree(metrics, select);

            cb(service.tree);
        });
    }

    service.updateSelectedInTree = function(select, subtrees) {
        var is_active = false;
        _.each(subtrees, function(subtree) {
            if (subtree.node && subtree.node.unique_id == select) {
                subtree.active = true;
                is_active = true;
            } else if (subtree.node && subtree.node.unique_id != select) {
                subtree.active = false;
            } else {
                var child_active = service.updateSelectedInTree(select, subtree.items);
                if (child_active) {
                    subtree.active = true;
                    is_active = true;
                }
            }
        })
        return is_active;
    }

    service.updateSelected = function(select) {
        service.updateSelectedInTree(select, service.tree.project);
        service.updateSelectedInTree(select, service.tree.database);
        service.updateSelectedInTree(select, service.tree.sources);
        service.updateSelectedInTree(select, service.tree.exposures);
        service.updateSelectedInTree(select, service.tree.metrics);

        return service.tree;
    }

    function recursiveFlattenItems(tree) {
        var res = [];

        var subtrees = _.values(tree);
        _.each(subtrees, function(subtree) {
            if (subtree.items) {
                var flattened = recursiveFlattenItems(subtree.items);
                var sorted = _.sortBy(flattened, 'name')
                subtree.items = sorted;
            }
            res.push(subtree);
        })

        return res;
    }

    function buildSourceTree(nodes, select) {
        var sources = {}

        _.each(nodes, function(node) {
            var source = node.source_name;
            var name = node.name;
            var is_active = node.unique_id == select;

            if (!sources[source]) {
                sources[source] = {
                    type: "folder",
                    name: source,
                    active: is_active,
                    items: []
                };
            } else if (is_active) {
                sources[source].active = true;
            }

            sources[source].items.push({
                type: 'file',
                name: name,
                node: node,
                active: is_active,
                unique_id: node.unique_id,
                node_type: 'source'
            })
        });

        // sort schemas
        var sources = _.sortBy(_.values(sources), 'name');

        // sort tables in the schema
        _.each(sources, function(source) {
            source.items = _.sortBy(source.items, 'name');
        });

        return sources
    }

    function buildExposureTree(nodes, select) {
        var exposures = {}

        _.each(nodes, function(node) {
            var name = node.name;

            var type = node.type || 'Uncategorized';
            type = type[0].toUpperCase() + type.slice(1);

            var is_active = node.unique_id == select;

            if (!exposures[type]) {
                exposures[type] = {
                    type: "folder",
                    name: type,
                    active: is_active,
                    items: []
                };
            } else if (is_active) {
                exposures[type].active = true;
            }

            exposures[type].items.push({
                type: 'file',
                name: name,
                node: node,
                active: is_active,
                unique_id: node.unique_id,
                node_type: 'exposure'
            })
        });

        // sort exposure types
        var exposures = _.sortBy(_.values(exposures), 'name');

        // sort entries in the exposure folder
        _.each(exposures, function(exposure) {
            exposure.items = _.sortBy(exposure.items, 'name');
        });

        return exposures
    }
    
    function buildMetricTree(nodes, select) {
        var metrics = {}

        _.each(nodes, function(node) {
            var name = node.name;

            var project = node.package_name;

            var is_active = node.unique_id == select;

            if (!metrics[project]) {
                metrics[project] = {
                    type: "folder",
                    name: project,
                    active: is_active,
                    items: []
                };
            } else if (is_active) {
                metrics[project].active = true;
            }

            metrics[project].items.push({
                type: 'file',
                name: name,
                node: node,
                active: is_active,
                unique_id: node.unique_id,
                node_type: 'metric'
            })
        });

        var metrics = _.sortBy(_.values(metrics), 'name');

        _.each(metrics, function(metric) {
            metrics.items = _.sortBy(metrics.items, 'name');
        });

        return metrics
    }

    function consolidateAdapterMacros(macros, adapter) {
        var adapter_macros = {};
        _.each(macros, function(macro) {
            if (macro.macro_sql.match(/{{\s*adapter_macro\([^)]+\)\s+}}/)) {
                macro.impls = {"Adapter Macro": macro.macro_sql};
                macro.is_adapter_macro = true;
                adapter_macros[macro.name] = macro;
            }
        });

        // ideally we would not need to do this!
        var databases = [
            'postgres',
            'redshift',
            'bigquery',
            'snowflake',
            'spark',
            'presto',
            'default',
        ];

        var to_return = _.values(adapter_macros);
        var extras = _.filter(macros, function(macro) {
            var parts = macro.name.split("__");
            var head = parts.shift();

            var macro_name = parts.join("__");
            if (databases.indexOf(head) >= 0 && adapter_macros[macro_name]) {
                adapter_macros[macro_name].impls[head] = macro.macro_sql;
                macro.is_adapter_macro_impl = true;
                return false;
            }
            return true;
        });

        return to_return.concat(extras);
    }

    function buildProjectTree(nodes, macros, select) {
        var tree = {};

        var nodes = nodes || [];
        var macros = macros || [];

        _.each(nodes.concat(macros), function(node) {
            var show = _.get(node, ['docs', 'show'], true);
            if (node.resource_type == 'source' || node.resource_type == 'exposure' || node.resource_type == 'metric') {
                // no sources in the model tree, sorry
                return;
            } else if (!show) {
                return;
            }

            if (node.original_file_path.indexOf("\\") != -1) {
                var path_parts = node.original_file_path.split("\\");
            } else {
                var path_parts = node.original_file_path.split("/");
            }

            var path = [node.package_name].concat(path_parts);
            var is_active = node.unique_id == select;

            var dirpath = _.initial(path);

            if (node.resource_type == 'macro') {
                var fname = node.name;
            } else {
                var fname = _.last(path);
            }

            var cur_dir = tree;
            _.each(dirpath, function(dir) {
                if (!cur_dir[dir]) {
                    cur_dir[dir] = {
                        type: 'folder',
                        name: dir,
                        active: is_active,
                        items: {}
                    };
                } else if (is_active) {
                    cur_dir[dir].active = true;
                }
                cur_dir = cur_dir[dir].items;
            })
            cur_dir[fname] = {
                type: 'file',
                name: node.name,
                node: node,
                active: is_active,
                unique_id: node.unique_id,
                node_type: node.resource_type
            }
        });

        var flat = recursiveFlattenItems(tree);
        return flat;
    }

    function buildDatabaseTree(nodes, select) {

        var databases = {};
        var tree_nodes = _.filter(nodes, function(node) {
            var show = _.get(node, ['docs', 'show'], true);
            if (!show) {
                return false;
            } else if (_.indexOf(['source', 'snapshot', 'seed'], node.resource_type) != -1) {
                return true;
            } else if (node.resource_type == 'model') {
                return node.config.materialized != 'ephemeral';
            }
        });

        var tree_nodes_sorted = _.sortBy(tree_nodes, function(node) {
            return node.database + '.' + node.schema +  '.' + (node.identifier || node.alias || node.name);
        });

        var by_database = _.groupBy(tree_nodes_sorted, 'database');
        _.each(by_database, function(db_nodes, db) {
            var database = {
                type: "database",
                name: db,
                active: false,
                items: []
            };
            databases[db] = database;

            var by_schema = _.groupBy(db_nodes, 'schema');
            _.each(by_schema, function(schema_nodes, schema) {
                var schema = {
                    type: "schema",
                    name: schema,
                    active: false,
                    items: []
                };

                database.items.push(schema);

                _.each(schema_nodes, function(node) {
                    var is_active = node.unique_id == select;
                    if (is_active) {
                        database.active = true;
                        schema.active = true;
                    }
                    schema.items.push({
                        type: 'table',
                        name: node.identifier || node.alias || node.name,
                        node: node,
                        active: is_active,
                        unique_id: node.unique_id,
                        node_type: 'model'
                    });
                });
            });
        });

        return databases;
    }

    service.caseColumn = function(col) {
        if (service.project.metadata.adapter_type == 'snowflake' && col.toUpperCase() == col) {
            return col.toLowerCase();
        } else {
            return col;
        }
    }

    service.init = function() {
        service.loadProject()
    }

    return service;

}]);
