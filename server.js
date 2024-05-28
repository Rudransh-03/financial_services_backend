const express = require('express');
const bodyParser = require('body-parser');
const prisma = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CategoriesRouter = require('./routes/Categories');
const BudgetsRouter = require('./routes/Budgets');
const FinancialReportsRouter = require('./routes/FinancialReports');
const TransactionsRouter = require('./routes/Transactions');

const app = express();
app.use(bodyParser.json());

const prismaClient = new prisma.PrismaClient();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Register a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  res.json({ token, expiresIn:" 1hour", assignedTime: currentTime});
});

const authenticateToken = require('./middleware/auth');

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.user.userId });
});

app.use('/categories', CategoriesRouter);
app.use('/transactions', TransactionsRouter);
app.use('/budgets', BudgetsRouter);
app.use('/financialReports', FinancialReportsRouter)