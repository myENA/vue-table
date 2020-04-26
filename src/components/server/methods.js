import { onMounted, ref, watch } from 'vue';
import { setSort } from '@/components/common/methods';

const useLoad = (props, state, opts, { sortOrders, sortKey }) => {
  const loadData = async () => {
    const params = {
      [opts.value.params.page]: state.currentPage,
      [opts.value.params.per_page]: state.perPage,
    };
    let direction;
    let sortBy = sortKey.value;
    if (sortOrders.value[sortBy] === 'ascending') {
      direction = 1;
    } else if (sortOrders.value[sortBy] === 'descending') {
      direction = -1;
    } else {
      direction = 0;
      sortBy = undefined;
    }
    if (sortBy) {
      Object.assign(params, {
        [opts.value.params.sort_by]: sortBy,
        [opts.value.params.sort_dir]: direction,
      });
    }
    try {
      const {
        data: responseData,
        total,
      } = props.parse(await props.fetchData(props.url, params));
      state.data = responseData;
      state.totalRows = total;
    } catch (e) {
      state.data = [];
      state.totalRows = 0;
      throw e;
    } finally {
      state.loading = false;
    }
  };

  watch(sortOrders, loadData, {
    deep: true,
  });

  return {
    loadData,
  };
};

const usePagination = (state, loadData) => {
  const getFirstPage = () => {
    state.currentPage = 1;
    loadData();
  };

  const paginate = (p) => {
    state.currentPage = p.currentPage;
    state.perPage = p.perPage;
    loadData();
  };

  return {
    paginate,
    getFirstPage,
  };
};

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

export { useLoad, usePagination, useSort };
