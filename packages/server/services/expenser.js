const { ExpenseDB } = require('./db/expense.js');
const { updateBalanceStartingFrom } = require('./balancer.js');

function addExpense(expense) {
  ExpenseDB.insert(expense);
  updateBalanceStartingFrom(expense.date);
}

function fixExpense({ id, amount }) {
  const expense = ExpenseDB.read(id);
  const update = {
    amount,
    id,
    isFixed: true,
  }

  if (!expense.is_fixed) {
    update.originalAmount = expense.amount;
  }

  ExpenseDB.update(update);
  updateBalanceStartingFrom(expense.date);
}

function updateExpense(properties) {
  ExpenseDB.update(properties);
  updateBalanceStartingFrom(properties.date);
}

module.exports = {
  addExpense,
  fixExpense,
  updateExpense,
}