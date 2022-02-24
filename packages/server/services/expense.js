const moment = require('moment');

const { DB_DATE_FORMAT } = require('../globals');
const db = require('./db.js').getDb();

function insertExpense({ amount, date, description, details, type }) {
  const insert = db.transaction(expense => {
    const stmt = db.prepare('INSERT INTO expense (type, amount, description, details, date) VALUES (@type, @amount, @description, @details, @date)');
    stmt.run(expense);
  });

  insert({
    type,
    amount,
    description,
    details,
    date: moment(date).format(DB_DATE_FORMAT),
  });
}

function updateExpense({ amount, date, description, details, id, type }) {
  const update = db.transaction(expense => {
    const stmt = db.prepare('UPDATE expense SET amount = @amount, date = @date, description = @description, details = @details, type = @type WHERE id = @id');
    stmt.run(expense);
  });

  update({
    amount,
    date: moment(date).format(DB_DATE_FORMAT),
    description,
    details,
    id,
    type,
  });
}

function findExpenseWithDescription(description) {
  const stmt = db.prepare('SELECT * FROM expense WHERE description = @description');
  return stmt.get({
    description,
  });
}

function findExistingExpenseEntry({ amount, date, description }) {
  const stmt = db.prepare('SELECT * FROM expense WHERE date = @date AND amount = @amount AND description = @description');
  return stmt.get({
    amount,
    date: moment(date).format(DB_DATE_FORMAT),
    description,
  });
}

function getExpenses(date) {
  const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type != 'Invest'`);
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

function getFixedExpenses(date) {
  const stmt = db.prepare(`SELECT * FROM fixed_expense WHERE start <= @date AND end >= @date`);
  return stmt.all({
    date: moment(date).format(DB_DATE_FORMAT),
  });
}

function getInvests(date) {
  const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type = 'Invest'`);
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

module.exports = {
  findExistingExpenseEntry,
  findExpenseWithDescription,
  getExpenses,
  getFixedExpenses,
  getInvests,
  insertExpense,
  updateExpense,
}