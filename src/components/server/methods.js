import { onMounted, ref, watch } from 'vue';
import { setSort } from '@/components/common/methods';

const useLoad = (props, opts, { currentPage, perPage }, { sortOrders, sortKey }) => {
  const loading = ref(true);
  const data = ref([]);
  const totalRows = ref(0);

  const loadData = async () => {
    loading.value = true;
    const params = {
      [opts.value.params.page]: currentPage.value,
      [opts.value.params.per_page]: perPage.value,
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
      data.value = responseData;
      totalRows.value = total;
    } catch (e) {
      data.value = [];
      totalRows.value = 0;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  watch(sortOrders, loadData, {
    deep: true,
  });
  watch(currentPage, loadData);
  watch(perPage, loadData);

  return {
    loadData,
    loading,
    data,
    totalRows,
  };
};

const usePagination = (defaultPerPage) => {
  const currentPage = ref(1);
  const perPage = ref(defaultPerPage);

  const getFirstPage = () => {
    currentPage.value = 1;
  };

  const paginate = (p) => {
    currentPage.value = p.currentPage;
    perPage.value = p.perPage;
  };

  return {
    currentPage,
    perPage,
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
