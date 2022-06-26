const moment = require('moment');

const db = require('./db.js').getDb();
const { DB, DB_DATE_FORMAT, DB_TYPES } = require('./db.js');

class BudgetDB extends DB {
  static tableName = 'budget';
  static schema = {
    date: DB_TYPES.DATE,
  };

  static getByDate(date) {
    const stmt = db.prepare(`SELECT * FROM budget WHERE date <= @date ORDER BY date desc`);
    return stmt.get({
      date: moment(date).format(DB_DATE_FORMAT),
    });
  }
}

module.exports = {
  BudgetDB,
}