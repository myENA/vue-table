import { expect } from 'chai';
import { setSort } from '@/components/common/methods';
import { ref } from 'vue';

describe('Common Methods', () => {
  describe('setSort', () => {
    it('throws for no arguments', () => {
      expect(setSort).to.throw(TypeError);
    });
    it('returns false for not found key', () => {
      expect(setSort({ key: 'a' }, [], {}, { })).to.be.false;
    });
    it('returns true for a found key', () => {
      expect(setSort({ key: 'a' }, ['a'], { a: true }, { sortKey: ref(''), sortOrders: ref({}) })).to.be.true;
    });
    it('sets sort to ascending if not previously set', () => {
      const sortKey = ref('');
      const sortOrders = ref({ a: null, b: 'ascending' });
      const columns = ['a', 'b'];
      const sortable = { a: true, b: true };

      setSort({ key: 'a' }, columns, sortable, { sortKey, sortOrders });
      expect(sortKey.value).to.eq('a');
      expect(sortOrders.value.a).to.eq('ascending');
      expect(sortOrders.value.b).to.eq(null);
    });
    it('sets sort to descending if previously set to ascending', () => {
      const sortKey = ref('');
      const sortOrders = ref({ a: 'ascending', b: null });
      const columns = ['a', 'b'];
      const sortable = { a: true, b: true };

      setSort({ key: 'a' }, columns, sortable, { sortKey, sortOrders });
      expect(sortKey.value).to.eq('a');
      expect(sortOrders.value.a).to.eq('descending');
      expect(sortOrders.value.b).to.eq(null);
    });
    it('resets sort if previously set to descending', () => {
      const sortKey = ref('');
      const sortOrders = ref({ a: 'descending', b: null });
      const columns = ['a', 'b'];
      const sortable = { a: true, b: true };

      setSort({ key: 'a' }, columns, sortable, { sortKey, sortOrders });
      expect(sortKey.value).to.eq('a');
      expect(sortOrders.value.a).to.eq(null);
      expect(sortOrders.value.b).to.eq(null);
    });
    it('sets sort to the value sent', () => {
      const sortKey = ref('');
      const sortOrders = ref({ a: 'descending', b: null });
      const columns = ['a', 'b'];
      const sortable = { a: true, b: true };

      setSort({ key: 'a', order: 'ascending' }, columns, sortable, { sortKey, sortOrders });
      expect(sortKey.value).to.eq('a');
      expect(sortOrders.value.a).to.eq('ascending');
      expect(sortOrders.value.b).to.eq(null);
    });
  });
});
