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
            <th v-for="key in allColumns" :key="key" @click="sortBy({key})"
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
                  {{ heading(key, opts.headings) }}
                </template>
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
                ...computedRowClasses[index],
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
                          :value="entry[opts.uniqueKey]">
                      </label>
                    </div>
                  </template>
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
td.selectable:hover {
  cursor: pointer;
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
import { reactive, toRefs, computed, watch } from 'vue';
import useFormatters from '@/components/common/formatters';
import useDefaultOptions from '@/components/common/default-options';
import { useToggle, useComputedColumns } from '@/components/common/methods';
import Pagination from '@/components/Pagination.vue';
import ActionsCell from '@/components/common/ActionsCell.vue';
import { usePagination, useSort, useSelect, useFilter, useGroups } from './methods';

export default {
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
  },
  setup(props, context) {
    const search = {};
    props.columns.forEach((key) => {
      if (typeof props.options.search[key] === 'undefined') {
        search[key] = false;
      } else {
        search[key] = props.options.search[key];
      }
    });

    const { opts } = useDefaultOptions(props, {
      search,
      groupBy: false,
      collapseAllGroups: false,
      groupMeta: {},
      pagination: true,
      editable: false,
      nonSelectableColumns: [],
      sortCollator: new Intl.Collator('en', {
        numeric: true,
        sensitivity: 'base',
      }),
    });

    const state = reactive({
      sortOrders: props.columns.reduce((orders, col) => ({ ...orders, [col]: null }), {}),
      sortKey: '',
      searchBy: '',
      currentPage: 1,
      perPage: opts.value.perPage,
      expandedRows: {},
      shown: {},
    });

    const computedFilter = computed(() => props.filter);
    const computedData = computed(() => props.data);

    const { filteredData, ...restFilter } = useFilter(computedData, computedFilter, state, opts);

    const totalRows = computed(() => filteredData.value.length);
    const startRow = computed(() => (state.currentPage - 1) * state.perPage);
    const endRow = computed(() => Math.min(startRow.value + state.perPage, totalRows.value));
    const pageData = computed(() => {
      const { sortKey, sortOrders } = state;
      let data = filteredData.value;
      let order = 0;
      if (sortOrders[sortKey] === 'ascending') {
        order = 1;
      } else if (sortOrders[sortKey] === 'descending') {
        order = -1;
      }
      if (sortKey && opts.value.sortable && order) {
        let sortableFn;
        if (opts.value.sortable[sortKey] === true) {
          sortableFn = (a, b) => {
            const aF = String(a[sortKey]);
            const bF = String(b[sortKey]);
            return opts.value.sortCollator.compare(aF, bF) * order;
          };
        } else if (typeof opts.value.sortable[sortKey] === 'function') {
          sortableFn = (a, b) => opts.value.sortable[sortKey](a, b) * order;
        }
        data = data.slice().sort(sortableFn);
      }
      if (opts.value.pagination) {
        // slice the data if pagionation is enabled
        data = data.slice(startRow.value, endRow.value);
      }
      if (opts.value.groupBy) {
        return data.reduce((groupedData, row) => {
          // eslint-disable-next-line
          (groupedData[row[opts.value.groupBy]] = groupedData[row[opts.value.groupBy]] || [])
            .push(row);
          return groupedData;
        }, {});
      }
      return { all: data };
    });

    watch(computedFilter, () => {
      // go to first page when search query changes
      state.currentPage = 1;
    });

    return {
      ...toRefs(state),
      ...useFormatters(),
      ...useToggle(state, context),
      ...useComputedColumns({ columns: props.columns, opts, data: props.data }),
      ...usePagination(context, state, filteredData),
      ...useSort(props, state, opts),
      ...useSelect(props.data, filteredData, opts, context),
      ...useGroups(pageData, state.shown, opts),
      filteredData,
      ...restFilter,
      opts,
      totalRows,
      startRow,
      endRow,
      pageData,
    };
  },
};
</script>
