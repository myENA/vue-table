import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Server from '@/components/server/index.vue';

describe('Server table', () => {
  describe('#render', () => {
    it('uses passed in url to retrieve data', async () => {
      const wrapper = shallowMount(Server, {
        props: {
          columns: ['id', 'first_name'],
          url: 'https://us-central1-vue-myena-table.cloudfunctions.net/countries',
          parse: (r) => ({ data: r.list, total: r.total }),
        },
      });
      expect(wrapper.find('table tbody tr').exists()).to.be.true;
      const tds = wrapper.findAll('table tbody tr > td');
      expect(tds.length).to.eq(1);
      expect(tds[0].text()).to.eq('Loading ...');
      await wrapper.vm.$nextTick();
      await new Promise((res) => { setTimeout(() => { res(); }, 1000); });
      const tr = wrapper.findAll('table tbody tr');
      expect(tr.length).to.eq(10);
    });
    it('a table with correct rows', async () => {
      const wrapper = shallowMount(Server, {
        props: {
          columns: ['id', 'first_name'],
          fetchData() {
            return {
              data: [
                { first_name: 'Name 1', id: 1 },
                { first_name: 'Name 2', id: 2 },
              ],
              total: 2,
            };
          },
          parse: (r) => r,
          url: '',
        },
      });
      expect(wrapper.find('table tbody tr').exists()).to.be.true;
      const tds = wrapper.findAll('table tbody tr > td');
      expect(tds.length).to.eq(1);
      expect(tds[0].text()).to.eq('Loading ...');
      await wrapper.vm.$nextTick();
      const tds2 = wrapper.findAll('table tbody tr > td');
      expect(tds2.length).to.eq(4);
      expect(tds2[0].text()).to.eq('1');
      expect(tds2[1].text()).to.eq('Name 1');
      expect(tds2[2].text()).to.eq('2');
      expect(tds2[3].text()).to.eq('Name 2');
    });
  });
});
