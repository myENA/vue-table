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
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key,
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null }">
              <slot :name="'heading_' + key">
                <template v-if="key === 'select'">
                  <div :class="[opts.classes.checkbox, $style.checkbox]">
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
              :class="{
                selectable: opts.editable && entry.showSelect,
                selected: selectedRowIds[entry[opts.uniqueKey]],
                [opts.rowClasses[key]]: opts.rowClasses[key] != null && entry[key],
              }"
              @click="toggleSelected(entry)"
              >
              <td v-for="key in columns" :key="'cell_'+key"
              :class="{
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null,
              }">
                <slot :name="'column_' + key" :row="entry">
                  <component v-if="opts.templates[key]" :is="opts.templates[key]"
                    :data="entry" :column="key" :index="index">
                  </component>
                  <template v-else-if="key === 'select'">
                    <div v-if="entry.showSelect" :class="[opts.classes.checkbox, $style.checkbox]">
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
        <tfoot v-if="opts.pagination && totalRows">
          <tr>
            <td :colspan="colspan">
              <Pagination
                @paginate="paginate"
                :classes="opts.classes.pagination"
                :text="opts.text.pagination"
                :pageInterval="opts.pageInterval"
                :perPage="opts.perPage"
                :perPageValues="opts.perPageValues"
                :currentPage="currentPage"
                :totalRows="totalRows"
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style lang="less" module>
.table {
  border-bottom: none;
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

</style>

<script type="text/javascript">
import { mergeDeepRight } from 'ramda';
import filters from './mixins/filters';
import defaultProps from './mixins/default-props';
import methods from './mixins/methods';
import Pagination from './mixins/Pagination.vue';

/**
 * @module EnaTableClient
 */
export default {
  mixins: [filters, methods],
  components: {
    Pagination,
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
      default: () => (Object.assign({}, defaultProps, {
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
         * Expand/collapse all groups
         *
         * @default
         * @type {Boolean}
         */
        collapseAllGroups: false,
        /**
         * Object of data to use for each group "header" (key is the group value)
         *
         * @type {Object}
         */
        groupMeta: {},
        /**
         * false, to disable pagination - show all; defaults to true
         *
         * @default
         * @type {Boolean}
         */
        pagination: true,
        /**
         * Is the table editable (eg: can select value)
         * @type {Boolean}
         */
        editable: false,
        /**
         * The collator used for sorting
         * @type {Intl.Collator}
         */
        sortCollator: new Intl.Collator('en', {
          numeric: true,
          sensitivity: 'base',
        }),
      })),
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
      const opts = mergeDeepRight(
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
    collapseAllGroups() {
      return this.opts.collapseAllGroups;
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
    totalRows() {
      return this.filteredData.length;
    },
    startRow() {
      return (this.currentPage - 1) * this.perPage;
    },
    endRow() {
      return Math.min(this.startRow + this.perPage, this.totalRows);
    },
    selectedRowIds() {
      return this.selectedRows.reduce((obj, id) => ({ ...obj, [id]: true }), {});
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
      // go to first page when filtered data is returned
      this.currentPage = 1;
      this.selectedRows = this.filteredData.reduce((acc, d) => {
        if (d.showSelect && d.selected) {
          acc.push(d[this.opts.uniqueKey]);
        }
        return acc;
      }, []);
    },
    pageData() {
      Object.keys(this.pageData).forEach((group) => {
        this.pageData[group].forEach((row) => {
          this.shown[row[this.opts.groupBy]] =
            typeof this.shown[row[this.opts.groupBy]] === 'undefined' ?
              !this.opts.collapseAllGroups :
              this.shown[row[this.opts.groupBy]];
        });
      });
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
          Object.assign(row, {
            selected: !!selectedRow,
          });
          if (selectedRow) {
            data.push(row);
          }
        }
        return data;
      }, []);
      this.$emit('selectedRows', selectedData);
    },
    collapseAllGroups(collapse) {
      const shown = Object.assign({}, this.shown);
      Object.keys(shown).forEach((key) => {
        shown[key] = !collapse;
      });
      this.shown = shown;
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
    toggleGroup(key) {
      this.shown[key] = typeof this.shown[key] === 'undefined' ? false : !this.shown[key];
      this.shown = Object.assign({}, this.shown);
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
    paginate({ currentPage, perPage }) {
      this.currentPage = currentPage;
      this.perPage = perPage;
    },
    toggleSelected(entry) {
      if (this.opts.editable && entry.showSelect) {
        if (entry.selected) {
          const idx = this.selectedRows.indexOf(entry[this.opts.uniqueKey]);
          this.selectedRows.splice(idx, 1);
        } else {
          this.selectedRows.push(entry[this.opts.uniqueKey]);
        }
      }
    },
  },
};
</script>
