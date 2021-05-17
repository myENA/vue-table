
# Client Table

Component for rendering a client side table with pagination, grouping, sorting, filtering, details row.
Entire table data should be given to the table and will be paginated client side. Data can come from a Vuex store.

## Use as plugin (or global)

### Template

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

### Script 

```javascript
// this will create the global (window) object "EnaTableClient"
import '@myena/vue-table/dist/EnaTableClient';
// or include as script in html : 
// <script type="text/javascript" src="node_modules/@myena/vue-table/dist/EnaTableClient/index.js"></script>
// registers the component globally

// in the view that contains the table
const MyView = new Vue({
  data() {
    // Define properties
    return {
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

## Use as module/local component

### Template

```html
<ClientTable :columns="columns" :options="options" :data="data" :loading="loading">
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
</ClientTable>
```

### Script

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
			return this.$store.state.myListData; 
			// or any other source that has all data
    },
  },
});
```