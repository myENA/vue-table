import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Server from '@/components/server/index.vue';

describe('Server table', () => {
  describe('#render', () => {
    it('a table with 1 row', () => {
      const wrapper = mount(Server, {
        props: {
          fetchData() {
            return {
              data: [{ first_name: '1', id: 1 }],
              total: 1,
            };
          },
          parse: r => r,
          url: '',
        },
      });
      expect(wrapper.find('table tbody tr')).to.exist;
    });
  });
});
