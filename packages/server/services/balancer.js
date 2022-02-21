const moment = require('moment');
const CronJob = require('cron').CronJob;

const { updateMonthBalance, getBalance } = require('./balance.js');
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
  const budget = getBudget(date);
  updateMonthBalance(date, budget, prevBalance, prevExpenses, prevInvests);
}

module.exports = {
  updateBalance,
}