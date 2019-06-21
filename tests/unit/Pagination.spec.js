import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Pagination from '@/components/mixins/Pagination.vue';

const propsData = {
  text: {
    prev: '',
    next: '',
    info: {
      showing: 'Showing %s to %s of %s rows.',
      records: 'records per page',
      noRows: 'No rows to display',
    },
  },
  pageInterval: 7,
  perPage: 1,
  perPageValues: [1],
  currentPage: 1,
  totalRows: 1,
};
describe('Pagination', () => {
  it('is rendered', () => {
    const wrapper = shallowMount(Pagination, {
      propsData,
    });
    expect(wrapper.contains('div')).to.be.true;
  });
  it('Shows correct pages', () => {
    const wrapper = shallowMount(Pagination, {
      propsData,
    });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([]);
    wrapper.setProps({ totalRows: 7, currentPage: 4 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6]);
    wrapper.setProps({ totalRows: 10, currentPage: 1 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    wrapper.setProps({ currentPage: 2 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    wrapper.setProps({ currentPage: 3 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    wrapper.setProps({ currentPage: 4 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    wrapper.setProps({ currentPage: 5 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    wrapper.setProps({ currentPage: 6 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    wrapper.setProps({ currentPage: 7 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    wrapper.setProps({ currentPage: 8 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    wrapper.setProps({ currentPage: 9 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    wrapper.setProps({ currentPage: 10 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    wrapper.setProps({ totalRows: 14, currentPage: 9 });
    expect(wrapper.vm.pagesToShow).to.be.deep.equal([6, 7, 8, 9, 10, 11, 12]);
  });
});
