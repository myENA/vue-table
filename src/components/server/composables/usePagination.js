
import { ref, watch } from 'vue';

const usePagination = (defaultPerPage) => {
  const currentPage = ref(1);
  const perPage = ref(defaultPerPage);

  const getFirstPage = () => {
    currentPage.value = 1;
  };

  const paginate = (p) => {
    currentPage.value = p.currentPage;
    perPage.value = p.perPage;
  };

  return {
    currentPage,
    perPage,
    paginate,
    getFirstPage,
  };
};

export default usePagination;
