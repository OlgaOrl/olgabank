const fs = require('fs');
const crypto = require('crypto');

// Create keys directory if it doesn't exist
if (!fs.existsSync('./keys')) {
  fs.mkdirSync('./keys');
}

// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Write keys to files
fs.writeFileSync('./keys/private.key', privateKey);
fs.writeFileSync('./keys/public.key', publicKey);

console.log('RSA key pair generated successfully!');
console.log('Private key saved to: ./keys/private.key');
console.log('Public key saved to: ./keys/public.key');