<template>
  <div>
    <slot name="filter">
      <div>
        <div class="row">
          <div class="col-md-2">
            <slot name="filters">
              <div class="form-group">
                <label>Search</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Search by keyword"
                    @input="search($event.target.value)" />
                  <span class="input-group-addon"><i class="fa fa-search"></i></span>
                </div>
              </div>
            </slot>
          </div>
          <div class="col-md-10">
            <div class="pull-right">
              <div class="form-group">
                <label>&nbsp;</label>
                <div>
                  <slot name="buttons"></slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </slot>
    <div :class="[opts.classes.wrapper, $style.wrapper]">
      <table :class="[opts.classes.table, $style.table]">
        <thead>
          <tr>
            <th v-for="key in columns" :key="key" @click="sortBy({key})"
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key }">
              <slot :name="'heading_' + key">
                <template v-if="key === 'select'">
                  <div :class="$style.checkbox">
                    <label>
                      <input class="check-all"
                        type="checkbox"
                        @change="selectAll"
                        :checked="allSelected" :disabled="!opts.editable"
                        />
                    </label>
                  </div>
                </template>
                <template v-else>
                  {{ key | heading(opts.headings) }}
                </template>
              </slot>
              <i v-if="opts.sortable[key]"
                :class="{
                  [opts.classes.sort.none] : sortKey !== key || sortOrders[key] === null,
                  [opts.classes.sort[sortOrders[key]]] : sortKey === key,
                }">
              </i>
            </th>
            <th v-if="opts.detailsRow">
              <slot name="heading_actions">
                Actions
              </slot>
            </th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr>
            <td class="msg-row" :colspan="colspan">
              <slot name="loading"><span v-html="opts.text.loading"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="data.length === 0">
          <tr>
            <td class="msg-row" :colspan="colspan">
              <slot name="no_data"><span v-html="opts.text.noData"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredData.length === 0">
          <tr>
            <td class="msg-row" :colspan="colspan">
              <slot name="empty_results"><span v-html="opts.text.emptyResults"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else v-for="(group, groupKey) in pageData" :key="groupKey">
          <tr v-if="groupKey !== 'all'">
            <th :colspan="colspan">
              <a href="#" @click.prevent="toggleGroup(groupKey)">
                <i :class="{
                  [opts.classes.group.hide]: isShown(groupKey),
                  [opts.classes.group.show]: !isShown(groupKey),
                }"></i>
              </a>
              <slot name="__group_meta" v-bind:data="opts.groupMeta[groupKey]">
                {{groupKey}}
              </slot>
            </th>
          </tr>
          <template v-for="(entry, index) in group">
            <tr
              v-if="isShown(groupKey)"
              :key="'row_'+entry[opts.uniqueKey]"
              :data-id="entry[opts.uniqueKey]"
              >
              <td v-for="key in columns" :key="'cell_'+key">
                <slot :name="'column_' + key" :row="entry">
                  <component v-if="opts.templates[key]" :is="opts.templates[key]"
                    :data="entry" :column="key" :index="index">
                  </component>
                  <template v-else-if="key === 'select'">
                    <div v-if="entry.showSelect" :class="$style.checkbox">
                      <label>
                        <input type="checkbox" name="selectedRows"
                          v-model="selectedRows" :disabled="!opts.editable"
                          :key="'select-'+entry[opts.uniqueKey]"
                          :value="entry[opts.uniqueKey]">
                      </label>
                    </div>
                  </template>
                  <template v-else>{{entry[key]}}</template>
                </slot>
              </td>
              <td v-if="opts.detailsRow">
                <slot name="column_actions_pre" :row="entry"></slot>
                <slot name="column_actions" :row="entry">
                  <a href="#" @click.prevent="toggleRow(entry[opts.uniqueKey])"
                    v-html="getToggleText(entry)">
                  </a>
                </slot>
                <slot name="column_actions_post" :row="entry"></slot>
              </td>
            </tr>
            <tr
              v-if="opts.detailsRow && isShown(groupKey)"
              v-show="isRowExpanded(entry[opts.uniqueKey])"
              :key="'details_row_'+entry[opts.uniqueKey]"
              :data-details="entry[opts.uniqueKey]"
              >
              <td :colspan="colspan">
                <slot name="details_row" :row="entry">
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot>
          <tr>
            <td :colspan="colspan">
              <ul :class="[$style.pagination, opts.classes.pagination.wrapper]">
                <li :class="{
                    [$style.disabled]: currentPage === 1,
                    disabled: currentPage === 1
                  }">
                  <a href="#"
                    :aria-label="opts.text.pagination.first || 'First'"
                    :title="opts.text.pagination.first || 'First'"
                    @click.prevent="goToPage(1)">
                    <span aria-hidden="true"><i
                      :class="opts.classes.pagination.first"
                      ></i></span>{{opts.text.pagination.first}}</a>
                </li>
                <li :class="{
                    [$style.disabled]: currentPage === 1,
                    disabled: currentPage === 1
                  }">
                  <a href="#"
                    :aria-label="opts.text.pagination.previous || 'Previous'"
                    :title="opts.text.pagination.previous || 'Previous'"
                    @click.prevent="goToPage(currentPage-1)">
                    <span aria-hidden="true"><i
                      :class="opts.classes.pagination.prev"
                      ></i></span>{{opts.text.pagination.prev}}</a>
                </li>
                <li v-for="page in pagesToShow"
                  :key="page"
                  :class="{
                      [$style.active]: page === currentPage,
                      active: page === currentPage,
                    }">
                  <a href="#" @click.prevent="goToPage(page)">{{page}}</a>
                </li>
                <li :class="{
                    [$style.disabled]: currentPage === totalPages || totalPages === 0,
                    disabled: currentPage === totalPages || totalPages === 0
                  }">
                  <a href="#"
                    :aria-label="opts.text.pagination.next || 'Next'"
                    :title="opts.text.pagination.next || 'Next'"
                    @click.prevent="goToPage(currentPage+1)">{{opts.text.pagination.next}}<span
                      aria-hidden="true"><i :class="opts.classes.pagination.next"></i></span>
                  </a>
                </li>
                <li :class="{
                    [$style.disabled]: currentPage === totalPages || totalPages === 0,
                    disabled: currentPage === totalPages || totalPages === 0
                  }">
                  <a href="#"
                    :aria-label="opts.text.pagination.last || 'Last'"
                    :title="opts.text.pagination.last || 'Last'"
                    @click.prevent="goToPage(totalPages)">{{opts.text.pagination.last}}<span
                      aria-hidden="true"><i :class="opts.classes.pagination.last"></i></span>
                  </a>
                </li>
              </ul>
              <div :class="[$style.info, opts.classes.pagination.info]">
                <div v-if="totalRows">
                  <span>
                    {{opts.text.pagination.info.showing | format(startRow+1, endRow, totalRows)}}
                  </span>
                  <select v-model="perPage" :class="[$style.perPageSelector, opts.classes.formControl]">
                    <option
                      v-for="perPageValue in opts.perPageValues"
                      :value="perPageValue"
                      :key="perPageValue"
                      >
                      {{perPageValue}}
                    </option>
                  </select>
                  <span>
                    {{opts.text.pagination.info.records}}
                  </span>
                </div>
                <div v-else >
                  <span>
                    {{opts.text.pagination.info.noRows}}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style lang="less" module>
