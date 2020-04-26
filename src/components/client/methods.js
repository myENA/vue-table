import { computed, watch, onMounted, ref } from 'vue';
import { union, difference } from 'ramda';
import { setSort } from '@/components/common/methods';

const usePagination = (context, state, filteredData) => {
  const paginate = ({ currentPage, perPage }) => {
    state.currentPage = currentPage;
    state.perPage = perPage;
    context.emit('paginate', {
      currentPage,
      perPage,
      pageData: state.pageData,
    });
  };

  const resetCurrentPage = () => {
    // go to last page if current page is no longer valid
    const lastPage = Math.max(1, Math.ceil(state.totalRows / state.perPage));
    if (lastPage < state.currentPage) {
      state.currentPage = lastPage;
    }
  };

  watch(filteredData, () => {
    resetCurrentPage();
  });

  return {
    paginate,
    resetCurrentPage,
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

const useSelect = (data, filteredData, opts, context) => {
  const allSelected = ref(false);
  const selectedRows = ref([]);
  const selectAll = () => {
    const selectableRows = filteredData.reduce((acc, d) => {
      if (d.showSelect) {
        acc.push(d[opts.value.uniqueKey]);
      }
      return acc;
    }, []);
    if (allSelected.value) {
      selectedRows.value = difference(selectedRows.value, selectableRows);
    } else {
      selectedRows.value = union(selectedRows.value, selectableRows);
    }
  };
  const setAllSelected = () => {
    if (selectedRows.value.length === 0) {
      allSelected.value = false;
    } else {
      allSelected.value = filteredData.filter(d => d.showSelect).length ===
        filteredData.filter(d => d.selected).length;
    }
  };
  const isColumnNonSelectable = column =>
    opts.value.nonSelectableColumns.includes(column) || column === 'actions';
  const isColumnSelectable = (entry, column) =>
    opts.value.editable && entry.showSelect && !isColumnNonSelectable(column);
  const toggleSelected = (entry, column) => {
    if (isColumnSelectable(entry, column)) {
      if (entry.selected) {
        const idx = selectedRows.value.indexOf(entry[opts.value.uniqueKey]);
        selectedRows.value.splice(idx, 1);
      } else {
        selectedRows.value.push(entry[opts.value.uniqueKey]);
      }
    }
  };

  const selectedRowIds = computed(() =>
    selectedRows.value.reduce((obj, id) => ({ ...obj, [id]: true }), {}));

  watch(data, () => {
    selectedRows.value = data.reduce((acc, d) => {
      if (d.showSelect && d.selected) {
        acc.push(d[opts.value.uniqueKey]);
      }
      return acc;
    }, []);
  });

  watch(filteredData, () => {
    setAllSelected();
  });

  watch(selectedRows.value, () => {
    setAllSelected();
    const selected = selectedRows.value.reduce((acc, id) => {
      // eslint-disable-next-line
      acc[id] = true;
      return acc;
    }, {});
    const selectedData = data.reduce((agg, row) => {
      if (row.showSelect) {
        const selectedRow = selected[row[opts.uniqueKey]] || false;
        Object.assign(row, {
          selected: !!selectedRow,
        });
        if (selectedRow) {
          agg.push(row);
        }
      }
      return agg;
    }, []);
    context.emit('selectedRows', selectedData);
  });

  return {
    selectAll,
    isColumnNonSelectable,
    isColumnSelectable,
    toggleSelected,
    setAllSelected,
    selectedRowIds,
    selectedRows,
    allSelected,
  };
};

const getFilterForData = ({ searchFields, someMatch, everyMatch, filter }) =>
  row =>
    everyMatch.every(key => searchFields[key](row, key, filter)) &&
    (someMatch.length === 0 || someMatch.some(key =>
      String(row[key]).toLowerCase().indexOf(filter.keyword) > -1));


const useFilter = (computedData, computedFilter, state, opts) => {
  const hasSearchFields = computed(() => Object.values(opts.value.search).some(v => v === true));
  const getFilter = (mFilter, searchBy) => {
    let { keyword = '' } = mFilter;
    if (!keyword) {
      keyword = searchBy;
    }
    keyword = keyword.toLowerCase();
    return { ...mFilter, keyword };
  };

  const getSomeMatchFields = searchFields =>
    Object.keys(searchFields).reduce((fields, key) => {
      if (searchFields[key] === true) {
        fields.push(key);
      }
      return fields;
    }, []);

  const getEveryMatchFields = searchFields => Object.keys(searchFields).reduce((fields, key) => {
    if (typeof searchFields[key] === 'function') {
      fields.push(key);
    }
    return fields;
  }, []);

  const search = (value) => {
    state.searchBy = value;
  };

  const filteredData = computed(() => {
    const normalizedFilter = getFilter(computedFilter.value, state.searchBy);
    // at least one of the fields with "true" should match the record
    const someMatch = getSomeMatchFields(opts.value.search);
    // every other "function" field should match the function
    const everyMatch = getEveryMatchFields(opts.value.search);
    if (someMatch.length === 0 && everyMatch.length === 0) {
      return computedData.value;
    }
    return computedData.value.filter(getFilterForData({
      searchFields: opts.value.search,
      someMatch,
      everyMatch,
      filter: normalizedFilter,
    }));
  });

  return {
    hasSearchFields,
    filteredData,
    search,
  };
};

const useGroups = (pageData, opts) => {
  const shown = ref({});

  const toggleGroup = (key) => {
    shown.value[key] = typeof shown.value[key] === 'undefined' ? false : !shown.value[key];
  };
  const isShown = key => typeof shown.value[key] === 'undefined' || shown.value[key];

  const collapseAllGroups = computed(() => opts.value.collapseAllGroups);

  watch(collapseAllGroups, () => {
    Object.keys(shown.value).forEach((key) => {
      shown.value[key] = !collapseAllGroups.value;
    });
  });

  watch(pageData, () => {
    Object.keys(pageData.value).forEach((group) => {
      pageData.value[group].forEach((row) => {
        shown.value[row[opts.value.groupBy]] =
          typeof shown.value[row[opts.value.groupBy]] === 'undefined' ?
            !collapseAllGroups.value :
            shown.value[row[opts.value.groupBy]];
      });
    });
  });

  return {
    shown,
    isShown,
    toggleGroup,
  };
};

export { usePagination, useSort, useSelect, useFilter, useGroups };
