# vue-table

[![CircleCI (all branches)](https://img.shields.io/circleci/project/github/myENA/vue-table.svg)](https://circleci.com/gh/myENA/vue-table)
[![npm (scoped)](https://img.shields.io/npm/v/@myena/vue-table.svg)](https://www.npmjs.com/package/@myena/vue-table)
![](https://img.shields.io/npm/dt/@myena/vue-table.svg)
[![NpmLicense](https://img.shields.io/npm/l/@myena/vue-table.svg)](https://www.npmjs.com/package/@myena/vue-table)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@myena/vue-table.svg)
![David](https://img.shields.io/david/peer/myena/vue-table.svg)
![David](https://img.shields.io/david/dev/myena/vue-table.svg)


## What's this
Components to render a table using client or remote data

## Install
```
npm install @myena/vue-table
```

# Dependencies

- Vue 2
- Bootstrap 3
- FontAwesome 4

# Demo
https://vue-myena-table.firebaseapp.com/

# Vue Client Table

Vue component for rendering a client side table with pagination, grouping, sorting, filtering, details row.
Entire table data should be given to the table and will be paginated client side. Data can come from a Vuex store.

## Usage:

```html
<EnaTableClient :columns="columns" :options="options" :data="data" :loading="loading">
  <my-custom-filter-component slot="filter" v-on:search="search"></my-custom-filter-component>
  <span slot="__group_meta" slot-scope="{ data }">
    <strong><span v-html="data.label"></span> (Total in group: {{data.total}})</strong>
  </span>
  <template slot="heading_column1">
    <div>Custom heading of column1</div>
  </template>
  <template slot="column_column1" slot-scope="{ row }" >
    <span><i v-if="row.column2 === 'disable'" class="fa fa-ban"></i> {{row.column1}}</span>
  </template>
  <template slot="details_row" slot-scope="{ row }">
    <div>Div for details (expanded) row</div>
  </template>
</EnaTableClient>
```

### As plugin (or in Browser)

```javascript
// this will create the global (window) object "EnaTableClient"
import '@myena/vue-table/dist/EnaTableClient';
// or include as script in html : <script type="text/javascript" src="node_modules/@myena/vue-table/dist/EnaTableClient/index.js"></script>
// registers the component globally

// in the view that contains the table
const MyView = new Vue({
  data() {
    // Define properties
    return {
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
        pageInterval: 7,
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
         * List of columns that should be disabled for click to select/deselect
         * @type {Array}
         */
        nonSelectableColumns: [],
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
      },
    };
  },
  // OR use computed properties instead
  computed: {
    data() {
      return this.$store.state.myListData; // or any other source that has all data
    },
  },
  methods: {
    search(filter) {
      this.searchQuery = filter.keyword;
    },
  },
  watch: {
    data(data) {
      // set the group metas when data changes
      // groupColumn is the same as the one used for 'groupBy' option
      this.options.groupMeta = data.reduce((groupMeta, r) => {
        if (!groupMeta[r.groupColumn]) {
          groupMeta[r.groupColumn] = {
            label: r.groupColumn,
            total: 0,
          };
        }
        groupMeta[r.groupColumn].total += 1;
        return groupMeta;
      }, {});
    },
  },
});
```

### As module/local component

```javascript
import { Client } from '@myena/vue-table';

// in the view that contains the table
const MyView = new Vue({
  components: {
    ClientTable: Client,
  },
  data() {
    return {
      columns: ['column1', 'column2'],
      options: {
      },
    };
  },
  computed: {
    data() {
      return this.$store.state.myListData; // or any other source that has all data
    },
  },
});
```

# Vue Server Table

Vue component for rendering a table that loads data from the server, with pagination, sorting, filtering, details row.
It doesn't support grouping.

## Usage:

```html
<EnaTableServer :columns="columns" :options="options" ref="serverTable">
  <div slot="filter">
    <input placeholder="Search by name" v-model="options.filter.name"/>
    <button @click="filter">Find</button>
  </div>
  <template slot="heading_column1">
    <div>Custom heading of column1</div>
  </template>
  <template slot="column_column1" slot-scope="{ row }" >
    <span><i v-if="row.column2 === 'disable'" class="fa fa-ban"></i> {{row.column1}}</span>
  </template>
  <template slot="details_row" slot-scope="{ row }">
    <div>Div for details (expanded) row</div>
  </template>
</EnaTableServer>
```

```javascript
import axios from 'axios';
import Qs from 'qs';
import { Server: ServerTable } from '@myena/vue-table';

const myServerTable = {
  extends: ServerTable,
  methods: {
    /**
     * Override the fetch method
     */
    async fetch(params) {
      const { data } = await axios.get(this.url, {
        params: Object.assign({}, params, {
          filter: this.options.filter,
        }),
        paramsSerializer(p) {
          return Qs.stringify(p, { arrayFormat: 'brackets' });
        },
      });
      return data;
    },
    /**
     * Override the parse method to return `data` and `total` fields
     */
    parse({ list, total }) {
      return {
        data: list,
        total,
      };
    },
  },
};

export default {
  name: 'app',
  components: {
    ServerTable: myServerTable,
  },
  data: () => ({
    columns: ['name', 'capital', 'population'],
    url: 'https://us-central1-vue-myena-table.cloudfunctions.net/countries',
    options: {
      perPage: 5,
      uniqueKey: 'alpha3Code',
      // not handled by the component
      // added here for easier access in the overridden fetch function
      filter: {
        name: null,
      },
    },
  }),
  methods: {
    filter() {
      // call component loadData, which sets some params then calls fetch (above)
      this.$refs.serverTable.loadData();
    },
  },
};
```
