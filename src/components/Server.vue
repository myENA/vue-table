<template>
  <div>
    <slot name="filter">
    </slot>
    <div :class="[opts.classes.wrapper, $style.wrapper]">
      <table :class="[opts.classes.table, $style.table]">
        <thead>
          <tr>
            <th v-for="key in columns" :key="key"
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key,
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null }">
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
                  <template>
                    {{ key | heading(opts.headings) }}
                  </template>
                </slot>
                <i v-if="opts.sortable[key]"
                  :class="{
                    [opts.classes.sort.none] : sortKey !== key || sortOrders[key] === null,
                    [opts.classes.sort[sortOrders[key]]] : sortKey === key,
                  }">
                </i>
              </a>
            </th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
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
        <tbody v-else>
          <template v-for="(entry, index) in data">
            <tr
              :key="'row_'+entry[opts.uniqueKey]"
              :data-id="entry[opts.uniqueKey]"
              :class="computedRowClasses[index]"
              >
              <td v-for="key in columns" :key="'cell_'+key"
              :class="{[opts.columnsClasses[key]]: opts.columnsClasses[key] != null }">
                <slot :name="'column_' + key" :row="entry">
                  <component v-if="opts.templates[key]" :is="opts.templates[key]"
                    :data="entry" :column="key" :index="index">
                  </component>
                  <template v-else-if="key === 'actions'">
                    <ActionsCell
                      :row="entry"
                      :is-row-expanded="isRowExpanded(entry[opts.uniqueKey])"
                      :opts="opts"
                      @toggleRow="toggleRow"
                    />
                  </template>
                  <template v-else>{{entry[key]}}</template>
                </slot>
              </td>
            </tr>
            <tr
              v-if="opts.detailsRow"
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
        <tfoot v-show="totalRows">
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
                :noPaginationOnCreate="opts.noPaginationOnCreate"
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
.pagination {
  margin: 0px;
}
.info{
  .perPageSelector{
    margin-left: 10px;
    margin-right: 10px;
  }
  float: right;
}
</style>

<script type="text/javascript">
import axios from 'axios';
import filters from './mixins/filters';
import defaultProps from './mixins/default-props';
import methods from './mixins/methods';
import Pagination from './mixins/Pagination.vue';
import ActionsCell from './mixins/ActionsCell.vue';

/**
 * @module EnaTableServer
 */
export default {
  mixins: [filters, methods],
  components: {
    Pagination,
    ActionsCell,
  },
  props: {
    /**
     * URL to fetch data from
     */
    url: '',
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
         * Object with request params mapping
         */
        params: {
          page: 'page',
          per_page: 'per_page',
          sort_by: 'sort_by',
          sort_dir: 'sort_dir',
        },
      }),
    },
    /**
     * Polling indicator. If true this will allow refreshing data in the background without
     * showing the loading icon
     * @type {Boolean}
     */
    polling: {
      type: Boolean,
      default: false,
    },
    /**
     * Loading indicator. If true, will display the `loadingMsg` instead of the body
     * @type {Boolean}
     */
    loadingOverride: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const sortOrders = {};
    this.columns.forEach((key) => {
      sortOrders[key] = null;
    });
    return {
      loading: false,
      sortOrders,
      sortKey: '',
      shown: {},
      data: [],
      expandedRows: {},
      currentPage: 1,
      perPage: this.options.perPage || this.defaults.perPage,
      totalRows: 0,
      pollLoading: false,
    };
  },
  computed: {
    opts() {
      const opts = {

        ...this.defaults,
        ...this.options,
      };
      const sortable = {};
      this.columns.forEach((key) => {
        if (opts.sortable === true || opts.sortable[key]) {
          sortable[key] = opts.sortable[key] || true;
        }
      });
      return Object.assign(
        opts,
        {
          sortable,
        }
      );
    },
    isLoading() {
      return this.polling ? this.pollLoading : this.loading;
    },
  },
  watch: {
    loadingOverride() {
      this.pollLoading = this.loadingOverride;
    },
  },
  mounted() {
    if (this.opts.sortBy) {
      this.sortBy(this.opts.sortBy);
    }
  },
  created() {
    if (this.opts.initialFetch) {
      this.loadData(true);
    }
  },
  methods: {
    async fetch(params) {
      const { data } = await axios.get(this.url, {
        params,
      });
      return data;
    },
    updateLoading(show, value) {
      if (this.polling && show) {
        this.pollLoading = value;
      } else {
        this.loading = value;
      }
    },
    async loadData(showPollLoading = false) {
      this.updateLoading(showPollLoading, true);

      const params = {
        [this.opts.params.page]: this.currentPage,
        [this.opts.params.per_page]: this.perPage,
      };
      let direction;
      if (this.sortOrders[this.sortKey] === 'ascending') {
        direction = 1;
      } else if (this.sortOrders[this.sortKey] === 'descending') {
        direction = -1;
      } else {
        direction = 0;
        this.sortKey = undefined;
      }
      if (this.sortKey) {
        Object.assign(params, {
          [this.opts.params.sort_by]: this.sortKey,
          [this.opts.params.sort_dir]: direction,
        });
      }
      try {
        const {
          data,
          total,
        } = this.parse(await this.fetch(params));
        this.data = data;
        this.totalRows = total;
      } catch (e) {
        this.data = [];
        this.totalRows = 0;
        throw e;
      } finally {
        this.updateLoading(showPollLoading, false);
      }
    },
    parse(response) {
      return response;
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
        this.loadData(true);
      }
    },
    getFirstPage() {
      this.currentPage = 1;
      this.loadData(true);
    },
    paginate({ currentPage, perPage }) {
      this.currentPage = currentPage;
      this.perPage = perPage;
      this.loadData(true);
    },
  },
};
</script>
