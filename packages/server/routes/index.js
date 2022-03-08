const express = require('express');
const helmet = require('helmet');

const { EXPENSE_TYPES } = require('../globals');
const { getAllBalanceDates, getBalance } = require('../services/balance.js');
const { updateBalance } = require('../services/balancer.js');
const { addExpense, updateExpense } = require('../services/expenser.js');
const { getBudget } = require('../services/budget.js');
const { getExpenses, getFixedExpenses, getInvests } = require('../services/expense.js');
const { parse } = require('../services/expense-parser.js');

const router = express.Router();
router.use(helmet.contentSecurityPolicy({
  useDefaults: true,
}));

router.get('/updateExpenses', (req, res) => {
  parse();
  res.send({});
});

router.get('/getBudget', (req, res) => {
  res.send(getBudget(req.query.date));
});

router.get('/calculations', (req, res) => {
  const budget = getBudget(req.query.date);
  const expenses = getExpenses(req.query.date);
  const invests = getInvests(req.query.date);
  const balance = getBalance(req.query.date);
  const overInvestAmount = invests.total > budget.invest ? invests.total - budget.invest : 0;
  const overSpendAmount = expenses.total > budget.spend ? expenses.total - budget.spend : 0;
  const totalSpendAvailable = (balance.amount - overInvestAmount + budget.spend).toFixed(2);
  const totalInvestAvailable = (balance.amount - overSpendAmount + budget.invest).toFixed(2);
  const totalSpendLeft = (totalSpendAvailable - expenses.total).toFixed(2);
  const totalInvestLeft = (totalInvestAvailable - invests.total).toFixed(2);
  res.send({
    overInvestAmount,
    overSpendAmount,

    totalSpendAvailable,
    totalSpendLeft,
    totalInvestAvailable,
    totalInvestLeft,
  });
});

router.get('/getExpenses', (req, res) => {
  const expenses = getExpenses(req.query.date);
  res.send(expenses);
});
router.get('/getFixedExpenses', (req, res) => {
  res.send(getFixedExpenses(req.query.date));
});
router.get('/getInvests', (req, res) => {
  const invests = getInvests(req.query.date);
  res.send(invests);
});

router.get('/getBalance', (req, res) => {
  const balance = getBalance(req.query.date);
  res.send(balance);
});
router.get('/status', (req, res) => {
  const balance = getBalance();
  const budget = getBudget();
  const expenses = getExpenses();
  const invests = getInvests();
  const status = {
    amount: balance.amount + budget.total - expenses.total - invests.total - budget.fixed,
    // amount still need to invest + this month's invest allocation - total invested this month
    investStatus: balance.invest_surplus + budget.invest - invests.total,
  }
  res.send(status);
});

router.get('/getDates', (req, res) => {
  res.send(getAllBalanceDates());
});

router.get('/expenseTypes', (req, res) => {
  res.send(EXPENSE_TYPES);
});

router.post('/addExpense', (req, res) => {
  const { amount, date, description, type } = req.body;
  addExpense({
    amount,
    date,
    description,
    type,
  });
  res.send({});
});

router.post('/updateExpense', (req, res) => {
  const { id, amount, date, description, type } = req.body;
  updateExpense({
    amount,
    date,
    description,
    id,
    type,
  });
  res.send({});
});

/**
 * Trigger balance update manually via API
 */
router.get('/updateBalance', (req, res) => {
  updateBalance(req.query.date);
  res.sendStatus(200);
});

module.exports = router;