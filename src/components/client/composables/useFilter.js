import { computed } from 'vue';

const getFilterForData = ({ searchFields, someMatch, everyMatch, filter }) => (row) => everyMatch.every((key) => searchFields[key](row, key, filter))
    && (someMatch.length === 0 || someMatch.some((key) => String(row[key]).toLowerCase().indexOf(filter.keyword) > -1));

export default (computedData, computedFilter, state, opts) => {
  const hasSearchFields = computed(() => Object.values(opts.value.search).some((v) => v === true));
  const getFilter = (mFilter, searchBy) => {
    let { keyword = '' } = mFilter;
    if (!keyword) {
      keyword = searchBy;
    }
    keyword = keyword.toLowerCase();
    return { ...mFilter, keyword };
  };

  const getSomeMatchFields = (searchFields) => Object.keys(searchFields).reduce((fields, key) => {
    if (searchFields[key] === true) {
      fields.push(key);
    }
    return fields;
  }, []);

  const getEveryMatchFields = (searchFields) => Object.keys(searchFields).reduce((fields, key) => {
    if (typeof searchFields[key] === 'function') {
      fields.push(key);
    }
    return fields;
  }, []);

  const search = (value) => {
    state.searchBy = value;
  };

  const filteredData = computed(() => {
    const normalizedFilter = getFilter(computedFilter.value, state.searchBy);
    // at least one of the fields with "true" should match the record
    const someMatch = getSomeMatchFields(opts.value.search);
    // every other "function" field should match the function
    const everyMatch = getEveryMatchFields(opts.value.search);
    if (someMatch.length === 0 && everyMatch.length === 0) {
      return computedData.value;
    }
    return computedData.value.filter(getFilterForData({
      searchFields: opts.value.search,
      someMatch,
      everyMatch,
      filter: normalizedFilter,
    }));
  });

  return {
    hasSearchFields,
    filteredData,
    search,
  };
};
