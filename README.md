# vue-table

## What's this
Components to render a table using client or remote data

## Install
```
npm install @ena/vue-table
```

# Vue Client Table

Vue component for rendering a client side table with pagination, grouping, sorting, filtering, details row.
Entire table data should be given to the table and will be paginated client side. Data can come from a Vuex store.

## Dependencies

- Vue 2
- Bootstrap 3
- FontAwesome 4

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
  <template slot="child_row" slot-scope="{ row }">
    <div>Div for child (expanded) row</div>
  </template>
</EnaTableClient>
```

### As plugin (or in Browser)

```javascript
// this will create the global (window) object "EnaTableClient"
import '@ena/vue-table/dist/EnaTableClient';
// or include as script in html : <script type="text/javascript" src="node_modules/@ena/vue-table/dist/EnaTableClient/index.js"></script>
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
         * Key-value pairs with custom search function per column, or false to disable search for that column
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
         * empty object to disable sorting for all, or define what columns are sortable; defaults to all sortable
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
import { Client } from '@ena/vue-table';

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
