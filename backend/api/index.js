const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'https://signup-app-with-mern-stack-ipya.vercel.app', // Replace with your frontend URL
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies if needed
  })
);

app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://admin:admin%402023@cluster0.u3djt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully!' });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      'mySuperSecretKey1234',  // Replace with your JWT secret directly
      { expiresIn: '1h' }
    );
    res.status(200).json({ success: true, token });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch All Users Route
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });  // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error });
  }
});

// Export the Express app to be used by Vercel serverless
module.exports = app;
