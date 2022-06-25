const moment = require('moment');

const { DB_DATE_FORMAT } = require('../globals');
const db = require('./db.js').getDb();

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

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

function updateExpense(properties) {
  const { amount, date, description, details, id, isFixed, originalAmount, type } = properties;
  
  const update = db.transaction(expense => {
    const setStatements = [];
    Object.keys(properties).forEach(property => {
      if (property === 'id') { return; }
      setStatements.push(`${camelToSnakeCase(property)} = @${property}`);
    });
    const stmt = db.prepare(`UPDATE expense SET ${setStatements.join(', ')} WHERE id = @id`);
    stmt.run(expense);
  });

  update({
    amount,
    date: moment(date).format(DB_DATE_FORMAT),
    description,
    details,
    id,
    isFixed: isFixed ? 1 : 0,
    originalAmount,
    type,
  });
}

function read(id) {
  const stmt = db.prepare(`SELECT * FROM expense WHERE id = @id`);
  return stmt.get({
    id,
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
  const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type != 'Invest' ORDER BY date desc`);
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
  const stmt = db.prepare(`SELECT * FROM expense WHERE date >= @firstDay AND date < @lastDay AND type = 'Invest' ORDER BY date desc`);
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
  read,
  updateExpense,
}