const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, Last name, Email and password are required' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const user = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
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
router.post('/login', async (req, res) => {
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
  
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
    res.json({ token, expiresIn:" 1hour", assignedTime: currentTime});
  });

  module.exports = router;