import { ref, watch, computed } from 'vue';

const useLoad = (props, opts, { currentPage, perPage }, { sortOrders, sortKey }) => {
  const loading = ref(true);
  const pollLoading = ref(false);
  const data = ref([]);
  const totalRows = ref(0);

  const isLoading = computed(() => (props.polling ? pollLoading.value : loading.value));
  const loadingOverride = computed(() => props.loadingOverride);

  const updateLoading = (show, value) => {
    if (props.polling && show) {
      pollLoading.value = value;
    } else {
      loading.value = value;
    }
  };

  const loadData = async (showPollLoading = false) => {
    updateLoading(showPollLoading, true);
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
      updateLoading(showPollLoading, false);
    }
  };

  watch(sortOrders, () => loadData(true), {
    deep: true,
  });
  watch(currentPage, () => loadData(true));
  watch(perPage, () => loadData(true));
  watch(loadingOverride, () => {
    pollLoading.value = props.loadingOverride;
  });

  return {
    loadData,
    isLoading,
    data,
    totalRows,
  };
};

export default useLoad;
