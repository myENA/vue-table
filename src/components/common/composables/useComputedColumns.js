import { computed } from 'vue-demi';

export default ({ columns, opts, data }) => {
  const allColumns = computed(() => {
    const columnsCopy = columns.slice();
    const a = 1;
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
