const moment = require('moment');

const db = require('./db.js').getDb();
const { DB, DB_DATE_FORMAT, DB_TYPES } = require('./db.js');

class BalanceDB extends DB {
  static tableName = 'balance';
  static schema = {
    date: DB_TYPES.DATE,
  };

  static getByStartOfMonth(date) {
    const stmt = db.prepare('SELECT * FROM balance WHERE date = @date');
    return stmt.get({
      date: moment(date).startOf('month').format(DB_DATE_FORMAT),
    });
  }

  static getByDate(date) {
    const stmt = db.prepare(`SELECT * FROM balance WHERE date <= @date ORDER BY date desc`);
    return stmt.get({
      date: moment(date).format(DB_DATE_FORMAT),
    });
  }

  static findAllDates() {
    const stmt = db.prepare(`SELECT date FROM balance`);
    return stmt.all();
  }
}

module.exports = {
  BalanceDB,
}