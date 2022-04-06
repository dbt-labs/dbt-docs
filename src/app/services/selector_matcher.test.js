
const matcher = require("./selector_matcher");
const _ = require('underscore');

const elements = [
    {
        data: {
            id: 1,
            fqn: ['my_package', 'dir', 'model'],
            tags: ['daily'],
            resource_type: 'model',
            original_file_path: 'models/dir/model.sql',
            package_name: 'my_package',
            config: {
                materialized: 'incremental',
                incremental_strategy: 'delete+insert',
            },
        }
    },
    {
        data: {
            id: 2,
            fqn: ['my_package', 'dir', 'other_model'],
            tags: ['daily'],
            resource_type: 'model',
            original_file_path: 'models/dir/other_model.sql',
            package_name: 'my_package',
            config: {
                materialized: 'table'
            },
        }
    },
    {
        data: {
            id: 3,
            fqn: ['other_package', 'dir', 'other_model_2'],
            tags: ['daily', 'nightly'],
            resource_type: 'model',
            original_file_path: 'models/dir/other_model_2.sql',
            package_name: 'other_package',
            config: {
                materialized: 'incremental'
            },
        }
    },
    {
        data: {
            id: 4,
            resource_type: 'source',
            tags: [],
            source_name: 'events',
            name: 'my_event',
            original_file_path: 'models/sources/my_source.yml',
            package_name: 'my_package',
        }
    },
    {
        data: {
            id: 5,
            resource_type: 'source',
            tags: [],
            source_name: 'events',
            name: 'my_event_2',
            original_file_path: 'models/sources/my_source.yml',
            package_name: 'my_package',
        }
    },
    {
        data: {
            id: 6,
            resource_type: 'source',
            tags: [],
            source_name: 'other_events',
            name: 'pageviews',
            original_file_path: 'models/sources/my_source.yml',
            package_name: 'my_package',
        }
    },
    {
        data: {
            id: 7,
            resource_type: 'test',
            tags: [],
            name: 'test_unique_page_views_id',
            original_file_path: 'tests/test_unique.yml',
            package_name: 'my_package',
            config: {
                severity: "error"
            },
            test_metadata: {
                name: 'unique'
            }
        }
    }
];


test("Test FQN Matching glob", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package.*'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching all parts", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package.dir.model'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching all parts with dots", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'ns1.ns2.model'],
            'my_package.dir.ns1.ns2.model'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare package", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare path", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package.dir'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare path glob", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package.dir.*'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching glob all", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            '*'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching direct model name", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'model'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching direct model name with dots", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'ns1.ns2.model'],
            'ns1.ns2.model'
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching non match package", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'other_package'
        )
    ).toStrictEqual(false)
})

test("Test FQN Matching non match path", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            'my_package.other_dir'
        )
    ).toStrictEqual(false)
})

test("Test getting nodes by FQN", () => {
    function matchByFQN(selector) {
        var nodes = matcher.getNodesByFQN(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByFQN('dir.model')
    ).toStrictEqual(
        [1]
    )

    expect(
        matchByFQN('dir.*')
    ).toStrictEqual(
        [1, 2, 3]
    )

    expect(
        matchByFQN('model')
    ).toStrictEqual(
        [1]
    )

    expect(
        matchByFQN('other_package')
    ).toStrictEqual(
        [3]
    )

    expect(
        matchByFQN('other_package.*')
    ).toStrictEqual(
        [3]
    )

    expect(
        matchByFQN('*')
    ).toStrictEqual(
        [1, 2, 3]
    )
})

test("Test getting nodes by Tag", () => {
    function matchByTag(selector) {
        var nodes = matcher.getNodesByTag(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByTag('nightly')
    ).toStrictEqual(
        [3]
    )

    expect(
        matchByTag('daily')
    ).toStrictEqual(
        [1, 2, 3]
    )
})

test("Test getting nodes by Source", () => {
    function matchBySource(selector) {
        var nodes = matcher.getNodesBySource(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchBySource('events')
    ).toStrictEqual(
        [4, 5]
    )

    expect(
        matchBySource('events.my_event')
    ).toStrictEqual(
        [4]
    )

    expect(
        matchBySource('badsource')
    ).toStrictEqual(
        []
    )

    expect(
        matchBySource('*')
    ).toStrictEqual(
        [4, 5, 6]
    )

    expect(
        matchBySource('events.*')
    ).toStrictEqual(
        [4, 5]
    )
})

test("Test getting nodes by path", () => {
    function matchByPath(selector) {
        var nodes = matcher.getNodesByPath(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByPath('models/dir/model.sql')
    ).toStrictEqual(
        [1]
    )

    expect(
        matchByPath('models')
    ).toStrictEqual(
        [1,2,3,4,5,6]
    )

    expect(
        matchByPath('models/')
    ).toStrictEqual(
        [1,2,3,4,5,6]
    )

    expect(
        matchByPath('models/dir')
    ).toStrictEqual(
        [1,2,3]
    )

    expect(
        matchByPath('models/dir/')
    ).toStrictEqual(
        [1,2,3]
    )

    expect(
        matchByPath('mod')
    ).toStrictEqual(
        []
    )

    expect(
        matchByPath('badpath/')
    ).toStrictEqual(
        []
    )
})


test("Test getting nodes by package", () => {
    function matchByPackage(selector) {
        var nodes = matcher.getNodesByPackage(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByPackage('my_package')
    ).toStrictEqual(
        [1,2,4,5,6,7]
    )

    expect(
        matchByPackage('other_package')
    ).toStrictEqual(
        [3]
    )

    expect(
        matchByPackage('')
    ).toStrictEqual(
        []
    )

    expect(
        matchByPackage('badpackagename')
    ).toStrictEqual(
        []
    )
})


test("Test getting nodes by config", () => {
    function matchByConfig(selector) {
        var nodes = matcher.getNodesByConfig(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByConfig({config: 'materialized', value: 'table'})
    ).toStrictEqual(
        [2]
    )

    expect(
        matchByConfig({config: 'materialized', value: 'incremental'})
    ).toStrictEqual(
        [1, 3]
    )

    expect(
        matchByConfig({config: 'incremental_strategy', value: 'delete+insert'})
    ).toStrictEqual(
        [1]
    )

    expect(
        matchByConfig({config: 'madeup', value: 'notreal'})
    ).toStrictEqual(
        []
    )

    expect(
        matchByConfig({config: 'severity', value: 'error'})
    ).toStrictEqual(
        [7]
    )
})


test("Test getting nodes by test name", () => {
    function matchByTestName(selector) {
        var nodes = matcher.getNodesByTestName(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByTestName('unique')
    ).toStrictEqual(
        [7]
    )

    expect(
        matchByTestName('bad')
    ).toStrictEqual(
        []
    )

})

test("Test getting nodes by test type", () => {
    function matchByTestType(selector) {
        var nodes = matcher.getNodesByTestType(elements, selector)
        return _.map(nodes, (node) => node.id);
    }

    expect(
        matchByTestType('data')
    ).toStrictEqual(
        [7]
    )

    expect(
        matchByTestType('singular')
    ).toStrictEqual(
        [7]
    )

    expect(
        matchByTestType('schema')
    ).toStrictEqual(
        []
    )

    expect(
        matchByTestType('generic')
    ).toStrictEqual(
        [7]
    )

    expect(
        matchByTestType('invalid')
    ).toStrictEqual(
        []
    )
})
