import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Client from '@/components/Client.vue';

describe('Client', () => {
  describe('slots', () => {
    describe('filter', () => {
      const slots = {
        filter: '<div class="custom-filter">Custom filter</div>',
      };

      context('when options.search is false', () => {
        it('does not render the slot', () => {
          const propsData = {
            options: { search: false },
          };
          const wrapper = shallowMount(Client, { propsData, slots });
          const subject = wrapper.find('div.custom-filter').exists();

          expect(subject).to.be.false;
        });
      });

      context('when options.search is the default', () => {
        it('renders the slot', () => {
          const wrapper = shallowMount(Client, { slots });
          const subject = wrapper.find('div.custom-filter').exists();

          expect(subject).to.be.true;
        });
      });
    });
  });
});
