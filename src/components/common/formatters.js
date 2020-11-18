const heading = (key, headings) => {
  if (typeof headings[key] !== 'undefined') {
    return headings[key];
  }
  const firstUpper = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  return key.split('_').map(firstUpper).join(' ');
};
const formatStr = (str, ...args) => [...args].reduce((s, a) => s.replace(/%s/, a), str);

export { heading };

export default function () {
  return {
    heading,
    formatStr,
  };
}
