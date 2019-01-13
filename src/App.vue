<template>
  <div id="app" class="container-fluid">
    <h1>Countries of Europe</h1>
    <h2>ClientTable, which needs all data pre-loaded</h2>
    <ClientTable :columns="clientColumns" :data="clientData" :options="clientOptions">
      <div slot="details_row" slot-scope="{ row }">
        <h4>Details for {{row.name}}.</h4>
        <p><strong>Alpha2Code:</strong> {{row.alpha2Code}}</p>
        <p><strong>Domain(s):</strong> {{row.topLevelDomain.join(', ')}}</p>
      </div>
    </ClientTable>
    <h2>ServerTable, which loads data page by page</h2>
    <ServerTable :columns="columns" :url="url" :options="options" />
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap';
import axios from 'axios';
import ServerTable from './components/Server.vue';
import ClientTable from './components/Client.vue';

const myServerTable = {
  extends: ServerTable,
  methods: {
    async fetch(params) {
      const { data } = await axios.get(this.url, {
        params: {
          limit: params.per_page,
          offset: params.per_page * params.page,
          // sort_by: params.sort_by,
          // sort_dir: params.sort_dir,
        },
      });
      return data;
    },
    parse(data) {
      return {
        data,
        total: 2000, // normally this should be returned by the API
      };
    },
  },
};

const myClientTable = {
  extends: ClientTable,
  methods: {

  },
};

export default {
  name: 'app',
  components: {
    ServerTable: myServerTable,
    ClientTable: myClientTable,
  },
  data: () => ({
    columns: ['number_of_pages', 'title', 'publish_date'],
    url: 'http://openlibrary.org/query.json?type=/type/edition&*=',
    options: {
      perPage: 5,
    },
    clientColumns: ['select', 'name', 'capital', 'population'],
    clientData: [],
    clientOptions: {
      perPage: 20,
      detailsRow: true,
      editable: true,
      groupBy: 'subregion',
      uniqueKey: 'alpha3Code',
    },
  }),
  async created() {
    const { data } = await axios.get('https://restcountries.eu/rest/v2/region/europe');
    this.clientData = data.map(d => Object.assign({}, d, { showSelect: true }));
  },
};
</script>

<style lang="less">
@import '~bootstrap/less/bootstrap';
@import '~font-awesome/css/font-awesome.min.css';

tfoot {
  [class^='EnaServerTable_pagination'],
  [class^='EnaServerTable_info'] {
    margin: 20px 0;
  }
}
</style>
