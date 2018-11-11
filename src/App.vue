<template>
  <div id="app" class="container-fluid">
    <ServerTable :columns="columns" :url="url" :options="options" />
    <ClientTable :columns="clientColumns" :data="clientData" :options="clientOptions">
      <div slot="details_row" slot-scope="{ row }">
        Details for {{row.first_name}} {{row.last_name}}
      </div>
    </ClientTable>
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
    // fetch() {
    //   return {
    //     data: [{ first_name: '1', id: 1 }],
    //     total: 1,
    //   };
    // },
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
    columns: ['id', 'first_name', 'last_name'],
    url: 'http://localhost:5000/api/users',
    options: {
      perPage: 5,
    },
    clientColumns: ['select', 'id', 'first_name', 'last_name'],
    clientData: [],
    clientOptions: {
      perPage: 20,
      groupBy: 'first_name',
      detailsRow: true,
      editable: true,
    },
  }),
  async created() {
    const { data: { data } } = await axios.get(this.url, {
      params: {
        page: 1,
        per_page: 20,
      },
    });
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
