const moment = require('moment');
const CronJob = require('cron').CronJob;

const { updateBalance: _updateBalance, getBalance } = require('./balance.js');
const { getBudget } = require('./budget.js');
const { getExpenses, getInvests } = require('./expense.js');

// Auto insert new balance every month
new CronJob('0 0 1 * *', () => {
  updateBalance(moment());
}).start();

function updateBalance(date) {
  const prevMonthDate = moment(date).subtract(1, 'months');
  const prevExpenses = getExpenses(prevMonthDate);
  const prevInvests = getInvests(prevMonthDate);
  const prevBalance = getBalance(prevMonthDate);
  const budget = getBudget(prevMonthDate);
  const newBalance = calculateMonthBalance(budget, prevBalance, prevExpenses, prevInvests);
  _updateBalance(date, newBalance);
}

function calculateMonthBalance(prevBudget, prevBalance, prevExpenses, prevInvests) {
  const spendSurplus = prevBudget.spend - prevExpenses.total + (prevBalance.spend_surplus ?? 0);
  const investSurplus = prevBudget.invest - prevInvests.total + (prevBalance.invest_surplus ?? 0);

  // TODO: factor in income from previous month, as well as previous month's amount
  // const amount = spendSurplus + investSurplus + prevBalance.amount;
  const income = 0;
  const amount = prevBalance.amount + prevBudget.total - prevExpenses.total - prevInvests.total - prevBudget.fixed + income;

  return {
    investSurplus,
    spendSurplus,
    amount,
  }
}

module.exports = {
  updateBalance,
}