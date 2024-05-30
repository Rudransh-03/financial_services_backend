const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  editCategory,
  deleteCategory
} = require('../services/CategoriesServices');

const router = express.Router();

router.post('/createCategory', authenticateToken, createCategory); 
router.get('/getCategories', authenticateToken, getCategories);
router.put('/editCategory/:id', editCategory);
router.delete('/deleteCategory/:id', authenticateToken, deleteCategory);

module.exports = router;
