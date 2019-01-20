const functions = require('firebase-functions');
const countries = require('./countries.json');
// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({
  origin: true,
});

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

exports.countries = functions.https.onRequest((req, res) => {
  const { page = 1, per_page: perPage = 10, sort_by: sortBy = 'name', sort_dir: sortDir = 1, filter = {} } = req.query;
  // filter
  const filtered = countries.filter(c => !filter.name ||
    (filter.name && c.name.toLowerCase().indexOf(filter.name.toLowerCase()) !== -1));
  // sort
  filtered.sort((a, b) => sortDir * collator.compare(a[sortBy], b[sortBy]));
  // slice & send
  const start = (page - 1) * perPage;
  const end = start + parseInt(perPage, 10);
  // Enable CORS using the `cors` express middleware.
  return cors(req, res, () => {
    res.send({
      list: filtered.slice(start, end),
      total: filtered.length,
    });
  });
});
