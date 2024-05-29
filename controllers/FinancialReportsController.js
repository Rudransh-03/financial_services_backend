const express = require('express');
const authenticateToken = require('../middleware/auth');
const { getReportForAMonth } = require('../services/FinancialReportServices');

const router = express.Router();

router.get('/getReportForAMonth/:month/:userId', authenticateToken, getReportForAMonth);

module.exports = router;
