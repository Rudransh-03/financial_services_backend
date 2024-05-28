const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient();
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/getReportForAMonth/:month', async (req, res)=>{
    const month = req.params.month;

    try {
        const transactions = await prismaClient.transaction.findMany({
            where: {
                date: {
                    contains: `/${month}/`
                }
            }
        });

        if(!transactions) res.status(500).json({error: "No transactions found for the month!"});
        var netAmount = 0;
        
        transactions.forEach((transaction)=>{
            if(transaction.type === 'income') netAmount += transaction.amount;
            else netAmount -= transaction.amount;
        })

        res.status(200).json({transactions, netAmount});

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

module.exports = router