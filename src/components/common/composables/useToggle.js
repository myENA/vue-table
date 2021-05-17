import { ref } from 'vue-demi';

export default (context) => {
  const expandedRows = ref({});

  const toggleRow = (id) => {
    expandedRows.value[id] = !expandedRows.value[id];
    context.emit('toggleRow', id, expandedRows.value);
  };
  const isRowExpanded = (id) => expandedRows.value[id];

  return {
    toggleRow,
    isRowExpanded,
  };
};
