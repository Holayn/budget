const moment = require('moment');
const CronJob = require('cron').CronJob;

const { updateBalance: _updateBalance, getBalance } = require('./balance.js');
const { getBudget } = require('./budget.js');
const { getExpenses, getInvests } = require('./expense.js');

// Auto-update balance every day. This has the added benefit of adding a new balance every month.
new CronJob('0 0 * * *', () => {
  updateBalance(moment());
}).start();

function updateBalance(date) {
  const prevMonthDate = moment(date).subtract(1, 'months');
  const prevExpenses = getExpenses(prevMonthDate);
  const prevInvests = getInvests(prevMonthDate);
  const prevBalance = getBalance(prevMonthDate);
  const budget = getBudget(prevMonthDate);
  if (!prevBalance || !budget) {
    return;
  }
  const newBalance = calculateMonthBalance(budget, prevBalance, prevExpenses, prevInvests);
  _updateBalance(date, newBalance);
}

function calculateMonthBalance(prevBudget, prevBalance, prevExpenses, prevInvests) {
  const investSurplus = prevBalance.invest_surplus + (prevBudget.invest - prevInvests.total);
  const spendSurplus = prevBalance.spend_surplus + (prevBudget.spend - prevExpenses.total);

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