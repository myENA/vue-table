<template>
  <div id="app">
    <TableServer :columns="columns" :url="url" />
  </div>
</template>

<script>
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import TableServer from './components/Server.vue';

const myComp = {
  extends: TableServer,
  methods: {
    fetch() {
      return {
        data: [{ first_name: '1', id: 1 }],
        total: 1,
      };
    },
  },
};

export default {
  name: 'app',
  components: {
    TableServer: myComp,
  },
  data: () => ({
    columns: ['id', 'first_name', 'last_name'],
    url: 'http://localhost:5000/api/users',
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
