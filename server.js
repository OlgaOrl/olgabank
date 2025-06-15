require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const fs = require('fs');
const authenticateJWT = require('./middleware/authenticateJWT');

// Import routes
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const roleRoutes = require('./routes/roleRoutes');          // НОВЫЙ
const auditRoutes = require('./routes/auditRoutes');        // НОВЫЙ

const app = express();
app.use(express.json()); // Parse JSON requests

// Connect routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/accounts', authenticateJWT, accountRoutes); // Protected routes for accounts
app.use('/transactions', authenticateJWT, transactionRoutes); // Protected routes for transactions
app.use('/roles', authenticateJWT, roleRoutes);       // НОВЫЙ - Protected routes for roles
app.use('/audit', authenticateJWT, auditRoutes);      // НОВЫЙ - Protected routes for audit

// JWKS endpoint (public keys)
let jwks = {
    keys: [
        {
            alg: 'RS256',
            kty: 'RSA',
            use: 'sig',
            kid: 'bank-key-1',
            n: 'sample-public-key-n',
            e: 'AQAB'
        }
    ]
};

try {
    // Attempt to read the public key from file
    const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');
    // For demonstration, we just insert the public key into 'n'. In a real system, it should be converted to a proper JWK.
    jwks = {
        keys: [
            {
                alg: 'RS256',
                kty: 'RSA',
                use: 'sig',
                kid: 'bank-key-1',
                n: publicKey,
                e: 'AQAB'
            }
        ]
    };
} catch (error) {
    console.error('Error reading public.key file:', error);
}

// Provide JWKS
app.get('/.well-known/jwks.json', (req, res) => {
    res.json(jwks);
});

// Swagger UI for API docs
app.use('/docs', swaggerUi.serve, (req, res, next) => {
    return swaggerUi.setup(swaggerDocument)(req, res, next);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/docs`);
    console.log('New endpoints available:');                    // НОВЫЙ
    console.log('- GET /roles/my-roles');                       // НОВЫЙ
    console.log('- GET /roles/users (admin only)');             // НОВЫЙ
    console.log('- POST /roles/assign (admin only)');           // НОВЫЙ
    console.log('- GET /audit/my-logs');                        // НОВЫЙ
    console.log('- GET /audit/all-logs (admin only)');          // НОВЫЙ
    console.log('- GET /audit/stats (admin only)');             // НОВЫЙ
});