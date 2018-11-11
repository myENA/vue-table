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
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th v-for="key in columns" :key="key" @click="sortBy({key})"
              :class="{ sortable: opts.sortable[key], sorted: sortKey === key }">
              <slot :name="'heading_' + key">
                <template v-if="key === 'select'">
                  <div class="checkbox">
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
              <i v-if="opts.sortable[key]" class="fa"
                :class="{
                  'fa-sort': sortKey !== key || sortOrders[key] === null,
                  'fa-sort-asc': sortKey === key && sortOrders[key] === 'ascending',
                  'fa-sort-desc': sortKey === key && sortOrders[key] === 'descending',
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
            <td class="msg-row" :colspan="columns.length + (opts.detailsRow ? 1 : 0)">
              <slot name="loading"><span v-html="opts.loadingMsg"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="data.length === 0">
          <tr>
            <td class="msg-row" :colspan="columns.length + (opts.detailsRow ? 1 : 0)">
              <slot name="no_data"><span v-html="opts.noDataMsg"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredData.length === 0">
          <tr>
            <td class="msg-row" :colspan="columns.length + (opts.detailsRow ? 1 : 0)">
              <slot name="empty_results"><span v-html="opts.emptyResultsMsg"></span></slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else v-for="(group, groupKey) in pageData" :key="groupKey">
          <tr v-if="groupKey !== 'all'">
            <th :colspan="columns.length + (opts.detailsRow ? 1 : 0)">
              <a href="#" @click.prevent="toggleGroup(groupKey)">
                <i class="fa" :class="{
                  'fa-chevron-down': isShown(groupKey),
                  'fa-chevron-right': !isShown(groupKey),
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
                <slot :name="'column_' + key" v-bind:row="entry">
                  <component v-if="opts.templates[key]"
                    :is="opts.templates[key]" :data="entry" :column="key" :index="index">
                  </component>
                  <template v-else-if="key === 'select'">
                    <div v-if="entry.showSelect" class="checkbox">
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
                <slot name="column_actions_pre" v-bind:row="entry"></slot>
                <slot name="column_actions" v-bind:row="entry">
                  <a href="#" @click.prevent="toggleRow(entry[opts.uniqueKey])"
                    v-html="getToggleText(entry)">
                  </a>
                </slot>
                <slot name="column_actions_post" v-bind:row="entry"></slot>
              </td>
            </tr>
            <tr
              v-if="opts.detailsRow && isShown(groupKey)"
              v-show="isRowExpanded(entry[opts.uniqueKey])"
              :key="'details_row_'+entry[opts.uniqueKey]"
              :data-details="entry[opts.uniqueKey]"
              >
              <td :colspan="columns.length + (opts.detailsRow ? 1 : 0)">
                <slot name="details_row" v-bind:row="entry">
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="row" v-if="opts.pagination">
      <div class="col-md-6">
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li :class="{ disabled: currentPage === 1}">
              <a href="#" aria-label="Firs" @click.prevent="goToPage(1)">
                <span aria-hidden="true"><i class="fa fa-angle-double-left"></i></span>
              </a>
            </li>
            <li :class="{ disabled: currentPage === 1}">
              <a href="#" aria-label="Previous" @click.prevent="goToPage(currentPage-1)">
                <span aria-hidden="true"><i class="fa fa-angle-left"></i></span>
              </a>
            </li>
            <li v-for="page in pagesToShow"
              :key="page"
              :class="{ active: page === currentPage }">
              <a href="#" @click.prevent="goToPage(page)">{{page}}</a>
            </li>
            <li :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
              <a href="#" aria-label="Next" @click.prevent="goToPage(currentPage+1)">
                <span aria-hidden="true"><i class="fa fa-angle-right"></i></span>
              </a>
            </li>
            <li :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
              <a href="#" aria-label="Last" @click.prevent="goToPage(totalPages)">
                <span aria-hidden="true"><i class="fa fa-angle-double-right"></i></span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="col-md-6">
        <div class="form-inline recordsInfo">
          <div v-if="totalRows">
            <div class="form-group">
              <p class="form-control-static">
                Showing {{startRow+1}} to {{endRow}} of {{totalRows}} rows
              </p>
            </div>
            <div class="form-group">
              <select v-model="perPage" class="perPageSelector form-control">
                <option
                  v-for="perPageValue in opts.perPageValues"
                  :value="perPageValue"
                  :key="perPageValue"
                  >
                  {{perPageValue}}
                </option>
              </select>
            </div>
            <div class="form-group">
              <p class="form-control-static">
                records per page
              </p>
            </div>
          </div>
          <div v-else class="form-group">
            <p class="form-control-static">
              No rows to display
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.table {
  border-bottom: 1px solid #ddd;
  > thead:first-details > tr:first-details > th {
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
  }
  tbody > tr:first-details > th {
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
  .sort-handle {
    color: #333;
    font-size: 12px;
    display: inline-block;
    width: 20px;
    text-align: center;
    cursor: move;
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
.recordsInfo{
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
  props: {
    /**
     * List of objects to present in the table
     *
     * @member
     * @type {Array}
     */
    data: Array,
    /**
     * List of keys to use from each object (table columns)
     *
     * @type {Array}
     */
    columns: Array,
    /**
     * The search query string. If updated will filter the results by the value
     * @type {String}
     */
    searchQuery: String,
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
      default() {
        return {};
      },
    },
    /**
     * Default option values. Will be overwritten by the "options" value
     *
     * @type {Object<Object>}
     */
    defaults: {
      type: Object,
      default() {
        return {
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
           * Text to show when row can be expanded
           * @type {String}
           */
          expandText: 'Show details',
          /**
           * Text to show when row can be collapsed
           * @type {String}
           */
          collapseText: 'Hide details',
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
           * Message to show when there is no data
           * @type {String}
           */
          noDataMsg: 'No data to show',
          /**
           * Message to show when no results are found for the search
           * @type {String}
           */
          emptyResultsMsg: 'No results for this filter',
          /**
           * Message to show when no results are found for the search
           * @type {String}
           */
          loadingMsg: 'Loading ...',
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
        };
      },
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
    opts() {
      const opts = Object.assign(
        {},
        this.defaults,
        this.options
      );
      const sortable = {};
      const search = {};
      this.columns.forEach((key) => {
        if (opts.sortable === true || opts.sortable[key]) {
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
      return Math.ceil(this.filteredData.length / this.perPage);
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
  filters: {
    heading(key, headings) {
      if (undefined !== headings[key]) {
        return headings[key];
      }
      return key.charAt(0).toUpperCase() + key.slice(1);
    },
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
        this.opts.collapseText :
        this.opts.expandText;
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
};
</script>
