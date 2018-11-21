export default {
  methods: {
    isShown(key) {
      return typeof this.shown[key] === 'undefined' || this.shown[key];
    },
    toggleRow(id) {
      this.expandedRows[id] = !this.expandedRows[id];
      this.expandedRows = Object.assign({}, this.expandedRows);
      this.$emit('toggleRow', id, this.expandedRows);
    },
    isRowExpanded(id) {
      return this.expandedRows[id];
    },
    getToggleText(entry) {
      return this.isRowExpanded(entry[this.opts.uniqueKey]) ?
        this.opts.text.collapse :
        this.opts.text.expand;
    },
  },
};
