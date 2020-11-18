<template>
  <main class="container-fluid">
    <h1>Countries of Europe</h1>
    <h2>ClientTable, which needs all data pre-loaded</h2>
    <ClientTable ref="clientTable" :columns="clientColumns" :data="clientData" :options="clientOptions">
      <template #details_row="{ row }">
        <div>
          <h4>Details for {{row.name}}.</h4>
          <p><strong>Alpha2Code:</strong> {{row.alpha2Code}}</p>
          <p><strong>Domain(s):</strong> {{row.topLevelDomain.join(', ')}}</p>
        </div>
      </template>
    </ClientTable>
    <button @click="downloadClientCsv">Download</button>

    <h1>All countries</h1>
    <h2>ServerTable, which loads data page by page</h2>
    <ServerTable
      ref="serverTable"
      :columns="columns"
      :url="url"
      :options="options"
      :fetch-data="fetchData"
      :parse="parse">
      <template #filter>
        <div>
          <input placeholder="Search by name" v-model="options.filter.name" aria-label="Search"/>
          <button @click="filter">Find</button>
        </div>
      </template>
      <template #details_row="{ row }">
        <div>
          <h4>Details for {{row.name}}.</h4>
          <p><strong>Alpha2Code:</strong> {{row.alpha2Code}}</p>
          <p><strong>Domain(s):</strong> {{row.topLevelDomain.join(', ')}}</p>
        </div>
      </template>
    </ServerTable>
  </main>
</template>

<script>
// import 'bootstrap/dist/js/bootstrap';
import axios from 'axios';
import Qs from 'qs';
import ServerTable from './components/server/index.vue';
import ClientTable from './components/client/index.vue';

export default {
  name: 'app',
  components: {
    ServerTable,
    ClientTable,
  },
  data: () => ({
    columns: ['name', 'capital', 'population'],
    url: '.netlify/functions/countries',
    options: {
      perPage: 5,
      uniqueKey: 'alpha3Code',
      filter: {
        name: null,
      },
      columnsClasses: {
        name: 'name-cls',
      },
      headings: {
        name: '',
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
      nonSelectableColumns: ['population'],
      // define which fields are search-able and how
      search: {
        name: true,
        capital: true,
        // population: (row, key, filter) => true,
      },
      searchCustom: {
        capital: (row, key, filter) => row[key].toLowerCase().includes(filter.keyword),
      },
      // text: {
      //   expand: '<i class="fa fa-chevron-right" />',
      //   collapse: '<i class="fa fa-chevron-down" />',
      // },
    },
  }),
  async created() {
    const { data } = await axios.get('https://restcountries.eu/rest/v2/region/europe');
    this.clientData = data.map((d) => ({ ...d, showSelect: true }));
  },
  methods: {
    filter() {
      // when filtering is applied, retrieve first page
      this.$refs.serverTable.getFirstPage();
    },
    async fetchData(url, params) {
      const { data } = await axios.get(url, {
        params: { ...params, filter: this.options.filter },
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
    downloadClientCsv() {
      this.$refs.clientTable.download({
        filename: 'my-data.csv',
        columns: ['name', 'capital', 'population'],
      });
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
