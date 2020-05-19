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

export { setSort };
