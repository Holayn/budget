const express = require('express');
const helmet = require('helmet');

const { EXPENSE_TYPES } = require('../globals');
const { updateBalance } = require('../services/balancer.js');
const { addExpense, fixExpense, updateExpense } = require('../services/expenser.js');
const { parse } = require('../services/expense-parser.js');

const { BalanceDB } = require('../services/db/balance.js');
const { BudgetDB } = require('../services/db/budget.js');
const { ExpenseDB } = require('../services/db/expense.js');

const router = express.Router();
router.use(helmet.contentSecurityPolicy({
  useDefaults: true,
}));

router.get('/updateExpenses', (req, res) => {
  parse();
  res.send({});
});

router.get('/getBudget', (req, res) => {
  res.send(BudgetDB.getByDate(req.query.date));
});

router.get('/calculations', (req, res) => {
  const budget = BudgetDB.getByDate(req.query.date);
  const expenses = ExpenseDB.findExpenses(req.query.date);
  const invests = ExpenseDB.findInvests(req.query.date);
  const balance = BalanceDB.getByDate(req.query.date);
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
  const expenses = ExpenseDB.findExpenses(req.query.date);
  res.send(expenses);
});
router.get('/getFixedExpenses', (req, res) => {
  res.send(ExpenseDB.findFixedExpenses(req.query.date));
});
router.get('/getInvests', (req, res) => {
  const invests = ExpenseDB.findInvests(req.query.date);
  res.send(invests);
});

router.get('/getBalance', (req, res) => {
  const balance = BalanceDB.getByDate(req.query.date);
  res.send(balance);
});
router.get('/status', (req, res) => {
  const balance = BalanceDB.getByDate();
  const budget = BudgetDB.getByDate();
  const expenses = ExpenseDB.findExpenses();
  const invests = ExpenseDB.findInvests();
  const status = {
    amount: balance.amount + budget.total - expenses.total - invests.total - budget.fixed,
    // amount still need to invest + this month's invest allocation - total invested this month
    investStatus: balance.invest_surplus + budget.invest - invests.total,
  }
  res.send(status);
});

router.get('/getDates', (req, res) => {
  res.send(BalanceDB.findAllDates());
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

router.get('/expense', (req, res) => {
  res.send(ExpenseDB.read(req.query.id));
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

router.post('/fixExpense', (req, res) => {
  const { id, amount } = req.body;
  fixExpense({
    id,
    amount,
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