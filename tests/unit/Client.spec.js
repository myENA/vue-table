import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Client from '@/components/Client.vue';

describe('Client.vue', () => {
  it('renders a table with 1 row', () => {
    const wrapper = shallowMount(Client, {
      propsData: {
        data: [{ first_name: '1', id: 1 }],
      },
    });
    expect(wrapper.contains('table tbody tr')).to.be.true;

    const rows = wrapper.findAll('table tbody tr');
    expect(rows).to.have.lengthOf(1);
  });

  it('Sort by columns', async () => {
    const wrapper = shallowMount(Client, {
      propsData: {
        data: [{
          first_name: '1',
          id: 1,
          eng: 10,
        }, {
          first_name: '2',
          id: 2,
          eng: 5,
        }, {
          first_name: '3',
          id: 3,
          eng: 15,
        }],
        columns: ['first_name', 'id'],
      },
    });
    expect(wrapper.contains('table tbody tr')).to.be.true;
    const rows = wrapper.findAll('table tbody tr');
    expect(rows).to.have.lengthOf(3);

    wrapper.vm.sortBy({
      key: 'id',
      order: 'descending',
    });

    expect(wrapper.vm.pageData).to.be.deep.equal({
      all: [{
        first_name: '3',
        id: 3,
        eng: 15,
      }, {
        first_name: '2',
        id: 2,
        eng: 5,
      }, {
        first_name: '1',
        id: 1,
        eng: 10,
      }],
    });


    wrapper.setProps({
      columns: ['first_name', 'id', 'eng'],
    });
    wrapper.vm.sortBy({
      key: 'eng',
      order: 'descending',
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.pageData).to.be.deep.equal({
      all: [{
        first_name: '3',
        id: 3,
        eng: 15,
      }, {
        first_name: '1',
        id: 1,
        eng: 10,
      }, {
        first_name: '2',
        id: 2,
        eng: 5,
      }],
    });
  });
});
