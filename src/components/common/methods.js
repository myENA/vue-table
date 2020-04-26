import { computed, ref } from 'vue';

const useComputedColumns = ({ columns, opts, data }) => {
  const allColumns = computed(() => {
    const columnsCopy = columns.slice();
    if (!columns.includes('actions') && opts.value.detailsRow) {
      columnsCopy.push('actions');
    }
    return columnsCopy;
  });

  const colspan = computed(() => allColumns.value.length);

  const computedRowClasses = computed(() => data.value.map((row) => {
    const classes = {};
    Object.keys(opts.value.rowClasses).forEach((prop) => {
      if (row.value[prop]) {
        classes[opts.value.rowClasses[prop]] = true;
      }
    });
    return classes;
  }));

  return {
    allColumns,
    colspan,
    computedRowClasses,
  };
};

const useToggle = (context) => {
  const expandedRows = ref({});

  const toggleRow = (id) => {
    context.emit('toggleRow', id, expandedRows.value);
  };
  const isRowExpanded = id => expandedRows.value[id];

  return {
    toggleRow,
    isRowExpanded,
  };
};

const setSort = ({ key, order }, columns, sortable, { sortKey, sortOrders }) => {
  if (sortable[key]) {
    sortKey.value = key;
    columns.forEach((elem) => {
      if (elem !== sortKey.value) {
        sortOrders.value[elem] = null;
      }
    });

    if (order) {
      sortOrders.value[key] = order;
    } else if (sortOrders.value[key] === null) {
      sortOrders.value[key] = 'ascending';
    } else if (sortOrders.value[key] === 'ascending') {
      sortOrders.value[key] = 'descending';
    } else {
      sortOrders.value[key] = null;
    }
    return true;
  }
  return false;
};

export { useToggle, useComputedColumns, setSort };
