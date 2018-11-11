<template>
  <div id="app">
    <ServerTable :columns="columns" :url="url" />
    <ClientTable :columns="columns" :data="clientData" />
  </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap';
import ServerTable from './components/Server.vue';
import ClientTable from './components/Client.vue';

const myServerTable = {
  extends: ServerTable,
  methods: {
    fetch() {
      return {
        data: [{ first_name: '1', id: 1 }],
        total: 1,
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
    columns: ['id', 'first_name', 'last_name'],
    url: 'http://localhost:5000/api/users',
    clientData: [{ first_name: '1', id: 1 }],
  }),
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
