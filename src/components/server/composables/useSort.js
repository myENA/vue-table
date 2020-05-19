import { onMounted, ref } from 'vue';
import { setSort } from '@/components/common/methods';

const useSort = (props, opts) => {
  const sortKey = ref('');
  const sortOrders = ref(props.columns.reduce((orders, col) => ({ ...orders, [col]: null }), {}));

  const sortBy = obj =>
    setSort(obj, props.columns, opts.value.sortable, { sortKey, sortOrders });

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

export default useSort;
