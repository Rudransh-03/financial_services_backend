const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const getReportForAMonth = async (req, res) => {
  const month = req.params.month;
  const userId = parseInt(req.params.userId, 10)

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: {
        userId,
        date: {
          contains: `/${month}/`
        }
      }
    });

    if (!transactions) {
      return res.status(500).json({ error: 'No transactions found for the month!' });
    }

    let netAmount = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        netAmount += transaction.amount;
      } else {
        netAmount -= transaction.amount;
      }
    });

    res.status(200).json({ transactions, netAmount });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getReportForAMonth
};
