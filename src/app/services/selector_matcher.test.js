
const matcher = require("./selector_matcher");
const _ = require('underscore');

const elements = [
    {
        data: {
            id: 1,
            fqn: ['my_package', 'dir', 'model'],
            tags: ['daily'],
            resource_type: 'model',
        }
    },
    {
        data: {
            id: 2,
            fqn: ['my_package', 'dir', 'other_model'],
            tags: ['daily'],
            resource_type: 'model',
        }
    },
    {
        data: {
            id: 3,
            fqn: ['other_package', 'dir', 'other_model_2'],
            tags: ['daily', 'nightly'],
            resource_type: 'model',
        }
    },
    {
        data: {
            id: 4,
            resource_type: 'source',
            tags: [],
            source_name: 'events',
            name: 'my_event',
        }
    },
    {
        data: {
            id: 5,
            resource_type: 'source',
            tags: [],
            source_name: 'events',
            name: 'my_event_2',
        }
    },
    {
        data: {
            id: 6,
            resource_type: 'source',
            tags: [],
            source_name: 'other_events',
            name: 'pageviews',
        }
    }
];


test("Test FQN Matching glob", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package', '*']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching all parts", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package', 'dir', 'model']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare package", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare path", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package', 'dir']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching bare path glob", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package', 'dir', '*']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching glob all", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['*']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching direct model name", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['model']
        )
    ).toStrictEqual(true)
})

test("Test FQN Matching non match package", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['other_package']
        )
    ).toStrictEqual(false)
})

test("Test FQN Matching non match path", () => {
    expect(
        matcher.isFQNMatch(
            ['my_package', 'dir', 'model'],
            ['my_package', 'other_dir']
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

