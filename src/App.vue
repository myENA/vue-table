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

    <h1>All countries</h1>
    <h2>ServerTable, which loads data page by page</h2>
    <ServerTable :columns="columns" :url="url" :options="options" ref="serverTable">
      <div slot="filter">
        <input placeholder="Search by name" v-model="options.filter.name"/>
        <button @click="filter">Find</button>
      </div>
      <div slot="details_row" slot-scope="{ row }">
        <h4>Details for {{row.name}}.</h4>
        <p><strong>Alpha2Code:</strong> {{row.alpha2Code}}</p>
        <p><strong>Domain(s):</strong> {{row.topLevelDomain.join(', ')}}</p>
      </div>
    </ServerTable>
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap';
import axios from 'axios';
import Qs from 'qs';
import ServerTable from './components/Server.vue';
import ClientTable from './components/Client.vue';

const myServerTable = {
  extends: ServerTable,
  methods: {
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
    parse({ list, total }) {
      return {
        data: list,
        total,
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
    columns: ['name', 'capital', 'population'],
    url: 'https://us-central1-vue-myena-table.cloudfunctions.net/countries',
    options: {
      perPage: 5,
      uniqueKey: 'alpha3Code',
      filter: {
        name: null,
      },
      columnsClasses: {
        name: 'name-cls',
      },
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
  methods: {
    filter() {
      this.$refs.serverTable.loadData();
    },
  },
};
</script>

<style lang="less">

tfoot {
  [class^='EnaServerTable_pagination'],
  [class^='EnaServerTable_info'] {
    margin: 20px 0;
  }
}
</style>
