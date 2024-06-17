const proj_utils = require('./project_service_utils')

describe('Project Service Tests', () => {
  describe('assignSearchRelevance', () => {
    let results;

    beforeEach(() => {
      results = [
        { model: { name: 'dm_test', tags: ["dm", "test", "test model"], columns: {"id": {"name": "id"}}, raw_code: "SELECT test from test" }, overallWeight: 0, overallNameWeight: 0 },
        { model: { name: 'ft_test_person', tags: ["test", "ft", "person"], columns: {"id": {"name": "id"}}, raw_code: "SELECT test, test from test" }, overallWeight: 0, overallNameWeight: 0 },
        { model: { name: 'test_event', tags: ["test", "event"], columns: {"test": {"name": "test"}} , raw_code: "SELECT id from abc" }, overallWeight: 0, overallNameWeight: 0 },
        { model: { name: 'test_log', tags: ["test", "log"], overallWeight: 0, overallNameWeight: 0 }},
        { model: { name: 'test', tags: [], columns: {} }, overallWeight: 0, overallNameWeight: 0 },
        { model: { name: 'n/a', tags: [], columns: {} }, overallWeight: 0, overallNameWeight: 0 },
      ];
    });

    it('should prioritize exact name matches', () => {
      proj_utils.assignSearchRelevance(results, 'test');
      expect(results[0].model.name).toBe('test');
      expect(results[0].overallNameWeight).toBe(100);
      expect(results[0].overallWeight).toBe(100);

      expect(results[1].model.name).toBe('test_event');
      expect(results[1].overallNameWeight).toBe(50);
      expect(results[1].overallWeight).toBe(56);

      expect(results[2].model.name).toBe('test_log');
      expect(results[2].overallNameWeight).toBe(50);
      expect(results[2].overallWeight).toBe(55);

      expect(results[3].model.name).toBe('dm_test');
      expect(results[3].overallNameWeight).toBe(30);
      expect(results[3].overallWeight).toBe(44);

      expect(results[4].model.name).toBe('ft_test_person');
      expect(results[4].overallNameWeight).toBe(10);
      expect(results[4].overallWeight).toBe(21);
    });

  });
});
