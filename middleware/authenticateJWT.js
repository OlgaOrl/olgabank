const jwt = require('jsonwebtoken');
const fs = require('fs');
const { checkTokenBlacklist } = require('../controllers/authController');

const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    // First check if token is blacklisted
    checkTokenBlacklist(req, res, () => {
        // Then verify JWT
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err);
                return res.status(403).json({ error: 'Invalid token' });
            }

            // Ensure userId is available
            if (!decoded.userId) {
                return res.status(403).json({ error: 'Invalid token payload' });
            }

            req.user = decoded;
            next();
        });
    });
}

module.exports = authenticateJWT;
