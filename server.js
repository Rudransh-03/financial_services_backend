const express = require('express');
const bodyParser = require('body-parser');
const CategoriesController = require('./controllers/CategoriesController');
const BudgetsController = require('./controllers/BudgetsController');
const FinancialReportsController = require('./controllers/FinancialReportsController');
const TransactionsController = require('./controllers/TransactionsController');
const AuthController = require('./controllers/AuthController');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use('/auth', AuthController);
app.use('/categories', CategoriesController);
app.use('/transactions', TransactionsController);
app.use('/budgets', BudgetsController);
app.use('/financialReports', FinancialReportsController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});