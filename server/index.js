const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fyp';

app.use(cors());
app.use(express.json());

mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName = '', email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include a number and a special character.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({ firstName, lastName, email: email.toLowerCase(), passwordHash });

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password.' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    return res.status(200).json({ message: 'Login successful.', user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/', (req, res) => {
  res.send('Auth service running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
