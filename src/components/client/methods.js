import { computed, watch, onMounted } from 'vue';
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

const useSort = (props, state, opts) => {
  const sortBy = obj =>
    setSort(obj, props.columns, opts.value.sortable, state);

  onMounted(() => {
    if (opts.value.sortBy) {
      sortBy(opts.value.sortBy);
    }
  });
  return {
    sortBy,
  };
};

const useSelect = (data, filteredData, state, opts, context) => {
  const selectAll = () => {
    const selectableRows = filteredData.reduce((acc, d) => {
      if (d.showSelect) {
        acc.push(d[opts.value.uniqueKey]);
      }
      return acc;
    }, []);
    if (state.allSelected) {
      state.selectedRows = difference(state.selectedRows, selectableRows);
    } else {
      state.selectedRows = union(state.selectedRows, selectableRows);
    }
  };
  const setAllSelected = () => {
    if (state.selectedRows.length === 0) {
      state.allSelected = false;
    } else {
      state.allSelected = filteredData.filter(d => d.showSelect).length ===
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
        const idx = state.selectedRows.indexOf(entry[opts.value.uniqueKey]);
        state.selectedRows.splice(idx, 1);
      } else {
        state.selectedRows.push(entry[opts.value.uniqueKey]);
      }
    }
  };

  const selectedRowIds = computed(() =>
    state.selectedRows.reduce((obj, id) => ({ ...obj, [id]: true }), {}));

  watch(data, () => {
    state.selectedRows = data.reduce((acc, d) => {
      if (d.showSelect && d.selected) {
        acc.push(d[opts.value.uniqueKey]);
      }
      return acc;
    }, []);
  });


  watch(filteredData, () => {
    setAllSelected();
  });

  watch(state.selectedRows, () => {
    setAllSelected();
    const selected = state.selectedRows.reduce((acc, id) => {
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

const useGroups = (pageData, shown, opts) => {
  const toggleGroup = (key) => {
    shown[key] = typeof shown[key] === 'undefined' ? false : !shown[key];
  };

  const collapseAllGroups = computed(() => opts.value.collapseAllGroups);

  watch(collapseAllGroups, () => {
    Object.keys(shown).forEach((key) => {
      shown[key] = !collapseAllGroups.value;
    });
  });

  watch(pageData, () => {
    Object.keys(pageData.value).forEach((group) => {
      pageData.value[group].forEach((row) => {
        shown[row[opts.value.groupBy]] =
          typeof shown[row[opts.value.groupBy]] === 'undefined' ?
            !collapseAllGroups.value :
            shown[row[opts.value.groupBy]];
      });
    });
  });

  return {
    shown,
    toggleGroup,
  };
};

export { usePagination, useSort, useSelect, useFilter, useGroups };
