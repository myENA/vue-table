<template>
  <div>
    <slot name="filter">
      <div v-if="hasSearchFields">
        <div class="row">
          <div class="col-md-2">
            <slot name="filters">
              <div class="form-group">
                <label>Search</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Search by keyword"
                    @input="search($event.target.value)"
                    aria-label="Search by keyword"/>
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
            <th v-for="key in allColumns" :key="key"
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key,
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null }">
              <template v-if="key === 'select'">
                <span :class="[opts.classes.checkbox, $style.checkbox]">
                  <label>
                    <input class="check-all"
                      type="checkbox"
                      @change="selectAll"
                      :checked="allSelected" :disabled="!opts.editable"
                      aria-label="Select all rows"
                      />
                  </label>
                </span>
              </template>
              <template v-else>
                <a
                v-if="opts.headings[key] !== ''"
                href="#"
                :tabindex="opts.sortable[key] ? '': -1"
                :aria-label="key | heading(opts.headings)"
                role="button"
                @keydown.space.prevent="sortBy({key})"
                @click.prevent="sortBy({key})"
                >
                  <slot :name="'heading_' + key">
                    {{ key | heading(opts.headings) }}
                  </slot>
                  <i v-if="opts.sortable[key]"
                    :class="{
                      [opts.classes.sort.none] : sortKey !== key || sortOrders[key] === null,
                      [opts.classes.sort[sortOrders[key]]] : sortKey === key,
                    }">
                  </i>
                </a>
              </template>
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
        <tbody v-else v-for="(group, groupKey, groupIndex) in pageData" :key="groupKey">
          <tr v-if="groupKey !== 'all'">
            <th :colspan="colspan">
              <a
                href="#"
                role="button"
                @keydown.space.prevent="toggleGroup(groupKey)"
                @click.prevent="toggleGroup(groupKey)"
                :aria-label="`Toggle group of rows for ${groupKey}`">
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
                ...computedRowClasses[groupIndex][index],
              }"
              >
              <td v-for="key in allColumns" :key="'cell_'+key"
              :class="{
                [$style.selectable]: isColumnSelectable(entry, key),
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null,
              }"
              @click="toggleSelected(entry, key)"
              >
                <slot :name="'column_' + key" :row="entry" :index="index">
                  <component v-if="opts.templates[key]" :is="opts.templates[key]"
                    :data="entry" :column="key" :index="index">
                  </component>
                  <template v-else-if="key === 'select'">
                    <div v-if="entry.showSelect" :class="[opts.classes.checkbox, $style.checkbox]">
                      <label>
                        <input type="checkbox" name="selectedRows"
                          v-model="selectedRows" :disabled="!opts.editable"
                          :key="'select-'+entry[opts.uniqueKey]"
                          :value="entry[opts.uniqueKey]"
                          aria-label="Select row">
                      </label>
                    </div>
                  </template>
                  <template v-else-if="key === 'actions'">
                    <ActionsCell
                      :row="entry"
                      :is-row-expanded="isRowExpanded(entry[opts.uniqueKey])"
                      :opts="opts"
                      @toggleRow="toggleRow"
                    >
                      <template #column_actions_pre="{row}">
                        <slot name="column_actions_pre" :row="row"/>
                      </template>
                      <template #column_actions_post="{row}">
                        <slot name="column_actions_post" :row="row"/>
                      </template>
                    </ActionsCell>
                  </template>
                  <template v-else>{{entry[key]}}</template>
                </slot>
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
    a {
      cursor: default;
      color: inherit;
      text-decoration: none;
      display: block;
    }
    &.sortable {
      a {
        cursor: pointer;
        &:focus {
          text-decoration: underline;
        }
      }
      i {
        margin-top: 5px;
        margin-left: 5px;
      }
    }
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
td.selectable:hover {
  cursor: pointer;
}

</style>

<script type="text/javascript">
import { mergeDeepRight, union, difference } from 'ramda';
import filters from './mixins/filters';
import defaultProps from './mixins/default-props';
import methods from './mixins/methods';
import Pagination from './mixins/Pagination.vue';
import ActionsCell from './mixins/ActionsCell.vue';

