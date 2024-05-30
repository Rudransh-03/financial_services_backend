const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();

const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for creating a category' });
  }

  const lowerCaseCategoryName = name.toLowerCase();

  try {
    const category = await prismaClient.category.create({
      data: { name: lowerCaseCategoryName },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error creating category', message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prismaClient.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

const editCategory = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for updating a category' });
  }

  const lowerCaseCategoryName = name.toLowerCase();

  try {
    const updatedCategory = await prismaClient.category.update({
      where: { id: parseInt(id, 10) },
      data: { name:lowerCaseCategoryName },
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error updating category', message: error.message });
  } 
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await prismaClient.category.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting category' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  editCategory,
  deleteCategory,
};
