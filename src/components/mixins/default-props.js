export default {
  /**
   * Key-value pairs with the headings to overwrite (label to display)
   * can also be overwritten with slot: "heading_colname"
   *
   * @inner
   * @type {Object}
   */
  headings: {},
  /**
   * Key-value pairs with templates (components) for the column value
   *
   * @type {Object}
   */
  templates: {},
  /**
   * empty object to disable sorting for all,
   * or define what columns are sortable; defaults to all sortable
   *
   * @default
   * @type {true|Object}
   */
  sortable: true,
  /**
   * Object (key, order) to sort table by on first load (on created)
   * @type {Object}
   */
  sortBy: {
    column: null,
    order: null,
  },
  /**
   * Required, unique identifier
   *
   * @default
   * @type {String}
   */
  uniqueKey: 'id',
  /**
   * show extra row for each row with details
   *
   * @default
   * @type {Boolean}
   */
  detailsRow: false,
  /**
   * number of items per page
   *
   * @default
   * @type {Number}
   */
  perPage: 10,
  /**
   * How many pages to show in the paginator. Odd number
   *
   * @default
   * @type {Number}
   */
  pageInterval: 9,
  /**
   * values to show in the selector of items per page
   *
   * @default
   * @type {Array}
   */
  perPageValues: [1, 2, 5, 10, 20, 50],
  /**
   * Classes to use on various elements
   *
   * @inner
   * @type {Object}
   */
  classes: {
    wrapper: 'table-responsive',
    table: 'table',
    sort: {
      none: 'fa fa-sort',
      ascending: 'fa fa-sort-asc',
      descending: 'fa fa-sort-desc',
    },
    pagination: {
      wrapper: 'pagination',
      formControl: 'form-control',
      info: 'info form-inline',
      first: 'fa fa-angle-double-left',
      prev: 'fa fa-angle-left',
      next: 'fa fa-angle-right',
      last: 'fa fa-angle-double-right',
    },
    group: {
      show: 'fa fa-chevron-right',
      hide: 'fa fa-chevron-down',
    },
  },
  /**
   * Texts
   *
   * @type Object
   */
  text: {
    /**
     * Text to show when row can be expanded
     * @type {String}
     */
    expand: 'Show details',
    /**
     * Text to show when row can be collapsed
     * @type {String}
     */
    collapse: 'Hide details',
    /**
     * Message to show when there is no data
     * @type {String}
     */
    noData: 'No data to show',
    /**
     * Message to show when no results are found for the search
     * @type {String}
     */
    emptyResults: 'No results for this filter',
    /**
     * Message to show when no results are found for the search
     * @type {String}
     */
    loading: 'Loading ...',
    /**
     * Text to show for pagination helper buttons
     * @type {Object}
     */
    pagination: {
      first: '',
      prev: '',
      next: '',
      last: '',
      info: {
        showing: 'Showing %s to %s of %s rows.',
        records: 'records per page',
        noRows: 'No rows to display',
      },
    },
  },
};
