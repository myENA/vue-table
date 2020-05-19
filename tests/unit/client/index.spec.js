import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Client from '@/components/client/index.vue';

describe('Client table', () => {
  describe('#render', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallowMount(Client, {
        props: {
          data: [{ first_name: '1', id: 1 }],
        },
      });
    });
    it('a table with 1 row', () => {
      expect(wrapper.find('table tbody tr').exists()).to.be.true;
    });
  });
});
