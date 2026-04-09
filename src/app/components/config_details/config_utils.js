'use strict';

var _ = require('underscore');

var PRIORITY_KEYS = ['materialized', 'enabled', 'schema', 'database', 'alias', 'tags', 'group'];

function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (_.isArray(value) && value.length === 0) return true;
    if (_.isObject(value) && !_.isArray(value) && _.isEmpty(value)) return true;
    return false;
}

function isSimpleArray(arr) {
    return _.every(arr, function(item) {
        return !_.isObject(item);
    });
}

function sortKeys(keys) {
    return keys.sort(function(a, b) {
        var aIdx = PRIORITY_KEYS.indexOf(a);
        var bIdx = PRIORITY_KEYS.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
    });
}

function toEntry(key, value) {
    if (_.isArray(value)) {
        if (isSimpleArray(value)) {
            return { key: key, value: value, type: 'array', isSimpleArray: true };
        }
        var children = _.map(value, function(item) {
            if (_.isObject(item)) {
                return { type: 'object', entries: toEntries(item) };
            }
            return { type: 'scalar', value: item };
        });
        return { key: key, value: children, type: 'array', isSimpleArray: false };
    }
    if (_.isObject(value)) {
        return { key: key, entries: toEntries(value), type: 'object' };
    }
    return { key: key, value: value, type: 'scalar' };
}

function toEntries(obj) {
    var keys = sortKeys(_.keys(obj));
    return _.chain(keys)
        .filter(function(k) { return !isEmptyValue(obj[k]); })
        .map(function(k) { return toEntry(k, obj[k]); })
        .value();
}

module.exports = {
    isEmptyValue: isEmptyValue,
    isSimpleArray: isSimpleArray,
    toEntry: toEntry,
    toEntries: toEntries
};
