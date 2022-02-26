const moment = require('moment');

const { DB_DATE_FORMAT } = require('../globals');
const db = require('./db.js').getDb();

function calculateMonthBalance(prevBudget, prevBalance, prevExpenses, prevInvests) {
  const spendSurplus = prevBudget.spend - prevExpenses.total + (prevBalance.spend_surplus ?? 0);
  const investSurplus = prevBudget.invest - prevInvests.total + (prevBalance.invest_surplus ?? 0);

  // TODO: factor in income from previous month, as well as previous month's amount
  // const amount = spendSurplus + investSurplus + prevBalance.amount;
  const income = 0;
  const amount = prevBalance.amount + (prevBudget.spend - prevExpenses.total) + (prevBudget.invest - prevInvests.total) + income;

  return {
    investSurplus,
    spendSurplus,
    amount,
  }
}

function updateMonthBalance(date, budget, prevBalance, prevExpenses, prevInvests) {
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
      ...calculateMonthBalance(budget, prevBalance, prevExpenses, prevInvests)
    });
  } else {
    const update = db.transaction(balance => {
      const stmt = db.prepare('UPDATE balance SET amount = @amount, spend_surplus = @spendSurplus, invest_surplus = @investSurplus WHERE date = @date');
      stmt.run(balance);
    });

    update({
      date: moment(date).startOf('month').format(DB_DATE_FORMAT),
      ...calculateMonthBalance(budget, prevBalance, prevExpenses, prevInvests)
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
  updateMonthBalance,
}