const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');

const app = express();

// Middleware
app.use(
  cors({
    origin: 'https://signup-app-with-mern-stack-ipya.vercel.app', // React frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dpxx5upa0',
  api_key: '149525395734734',
  api_secret: 'gLkxqYnm44K4fUg7TbF0MKwEu08',
});

// MongoDB connection
const mongoURI = 'mongodb+srv://admin:admin%402023@cluster0.u3djt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
});

// Prevent the model from being redefined in serverless environments
let User;
try {
  User = mongoose.model('User'); // Attempt to get the model
} catch (error) {
  User = mongoose.model('User', userSchema); // If not found, create it
}

// Image upload setup using multer
const upload = multer({ dest: 'uploads/' });

// Signup Route with image upload
app.post('/signup', upload.single('image'), async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Upload image to Cloudinary
    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path); // Upload image
      profileImageUrl = result.secure_url; // Get the image URL

      // Remove the uploaded file from local storage
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
      
