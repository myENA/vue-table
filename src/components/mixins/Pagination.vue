<template>
  <div>
    <ul :class="[$style.pagination, classes.wrapper]">
      <li :class="{
          [$style.disabled]: currentPageValue === 1,
          disabled: currentPageValue === 1
        }">
        <a href="#"
          :aria-label="text.previous || 'Previous'"
          :title="text.previous || 'Previous'"
          role="button"
          @keydown.space.prevent="currentPageValue !== 1 && goToPage(currentPageValue-1)"
          @click.prevent="currentPageValue !== 1 && goToPage(currentPageValue-1)">
          <span aria-hidden="true"><i
            :class="classes.prev"
            ></i></span>{{text.prev}}</a>
      </li>
      <li :class="{
        [$style.active]: 1 === currentPageValue,
        active: 1 === currentPageValue,
        }">
        <a href="#"
          aria-label="Page 1"
          title="Page 1"
          role="button"
          @keydown.space.prevent="goToPage(1)"
          @click.prevent="goToPage(1)">
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
          @keydown.space.prevent="goToPage(page)"
          @click.prevent="goToPage(page)">{{page}}</a>
      </li>
      <li v-if="endPage < totalPages - 1">
        <span>&hellip;</span>
      </li>
      <li v-if="totalPages > 1"
        :class="{
          [$style.active]: totalPages === currentPageValue,
          active: totalPages === currentPageValue,
        }">
        <a href="#"
          :aria-label="`Page ${totalPages}`"
          :title="`Page ${totalPages}`"
          role="button"
          @keydown.space.prevent="goToPage(totalPages)"
          @click.prevent="goToPage(totalPages)">{{totalPages}}
        </a>
      </li>
      <li :class="{
          [$style.disabled]: currentPageValue === totalPages || totalPages === 0,
          disabled: currentPageValue === totalPages || totalPages === 0
        }">
        <a href="#"
          :aria-label="text.next || 'Next'"
          :title="text.next || 'Next'"
          role="button"
          @keydown.space.prevent="(currentPageValue !== totalPages && totalPages !== 0) && goToPage(currentPageValue+1)"
          @click.prevent="(currentPageValue !== totalPages && totalPages !== 0) && goToPage(currentPageValue+1)">{{text.next}}
          <span aria-hidden="true"><i :class="classes.next"></i></span>
        </a>
      </li>
    </ul>
    <div :class="[$style.info, classes.info]">
      <div v-if="totalRows">
        <span>
          {{text.info.showing | format(startRow+1, endRow, totalRows)}}
        </span>
        <select v-model="perPageValue"
          :class="[$style.perPageSelector, classes.formControl]"
          aria-label="Number of records per page">
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
import filters from './filters';

export default {
  mixins: [filters],
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
  data() {
    return {
      perPageValue: this.perPage,
      currentPageValue: this.currentPage,
    };
  },
  computed: {
    pagesToShow() {
      const halfInterval = (this.pageInterval - 1) / 2;
      let startPage = Math.max(2, this.currentPageValue - halfInterval);
      let endPage = Math.min(this.totalPages - 1, this.currentPageValue + halfInterval);
      if (startPage + this.pageInterval - 1 > endPage) {
        endPage = Math.min(this.totalPages - 1, startPage + this.pageInterval - 1);
      }
      if (endPage - (this.pageInterval - 1)) {
        startPage = Math.max(2, endPage - (this.pageInterval - 1));
      }
      const pages = [];
      for (let i = startPage; i <= endPage; i += 1) {
        pages.push(i);
      }
      return pages;
    },
    totalPages() {
      return Math.ceil(this.totalRows / this.perPageValue);
    },
    startRow() {
      return (this.currentPageValue - 1) * this.perPageValue;
    },
    endRow() {
      return Math.min(this.startRow + this.perPageValue, this.totalRows);
    },
    startPage() {
      return this.pagesToShow[0];
    },
    endPage() {
      return this.pagesToShow[this.pagesToShow.length - 1];
    },
  },
  watch: {
    totalPages() {
      if (this.currentPageValue > this.totalPages) {
        // set the current page to the last page if the number of pages has been reduced below it
        this.currentPageValue = this.totalPages;
      } else if (!this.currentPageValue && this.totalPages) {
        // if there was no current page and then the number of pages was set, go to first page
        this.currentPageValue = 1;
      }
    },
    perPageValue() {
      this.paginate();
    },
    perPage() {
      this.perPageValue = this.perPage;
    },
    currentPage() {
      this.currentPageValue = this.currentPage;
    },
  },
  created() {
    if (!this.noPaginationOnCreate) {
      this.paginate();
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPageValue = page;
      }
      this.paginate();
    },
    paginate() {
      this.$emit('paginate', {
        currentPage: this.currentPageValue,
        perPage: this.perPageValue,
      });
    },
  },
};
</script>
