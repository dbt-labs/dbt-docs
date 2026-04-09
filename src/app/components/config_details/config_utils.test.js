const { isEmptyValue, isSimpleArray, toEntry, toEntries } = require('./config_utils');

describe('config_utils', function() {

    describe('isEmptyValue', function() {
        it('returns true for null', function() {
            expect(isEmptyValue(null)).toBe(true);
        });

        it('returns true for undefined', function() {
            expect(isEmptyValue(undefined)).toBe(true);
        });

        it('returns true for empty array', function() {
            expect(isEmptyValue([])).toBe(true);
        });

        it('returns true for empty object', function() {
            expect(isEmptyValue({})).toBe(true);
        });

        it('returns false for non-empty string', function() {
            expect(isEmptyValue('hello')).toBe(false);
        });

        it('returns false for zero', function() {
            expect(isEmptyValue(0)).toBe(false);
        });

        it('returns false for false', function() {
            expect(isEmptyValue(false)).toBe(false);
        });

        it('returns false for non-empty array', function() {
            expect(isEmptyValue([1])).toBe(false);
        });

        it('returns false for non-empty object', function() {
            expect(isEmptyValue({ a: 1 })).toBe(false);
        });
    });

    describe('isSimpleArray', function() {
        it('returns true for array of strings', function() {
            expect(isSimpleArray(['a', 'b'])).toBe(true);
        });

        it('returns true for array of numbers', function() {
            expect(isSimpleArray([1, 2])).toBe(true);
        });

        it('returns true for mixed primitives', function() {
            expect(isSimpleArray(['a', 1, true])).toBe(true);
        });

        it('returns false for array containing objects', function() {
            expect(isSimpleArray([{ a: 1 }])).toBe(false);
        });

        it('returns true for empty array', function() {
            expect(isSimpleArray([])).toBe(true);
        });
    });

    describe('toEntry', function() {
        it('creates scalar entry for string', function() {
            expect(toEntry('key', 'value')).toEqual({
                key: 'key', value: 'value', type: 'scalar'
            });
        });

        it('creates scalar entry for number', function() {
            expect(toEntry('count', 42)).toEqual({
                key: 'count', value: 42, type: 'scalar'
            });
        });

        it('creates scalar entry for boolean', function() {
            expect(toEntry('enabled', true)).toEqual({
                key: 'enabled', value: true, type: 'scalar'
            });

            expect(toEntry('enabled', false)).toEqual({
                key: 'enabled', value: false, type: 'scalar'
            });
        });

        it('creates simple array entry', function() {
            var result = toEntry('tags', ['a', 'b']);
            expect(result.type).toBe('array');
            expect(result.isSimpleArray).toBe(true);
            expect(result.value).toEqual(['a', 'b']);
        });

        it('creates complex array entry', function() {
            var result = toEntry('items', [{ name: 'x' }]);
            expect(result.type).toBe('array');
            expect(result.isSimpleArray).toBe(false);
            expect(result.value[0].type).toBe('object');
        });

        it('creates object entry', function() {
            var result = toEntry('contract', { enforced: true });
            expect(result.type).toBe('object');
            expect(result.entries).toEqual([
                { key: 'enforced', value: true, type: 'scalar' }
            ]);
        });
    });

    describe('toEntries', function() {
        it('filters out null values', function() {
            var result = toEntries({ a: 'x', b: null, c: 'y' });
            expect(result.map(function(e) { return e.key; })).toEqual(['a', 'c']);
        });

        it('filters out empty objects', function() {
            var result = toEntries({ a: 'x', b: {} });
            expect(result.map(function(e) { return e.key; })).toEqual(['a']);
        });

        it('filters out empty arrays', function() {
            var result = toEntries({ a: 'x', b: [] });
            expect(result.map(function(e) { return e.key; })).toEqual(['a']);
        });

        it('sorts priority keys first', function() {
            var result = toEntries({
                on_schema_change: 'ignore',
                materialized: 'view',
                enabled: true,
                alias: 'foo'
            });
            var keys = result.map(function(e) { return e.key; });
            expect(keys).toEqual(['materialized', 'enabled', 'alias', 'on_schema_change']);
        });

        it('sorts non-priority keys alphabetically', function() {
            var result = toEntries({ zebra: 1, apple: 2 });
            var keys = result.map(function(e) { return e.key; });
            expect(keys).toEqual(['apple', 'zebra']);
        });

        it('handles nested objects', function() {
            var result = toEntries({
                contract: { enforced: false },
                docs: { show: true, node_color: 'crimson' }
            });
            expect(result.length).toBe(2);
            expect(result[0].type).toBe('object');
            expect(result[0].entries[0].key).toBe('enforced');
            expect(result[1].entries.map(function(e) { return e.key; })).toEqual(['node_color', 'show']);
        });

        it('returns empty array for empty object', function() {
            expect(toEntries({})).toEqual([]);
        });

        it('preserves boolean false as value', function() {
            var result = toEntries({ enforced: false });
            expect(result[0].value).toBe(false);
        });

        it('preserves zero as value', function() {
            var result = toEntries({ count: 0 });
            expect(result[0].value).toBe(0);
        });
    });
});
