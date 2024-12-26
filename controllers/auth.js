// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv =  require("dotenv")

const router = express.Router()

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: envFile });

const JWT_SECRET = process.env.JWT_SECRET; 
const users = []; // Mock database (replace with real DB in production)

// Helper to generate a JWT
const generateToken = (user) => {
  console.log(JWT_SECRET)
  return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
};



const signUpController = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) { 
      return res.status(400).send('Username and password are required.');
    }
  
    // Check if the user already exists
    if (users.find((user) => user.username === username)) {
      return res.status(400).send('User already exists.');
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Save the user
    users.push({ username, password: hashedPassword });
    console.log(users)
  
    return res.send('User registered successfully!');
  };

const loginController =  async (req, res) => {

    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('Username and password are required.');
    }
  
    // Find the user
    const user = users.find((user) => user.username === username);
    console.log(user)
    if (!user) {
      return res.status(400).send('Invalid username or password.');
    }
  
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid username or password.');
    }
  
    // Generate JWT
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
  
    res.send('Login successful!');
  };

module.exports = {signUpController, loginController};

