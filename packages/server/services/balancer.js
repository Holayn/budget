const moment = require('moment');
const CronJob = require('cron').CronJob;

const { BalanceDB } = require('./db/balance.js');
const { BudgetDB } = require('./db/budget.js');
const { ExpenseDB } = require('./db/expense.js');

// Auto-update balance every day. This has the added benefit of adding a new balance every month.
new CronJob('0 0 * * *', () => {
  updateBalance(moment());
}).start();

function updateBalance(date) {
  const prevMonthDate = moment(date).subtract(1, 'months');
  const prevExpenses = ExpenseDB.findExpenses(prevMonthDate);
  const prevInvests = ExpenseDB.findInvests(prevMonthDate);
  const prevBalance = BalanceDB.getByDate(prevMonthDate);
  const budget = BudgetDB.getByDate(prevMonthDate);
  if (!prevBalance || !budget) {
    return;
  }
  const newBalance = calculateMonthBalance(budget, prevBalance, prevExpenses, prevInvests);

  const currentBalance = BalanceDB.getByStartOfMonth(date);
  if (currentBalance) {
    BalanceDB.update(newBalance);
  }
  else {
    BalanceDB.create(newBalance);
  }
}

function calculateMonthBalance(prevBudget, prevBalance, prevExpenses, prevInvests) {
  const investSurplus = prevBalance.invest_surplus + (prevBudget.invest - prevInvests.total);

  // TODO: factor in income from previous month, as well as previous month's amount
  const income = 0;
  const amount = prevBalance.amount + prevBudget.total - prevExpenses.total - prevInvests.total - prevBudget.fixed + income;

  return {
    investSurplus,
    amount,
  }
}

function updateBalanceStartingFrom(date) {
  const today = moment();
  let currDate = moment(date);
  while (currDate.year() != today.year() || currDate.month() != today.month()) {
    currDate = moment(currDate).add(1, 'months');
    updateBalance(currDate);
  }
}

module.exports = {
  updateBalance,
  updateBalanceStartingFrom,
}