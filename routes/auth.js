const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'goodboy'; // Use process.env.JWT_SECRET in production

// ROUTE 1: Create a new user - POST "/api/auth/createuser"
router.post('/createuser', [
  body('name', 'Name must be at least 5 characters').isLength({ min: 5 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });

    // Generate JWT token
    const data = {
      user: {
        id: user.id
      }
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    return res.json({ authtoken });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});


// ROUTE 2: Authenticate a user - POST "/api/auth/login"
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const data = {
      user: {
        id: user.id
      }
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    return res.json({ authtoken });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

// ROUTE : Get loggedin user details usin - POST "/api/auth/getuser
router.post('/getuser', fetchuser, async (req, res) => {
  
  try {
    userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
  }
  catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
})


module.exports = router;
