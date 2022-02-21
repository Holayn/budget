const moment = require('moment');

const { DB_DATE_FORMAT } = require('../globals');
const db = require('./db.js').getDb();

function getBudget(date) {
  const stmt = db.prepare(`SELECT * FROM budget WHERE date <= @date ORDER BY date desc`);
  return stmt.get({
    date: moment(date).format(DB_DATE_FORMAT),
  });
}

module.exports = {
  getBudget,
}