const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
    createBudget,
    getBudgetsForUser,
    trackBudget,
    getBudgetsForCategory,
    editBudget,
    deleteBudget
} = require('../services/BudgetServices');

const router = express.Router();

router.post('/createBudget/:userId', authenticateToken, createBudget);
router.get('/getBudgetsForUser/:userId', authenticateToken, getBudgetsForUser);
router.get('/trackBudget', authenticateToken, trackBudget);
router.get('/getBudgetsForCategory/:categoryId', authenticateToken, getBudgetsForCategory);
router.put('/editBudget/:id/:userId', authenticateToken, editBudget);
router.delete('/deleteBudget/:id', authenticateToken, deleteBudget);

module.exports = router;
