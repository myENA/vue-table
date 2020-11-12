<template>
  <div>
    <slot name="column_actions_pre" :row="row"></slot>
    <a href="#"
      role="button"
      :aria-label="`${isRowExpanded ? 'Hide' : 'Show'} details`"
      :aria-expanded="isRowExpanded ? 'true' : 'false'"
      @keydown.space.prevent="toggleRow(row[opts.uniqueKey])"
      @click.prevent="toggleRow(row[opts.uniqueKey])"
      v-html="getToggleText(row)">
    </a>
    <slot name="column_actions_post" :row="row"></slot>
  </div>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      required: true,
    },
    isRowExpanded: {
      type: Boolean,
      default: false,
    },
    opts: {
      type: Object,
      required: true,
    },
  },
  methods: {
    toggleRow(id) {
      this.$emit('toggleRow', id);
    },
    getToggleText() {
      return this.isRowExpanded
        ? this.opts.text.collapse
        : this.opts.text.expand;
    },
  },
};
</script>
