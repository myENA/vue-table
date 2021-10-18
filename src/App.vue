<template>
  <main class="container-fluid">
    <h1>Countries of Europe</h1>
    <h2>ClientTable, which needs all data pre-loaded</h2>
    <ClientTable ref="clientTable" :columns="clientColumns" :data="clientData" :options="clientOptions">
      <template #details_row="{ row }">
        <div>
          <h4>Details for {{row.name}}.</h4>
          <p><strong>Alpha2Code:</strong> {{row.cca2}}</p>
          <p><strong>Domain(s):</strong> {{row.tld.join(', ')}}</p>
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
          <p><strong>Alpha2Code:</strong> {{row.cca2}}</p>
          <p><strong>Domain(s):</strong> {{row.tld.join(', ')}}</p>
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
    url: 'https://restcountries.com/v3.1/region/europe',
    options: {
      perPage: 5,
      uniqueKey: 'ccn3',
      filter: {
        name: null,
      },
      columnsClasses: {
        name: 'name-cls',
      },
      headings: {
        name: 'Country Name',
      },
      detailsRow: true,
    },
    clientColumns: ['select', 'name', 'capital', 'population'],
    clientData: [],
    clientOptions: {
      perPage: 20,
      detailsRow: true,
      editable: true,
      // groupBy: 'subregion',
      uniqueKey: 'ccn3',
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
    // const { data } = await axios.get('https://restcountries.com/v3.1/region/europe');
    const data = [
      { ccn3: 'DEU', name: { common: 'Germany' }, capital: ['Berlin'], population: 8, tld: ['.de'] },
      { ccn3: 'FRA', name: { common: 'France' }, capital: ['Paris'], population: 66, tld: ['.fr'] },
      { ccn3: 'GBR', name: { common: 'United Kingdom' }, capital: ['London'], population: 65, tld: ['.uk'] },
      { ccn3: 'ITA', name: { common: 'Italy' }, capital: ['Rome'], population: 60, tld: ['.it'] },
      { ccn3: 'NLD', name: { common: 'Netherlands' }, capital: ['Amsterdam'], population: 16, tld: ['.nl'] },
      { ccn3: 'NOR', name: { common: 'Norway' }, capital: ['Oslo'], population: 5, tld: ['.no'] },
      { ccn3: 'SWE', name: { common: 'Sweden' }, capital: ['Stockholm'], population: 9, tld: ['.se'] },
      { ccn3: 'CHE', name: { common: 'Switzerland' }, capital: ['Bern'], population: 8, tld: ['.ch'] },
      { ccn3: 'AUT', name: { common: 'Austria' }, capital: ['Vienna'], population: 8, tld: ['.at'] },
      { ccn3: 'BEL', name: { common: 'Belgium' }, capital: ['Brussels'], population: 11, tld: ['.be'] },
      { ccn3: 'BGR', name: { common: 'Bulgaria' }, capital: ['Sofia'], population: 7, tld: ['.bg'] },
      { ccn3: 'CYP', name: { common: 'Cyprus' }, capital: ['Nicosia'], population: 9, tld: ['.cy'] },
      { ccn3: 'CZE', name: { common: 'Czech Republic' }, capital: ['Prague'], population: 10, tld: ['.cz'] },
      { ccn3: 'DNK', name: { common: 'Denmark' }, capital: ['Copenhagen'], population: 5, tld: ['.dk'] },
      { ccn3: 'EST', name: { common: 'Estonia' }, capital: ['Tallinn'], population: 1, tld: ['.ee'] },
    ];
    this.clientData = data.map((d) => ({
      ...d,
      showSelect: true,
      tld: d.tld ?? [],
      name: d.name.common,
      capital: d.capital.join(', '),
    }));
  },
  methods: {
    filter() {
      // when filtering is applied, retrieve first page
      this.$refs.serverTable.getFirstPage();
    },
    async fetchData(url, params) {
      // let { data } = await axios.get(url, {
      //   params,
      //   paramsSerializer(p) {
      //     return Qs.stringify(p, { arrayFormat: 'brackets' });
      //   },
      // });
      let data = [
        { ccn3: 'DEU', name: { common: 'Germany' }, capital: ['Berlin'], population: 8, tld: ['.de'] },
        { ccn3: 'FRA', name: { common: 'France' }, capital: ['Paris'], population: 66, tld: ['.fr'] },
        { ccn3: 'GBR', name: { common: 'United Kingdom' }, capital: ['London'], population: 65, tld: ['.uk'] },
        { ccn3: 'ITA', name: { common: 'Italy' }, capital: ['Rome'], population: 60, tld: ['.it'] },
        { ccn3: 'NLD', name: { common: 'Netherlands' }, capital: ['Amsterdam'], population: 16, tld: ['.nl'] },
        { ccn3: 'NOR', name: { common: 'Norway' }, capital: ['Oslo'], population: 5, tld: ['.no'] },
        { ccn3: 'SWE', name: { common: 'Sweden' }, capital: ['Stockholm'], population: 9, tld: ['.se'] },
        { ccn3: 'CHE', name: { common: 'Switzerland' }, capital: ['Bern'], population: 8, tld: ['.ch'] },
        { ccn3: 'AUT', name: { common: 'Austria' }, capital: ['Vienna'], population: 8, tld: ['.at'] },
        { ccn3: 'BEL', name: { common: 'Belgium' }, capital: ['Brussels'], population: 11, tld: ['.be'] },
        { ccn3: 'BGR', name: { common: 'Bulgaria' }, capital: ['Sofia'], population: 7, tld: ['.bg'] },
        { ccn3: 'CYP', name: { common: 'Cyprus' }, capital: ['Nicosia'], population: 9, tld: ['.cy'] },
        { ccn3: 'CZE', name: { common: 'Czech Republic' }, capital: ['Prague'], population: 10, tld: ['.cz'] },
        { ccn3: 'DNK', name: { common: 'Denmark' }, capital: ['Copenhagen'], population: 5, tld: ['.dk'] },
        { ccn3: 'EST', name: { common: 'Estonia' }, capital: ['Tallinn'], population: 1, tld: ['.ee'] },
      ];
      // usually these actions are done on the server side
      // prepare data
      data = data.map((d) => ({
        ...d,
        tld: d.tld ?? [],
        name: d.name.common,
        capital: d.capital.join(', '),
      }));
      // filter by name
      data = data.filter((row) => !this.options.filter.name
        || row.name.common.toLowerCase().includes(this.options.filter.name.toLowerCase()));
      if (params.sort_by) {
        // sort
        data = data.sort((a, b) => params.sort_dir * `${a[params.sort_by]}`.localeCompare(`${b[params.sort_by]}`));
      }
      // paginate
      const start = (params.page - 1) * params.per_page;
      const end = start + params.per_page;
      return {
        list: data.slice(start, end),
        total: data.length,
      };
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
