const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient();
const router = express.Router();
const authenticateToken = require('../middleware/auth');


router.post('/createCategory', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for creating a category' });
  }

  try {
    const category = await prismaClient.category.create({
      data: {
        name,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error creating category' });
  }
});

router.get('/getCategories', authenticateToken, async (req, res) => {
  try {
    const categories = await prismaClient.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

router.put('/editCategory/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for updating a category' });
  }

  try {
    const updatedCategory = await prismaClient.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error updating category' });
  }
});

router.delete('/deleteCategory:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prismaClient.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting category' });
  }
});

module.exports = router;