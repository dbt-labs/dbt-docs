
const matcher = require("./selector_matcher");
const selectorMethods = require("./selector_methods");

const _ = require('underscore');
const graphlib = require('graphlib');

var dag = new graphlib.Graph({directed: true});

/*
    a ---> b -----\
    \              +--->d
     \-------> c --/
                \
                 +---> e

    f
*/

dag.setNode("a", {
    resource_type: 'source',
    package_name: 'my_package',
    source_name: 'event',
    unique_id: 'a',
    name: 'a',
    tags: ['pii']
});

dag.setNode("b", {
    resource_type: 'model',
    package_name: 'my_package',
    unique_id: 'b',
    name: 'b',
    fqn: ['my_package', 'b'],
    tags: ['nightly'],
});

dag.setNode("c", {
    resource_type: 'model',
    package_name: 'my_package',
    unique_id: 'c',
    name: 'c',
    fqn: ['my_package', 'dir', 'c'],
    tags: ['nightly'],
});

dag.setNode("d", {
    resource_type: 'test',
    package_name: 'my_package',
    unique_id: 'd',
    name: 'd',
    fqn: ['my_package', 'dir', 'd'],
    tags: ['daily', 'nightly'],
});

dag.setNode("e", {
    resource_type: 'model',
    package_name: 'my_package',
    unique_id: 'e',
    name: 'e',
    fqn: ['my_package', 'dir', 'e'],
    tags: ['nightly'],
});

dag.setNode("f", {
    resource_type: 'model',
    package_name: 'other_package',
    unique_id: 'f',
    name: 'f',
    fqn: ['other_package', 'dir', 'f'],
    tags: ['imported'],
});


dag.setEdge("a", "b");
dag.setEdge("a", "c");
dag.setEdge("b", "d");
dag.setEdge("c", "d");
dag.setEdge("c", "e");

var pristine_nodes = _.map(dag.nodes(), (node) => {
    var data = dag.node(node);
    return {
        data: data
    };
})

var pristine_node_map = _.indexBy(pristine_nodes, (n) => n.data.unique_id)

test("Test getting nodes from a spec (no nodes)", () => {
    expect(
        matcher.getNodesFromSpec(
            dag,
            pristine_nodes,
            undefined,
            {
                select_at: false,
                select_parents: false,
                parents_depth: null,
                children_depth: null,
                select_children: false,
                selector_type: 'fqn',
                selector_value: 'badselector',
                raw: 'badselector'
            }
        )
    ).toStrictEqual({
        matched: [],
        selected: [],
    })
})

test("Test getting nodes from a spec", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: true,
            selector_type: 'fqn',
            selector_value: 'c',
            raw: '+c+'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['c'],
        selected: ['a', 'c', 'd', 'e'],
    })
})

test("Test getting nodes from a spec at-selector", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: true,
            select_parents: false,
            parents_depth: null,
            children_depth: null,
            select_children: false,
            selector_type: 'fqn',
            selector_value: 'c',
            raw: '@c'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['c'],
        selected: ['a', 'b', 'c', 'd', 'e'],
    })
})

test("Test getting nodes by tag", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: false,
            selector_type: 'tag',
            selector_value: 'daily',
            raw: '+tag:d'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['d'],
        selected: ['a', 'b', 'c', 'd'],
    })
})

test("Test getting nodes by tag and depth", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: 1,
            children_depth: null,
            select_children: false,
            selector_type: 'tag',
            selector_value: 'daily',
            raw: '+tag:daily'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['d'],
        selected: ['b', 'c', 'd'],
    })
})

test("Test getting nodes by source", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: false,
            selector_type: 'source',
            selector_value: 'event',
            raw: 'source:event'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a'],
        selected: ['a'],
    })
})

test("Test getting nodes by source with depth", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: 1,
            select_children: true,
            selector_type: 'source',
            selector_value: 'event',
            raw: 'source:event+1'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a'],
        selected: ['a', 'b', 'c'],
    })
})

