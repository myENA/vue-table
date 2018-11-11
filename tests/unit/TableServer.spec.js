import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Server from '@/components/Server.vue';

describe('Server.vue', () => {
  it('renders a table with 1 row', () => {
    const wrapper = shallowMount(Server, {
      propsData: {
      },
      methods: {
        fetch() {
          return {
            data: [{ first_name: '1', id: 1 }],
            total: 1,
          };
        },
      },
    });
    expect(wrapper.contains('table tbody tr')).to.be.true;
  });
});
