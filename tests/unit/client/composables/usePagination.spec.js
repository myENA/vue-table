import { reactive, ref } from 'vue';
import usePagination from '@/components/client/composables/usePagination';
import '../../setup';

describe('Client composables', () => {
  describe('#usePagination', () => {
    it('returns methods', () => {
      const { ctx } = { ctx: { emit() {} } };
      const state = reactive({
        currentPage: 1,
        perPage: 10,
      });
      const filteredData = ref([]);
      const use = usePagination(ctx, state, filteredData);

      expect(use.paginate).toBeDefined();
      expect(use.resetCurrentPage).toBeDefined();
    });
    describe('#paginate', () => {
      it('sets values', () => {
        const { ctx } = { ctx: { emit() { } } };
        const state = reactive({
          currentPage: 1,
          perPage: 10,
        });
        const filteredData = ref([]);
        const use = usePagination(ctx, state, filteredData);
        use.paginate({ currentPage: 2, perPage: 5 });
        expect(state.currentPage).toBe(2);
        expect(state.perPage).toBe(5);
        // TODO test event and fn calls
      });
    });
  });
});
