<template>
  <div>
    <ul :class="[$style.pagination, classes.wrapper]">
      <li :class="{
          [$style.disabled]: isFirstPage,
          disabled: isFirstPage
        }">
        <a href="#"
          :aria-label="text.previous || 'Previous'"
          :title="text.previous || 'Previous'"
          role="button"
          @keydown.space.prevent="!isFirstPage && goToPage(currentPageValue-1)"
          @click.prevent="!isFirstPage && goToPage(currentPageValue-1)">
          <span aria-hidden="true"><i
            :class="classes.prev"
            ></i></span>{{text.prev}}</a>
      </li>
      <li :class="{
        [$style.active]: isFirstPage,
        active: isFirstPage,
        }">
        <a href="#"
          aria-label="Page 1"
          title="Page 1"
          role="button"
          @keydown.space.prevent="goToPage(1)"
          @click.prevent="goToPage(1)"
          >
          1
        </a>
      </li>
      <li v-if="startPage > 2">
        <span>&hellip;</span>
      </li>
      <li v-for="page in pagesToShow"
        :key="page"
        :class="{
            [$style.active]: page === currentPageValue,
            active: page === currentPageValue,
          }">
        <a href="#"
          :aria-label="`Page ${page}`"
          :title="`Page ${page}`"
          role="button"
          @keydown.space.prevent="(page)"
          @click.prevent="goToPage(page)"
          >{{page}}</a>
      </li>
      <li v-if="endPage < totalPages - 1">
        <span>&hellip;</span>
      </li>
      <li v-if="totalPages > 1"
        :class="{
          [$style.active]: isLastPage,
          active: isLastPage,
        }">
        <a href="#"
          :aria-label="`Page ${totalPages}`"
          :title="`Page ${totalPages}`"
          role="button"
          @keydown.space.prevent="goToPage(totalPages)"
          @click.prevent="goToPage(totalPages)"
          >{{totalPages}}
        </a>
      </li>
      <li :class="{
          [$style.disabled]: isNextDisabled,
          disabled: isNextDisabled
        }">
        <a href="#"
          :aria-label="text.next || 'Next'"
          :title="text.next || 'Next'"
          role="button"
          @keydown.space.prevent="isNextEnabled && goToPage(currentPageValue+1)"
          @click.prevent="isNextEnabled && goToPage(currentPageValue+1)"
          >{{text.next}}<span
            aria-hidden="true"><i :class="classes.next"></i></span>
        </a>
      </li>
    </ul>
    <div :class="[$style.info, classes.info]">
      <div v-if="totalRows">
        <span>
          {{formatStr(text.info.showing, startRow+1, endRow, totalRows)}}
        </span>
        <select
          v-model="perPageValue"
          :class="[$style.perPageSelector, classes.formControl]"
          aria-label="Number of records per page"
          >
          <option
            v-for="perPageValue in perPageValues"
            :value="perPageValue"
            :key="perPageValue"
            >
            {{perPageValue}}
          </option>
        </select>
        <span>
          {{text.info.records}}
        </span>
      </div>
      <div v-else>
        <span>
          {{text.info.noRows}}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less" module>
.pagination {
  margin: 0px;
  > li > span,
  > li > span:hover,
  > li > span:focus {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  > li > span:hover,
  > li > span:focus {
    background-color: #fff;
  }
}
.info {
  .perPageSelector{
    margin-left: 10px;
    margin-right: 10px;
  }
  float: right;
}
</style>

<script>
import { reactive, toRefs, computed, watch } from 'vue';
import useFormatters from '@/components/common/formatters';

const calculatePages = (pageInterval, currentPageValue, totalPages) => {
  const halfInterval = (pageInterval - 1) / 2;
  let startPage = Math.max(2, currentPageValue - halfInterval);
  let endPage = Math.min(totalPages - 1, currentPageValue + halfInterval);
  if (startPage + pageInterval - 1 > endPage) {
    endPage = Math.min(totalPages - 1, startPage + pageInterval - 1);
  }
  if (endPage - (pageInterval - 1)) {
    startPage = Math.max(2, endPage - (pageInterval - 1));
  }
  const pages = [];
  for (let i = startPage; i <= endPage; i += 1) {
    pages.push(i);
  }
  return pages;
};

const computePages = (props, state) => {
  const totalPages = computed(() => Math.ceil(props.totalRows / state.perPageValue));
  const pagesToShow = computed(() => calculatePages(
    props.pageInterval,
    state.currentPageValue,
    totalPages.value
  ));

  const startPage = computed(() => pagesToShow[0]);
  const endPage = computed(() => pagesToShow[pagesToShow.length - 1]);
  const isFirstPage = computed(() => state.currentPageValue === 1);
  const isLastPage = computed(() => state.currentPageValue === totalPages.value);
  const isNextEnabled = computed(() => !isLastPage.value && totalPages.value !== 0);
  const isNextDisabled = computed(() => !isNextDisabled.value);

  return {
    totalPages,
    pagesToShow,
    startPage,
    endPage,
    isNextDisabled,
    isNextEnabled,
    isFirstPage,
    isLastPage,
  };
};

const usePagination = (props, context, state, totalPages) => {
  const paginate = () => {
    context.emit('paginate', {
      currentPage: state.currentPageValue,
      perPage: state.perPageValue,
    });
  };
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      state.currentPageValue = page;
    }
    paginate();
  };

  watch(totalPages, () => {
    if (state.currentPageValue > totalPages.value) {
      // set the current page to the last page if the number of pages has been reduced below it
      state.currentPageValue = totalPages.value;
    } else if (!state.currentPageValue && totalPages.value) {
      // if there was no current page and then the number of pages was set, go to first page
      state.currentPageValue = 1;
    }
  });
  return {
    paginate,
    goToPage,
  };
};

const computeRows = (props, state) => {
  const startRow = computed(() => (state.currentPageValue - 1) * state.perPageValue);
  const endRow = computed(() => Math.min(startRow.value + state.perPageValue, props.totalRows));
  return { startRow, endRow };
};

export default {
  props: {
    classes: {
      type: Object,
      default: () => ({}),
    },
    text: {
      type: Object,
      default: () => ({}),
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    perPage: {
      type: Number,
      default: 10,
    },
    perPageValues: {
      type: Array,
      default: () => ([1, 2, 5, 10, 20, 50]),
    },
    pageInterval: {
      type: Number,
      default: 7,
    },
    totalRows: {
      type: Number,
      required: true,
    },
    noPaginationOnCreate: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, context) {
    const state = reactive({
      perPageValue: props.perPage,
      currentPageValue: props.currentPage,
    });

    const { totalPages, ...restPages } = computePages(props, state);

    return {
      ...useFormatters(),
      ...toRefs(state),
      ...usePagination(props, context, state, totalPages),
      totalPages,
      ...restPages,
      ...computeRows(props, state),
    };
  },
  created() {
    if (!this.noPaginationOnCreate) {
      this.paginate();
    }
  },
};

export { calculatePages };
</script>
