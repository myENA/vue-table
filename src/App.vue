<template>
  <main id="app" class="container-fluid">
    <h1>Countries of Europe</h1>
    <h2>ClientTable, which needs all data pre-loaded</h2>
    <ClientTable ref="clientTable" :columns="clientColumns" :data="clientData" :options="clientOptions">
      <div slot="details_row" slot-scope="{ row }">
        <h4>Details for {{row.name}}.</h4>
        <p><strong>Alpha2Code:</strong> {{row.cca2}}</p>
        <p><strong>Domain(s):</strong> {{row.tld.join(', ')}}</p>
      </div>
    </ClientTable>
    <button @click="downloadClientCsv">Download</button>

    <h1>All countries</h1>
    <h2>ServerTable, which loads data page by page</h2>
    <ServerTable :columns="columns" :url="url" :options="options" ref="serverTable">
      <div slot="filter">
        <input placeholder="Search by name" v-model="options.filter.name" aria-label="Search" />
        <button @click="filter">Find</button>
      </div>
      <div slot="details_row" slot-scope="{ row }">
        <h4>Details for {{row.name}}.</h4>
        <p><strong>Alpha2Code:</strong> {{row.cca2}}</p>
        <p><strong>Domain(s):</strong> {{row.tld.join(', ')}}</p>
      </div>
    </ServerTable>
  </main>
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
      let { data } = await axios.get(this.url, {
        params,
        paramsSerializer(p) {
          return Qs.stringify(p, { arrayFormat: 'brackets' });
        },
      });
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
        name: '',
      },
      detailsRow: true,
    },
    clientColumns: ['select', 'name', 'capital', 'population'],
    clientData: [],
    clientOptions: {
      perPage: 20,
      detailsRow: true,
      editable: true,
      groupBy: 'subregion',
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
    const { data } = await axios.get('https://restcountries.com/v3.1/region/europe');
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
