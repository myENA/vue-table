import { shallowMount } from '@vue/test-utils';
import Server from '@/components/server/index.vue';
import '../setup';

describe('Server table', () => {
  describe('#render', () => {
    it.skip('uses passed in url to retrieve data', async () => {
      const wrapper = shallowMount(Server, {
        props: {
          columns: ['id', 'first_name'],
          url: 'https://us-central1-vue-myena-table.cloudfunctions.net/countries',
          parse: (r) => ({ data: r.list, total: r.total }),
        },
      });
      expect(wrapper.find('table tbody tr').exists()).toBe(true);
      const tds = wrapper.findAll('table tbody tr > td');
      expect(tds.length).toBe(1);
      expect(tds[0].text()).toBe('Loading ...');
      await wrapper.vm.$nextTick();
      await new Promise((res) => { setTimeout(() => { res(); }, 1000); });
      const tr = wrapper.findAll('table tbody tr');
      expect(tr.length).toBe(10);
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
      expect(wrapper.find('table tbody tr').exists()).toBe(true);
      const tds = wrapper.findAll('table tbody tr > td');
      expect(tds.length).toBe(1);
      expect(tds[0].text()).toBe('Loading ...');
      await wrapper.vm.$nextTick();
      const tds2 = wrapper.findAll('table tbody tr > td');
      expect(tds2.length).toBe(4);
      expect(tds2[0].text()).toBe('1');
      expect(tds2[1].text()).toBe('Name 1');
      expect(tds2[2].text()).toBe('2');
      expect(tds2[3].text()).toBe('Name 2');
    });
  });
});
