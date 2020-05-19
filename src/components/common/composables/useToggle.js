import { ref } from 'vue';

export default (context) => {
  const expandedRows = ref({});

  const toggleRow = (id) => {
    context.emit('toggleRow', id, expandedRows.value);
  };
  const isRowExpanded = (id) => expandedRows.value[id];

  return {
    toggleRow,
    isRowExpanded,
  };
};
