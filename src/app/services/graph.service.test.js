/**
 * @jest-environment jsdom
 */

'use strict';
global.mocha = true;

const _ = require('underscore')
const angular = require('angular');
Object.defineProperty(window, 'angular', { value: angular });
require('angular');
require('angular-mocks');
require('../index.module');
require('./graph.service')
const selectMethods = require('./selector_methods');

describe('dbt.graph', () => {
  describe('grouping', () => {
    var mockSelectOptions;
    var mockProject;
    beforeEach(() => {
      mockSelectOptions = {
        'include': '',
        'exclude': '',
        'packages': ['jaffle_shop'],
        'tags': [null, 'staging', 'extra'],
        'resource_types': ['model'],
      }
      mockProject = {
        'nodes': {
          'my_model': {
            unique_id: '1',
            path: 'my_model.yml',
            resource_type: 'model',
            tags: [],
            package_name: 'jaffle_shop',
          },
          'stg_model': {
            unique_id: '2',
            path: 'stg.yml',
            resource_type: 'model',
            tags: ['staging'],
            package_name: 'jaffle_shop',
          },
          'stg_model_2': {
            unique_id: '3',
            path: 'stg.yml',
            resource_type: 'model',
            tags: ['staging', 'extra'],
            package_name: 'jaffle_shop',
          }
        },
      };
      angular.mock.module('dbt');
      angular.mock.module(function($provide) {
        $provide.service('selectorService', function() {
          return {
            selectNodes: selectMethods.selectNodes,
          };
        });
        $provide.service('project', function() {
          return {
            ready: (cb) => { cb(mockProject);},
          };
        });
        $provide.service('locationService', function() {
            return {
              setState: (spec) => { },
            };
        });
      });
    });

    var _graph;
    beforeEach(inject((graph) => {
      _graph = graph;
    }))

    function expectGroups(groups, elements) {
      expect(_.chain(elements)
        .filter((el) => { return el.is_group == "true" })
        .map((el) => { return el.data.id })
        .union(groups)
        .value()
        .length).toEqual(groups.length)
    }

    test("adds no nodes with default select", () => {
      _graph.updateGraph(mockSelectOptions);
      expect(_graph.graph.elements.length).toEqual(3);
    });

    test("creates group nodes first", () => {
      _graph.updateGraph(
        _.assign(mockSelectOptions, {'grouping': [{ 'type': 'data', 'value': 'path'} ]})
        );
      expect(_graph.graph.elements[0].data.is_group).toEqual("true");
    });

    test("creates path nodes and parents", () => {
      const expectedGroups = ['path: my_model.yml', 'path: stg.yml'];
      _graph.updateGraph(
        _.assign(mockSelectOptions, {'grouping': [{ 'type': 'data', 'value': 'path'} ]})
        );
      expectGroups(expectedGroups, _graph.graph.elements);
      expect(_graph.graph.elements.length).toEqual(Object.keys(mockProject.nodes).length + expectedGroups.length);
    });

    test("creates tag nodes and parents", () => {
      const expectedGroups = ['tag: staging'];
      _graph.updateGraph(
        _.assign(mockSelectOptions, {'grouping': [{ 'type': 'tag', 'value': 'staging'}]})
        );
      expectGroups(expectedGroups, _graph.graph.elements);
      expect(_graph.graph.elements.length).toEqual(Object.keys(mockProject.nodes).length + expectedGroups.length);
    });
  });
});