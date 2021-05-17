import Vue from 'vue-demi';
import Server from './server/index.vue';
import Client from './client/index.vue';

const components = {
  Server,
  Client,
};

// global register components
function register() {
  Object.keys(components).forEach(name => Vue.component(
    `${LIBNAME}${name}`,
    components[name],
    {
      name: `${LIBNAME}${name}`,
    }
  ));
}

export {
  Server,
  Client,
};

export default register;
