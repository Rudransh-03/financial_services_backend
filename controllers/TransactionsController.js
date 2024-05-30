const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  createTransaction,
  getTransactionsForUser,
  getExpenses,
  getExpenseTransactionsForUser,
  getIncome,
  getIncomeTransactionsForUser,
  getTransactionsForCategory,
  editTransaction,
  deleteTransaction
} = require('../services/TransactionServices');

const router = express.Router();

router.post('/createTransaction', authenticateToken, createTransaction);
router.get('/getTransactionsForUser/:userId', authenticateToken, getTransactionsForUser);
router.get('/getExpenses', authenticateToken, getExpenses);
router.get('/getExpenseTransactionsForUser/:userId', authenticateToken, getExpenseTransactionsForUser);
router.get('/getIncome', authenticateToken, getIncome);
router.get('/getIncomeTransactionsForUser/:userId', authenticateToken, getIncomeTransactionsForUser);
router.get('/getExpensesForCategory/:categoryName/:userId', authenticateToken, getTransactionsForCategory);
router.put('/editTransaction/:id', authenticateToken, editTransaction);
router.delete('/deleteTransaction/:id', authenticateToken, deleteTransaction);

module.exports = router;