.table {
  border-bottom: 1px solid #ddd;
  > thead:first-child > tr:first-child > th {
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
  }
  tbody > tr:first-child > th {
    background-color: #F2F2F2;
    a + span {
      margin-left: 5px;
    }
    a {
      color: #333;
      font-size: 16px;
      display: inline-block;
      width: 20px;
      text-align: center;
    }
  }
  .checkbox {
    margin: 0;
    label {
      min-height: 18px;
    }
  }
}
th.sortable {
  cursor: pointer;
  i {
    margin-top: 5px;
    margin-left: 5px;
  }
}
.pagination {
  margin: 0;
}
.info{
  .perPageSelector{
    margin-left: 20px;
    margin-right: 10px;
  }
  float: right;
}
</style>

<script type="text/javascript">
/**
 * @module EnaTableClient
 */
export default {
  filters: {
    heading(key, headings) {
      if (undefined !== headings[key]) {
        return headings[key];
      }
      const firstUpper = w => w.charAt(0).toUpperCase() + w.slice(1);
      return key.split('_').map(firstUpper).join(' ');
    },
    format: (str, ...args) => [...args].reduce((s, a) => s.replace(/%s/, a), str),
  },
  props: {
    /**
     * List of objects to present in the table
     *
     * @member
     * @type {Array}
     */
    data: {
      type: Array,
      default: () => ([]),
    },
    /**
     * List of keys to use from each object (table columns)
     *
     * @type {Array}
     */
    columns: {
      type: Array,
      default: () => ([]),
    },
    /**
     * The search query string. If updated will filter the results by the value
     * @type {String}
     */
    searchQuery: {
      type: String,
      default: '',
    },
    /**
     * Loading indicator. If true, will display the `loadingMsg` instead of the body
     * @type {Boolean}
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Options for the table
     *
     * @inner
     * @type {Object}
     */
    options: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Default option values. Will be overwritten by the "options" value
     *
     * @type {Object<Object>}
     */
    defaults: {
      type: Object,
      default: () => ({
        /**
         * Classes to use on various elements
         *
         * @inner
         * @type {Object}
         */
        classes: {
          wrapper: 'table-responsive',
          table: 'table',
          formControl: 'form-control',
          sort: {
            none: 'fa fa-sort',
            ascending: 'fa fa-sort-asc',
            descending: 'fa fa-sort-desc',
          },
          pagination: {
            wrapper: 'pagination',
            info: 'info form-inline',
            first: 'fa fa-angle-double-left',
            prev: 'fa fa-angle-left',
            next: 'fa fa-angle-right',
            last: 'fa fa-angle-double-right',
          },
          group: {
            show: 'fa fa-chevron-right',
            hide: 'fa fa-chevron-down',
          },
        },
        /**
         * Key-value pairs with the headings to overwrite (label to display)
         * can also be overwritten with slot: "heading_colname"
         *
         * @inner
         * @type {Object}
         */
        headings: {},
        /**
         * Key-value pairs with templates (components) for the column value
         *
         * @type {Object}
         */
        templates: {},
        /**
         * Key-value pairs with custom search function per column,
         * or false to disable search for that column
         *
         * @type {Object}
         */
        search: {},
        /**
         * Field to group by - key name
         *
         * @default
         * @type {Boolean|String}
         */
        groupBy: false,
        /**
         * Expand/collapse groups
         *
         * @default
         * @type {Boolean}
         */
        toggleGroups: false,
        /**
         * Object of data to use for each group "header" (key is the group value)
         *
         * @type {Object}
         */
        groupMeta: {},
        /**
         * Required, unique identifier
         *
         * @default
         * @type {String}
         */
        uniqueKey: 'id',
        /**
         * show extra row for each row with details
         *
         * @default
         * @type {Boolean}
         */
        detailsRow: false,
        /**
         * Texts
         *
         * @type Object
         */
        text: {
          /**
           * Text to show when row can be expanded
           * @type {String}
           */
          expand: 'Show details',
          /**
           * Text to show when row can be collapsed
           * @type {String}
           */
          collapse: 'Hide details',
          /**
           * Message to show when there is no data
           * @type {String}
           */
          noData: 'No data to show',
          /**
           * Message to show when no results are found for the search
           * @type {String}
           */
          emptyResults: 'No results for this filter',
          /**
           * Message to show when no results are found for the search
           * @type {String}
           */
          loading: 'Loading ...',
          /**
           * Text to show for pagination helper buttons
           * @type {Object}
           */
          pagination: {
            first: '',
            prev: '',
            next: '',
            last: '',
            info: {
              showing: 'Showing %s to %s of %s rows.',
              records: 'records per page',
              noRows: 'No rows to display',
            },
          },
        },
        /**
         * empty object to disable sorting for all,
         * or define what columns are sortable; defaults to all sortable
         *
         * @default
         * @type {true|Object}
         */
        sortable: true,
        /**
         * false, to disable pagination - show all; defaults to true
         *
         * @default
         * @type {Boolean}
         */
        pagination: true,
        /**
         * number of items per page
         *
         * @default
         * @type {Number}
         */
        perPage: 10,
        /**
         * How many pages to show in the paginator. Odd number
         *
         * @default
         * @type {Number}
         */
        pageInterval: 9,
        /**
         * values to show in the selector of items per page
         *
         * @default
         * @type {Array}
         */
        perPageValues: [1, 2, 5, 10, 20, 50],
        /**
         * Is the table editable (eg: can select value)
         * @type {Boolean}
         */
        editable: false,
        /**
         * Object (key, order) to sort table by on first load (on created)
         * @type {Object}
         */
        sortBy: {
          column: null,
          order: null,
        },
        /**
         * The collator used for sorting
         * @type {Intl.Collator}
         */
        sortCollator: new Intl.Collator('en', {
          numeric: true,
          sensitivity: 'base',
        }),
      }),
    },
  },
  data() {
    const sortOrders = {};
    this.columns.forEach((key) => {
      sortOrders[key] = null;
    });
    return {
      allSelected: false,
      selectedRows: [],
      sortOrders,
      sortKey: '',
      searchBy: '',
      shown: {},
      expandedRows: {},
      currentPage: 1,
      perPage: this.options.perPage || this.defaults.perPage,
    };
  },
  computed: {
    colspan() {
      return this.columns.length + (this.opts.detailsRow ? 1 : 0);
    },
    opts() {
      const opts = Object.assign(
        {},
        this.defaults,
        this.options
      );
      const sortable = {};
      const search = {};
      this.columns.forEach((key) => {
        if (key !== 'select' && (opts.sortable === true || opts.sortable[key])) {
          sortable[key] = opts.sortable[key] || true;
        }
        if (typeof opts.search[key] === 'undefined') {
          search[key] = true;
        } else {
          search[key] = opts.search[key];
        }
      });
      return Object.assign(
        opts,
        {
          sortable,
          search,
        }
      );
    },
    pagesToShow() {
      const halfInterval = (this.opts.pageInterval - 1) / 2;
      let startPage = Math.max(1, this.currentPage - halfInterval);
      let endPage = Math.min(this.totalPages, this.currentPage + halfInterval);
      if (this.totalPages <= this.opts.pageInterval) {
        startPage = 1;
        endPage = this.totalPages;
      } else {
        while (endPage - startPage < this.opts.pageInterval - 1) {
          // stabilize the interval
          endPage = Math.min(this.totalPages, startPage + this.opts.pageInterval - 1);
          startPage = Math.max(1, endPage - this.opts.pageInterval + 1);
        }
      }
      const pages = [];
      for (let i = startPage; i <= endPage; i += 1) {
        pages.push(i);
      }
      return pages;
    },
    totalPages() {
      return Math.ceil(this.totalRows / this.perPage);
    },
    startRow() {
      return (this.currentPage - 1) * this.perPage;
    },
    endRow() {
      return Math.min(this.startRow + this.perPage, this.totalRows);
    },
    totalRows() {
      return this.filteredData.length;
    },
    filteredData() {
      let { data } = this;
      const searchQuery = this.searchBy && this.searchBy.toLowerCase();
      if (searchQuery) {
        data = data.filter(row =>
          Object.keys(this.opts.search).some((key) => {
            if (typeof this.opts.search[key] === 'function') {
              return this.opts.search[key](row, key, searchQuery);
            }
            return String(row[key]).toLowerCase().indexOf(searchQuery) > -1;
          }));
      }
      return data;
    },
    pageData() {
      const { sortKey } = this;
      let data = this.filteredData;
      let order = 0;
      if (this.sortOrders[sortKey] === 'ascending') {
        order = 1;
      } else if (this.sortOrders[sortKey] === 'descending') {
        order = -1;
      }
      if (sortKey && this.opts.sortable && order) {
        let sortableFn;
        if (this.opts.sortable[sortKey] === true) {
          sortableFn = (a, b) => {
            const aF = String(a[sortKey]);
            const bF = String(b[sortKey]);
            return this.opts.sortCollator.compare(aF, bF) * order;
          };
        } else if (typeof this.opts.sortable[sortKey] === 'function') {
          sortableFn = (a, b) => this.opts.sortable[sortKey](a, b) * order;
        }
        data = data.slice().sort(sortableFn);
      }
      if (this.opts.pagination) {
        // slice the data if pagionation is enabled
        data = data.slice(this.startRow, this.endRow);
      }
      if (this.opts.groupBy) {
        return data.reduce((groupedData, row) => {
          // eslint-disable-next-line
          (groupedData[row[this.opts.groupBy]] = groupedData[row[this.opts.groupBy]] || [])
            .push(row);
          return groupedData;
        }, {});
      }
      return { all: data };
    },
  },
  watch: {
    searchQuery(query) {
      this.searchBy = query;
    },
    searchBy() {
      // go to first page when search query changes
      this.currentPage = 1;
    },
    filteredData() {
      this.selectedRows = this.filteredData.reduce((acc, d) => {
        if (d.showSelect && d.selected) {
          acc.push(d[this.opts.uniqueKey]);
        }
        return acc;
      }, []);
    },
    selectedRows() {
      this.setAllSelected();
      const selected = this.selectedRows.reduce((acc, id) => {
        // eslint-disable-next-line
        acc[id] = true;
        return acc;
      }, {});
      const selectedData = this.filteredData.reduce((data, row) => {
        if (row.showSelect) {
          const selectedRow = selected[row[this.opts.uniqueKey]] || false;
          if (selectedRow) {
            data.push(Object.assign({}, row, {
              selected: selectedRow,
            }));
          }
        }
        return data;
      }, []);
      this.$emit('selectedRows', selectedData);
    },
    totalPages() {
      if (this.currentPage > this.totalPages) {
        // set the current page to the last page if the number of pages has been reduced below it
        this.currentPage = this.totalPages;
      } else if (!this.currentPage && this.totalPages) {
        // if there was no current page and then the number of pages was set, go to first page
        this.currentPage = 1;
      }
    },
  },
  mounted() {
    if (this.opts.sortBy) {
      this.sortBy(this.opts.sortBy);
    }
  },
  methods: {
    search(value) {
      this.searchBy = value;
    },
    sortBy(obj) {
      const { key, order } = obj;
      if (this.opts.sortable[key]) {
        this.sortKey = key;
        this.columns.forEach((elem) => {
          if (elem !== this.sortKey) {
            this.sortOrders[elem] = null;
          }
        });

        if (order) {
          this.sortOrders[key] = order;
        } else if (this.sortOrders[key] === null) {
          this.sortOrders[key] = 'ascending';
        } else if (this.sortOrders[key] === 'ascending') {
          this.sortOrders[key] = 'descending';
        } else {
          this.sortOrders[key] = null;
        }
      }
    },
    isShown(key) {
      return typeof this.shown[key] === 'undefined' || this.shown[key];
    },
    toggleGroup(key) {
      this.shown[key] = typeof this.shown[key] === 'undefined' ? false : !this.shown[key];
      this.shown = Object.assign({}, this.shown);
    },
    toggleRow(id) {
      this.expandedRows[id] = !this.expandedRows[id];
      this.expandedRows = Object.assign({}, this.expandedRows);
    },
    isRowExpanded(id) {
      return this.expandedRows[id];
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    selectAll() {
      if (this.allSelected) {
        this.selectedRows = [];
      } else {
        this.selectedRows = this.filteredData.reduce((acc, d) => {
          if (d.showSelect) {
            acc.push(d[this.opts.uniqueKey]);
          }
          return acc;
        }, []);
      }
    },
    setAllSelected() {
      this.allSelected = this.selectedRows.length > 0
        && this.selectedRows.length === this.filteredData.filter(d => d.showSelect).length;
    },
    getToggleText(entry) {
      return this.isRowExpanded(entry[this.opts.uniqueKey]) ?
        this.opts.text.collapse :
        this.opts.text.expand;
    },
  },
};
</script>
