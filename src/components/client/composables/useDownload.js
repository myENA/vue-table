import { heading } from '../../common/formatters';

const getFileNameWithExtension = (name) => {
  // check if the filename has the .csv extension and add it if it does not
  if (name.slice(-4) !== '.csv') {
    return `${name}.csv`;
  }
  return name;
};

const prepareValueForCsv = (value = '') => {
  let preparedValue = value;
  if (preparedValue) {
    preparedValue = preparedValue.toString();
  }
  preparedValue = preparedValue.replace(/"/g, '""');
  if (preparedValue.search(/("|,|\n)/g) >= 0) {
    preparedValue = `"${preparedValue}"`;
  }
  return preparedValue;
};

const getCsvData = ({ sortedData, headers, columns, top }) => {
  const rows = [];
  const list = sortedData.value.slice(0, top);
  list.forEach((entry) => {
    const r = [];
    columns.forEach((c) => {
      r.push(prepareValueForCsv(entry[c]));
    });
    rows.push(r);
  });
  const data = [headers, ...rows];
  return data.map((r) => r.join(',')).join('\n');
};

const getExportHeaders = (columns, headings) => columns.map((key) => heading(key, headings));

export default ({ sortedData, columns: defaultColumns, headings }) => {
  const download = ({
    filename,
    columns = defaultColumns,
    headers = getExportHeaders(columns, headings),
    top = undefined,
  }) => {
    const filenameWithExtension = getFileNameWithExtension(filename);
    const csvData = getCsvData({
      sortedData,
      headers,
      columns,
      top,
    });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filenameWithExtension);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filenameWithExtension);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
  return {
    download,
  };
};
