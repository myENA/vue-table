import { reactive, ref } from 'vue';
import { expect } from 'chai';
import usePagination from '@/components/client/composables/usePagination';

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

      expect(use.paginate).to.exist;
      expect(use.resetCurrentPage).to.exist;
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
        expect(state.currentPage).to.eq(2);
        expect(state.perPage).to.eq(5);
        // TODO test event and fn calls
      });
    });
  });
});
