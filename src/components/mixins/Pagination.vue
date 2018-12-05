<template>
  <div>
    <ul :class="[$style.pagination, classes.wrapper]">
      <li :class="{
          [$style.disabled]: currentPageValue === 1,
          disabled: currentPageValue === 1
        }">
        <a href="#"
          :aria-label="text.first || 'First'"
          :title="text.first || 'First'"
          @click.prevent="goToPage(1)">
          <span aria-hidden="true"><i
            :class="classes.first"
            ></i></span>{{text.first}}</a>
      </li>
      <li :class="{
          [$style.disabled]: currentPageValue === 1,
          disabled: currentPageValue === 1
        }">
        <a href="#"
          :aria-label="text.previous || 'Previous'"
          :title="text.previous || 'Previous'"
          @click.prevent="goToPage(currentPageValue-1)">
          <span aria-hidden="true"><i
            :class="classes.prev"
            ></i></span>{{text.prev}}</a>
      </li>
      <li v-for="page in pagesToShow"
        :key="page"
        :class="{
            [$style.active]: page === currentPageValue,
            active: page === currentPageValue,
          }">
        <a href="#" @click.prevent="goToPage(page)">{{page}}</a>
      </li>
      <li :class="{
          [$style.disabled]: currentPageValue === totalPages || totalPages === 0,
          disabled: currentPageValue === totalPages || totalPages === 0
        }">
        <a href="#"
          :aria-label="text.next || 'Next'"
          :title="text.next || 'Next'"
          @click.prevent="goToPage(currentPageValue+1)">{{text.next}}<span
            aria-hidden="true"><i :class="classes.next"></i></span>
        </a>
      </li>
      <li :class="{
          [$style.disabled]: currentPageValue === totalPages || totalPages === 0,
          disabled: currentPageValue === totalPages || totalPages === 0
        }">
        <a href="#"
          :aria-label="text.last || 'Last'"
          :title="text.last || 'Last'"
          @click.prevent="goToPage(totalPages)">{{text.last}}<span
            aria-hidden="true"><i :class="classes.last"></i></span>
        </a>
      </li>
    </ul>
    <div :class="[$style.info, classes.info]">
      <div v-if="totalRows">
        <span>
          {{text.info.showing | format(startRow+1, endRow, totalRows)}}
        </span>
        <select v-model="perPageValue"
          :class="[$style.perPageSelector, classes.formControl]">
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
      <div v-else >
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
      default: 9,
    },
    totalRows: {
      type: Number,
      required: true,
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
      let startPage = Math.max(1, this.currentPageValue - halfInterval);
      let endPage = Math.min(this.totalPages, this.currentPageValue + halfInterval);
      if (this.totalPages <= this.pageInterval) {
        startPage = 1;
        endPage = this.totalPages;
      } else {
        while (endPage - startPage < this.pageInterval - 1) {
          // stabilize the interval
          endPage = Math.min(this.totalPages, startPage + this.pageInterval - 1);
          startPage = Math.max(1, endPage - this.pageInterval + 1);
        }
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
    currentPageValue() {
      this.currentPageValue = this.currentPage;
    },
  },
  created() {
    this.paginate();
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
