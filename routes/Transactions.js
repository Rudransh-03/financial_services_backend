const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient();
const router = express.Router();

const authenticateToken = require('../middleware/auth');

router.post('/createTransaction', authenticateToken, async (req, res) => {
  const data = req.body;

  if (!data.amount || !data.type || !data.userId || !data.name) {
    return res.status(400).json({ error: 'Amount, type, name and userId are required' });
  }

  const type = data.type;
  const amount = data.amount;
  const userId = data.userId;
  const name = data.name;

  if(type !== 'expense' && type!=='income') return res.status(400).json({error: "Transaction type can only be expense or income"});

  if(type === 'expense' && !data.categoryName) return res.status(400).json({error: "You need to specify a category name for an expense"});
  
    try {

      // Format date as "dd/mm/yyyy"
      var currentDate = new Date();
      var formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

      const [day, month, year] = formattedDate.split('/');
      formattedDate = `${year}/${month}/${day}`;
      console.log(formattedDate);

      const transactionData = {
        amount,
        type,
        name,
        date: formattedDate, // Use the formatted date
        userId,
      };


      if(type === 'expense'){

        const category = await prismaClient.category.findUnique({
          where: {
            name: data.categoryName,
          },
        });
    
        if (!category) {
          return res.status(400).json({ error: 'Category not found' });
        }

        transactionData.categoryId = category.id;
  
        console.log(userId + " " + category.id);

        const budgets = await prismaClient.budget.findMany({
          where: {
              userId: userId,
              categoryId: category.id,
              startDate: {
                  lte: formattedDate, // startDate <= formattedDate
              },
              endDate: {
                  gte: formattedDate, // endDate >= formattedDate
              },
          },
      });
      
      if (budgets.length === 0) {
          return res.status(400).json({ error: 'No budgets found for this category and user within the specified date range' });
      }
  
      console.log(budgets);
  
        let remainingAmount = amount;
        for (const budget of budgets) {
            if (budget.leftAmount >= remainingAmount) {
                await prismaClient.budget.update({
                    where: { id: budget.id },
                    data: {
                        leftAmount: {
                            decrement: remainingAmount,
                        },
                    },
                });
                remainingAmount = 0;
                break;
            } else {
                remainingAmount -= budget.leftAmount;
                await prismaClient.budget.update({
                    where: { id: budget.id },
                    data: {
                        leftAmount: 0,
                    },
                });
            }
        }
        
        if (remainingAmount > 0) {
            return res.status(400).json({ error: 'Not enough budget available' });
        }
      }

      const transaction = await prismaClient.transaction.create({
        data: transactionData,
      });
        
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Error creating transaction', message: error.message });
    }
});


router.get('/getTransactionsForUser/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId: parseInt(userId) },
      include: { category: true },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

router.get('/getExpenses', authenticateToken, async(req, res)=>{
  try {
    const expenses = await prismaClient.transaction.findMany({
      where: {type: "expense"},
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
})

router.get('/getExpenseTransactionsForUser/:userId', authenticateToken, async(req, res)=>{
  const { userId } = req.params;
  try {
    const expenses = await prismaClient.transaction.findMany({
      where: {
        type: "expense",
        userId: parseInt(userId), 
      },
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
})

router.get('/getIncome', authenticateToken, async(req, res)=>{
  try {
    const incomes = await prismaClient.transaction.findMany({
      where: {type: "income"},
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
})

router.get('/getIncomeTransactionsForUser/:userId', authenticateToken, async(req, res)=>{
  const { userId } = req.params;
  try {
    const incomes = await prismaClient.transaction.findMany({
      where: {
        type: "income",
        userId: parseInt(userId)
      },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
})

router.put('/editTransaction/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount, type, categoryName } = req.body;

  if (!amount || !type || !categoryName) {
    return res.status(400).json({ error: 'Amount, type, and categoryName are required' });
  }

  try {
    const category = await prismaClient.category.findFirst({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const categoryId = category.id;
    
    const updatedTransaction = await prismaClient.transaction.update({
      where: { id: parseInt(id) },
      data: { amount, type, categoryId },
    });
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
});

router.delete('/deleteTransaction/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prismaClient.transaction.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
});

module.exports = router;