import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Pagination, { calculatePages } from '@/components/Pagination.vue';

const props = {
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
    const wrapper = mount(Pagination, {
      props,
    });
    expect(wrapper.find('div')).to.exist;
  });
  it('Shows correct pages', async () => {
    expect(calculatePages(props.pageInterval, 1, 1)).to.be.deep.equal([]);
    expect(calculatePages(props.pageInterval, 4, 7)).to.be.deep.equal([2, 3, 4, 5, 6]);
    expect(calculatePages(props.pageInterval, 1, 10)).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 2, 10)).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 3, 10)).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 4, 10)).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 5, 10)).to.be.deep.equal([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 6, 10)).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 7, 10)).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 8, 10)).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 9, 10)).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 10, 10)).to.be.deep.equal([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 9, 14)).to.be.deep.equal([6, 7, 8, 9, 10, 11, 12]);
  });
});
