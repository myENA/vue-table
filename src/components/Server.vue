<template>
  <div>
    <slot name="filter">
    </slot>
    <div :class="[opts.classes.wrapper, $style.wrapper]">
      <table :class="[opts.classes.table, $style.table]">
        <thead>
          <tr>
            <th v-for="key in columns" :key="key" @click="sortBy({key})"
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key }">
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
        <tbody v-else>
          <template v-for="(entry, index) in data">
            <tr
              :key="'row_'+entry[opts.uniqueKey]"
              :data-id="entry[opts.uniqueKey]"
              >
              <td v-for="key in columns" :key="'cell_'+key">
                <slot :name="'column_' + key" :row="entry">
                  <component v-if="opts.templates[key]" :is="opts.templates[key]"
                    :data="entry" :column="key" :index="index">
                  </component>
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
        <tfoot>
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

/**
 * @module EnaTableServer
 */
export default {
  mixins: [filters, methods],
  components: {
    Pagination,
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
      default: () => Object.assign({}, defaultProps, {
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
  },
  watch: {
  },
  created() {
    if (this.initialFetch) {
      this.loadData();
    }
  },
  methods: {
    async fetch(params) {
      const { data } = await axios.get(this.url, {
        params,
      });
      return data;
    },
    async loadData() {
      this.loading = true;
      let direction;
      if (this.sortOrders[this.sortKey] === 'ascending') {
        direction = 1;
      } else if (this.sortOrders[this.sortKey] === 'descending') {
        direction = -1;
      } else {
        direction = 0;
        this.sortKey = '';
      }
      const params = {
        [this.opts.params.page]: this.currentPage,
        [this.opts.params.per_page]: this.perPage,
        [this.opts.params.sort_by]: this.sortKey,
        [this.opts.params.sort_dir]: direction,
      };
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
        this.loading = false;
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
        this.loadData();
      }
    },
    paginate({ currentPage, perPage }) {
      this.currentPage = currentPage;
      this.perPage = perPage;
      this.loadData();
    },
  },
};
</script>
