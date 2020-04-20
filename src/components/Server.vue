<template>
  <div>
    <slot name="filter">
    </slot>
    <div :class="[opts.classes.wrapper, $style.wrapper]">
      <table :class="[opts.classes.table, $style.table]">
        <thead>
          <tr>
            <th v-for="key in columns" :key="key" @click="sortBy({key})"
              :class="{ [$style.sortable]: opts.sortable[key], sorted: sortKey === key,
                [opts.columnsClasses[key]]: opts.columnsClasses[key] != null }">
              <slot :name="'heading_' + key">
                {{ heading(key, opts.headings) }}
              </slot>
              <i v-if="opts.sortable[key]"
                :class="{
                  [opts.classes.sort.none] : sortKey !== key || sortOrders[key] === null,
                  [opts.classes.sort[sortOrders[key]]] : sortKey === key,
                }">
              </i>
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
import { onMounted, computed, reactive, toRefs } from 'vue';
import { mergeDeepRight } from 'ramda';
import useFilters from './mixins/filters';
import defaultProps from './mixins/default-props';
import { useToggle, useComputedColumns } from './mixins/methods';
import Pagination from './mixins/Pagination.vue';
import ActionsCell from './mixins/ActionsCell.vue';

const defaultFetch = async (url, params) => {
  const { data } = await axios.get(url, {
    params,
  });
  return data;
};

const defaultParse = response => response;

/**
 * @module EnaTableServer
 */
const useServerTable = () => ({
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
    fetchData: {
      type: Function,
      default: defaultFetch,
    },
    parse: {
      type: Function,
      default: defaultParse,
    },
  },
  setup(props, context) {
    const state = reactive({
      loading: true,
      data: [],
      totalRows: 0,
      currentPage: 1,
      sortKey: '',
      perPage: props.options.perPage || defaultProps.perPage,
      sortOrders: {},
      shown: {},
      expandedRows: {},
    });

    props.columns.forEach((key) => {
      state.sortOrders[key] = null;
    });

    const opts = computed(() => {
      const mOpts = [
        defaultProps,
        {
          params: {
            page: 'page',
            per_page: 'per_page',
            sort_by: 'sort_by',
            sort_dir: 'sort_dir',
          },
        },
        props.options,
      ].reduce(mergeDeepRight, {});
      const sortable = {};
      props.columns.forEach((key) => {
        if (mOpts.sortable === true || mOpts.sortable[key]) {
          sortable[key] = mOpts.sortable[key] || true;
        }
      });
      return Object.assign(
        mOpts,
        {
          sortable,
        }
      );
    });

    const loadData = async () => {
      const params = {
        [opts.value.params.page]: state.currentPage,
        [opts.value.params.per_page]: state.perPage,
      };
      let direction;
      if (state.sortOrders[state.sortKey] === 'ascending') {
        direction = 1;
      } else if (state.sortOrders[state.sortKey] === 'descending') {
        direction = -1;
      } else {
        direction = 0;
        state.sortKey = undefined;
      }
      if (state.sortKey) {
        Object.assign(params, {
          [opts.value.params.sort_by]: state.sortKey,
          [opts.value.params.sort_dir]: direction,
        });
      }
      try {
        const {
          data: responseData,
          total,
        } = props.parse(await props.fetchData(props.url, params));
        state.data = responseData;
        state.totalRows = total;
      } catch (e) {
        state.data = [];
        state.totalRows = 0;
        throw e;
      } finally {
        state.loading = false;
      }
    };
    const sortBy = (obj) => {
      const { key, order } = obj;
      if (opts.value.sortable[key]) {
        state.sortKey = key;
        props.columns.forEach((elem) => {
          if (elem !== state.sortKey) {
            state.sortOrders[elem] = null;
          }
        });

        if (order) {
          state.sortOrders[key] = order;
        } else if (state.sortOrders[key] === null) {
          state.sortOrders[key] = 'ascending';
        } else if (state.sortOrders[key] === 'ascending') {
          state.sortOrders[key] = 'descending';
        } else {
          state.sortOrders[key] = null;
        }
        loadData();
      }
    };

    const getFirstPage = () => {
      state.currentPage = 1;
      loadData();
    };

    const paginate = (p) => {
      state.currentPage = p.currentPage;
      state.perPage = p.perPage;
      loadData();
    };

    onMounted(() => {
      if (opts.value.sortBy) {
        sortBy(opts.value.sortBy);
      }
    });

    return {
      ...toRefs(state),
      ...useFilters(),
      ...useToggle(state, context),
      ...useComputedColumns({ columns: props.columns, opts, data: state.data }),
      sortBy,
      getFirstPage,
      paginate,
      opts,
      loadData,
    };
  },
  created() {
    if (this.opts.initialFetch) {
      this.loadData();
    }
  },
});

export { useServerTable };
export default useServerTable();
</script>
