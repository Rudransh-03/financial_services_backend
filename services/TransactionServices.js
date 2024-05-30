const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const createTransaction = async (req, res) => {
  const data = req.body;

  if (!data.amount || !data.type || !data.userId || !data.name) {
    return res.status(400).json({ error: 'Amount, type, name, and userId are required' });
  }

  const { type, amount, userId, name } = data;

  const lowerCaseName = name.toLowerCase();

  if (type !== 'expense' && type !== 'income') {
    return res.status(400).json({ error: 'Transaction type can only be expense or income' });
  }

  if (type === 'expense' && !data.categoryName) {
    return res.status(400).json({ error: 'You need to specify a category name for an expense' });
  }

  try {
    var currentDate = new Date();
    var formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const [day, month, year] = formattedDate.split('/');
    formattedDate = `${year}/${month}/${day}`;
    
    const transactionData = {
      amount,
      type,
      name:lowerCaseName,
      date: formattedDate,
      userId,
    };

    if (type === 'expense') {
      const category = await prismaClient.category.findUnique({
        where: { name: data.categoryName.toLowerCase() },
      });

      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }

      transactionData.categoryId = category.id;

      const budgets = await prismaClient.budget.findMany({
        where: {
          userId: userId,
          categoryId: category.id,
          startDate: { lte: formattedDate },
          endDate: { gte: formattedDate },
        },
      });

      if (budgets.length === 0) {
        return res.status(400).json({ error: 'No budgets found for this category and user within the specified date range' });
      }

      let remainingAmount = amount;

      for (const budget of budgets) {
        if (budget.leftAmount >= remainingAmount) {
          await prismaClient.budget.update({
            where: { id: budget.id },
            data: { leftAmount: { decrement: remainingAmount } },
          });
        } 
        
        else {
          return res.status(400).json({ error: 'You are going over-budget with this transaction!!' });
        }
      }

    }

    const transaction = await prismaClient.transaction.create({
      data: transactionData,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error creating transaction', message: error.message });
  }
};

const getTransactionsForUser = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId: userId },
      include: { category: true },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await prismaClient.transaction.findMany({
      where: { type: 'expense' },
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

const getExpenseTransactionsForUser = async (req, res) => {
  const  userId  = parseInt(req.params.userId, 10);

  try {
    const expenses = await prismaClient.transaction.findMany({
      where: {
        type: 'expense',
        userId,
      },
      include: { category: true },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

const getIncome = async (req, res) => {
  try {
    const incomes = await prismaClient.transaction.findMany({
      where: { type: 'income' },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incomes' });
  }
};

const getIncomeTransactionsForUser = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const incomes = await prismaClient.transaction.findMany({
      where: {
        userId,
        type: 'income',
      },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incomes' });
  }
};

const getTransactionsForCategory = async (req, res) => {
  const categoryName = req.params.categoryName;
  const userId = parseInt(req.params.userId);

  const lowerCaseCategoryName = categoryName.toLowerCase();

  try {
    const category = await prismaClient.category.findFirst({
      where: {
        name: lowerCaseCategoryName
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found!!' });
    }

    const expenses = await prismaClient.transaction.findMany({
      where: {
        userId,
        categoryId: category.id,
      },
      include: { category: true },
    })

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses for this category' });
  }
}


const editTransaction = async (req, res) => {
  const id  = parseInt(req.params.id, 10);
  const { amount, name, type, categoryName } = req.body;

  if (!amount || !name || !type) {
    return res.status(400).json({ error: 'Amount, name, type are required' });
  }

  if(type === 'expense' && !categoryName) return res.status(400).json({ error: 'Category Name is required in type expense' });

  if(type === 'income' && categoryName) return res.status(400).json({ error: 'Income type transaction cannot have a cateogry name'});

  const oldTransaction = await prismaClient.transaction.findUnique({
    where:{
      id
    }
  });

  if(oldTransaction.type !== type) return res.status(400).json({error: 'You cannot convert an income transaction to an expense transaction or vice-versa. Either delete and create a new transaction or edit another transaction'});

  try {

    const editDataBody = {
        amount,
        name,
        type
    }

    if(type === 'expense'){
      const date = oldTransaction.date;
      const oldCategoryId = oldTransaction.categoryId;
      
      const budgets = await prismaClient.budget.findMany({
        where:{
          categoryId: oldCategoryId,
          startDate :{
            lte: date
          },
          endDate:{
            gte: date
          }
        }
      })

      const category = await prismaClient.category.findFirst({
        where: { name: categoryName.toLowerCase() },
      });
  
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }

      editDataBody.categoryId = category.id;

      for(let budget of budgets){
        if(budget.leftAmount + oldTransaction.amount - amount < 0) res.status(500).send({error : 'You are going overbudget for this transaction'});
        
        const newAmount = budget.leftAmount + oldTransaction.amount - amount;
        
        await prismaClient.budget.update({
          where:{ id: budget.id},
          data : {
            leftAmount : newAmount
          }
        })
      }
    }

    const updatedTransaction = await prismaClient.transaction.update({
      where: { id },
      data: editDataBody,
    });

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction', message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const id  = parseInt(req.params.id, 10);

  const transaction = await prismaClient.transaction.findUnique({
    where:{
      id
    }
  })

  if(transaction.type === 'expense'){
    const categoryId = transaction.categoryId;
    const budgets = await prismaClient.budget.findMany({
      where:{
        categoryId,
        startDate:{
          lte: transaction.date
        },
        endDate:{
          gte: transaction.date
        }
      }
    });

    for(let budget of budgets){
      await prismaClient.budget.update({
        where: { id: budget.id },
        data: { leftAmount: { increment: transaction.amount } },
      });
    }
  }

  try {
    await prismaClient.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting transaction' });
  }
};

module.exports = {
  createTransaction,
  getTransactionsForUser,
  getExpenses,
  getExpenseTransactionsForUser,
  getIncome,
  getIncomeTransactionsForUser,
  getTransactionsForCategory,
  editTransaction,
  deleteTransaction,
};
