const moment = require('moment');

const { DB_DATE_FORMAT } = '../globals';
const { insertExpense, updateExpense: _updateExpense } = require('./expense.js');
const { updateBalance } = require('./balancer.js');

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
    updateBalance(currDate);
  }
}

function updateExpense({ amount, date, description, id, type }) {
  _updateExpense({
    amount,
    date: moment(date).format(DB_DATE_FORMAT),
    description,
    details: null,
    id,
    type,
  });

  // have to update balances for dates until today when inserting expenses
  const today = moment();
  let currDate = moment(date);
  while (currDate.year() != today.year() || currDate.month() != today.month()) {
    currDate = moment(currDate).add(1, 'months');
    updateBalance(currDate);
  }
}

module.exports = {
  addExpense,
  updateExpense,
}