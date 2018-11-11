export default {
  filters: {
    heading(key, headings) {
      if (undefined !== headings[key]) {
        return headings[key];
      }
      const firstUpper = w => w.charAt(0).toUpperCase() + w.slice(1);
      return key.split('_').map(firstUpper).join(' ');
    },
    format: (str, ...args) => [...args].reduce((s, a) => s.replace(/%s/, a), str),
  },
};
