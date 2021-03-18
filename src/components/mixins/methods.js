export default {
  computed: {
    allColumns() {
      const allColumns = this.columns.slice();
      if (!this.columns.includes('actions') && this.opts.detailsRow) {
        allColumns.push('actions');
      }
      return allColumns;
    },
    computedRowClasses() {
      if (this.opts.groupBy) {
        return Object.values(this.pageData).map((rowGroup) => {
          return rowGroup.map((row) => {
            const classes = {};
            Object.keys(this.opts.rowClasses).forEach((prop) => {
              if (row[prop]) {
                classes[this.opts.rowClasses[prop]] = true;
              }
            });
            return classes;
          });
        });
      }
      return this.data.map((row) => {
        const classes = {};
        Object.keys(this.opts.rowClasses).forEach((prop) => {
          if (row[prop]) {
            classes[this.opts.rowClasses[prop]] = true;
          }
        });
        return classes;
      });
    },
    colspan() {
      return this.allColumns.length;
    },
  },
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
  },
};