test("Test getting nodes by source with children", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: true,
            selector_type: 'source',
            selector_value: 'event',
            raw: 'source:event+'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a'],
        selected: ['a', 'b', 'c', 'd', 'e'],
    })
})

test("Test getting nodes by source with table name", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: true,
            selector_type: 'source',
            selector_value: 'event.a',
            raw: 'source:event.a+'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a'],
        selected: ['a', 'b', 'c', 'd', 'e'],
    })
})

test("Test getting nodes by tag with no edges", () => {
    var matched = matcher.getNodesFromSpec(
        dag,
        pristine_nodes,
        undefined,
        {
            select_at: false,
            select_parents: true,
            parents_depth: null,
            children_depth: null,
            select_children: true,
            selector_type: 'tag',
            selector_value: 'imported',
            raw: '+tag:imported+'
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['f'],
        selected: ['f'],
    })
})


/*
 * Test root-level selectNodes method
 */

var all_resource_types = ['model', 'source', 'test'];
var all_packages = _.uniq(_.map(pristine_nodes, (n) => n.data.package_name));
var all_tags = [];
_.each(pristine_nodes, (n) => {
    all_tags = all_tags.concat(n.data.tags || []);
})
all_tags = _.uniq(all_tags).concat([null]);


test("Test node selection - select all", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: '',
            exclude: '',
            hops: undefined,
            packages: all_packages,
            tags: all_tags,
            resource_types: all_resource_types,
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: [],
        selected: ['a', 'b', 'c', 'd', 'e', 'f'],
    })
})

test("Test node selection - select included", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: 'c+',
            exclude: '',
            hops: undefined,
            packages: all_packages,
            tags: all_tags,
            resource_types: all_resource_types,
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['c'],
        selected: ['c', 'd', 'e'],
    })
})

test("Test node selection - select included and excluded", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: '@b',
            exclude: '+c',
            hops: undefined,
            packages: all_packages,
            tags: all_tags,
            resource_types: all_resource_types,
        }
    )
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['b'],
        selected: ['b', 'd'],
    })
})

test("Test node selection - kitchen sink", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: 'source:event.*+ f',
            exclude: 'tag:daily,tag:nightly my_package.dir.e',
            hops: undefined,
            packages: all_packages,
            tags: all_tags,
            resource_types: all_resource_types,
        }
    )
    matched.matched = matched.matched.sort()
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a', 'f'],
        selected: ['a', 'b', 'c', 'f'],
    })
})

test("Test node selection - kitchen sink with package filters", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: 'source:event.*+ f',
            exclude: 'tag:daily,tag:nightly my_package.dir.e',
            hops: undefined,
            packages: ['other_package'],
            tags: all_tags,
            resource_types: all_resource_types,
        }
    )
    matched.matched = matched.matched.sort()
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['f'],
        selected: ['f'],
    })
})

test("Test node selection - kitchen sink with tag filters", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: 'source:event.*+ f',
            exclude: 'tag:daily,tag:nightly my_package.dir.e',
            hops: undefined,
            packages: all_packages,
            tags: ['pii'],
            resource_types: all_resource_types,
        }
    )
    matched.matched = matched.matched.sort()
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['a'],
        selected: ['a'],
    })
})

test("Test node selection - kitchen sink with resource filters", () => {
    var matched = selectorMethods.selectNodes(
        dag,
        pristine_node_map,
        {
            include: 'source:event.*+ f',
            exclude: 'tag:daily,tag:nightly my_package.dir.e',
            hops: undefined,
            packages: all_packages,
            tags: all_tags,
            resource_types: ['model'],
        }
    )
    matched.matched = matched.matched.sort()
    matched.selected = matched.selected.sort()

    expect(matched).toStrictEqual({
        matched: ['f'],
        selected: ['b', 'c', 'f'],
    })
})
