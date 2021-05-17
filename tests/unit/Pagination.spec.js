import { mount } from '@vue/test-utils';
import Pagination, { calculatePages } from '@/components/Pagination.vue';
import './setup';

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
    expect(wrapper.find('div')).toBeDefined();
  });
  it('Shows correct pages', async () => {
    expect(calculatePages(props.pageInterval, 1, 1)).toEqual([]);
    expect(calculatePages(props.pageInterval, 4, 7)).toEqual([2, 3, 4, 5, 6]);
    expect(calculatePages(props.pageInterval, 1, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 2, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 3, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 4, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 5, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(calculatePages(props.pageInterval, 6, 10)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 7, 10)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 8, 10)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 9, 10)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 10, 10)).toEqual([3, 4, 5, 6, 7, 8, 9]);
    expect(calculatePages(props.pageInterval, 9, 14)).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });
});
