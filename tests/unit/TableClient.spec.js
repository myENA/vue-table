import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Client from '@/components/client/index.vue';

describe('Client table', () => {
  describe('#render', () => {
    it('a table with 1 row', () => {
      const wrapper = mount(Client, {
        props: {
          data: [{ first_name: '1', id: 1 }],
        },
      });
      expect(wrapper.find('table tbody tr')).to.exist;
    });
  });
});
