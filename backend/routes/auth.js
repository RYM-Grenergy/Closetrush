const router = require('express').Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body;
        // In a real app, hash password here using bcrypt
        const newUser = new User({ username, fullName, email, password });
        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json(`${field.charAt(0).toUpperCase() + field.slice(1)} already taken.`);
        }
        res.status(500).json(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found!");

        // In a real app, compare hashed password
        if (user.password !== req.body.password) return res.status(400).json("Wrong credentials!");

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found!");

        if (user.role !== 'admin') return res.status(403).json("Access Denied: Admins Only");

        if (user.password !== req.body.password) return res.status(400).json("Wrong credentials!");

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
