import Vue from 'vue';
import Server from './Server.vue';

const components = {
  Server,
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
};

export default register;
