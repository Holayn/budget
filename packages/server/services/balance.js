const moment = require('moment');

const { DB_DATE_FORMAT } = require('../globals');
const db = require('./db.js').getDb();

function updateBalance(date, { amount, spendSurplus, investSurplus }) {
  const stmt = db.prepare(`SELECT * FROM balance WHERE date = @date`);
  const currentBalance = stmt.get({
    date: moment(date).startOf('month').format(DB_DATE_FORMAT),
  });
  if (!currentBalance) {
    const insert = db.transaction(balance => {
      const stmt = db.prepare('INSERT INTO balance (date, amount, spend_surplus, invest_surplus) VALUES (@date, @amount, @spendSurplus, @investSurplus)');
      stmt.run(balance);
    });

    insert({
      date: moment(date).startOf('month').format(DB_DATE_FORMAT),
      amount,
      spendSurplus,
      investSurplus,
    });
  } else {
    const update = db.transaction(balance => {
      const stmt = db.prepare('UPDATE balance SET amount = @amount, spend_surplus = @spendSurplus, invest_surplus = @investSurplus WHERE date = @date');
      stmt.run(balance);
    });

    update({
      date: moment(date).startOf('month').format(DB_DATE_FORMAT),
      amount,
      spendSurplus,
      investSurplus,
    });
  }
}

function getBalance(date) {
  const stmt = db.prepare(`SELECT * FROM balance WHERE date <= @date ORDER BY date desc`);
  return stmt.get({
    date: moment(date).format(DB_DATE_FORMAT),
  });
}

function getAllBalanceDates() {
  const stmt = db.prepare(`SELECT date FROM balance`);
  return stmt.all();
}

module.exports = {
  getAllBalanceDates,
  getBalance,
  updateBalance,
}