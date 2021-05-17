import { ref, onMounted } from 'vue-demi';
import { setSort } from '@/components/common/methods';

export default (props, opts) => {
  const sortKey = ref('');
  const sortOrders = ref(props.columns.reduce((orders, col) => ({ ...orders, [col]: null }), {}));

  const sortBy = (obj) => setSort(obj, props.columns, opts.value.sortable, { sortKey, sortOrders });

  onMounted(() => {
    if (opts.value.sortBy) {
      sortBy(opts.value.sortBy);
    }
  });

  return {
    sortKey,
    sortOrders,
    sortBy,
  };
};
