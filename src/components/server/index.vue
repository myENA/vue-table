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
                    {{ heading(key, opts.headings) }}
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
          <template
            v-for="(entry, index) in data"
            :key="'row_'+entry[opts.uniqueKey]">
            <tr
              :data-id="entry[opts.uniqueKey]"
              :class="computedRowClasses[index]"
              >
              <td
                v-for="key in columns"
                :key="'cell_'+key"
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
import useFormatters from '@/components/common/formatters';
import useDefaultOptions from '@/components/common/default-options';
import useToggle from '@/components/common/composables/useToggle';
import useComputedColumns from '@/components/common/composables/useComputedColumns';
import Pagination from '@/components/Pagination.vue';
import ActionsCell from '@/components/common/ActionsCell.vue';
import useLoad from './composables/useLoad';
import usePagination from './composables/usePagination';
import useSort from './composables/useSort';

const defaultFetch = async (url, params) => {
  const { data } = await axios.get(url, {
    params,
  });
  return data;
};

const defaultParse = (response) => {
  if (typeof response === 'undefined') {
    console.warn('No response returned');
  }
  if (typeof response.data === 'undefined') {
    console.warn('Response data must have a "data" key containing the items for current page');
  }
  if (typeof response.total === 'undefined') {
    console.warn('Response data must have a "total" key containing the total number of items');
  }
  return response;
};

/**
 * @module EnaTableServer
 */
export default {
  components: {
    Pagination,
    ActionsCell,
  },
  props: {
    /**
     * URL to fetch data from
     */
    url: {
      type: String,
      required: true,
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
      default: () => defaultFetch,
    },
    parse: {
      type: Function,
      default: () => defaultParse,
    },
  },
  setup(props, context) {
    const { opts } = useDefaultOptions(props, {
      params: {
        page: 'page',
        per_page: 'per_page',
        sort_by: 'sort_by',
        sort_dir: 'sort_dir',
      },
    });

    const sort = useSort(props, opts);
    const pagination = usePagination(opts.value.perPage);

    const { loadData, data, loading, totalRows } = useLoad(props, opts, pagination, sort);

    return {
      ...useFormatters(),
      ...useToggle(context),
      ...useComputedColumns({ columns: props.columns, opts, data }),
      ...sort,
      ...pagination,
      opts,
      loadData,
      data,
      loading,
      totalRows,
    };
  },
  created() {
    if (this.opts.initialFetch) {
      this.loadData();
    }
  },
};
</script>
