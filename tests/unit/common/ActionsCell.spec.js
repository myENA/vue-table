import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import ActionsCell from '@/components/common/ActionsCell.vue';

describe('ActionsCell', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ActionsCell, {
      props: {
        row: { id: 1 },
        opts: {
          uniqueKey: 'id',
          text: {
            collapse: 'C',
            expand: 'E',
          },
        },
      },
    });
  });
  describe('#render', () => {
    it('has expand action link', () => {
      const expand = wrapper.find('div > a');
      expect(expand.exists()).to.be.true;
    });
    it('returns correct text', async () => {
      const expand = wrapper.find('div > a');
      expect(expand.text()).to.eq('E');
      await wrapper.setProps({
        isRowExpanded: true,
      });
      expect(expand.text()).to.eq('C');
    });
  });
  describe('#events', () => {
    it('triggers toggle with id', async () => {
      const expand = wrapper.find('div > a');
      await expand.trigger('click');
      const emitted = wrapper.emitted();
      expect(emitted.toggleRow).to.exist;
      expect(emitted.toggleRow[0][0]).to.eq(1);
    });
  });
});
