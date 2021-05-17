import { watch } from 'vue-demi';

export default (context, state, filteredData) => {
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
