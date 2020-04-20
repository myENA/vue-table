import { computed } from 'vue';

const useComputedColumns = ({ columns, opts, data }) => {
  const allColumns = computed(() => {
    const columnsCopy = columns.slice();
    if (!columns.includes('actions') && opts.value.detailsRow) {
      columnsCopy.push('actions');
    }
    return columnsCopy;
  });

  const colspan = computed(() => allColumns.value.length);

  const computedRowClasses = computed(() => data.map((row) => {
    const classes = {};
    Object.keys(opts.value.rowClasses).forEach((prop) => {
      if (row[prop]) {
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

const useToggle = (state, context) => ({
  toggleRow(id) {
    state.expandedRows[id] = !state.expandedRows[id];
    // state.expandedRows = Object.assign({}, state.expandedRows);
    context.emit('toggleRow', id, state.expandedRows);
  },
  isRowExpanded(id) {
    return state.expandedRows[id];
  },
  isShown(key) {
    return typeof state.shown[key] === 'undefined' || state.shown[key];
  },
});

export { useToggle, useComputedColumns };
