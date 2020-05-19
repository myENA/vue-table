import { computed, watch, ref } from 'vue';
import { union, difference } from 'ramda';

export default (data, filteredData, opts, context) => {
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
      allSelected.value = filteredData.filter((d) => d.showSelect).length
        === filteredData.filter((d) => d.selected).length;
    }
  };
  const isColumnNonSelectable = (column) => opts.value.nonSelectableColumns.includes(column) || column === 'actions';
  const isColumnSelectable = (entry, column) => opts.value.editable && entry.showSelect && !isColumnNonSelectable(column);
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

  const selectedRowIds = computed(
    () => selectedRows.value.reduce((obj, id) => ({ ...obj, [id]: true }), {})
  );

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
