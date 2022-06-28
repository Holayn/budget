const moment = require('moment');

const db = require('./db.js').getDb();
const { DB, DB_DATE_FORMAT, DB_TYPES } = require('./db.js');

class ExpenseDB extends DB {
  static tableName = 'expense';
  static schema = {
    isFixed: DB_TYPES.BOOLEAN,
    date: DB_TYPES.DATE,
  };

  static getByDescription(description) {
    const stmt = db.prepare('SELECT * FROM expense WHERE description = @description');
    return stmt.get({
      description,
    });
  }

  static getByAmountDateDescription({ amount, date, description }) {
    const stmt = db.prepare('SELECT * FROM expense WHERE date = @date AND (amount = @amount OR (is_fixed = 1 AND original_amount = @amount)) AND description = @description');
    return stmt.get({
      amount,
      date: moment(date).format(DB_DATE_FORMAT),
      description,
    });
  }

  static findExpenses(date) {
    const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type != 'Invest' ORDER BY date desc`);
    const expenses = stmt.all({
      firstDay: moment(date).startOf('month').format(DB_DATE_FORMAT),
      lastDay: moment(date).endOf('month').format(DB_DATE_FORMAT),
    });
  
    return {
      expenses,
      total: expenses.reduce((acc, val) => {
        acc += val.amount;
        return acc;
      }, 0),
    };
  }

  static findFixedExpenses(date) {
    const stmt = db.prepare(`SELECT * FROM fixed_expense WHERE start <= @date AND end >= @date`);
    return stmt.all({
      date: moment(date).format(DB_DATE_FORMAT),
    });
  }

  static findInvests(date) {
    const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type = 'Invest' ORDER BY date desc`);
    const invests = stmt.all({
      firstDay: moment(date).startOf('month').format(DB_DATE_FORMAT),
      lastDay: moment(date).endOf('month').format(DB_DATE_FORMAT),
    });
  
    return {
      invests,
      total: invests.reduce((acc, val) => {
        acc += val.amount;
        return acc;
      }, 0),
    };
  }
}

module.exports = {
  ExpenseDB,
}