import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Server from '@/components/Server.vue';

describe('Server.vue', () => {
  it('renders a table', () => {
    const wrapper = shallowMount(Server);
    expect(wrapper.contains('table')).to.be.true;
  });
});
