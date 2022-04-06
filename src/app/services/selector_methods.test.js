
const selectors = require("./selector_methods");

test("Test splitting specs", () => {
    expect(
        selectors.splitSpecs('a b c')
    ).toStrictEqual(
        ['a', 'b', 'c']
    );

    expect(
        selectors.splitSpecs('a b  ')
    ).toStrictEqual(
        ['a', 'b']
    );

    expect(
        selectors.splitSpecs('a   c')
    ).toStrictEqual(
        ['a', 'c']
    );

    expect(
        selectors.splitSpecs(' b  c')
    ).toStrictEqual(
        ['b', 'c']
    );
});

test("Test splitting specs (intersection)", () => {
    expect(
        selectors.splitSpecs('a,b c')
    ).toStrictEqual(
        ['a,b', 'c']
    );

    expect(
        selectors.splitSpecs('a, b  ')
    ).toStrictEqual(
        ['a,', 'b']
    );
});

test("Test parsing specs (fqn)", () => {
    expect(
        selectors.parseSpec('a')
    ).toStrictEqual({
        select_at: false,
        select_children: false,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'implicit',
        selector_value: 'a',
        raw: 'a',
    });
})

test("Test parsing specs (fqn with parents and children)", () => {
    expect(
        selectors.parseSpec('+a+5')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: true,
        parents_depth: null,
        children_depth: 5,
        selector_type: 'implicit',
        selector_value: 'a',
        raw: '+a+5',
    });
})

test("Test parsing specs (at-syntax)", () => {
    expect(
        selectors.parseSpec('@a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'implicit',
        selector_value: 'a',
        raw: '@a',
    });
})

test("Test parsing specs (explicit fqn)", () => {
    expect(
        selectors.parseSpec('@fqn:a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'fqn',
        selector_value: 'a',
        raw: '@fqn:a',
    });
})

test("Test parsing specs (explicit tag)", () => {
    expect(
        selectors.parseSpec('@tag:a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'tag',
        selector_value: 'a',
        raw: '@tag:a',
    });
})

test("Test parsing specs (explicit source)", () => {
    expect(
        selectors.parseSpec('source:a+1')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        parents_depth: null,
        children_depth: 1,
        selector_type: 'source',
        selector_value: 'a',
        raw: 'source:a+1',
    });
})

test("Test parsing specs (explicit source.table)", () => {
    expect(
        selectors.parseSpec('source:a.b+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'source',
        selector_value: 'a.b',
        raw: 'source:a.b+',
    });
})

test("Test parsing specs (explicit exposure)", () => {
    expect(
        selectors.parseSpec('+exposure:a')
    ).toStrictEqual({
        select_at: false,
        select_children: false,
        select_parents: true,
        parents_depth: null,
        children_depth: null,
        selector_type: 'exposure',
        selector_value: 'a',
        raw: '+exposure:a',
    });
})

test("Test parsing specs (explicit metric)", () => {
    expect(
        selectors.parseSpec('+metric:a')
    ).toStrictEqual({
        select_at: false,
        select_children: false,
        select_parents: true,
        parents_depth: null,
        children_depth: null,
        selector_type: 'metric',
        selector_value: 'a',
        raw: '+metric:a',
    });
})

test("Test parsing specs (scoped fqn)", () => {
    expect(
        selectors.parseSpec('a.b.c+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        parents_depth: null,
        children_depth: null,
        selector_type: 'implicit',
        selector_value: 'a.b.c',
        raw: 'a.b.c+',
    });
})

test("Test set based selectors", () => {
    expect(
        selectors.parseSpecs('a,b c')
    ).toStrictEqual([
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    selector_type: 'implicit',
                    selector_value: 'a',
                    raw: 'a',
                },
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    selector_type: 'implicit',
                    selector_value: 'b',
                    raw: 'b',
                }
            ]
        },
        {
            method: 'none',
            selectors: [
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    selector_type: 'implicit',
                    selector_value: 'c',
                    raw: 'c',
                }
            ]
        },
    ]);
})

test("Test set based selectors (complicated)", () => {
    expect(
        selectors.parseSpecs('2+tag:a,source:b.c mypackage fqn:a.b.c,tag:mytag+')
    ).toStrictEqual([
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_parents: true,
                    parents_depth: 2,
                    children_depth: null,
                    select_children: false,
                    selector_type: 'tag',
                    selector_value: 'a',
                    raw: '2+tag:a'
                },
                {
                    select_at: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    select_children: false,
                    selector_type: 'source',
                    selector_value: 'b.c',
                    raw: 'source:b.c'
                },
            ]
        },
        {
            method: 'none',
            selectors: [
                {
                    select_at: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    select_children: false,
                    selector_type: 'implicit',
                    selector_value: 'mypackage',
                    raw: 'mypackage'
                },
            ]
        },
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    select_children: false,
                    selector_type: 'fqn',
                    selector_value: 'a.b.c',
                    raw: 'fqn:a.b.c'
                },
                {
                    select_at: false,
                    select_parents: false,
                    parents_depth: null,
                    children_depth: null,
                    select_children: true,
                    selector_type: 'tag',
                    selector_value: 'mytag',
                    raw: 'tag:mytag+'
                },
            ]
        },
    ]);
})

test("Test parsing invalid spec", () => {
    expect(
        selectors.parseSpec('@a+')
    ).toStrictEqual({
        children_depth: null,
        parents_depth: null,
        raw: "@a+",
        select_at: true,
        select_children: true,
        select_parents: false,
        selector_type: 'implicit',
        selector_value: 'a'
    })
})


test("Test applying selector specs", () => {
    var lookup = {
        a: {matched: [1], selected: [1]},
        b: {matched: [2], selected: [2]},
        c: {matched: [3], selected: [3]},
    }

    expect(
        selectors.applySpec('a b c', (el) => lookup[el.raw])
    ).toStrictEqual({
        matched: [1,2,3],
        selected: [1,2,3],
    })
})

test("Test applying selector specs with intersection", () => {
    var lookup = {
        a: {matched: [1,2], selected: [1,2]},
        b: {matched: [2,3], selected: [2,3]},
        c: {matched: [3], selected: [3]}
    }

    expect(
        selectors.applySpec('a,b c', (el) => lookup[el.raw])
    ).toStrictEqual({
        matched: [2, 3],
        selected: [2, 3]
    })
})

test("Test parsing specs", () => {
    expect(
        selectors.buildSpec(
            "a,tag:b+ c",
            "d",
            1
        )
    ).toStrictEqual({
        include: [
            {
                method: 'intersect',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        parents_depth: null,
                        children_depth: null,
                        select_children: false,
                        selector_type: 'implicit',
                        selector_value: 'a',
                        raw: 'a'
                    },
                    {
                        select_at: false,
                        select_parents: false,
                        parents_depth: null,
                        children_depth: null,
                        select_children: true,
                        selector_type: 'tag',
                        selector_value: 'b',
                        raw: 'tag:b+'
                    }
                ]
            },
            {
                method: 'none',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        parents_depth: null,
                        children_depth: null,
                        select_children: false,
                        selector_type: 'implicit',
                        selector_value: 'c',
                        raw: 'c'
                    },
                ]
            }
        ],
        exclude: [
            {
                method: 'none',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        parents_depth: null,
                        children_depth: null,
                        select_children: false,
                        selector_type: 'implicit',
                        selector_value: 'd',
                        raw: 'd'
                    },
                ]
            }
        ],
        hops: 1
    })
})
