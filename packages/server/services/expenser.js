const moment = require('moment');

const { DB_DATE_FORMAT } = '../globals';
const { insertExpense, getExpenses, getInvests } = require('./expense.js');
const { updateMonthBalance, getBalance } = require('./balance.js');
const { getBudget } = require('./budget.js');

function addExpense({ amount, date, description, type }) {
  insertExpense({
    amount,
    date: moment(date).format(DB_DATE_FORMAT),
    description,
    details: null,
    type,
  });

  // have to update balances for dates until today when inserting expenses
  const today = moment();
  let currDate = moment(date);
  while (currDate.year() != today.year() || currDate.month() != today.month()) {
    currDate = moment(currDate).add(1, 'months');
    const prevMonthDate = moment(currDate).subtract(1, 'months');
    const prevExpenses = getExpenses(prevMonthDate);
    const prevInvests = getInvests(prevMonthDate);
    const prevBalance = getBalance(prevMonthDate);
    const budget = getBudget(currDate);
    updateMonthBalance(currDate, budget, prevBalance, prevExpenses, prevInvests);
  }
}

module.exports = {
  addExpense,
}