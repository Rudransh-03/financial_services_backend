const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prismaClient = new PrismaClient();

const createBudget = async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    let { amount, startDate, endDate, categoryName } = req.body;

    if (!amount || !startDate || !endDate || !categoryName) {
        return res.status(400).json({ error: "One of the fields is missing!" });
    }

    const [startDay, startMonth, startYear] = startDate.split('/');
    startDate = `${startYear}/${startMonth}/${startDay}`;

    const [endDay, endMonth, endYear] = endDate.split('/');
    endDate = `${endYear}/${endMonth}/${endDay}`;

    const lowerCaseCategoryName = categoryName.toLowerCase();

    try {
        const category = await prismaClient.category.findUnique({
            where: { name: lowerCaseCategoryName },
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

        if (isPresent) {
            return res.status(400).json({ error: 'You cannot create multiple budgets for the same category for the same start/end dates' });
        }

        // const response = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}`);
        // const currencies = response.data.data;
        
        // const usdObject = Object.values(currencies).find(currency => currency.code === 'USD');

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
    } catch (error) {
        res.status(500).json({ error: "Error creating budget!!", message: error.message });
    }
};

const getBudgetsForUser = async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    try {
        const budgets = await prismaClient.budget.findMany({
            where: { userId: userId },
            include: { category: true }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
    }
};

const trackBudget = async (req, res) => {
    const categoryName = req.query.categoryName;
    const lowerCaseCategoryName = categoryName.toLowerCase();
    const userId = parseInt(req.query.userId, 10);

    try {
        const category = await prismaClient.category.findUnique({
            where:{
                name: lowerCaseCategoryName
            }
        })

        if(!category) return res.status(500).json({error: "Category not found!"});

        const budgets = await prismaClient.budget.findMany({
            where: {
                categoryId: category.id,
                userId: userId,
            },
            include: { category: true }
        });

        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets', message: error.message });
    }
};

const getBudgetsForCategory = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId, 10);

    try {
        const budgets = await prismaClient.budget.findMany({
            where: { categoryId: categoryId },
            include: { category: true }
        });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching budgets' });
    }
};

const editBudget = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    let { amount, startDate, endDate, categoryName } = req.body;

    if (!amount || !startDate || !endDate || !categoryName) {
        return res.status(400).json({ error: "One of the fields is missing!" });
    }

    const [startDay, startMonth, startYear] = startDate.split('/');
    startDate = `${startYear}/${startMonth}/${startDay}`;

    const [endDay, endMonth, endYear] = endDate.split('/');
    endDate = `${endYear}/${endMonth}/${endDay}`;

    const lowerCaseCategoryName = categoryName.toLowerCase();

    try {
        const oldBudget = await prismaClient.budget.findUnique({
            where:{
                id: id
            }
        })

        const amountDiff = amount - oldBudget.amount;
        var leftAmount = oldBudget.leftAmount + amountDiff;

        const category = await prismaClient.category.findFirst({
            where: { name: lowerCaseCategoryName },
        });

        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        const categoryId = category.id;

        const isPresent = await prismaClient.budget.findFirst({
            where: {
                userId: userId,
                categoryId: category.id,
                startDate: startDate,
                endDate: endDate,
            },
        });


        if (isPresent && (categoryId !== oldBudget.categoryId)) {
            return res.status(400).json({ error: 'You cannot create multiple budgets for the same category for the same start/end dates' });
        }


        const updatedBudget = await prismaClient.budget.update({
            where: { id: id },
            data: { userId, amount, leftAmount, startDate, endDate, categoryId },
        });

        res.json(updatedBudget);
    } catch (error) {
        res.status(500).json({ error: 'Error updating budget' });
    }
};

const deleteBudget = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        await prismaClient.budget.delete({ where: { id: id } });
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting budget' });
    }
};

module.exports = {
    createBudget,
    getBudgetsForUser,
    trackBudget,
    getBudgetsForCategory,
    editBudget,
    deleteBudget,
};
