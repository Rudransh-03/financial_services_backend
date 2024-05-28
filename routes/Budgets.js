const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient();
const router = express.Router();
const authenticateToken = require('../middleware/auth');


router.post('/createBudget/:userId', authenticateToken, async (req,res)=>{
    const userId = parseInt(req.params.userId, 10);
    var {amount, startDate, endDate, categoryName} = req.body;

    if(!amount || !startDate || !endDate || !categoryName) return res.status(400).json({error: "One of the fields is missing!"});
    
    const [startDay, startMonth, startYear] = startDate.split('/');
    startDate = `${startYear}/${startMonth}/${startDay}`;

    const [endDay, endMonth, endYear] = startDate.split('/');
    endDate = `${endYear}/${endMonth}/${endDay}`;

    try{
        console.log(categoryName)
        const category = await prismaClient.category.findUnique({
            where: {
                name: categoryName,
            },
        });

        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        const isPresent = await prismaClient.budget.findFirst({
            where: {
                userId: userId,
                categoryId: category.id,
                startDate: startDate,
                endDate: endDate,
            },
        });

        if(isPresent) return res.status(400).json({error: 'You cannot create multiple budgets for the same category for the same start/end dates'})

        const budget = await prismaClient.budget.create({
            data: {
                amount,
                leftAmount: amount,
                startDate,
                endDate,
                categoryId: category.id,
                userId,
            },
        });
        res.status(201).json(budget);

    } catch(error){
        res.status(500).json({error: "Error creating budget!!", message: error.message });
    }
});

router.get('/getBudgetsForUser/:userId', authenticateToken, async(req, res)=>{
    const userId = parseInt(req.params.userId, 10);

    try{
        const budgets = await prismaClient.budget.findMany({
            where: {userId: parseInt(userId)},
            include: {category:true}
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
      }
})

router.get('/trackBudget/:categoryName/:userId', authenticateToken, async(req, res)=>{
    const categoryName = req.params.categoryName;
    const userId = parseInt(req.params.userId, 10);``

    try{
        const budgets = await prismaClient.budget.findMany({
            where: {
                categoryName: categoryName,
                userId: userId,
            },
            include: {category:true}
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
      }
})

router.get('/getBudgetsForCategory/:categoryId', authenticateToken, async(req, res)=>{
    const categoryId = parseInt(req.params.categoryId, 10);

    try{
        const budgets = await prismaClient.budget.findMany({
            where: {categoryId: categoryId},
            include: {category:true}
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
      }
})

router.put('/editBudget/:id/:userId', authenticateToken, async(req, res)=>{
    const id = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    const {amount, leftAmount, startDate, endDate, categoryName} = req.body;

    if(!amount || !startDate || !endDate || !categoryName || !leftAmount) return res.status(400).json({error: "One of the fields is missing!"});

    try{
        const category = await prismaClient.category.findFirst({
            where: {
                name: categoryName,
            },
        });

        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
      
        const categoryId = category.id;

        const updatedBudget = await prismaClient.budget.update({
            where: {id: parseInt(id)},
            data: {userId, amount, leftAmount, startDate, endDate, categoryId},
        })
        res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Error updating transaction' });
    }
  });

router.delete("/deleteBudget/:id", authenticateToken, async(req, res)=>{
    const id = parseInt(req.params.id, 10);
    try {
        await prismaClient.budget.delete({ where: { id: id } });
        res.json({ message: 'Budget deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error deleting transaction' });
      }
})

module.exports = router;