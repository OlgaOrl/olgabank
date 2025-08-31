const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('../models/user');

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const tokenBlacklist = new Set();

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Fix: Return 400 for validation errors, NOT 401
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(username, hashedPassword);
        await User.save(user);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findByUsername(username);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username }, 
            privateKey, 
            { algorithm: 'RS256', expiresIn: '1h' }
        );
        
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Fix: Implement token blacklisting
const logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        tokenBlacklist.add(token);
    }
    
    res.json({ message: 'Logged out successfully' });
};

// Add token blacklist check function
const checkTokenBlacklist = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Token invalidated' });
    }
    next();
};

const getTokenBlacklist = () => tokenBlacklist;

module.exports = {
    register,
    login,
    logout,
    checkTokenBlacklist,
    getTokenBlacklist
};
