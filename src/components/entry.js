import Vue from 'vue';
import Server from './Server.vue';
import Client from './Client.vue';

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
