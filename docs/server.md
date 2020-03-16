
# Server Table

Component for rendering a table that loads data from the server, with pagination, sorting, filtering, details row.
It doesn't support grouping.

## Usage

### Template
```html
<ServerTable :columns="columns" :options="options" ref="serverTable">
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
</ServerTable>
```

### Script
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
