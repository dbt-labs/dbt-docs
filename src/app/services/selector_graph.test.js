
const graph = require("./selector_graph");
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

dag.setNode("a");
dag.setNode("b");
dag.setNode("c");
dag.setNode("d");
dag.setNode("e");
dag.setNode("f");

dag.setEdge("a", "b");
dag.setEdge("a", "c");
dag.setEdge("b", "d");
dag.setEdge("c", "d");
dag.setEdge("c", "e");

test("Test node ancestors", () => {
    expect(
        graph.ancestorNodes(dag, 'd').sort()
    ).toStrictEqual(
        ['a', 'b', 'c'].sort()
    )

    expect(
        graph.ancestorNodes(dag, 'b').sort()
    ).toStrictEqual(
        ['a'].sort()
    )

    expect(
        graph.ancestorNodes(dag, 'a')
    ).toStrictEqual(
        []
    )

    expect(
        graph.ancestorNodes(dag, 'd', 1)
    ).toStrictEqual(
        ['b', 'c']
    )

    expect(
        graph.ancestorNodes(dag, 'b', 1)
    ).toStrictEqual(
        ['a']
    )

    expect(
        graph.ancestorNodes(dag, 'e', 1)
    ).toStrictEqual(
        ['c']
    )

    expect(
        graph.ancestorNodes(dag, 'e', 2).sort()
    ).toStrictEqual(
        ['a', 'c']
    )
})

test("Test node descendents", () => {
    expect(
        graph.descendentNodes(dag, 'd')
    ).toStrictEqual(
        []
    )

    expect(
        graph.descendentNodes(dag, 'b').sort()
    ).toStrictEqual(
        ['d']
    )

    expect(
        graph.descendentNodes(dag, 'a').sort()
    ).toStrictEqual(
        ['b', 'c', 'd', 'e']
    )

    expect(
        graph.descendentNodes(dag, 'a', 1).sort()
    ).toStrictEqual(
        ['b', 'c']
    )

    expect(
        graph.descendentNodes(dag, 'c', 1).sort()
    ).toStrictEqual(
        ['d', 'e']
    )
})

test("Test node at-selector", () => {
    expect(
        graph.selectAt(dag, 'c').sort()
    ).toStrictEqual(
        ['a', 'b', 'c', 'd', 'e']
    )

    expect(
        graph.selectAt(dag, 'b').sort()
    ).toStrictEqual(
        ['a', 'b', 'c', 'd']
    )

    expect(
        graph.selectAt(dag, 'a').sort()
    ).toStrictEqual(
        ['a', 'b', 'c', 'd', 'e']
    )

    expect(
        graph.selectAt(dag, 'd').sort()
    ).toStrictEqual(
        ['a', 'b', 'c', 'd']
    )

    expect(
        graph.selectAt(dag, 'e').sort()
    ).toStrictEqual(
        ['a', 'c', 'e']
    )

    expect(
        graph.selectAt(dag, 'f').sort()
    ).toStrictEqual(
        ['f']
    )
})
