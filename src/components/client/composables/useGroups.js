import { computed, watch, ref } from 'vue';

export default (pageData, opts) => {
  const shown = ref({});

  const toggleGroup = (key) => {
    shown.value[key] = typeof shown.value[key] === 'undefined' ? false : !shown.value[key];
  };
  const isShown = (key) => typeof shown.value[key] === 'undefined' || shown.value[key];

  const collapseAllGroups = computed(() => opts.value.collapseAllGroups);

  watch(collapseAllGroups, () => {
    Object.keys(shown.value).forEach((key) => {
      shown.value[key] = !collapseAllGroups.value;
    });
  });

  watch(pageData, () => {
    Object.keys(pageData.value).forEach((group) => {
      pageData.value[group].forEach((row) => {
        shown.value[row[opts.value.groupBy]] = typeof shown.value[row[opts.value.groupBy]] === 'undefined'
          ? !collapseAllGroups.value
          : shown.value[row[opts.value.groupBy]];
      });
    });
  });

  return {
    shown,
    isShown,
    toggleGroup,
  };
};