const getFilterForData = ({ searchFields, someMatch, everyMatch, filter, customMatch = {} }) => (row) => everyMatch.every((key) => searchFields[key](row, key, filter))
  && (
    someMatch.length === 0
    || someMatch.some((key) => {
      if (customMatch[key]) {
        return customMatch[key](row, key, filter);
      }
      return String(row[key]).toLowerCase().indexOf(filter.keyword) > -1;
    })
  );

/**
 * @module EnaTableClient
 */
export default {
  mixins: [filters, methods],
  components: {
    Pagination,
    ActionsCell,
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
     * The filter object. If updated will filter the results by the value
     *
     * @type {Object}
     */
    filter: {
      type: Object,
      default: () => ({
        // The search query string. If updated will filter the results by the value
        keyword: '',
      }),
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
        ...defaultProps,
        /**
         * Key-value pairs with custom search function per column,
         * or true to enable keyword search for that column
         *    At least one keyword search-able columns should match AND
         *    All custom-search function columns should match
         *
         * @type {Object}
         */
        search: {},
        /**
        /**
         * Key-value pairs with custom search function (by keyword) per column
         * Applies for those search-able columns with "true", but which need customized search
         *
         * @type {Object}
         */
        searchCustom: {},
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
         * List of columns that should be disabled for click to select/deselect
         * @type {Array}
         */
        nonSelectableColumns: [],
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
    opts() {
      const opts = mergeDeepRight(
        this.defaults,
        this.options
      );
      const sortable = {};
      const search = {};
      this.columns.forEach((key) => {
        if (key !== 'select' && key !== 'actions'
          && (opts.sortable === true || opts.sortable[key])) {
          sortable[key] = opts.sortable[key] || true;
        }
        if (typeof opts.search[key] === 'undefined') {
          search[key] = false;
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
    hasSearchFields() {
      return Object.values(this.opts.search).some((v) => v === true);
    },
    filteredData() {
      const { data } = this;
      const filter = this.getFilter(this.filter, this.searchBy);
      // at least one of the fields with "true" should match the record
      const someMatch = this.getSomeMatchFields(this.opts.search);
      // every other "function" field should match the function
      const everyMatch = this.getEveryMatchFields(this.opts.search);
      if (someMatch.length === 0 && everyMatch.length === 0) {
        return data;
      }
      return data.filter(getFilterForData({
        searchFields: this.opts.search,
        someMatch,
        everyMatch,
        filter,
        customMatch: this.opts.searchCustom,
      }));
    },
    sortedData() {
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
      return data;
    },
    pageData() {
      let data = this.sortedData;
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
      return this.selectedRows.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
    },
  },
  watch: {
    filter() {
      // go to first page when search query changes
      this.currentPage = 1;
    },
    data: {
      immediate: true,
      handler() {
        this.selectedRows = this.data.reduce((acc, d) => {
          if (d.showSelect && d.selected) {
            acc.push(d[this.opts.uniqueKey]);
          }
          return acc;
        }, []);
      },
    },
    filteredData: {
      immediate: true,
      handler() {
        this.setAllSelected();
        this.resetCurrentPage();
      },
    },
    pageData() {
      Object.keys(this.pageData).forEach((group) => {
        this.pageData[group].forEach((row) => {
          this.shown[row[this.opts.groupBy]] = typeof this.shown[row[this.opts.groupBy]] === 'undefined'
            ? !this.opts.collapseAllGroups
            : this.shown[row[this.opts.groupBy]];
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
      const selectedData = this.data.reduce((data, row) => {
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
      const shown = { ...this.shown };
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
    getFilter(filter, searchBy) {
      let { keyword = '' } = filter;
      if (!keyword) {
        keyword = searchBy;
      }
      keyword = keyword.toLowerCase();
      return { ...filter, keyword };
    },

    getSomeMatchFields(searchFields) {
      return Object.keys(searchFields).reduce((fields, key) => {
        if (searchFields[key] === true) {
          fields.push(key);
        }
        return fields;
      }, []);
    },
    getEveryMatchFields(searchFields) {
      return Object.keys(searchFields).reduce((fields, key) => {
        if (typeof searchFields[key] === 'function') {
          fields.push(key);
        }
        return fields;
      }, []);
    },
    search(value) {
      this.searchBy = value;
    },
    sortBy(obj) {
      const { key, order } = obj;
      if (this.opts.sortable[key]) {
        this.sortKey = key;
        this.allColumns.forEach((elem) => {
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
        this.sortOrders = { ...this.sortOrders };
      }
    },
    toggleGroup(key) {
      this.shown[key] = typeof this.shown[key] === 'undefined' ? false : !this.shown[key];
      this.shown = { ...this.shown };
    },
    selectAll() {
      const selectableRows = this.filteredData.reduce((acc, d) => {
        if (d.showSelect) {
          acc.push(d[this.opts.uniqueKey]);
        }
        return acc;
      }, []);
      if (this.allSelected) {
        this.selectedRows = difference(this.selectedRows, selectableRows);
      } else {
        this.selectedRows = union(this.selectedRows, selectableRows);
      }
    },
    setAllSelected() {
      if (this.selectedRows.length === 0) {
        this.allSelected = false;
      } else {
        this.allSelected = this.filteredData.filter((d) => d.showSelect).length
          === this.selectedRows.length;
      }
    },
    paginate({ currentPage, perPage }) {
      this.currentPage = currentPage;
      this.perPage = perPage;
      this.$emit('paginate', {
        currentPage,
        perPage,
        pageData: this.pageData,
      });
    },
    isColumnNonSelectable(column) {
      return this.opts.nonSelectableColumns.includes(column) || column === 'actions';
    },
    isColumnSelectable(entry, column) {
      return this.opts.editable && entry.showSelect && !this.isColumnNonSelectable(column);
    },
    toggleSelected(entry, column) {
      if (this.isColumnSelectable(entry, column)) {
        if (entry.selected) {
          const idx = this.selectedRows.indexOf(entry[this.opts.uniqueKey]);
          this.selectedRows.splice(idx, 1);
        } else {
          this.selectedRows.push(entry[this.opts.uniqueKey]);
        }
      }
    },
    resetCurrentPage() {
      // go to last page if current page is no longer valid
      const lastPage = Math.max(1, Math.ceil(this.totalRows / this.perPage));
      if (lastPage < this.currentPage) {
        this.currentPage = lastPage;
      }
    },
    getFileNameWithExtension(name) {
      // check if the filename has the .csv extension and add it if it does not
      if (name.slice(-4) !== '.csv') {
        return `${name}.csv`;
      }
      return name;
    },
    prepareValueForCsv(value = '') {
      let preparedValue = value;
      if (preparedValue) {
        preparedValue = preparedValue.toString();
      }
      preparedValue = preparedValue.replace(/"/g, '""');
      if (preparedValue.search(/("|,|\n)/g) >= 0) {
        preparedValue = `"${preparedValue}"`;
      }
      return preparedValue;
    },
    getCsvData({ headers, columns, top }) {
      const rows = [];
      const list = this.sortedData.slice(0, top);
      list.forEach((entry) => {
        const r = [];
        columns.forEach((c) => {
          r.push(this.prepareValueForCsv(entry[c]));
        });
        rows.push(r);
      });
      const data = [headers, ...rows];
      return data.map((r) => r.join(',')).join('\n');
    },
    getExportHeaders(columns) {
      return columns.map((key) => {
        // TODO replace this with the filter method once merged with the vue3 branch
        if (undefined !== this.opts.headings[key]) {
          return this.opts.headings[key];
        }
        const firstUpper = (w) => w.charAt(0).toUpperCase() + w.slice(1);
        return key.split('_').map(firstUpper).join(' ');
      });
    },
    download({
      filename,
      columns = this.columns,
      headers = this.getExportHeaders(columns),
      top = 0,
    }) {
      const filenameWithExtension = this.getFileNameWithExtension(filename);
      const csvData = this.getCsvData({
        headers,
        columns,
        top,
      });
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filenameWithExtension);
      } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filenameWithExtension);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },
  },
};
</script>
