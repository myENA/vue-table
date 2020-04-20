import { onMounted } from 'vue';

const useLoad = (props, state, opts) => {
  const loadData = async () => {
    const params = {
      [opts.value.params.page]: state.currentPage,
      [opts.value.params.per_page]: state.perPage,
    };
    let direction;
    if (state.sortOrders[state.sortKey] === 'ascending') {
      direction = 1;
    } else if (state.sortOrders[state.sortKey] === 'descending') {
      direction = -1;
    } else {
      direction = 0;
      state.sortKey = undefined;
    }
    if (state.sortKey) {
      Object.assign(params, {
        [opts.value.params.sort_by]: state.sortKey,
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

const useSort = (state, opts, loadData) => {
  const sortBy = (obj) => {
    const { key, order } = obj;
    if (opts.value.sortable[key]) {
      state.sortKey = key;
      props.columns.forEach((elem) => {
        if (elem !== state.sortKey) {
          state.sortOrders[elem] = null;
        }
      });

      if (order) {
        state.sortOrders[key] = order;
      } else if (state.sortOrders[key] === null) {
        state.sortOrders[key] = 'ascending';
      } else if (state.sortOrders[key] === 'ascending') {
        state.sortOrders[key] = 'descending';
      } else {
        state.sortOrders[key] = null;
      }
      loadData();
    }
  };

  onMounted(() => {
    if (opts.value.sortBy) {
      sortBy(opts.value.sortBy);
    }
  });
  return {
    sortBy,
  };
};

export { useLoad, usePagination, useSort };
