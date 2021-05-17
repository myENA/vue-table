// shamelessly "stolen" from:
// https://github.com/pikax/vue-composable/blob/master/packages/vue-composable/__tests__/utils.ts
import { createApp } from 'vue';

export { nextTick } from 'vue';

export const createVue = (component, props = {}) => {
  const app = createApp({
    render: () => null,
    ...component,
  }, props);

  const el = document.createElement('div');

  document.body.appendChild(el);

  const mount = () => app.mount(el);

  const destroy = () => app.unmount(el);

  return {
    el,
    mount,
    destroy,
  };
};

export const setupVue = () => new Promise((resolve) => {
  const vue = createVue({
    setup(props, ctx) {
      resolve({ props, ctx });
    },
  });
  vue.mount();
});
