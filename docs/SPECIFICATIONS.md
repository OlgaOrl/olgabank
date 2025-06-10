# Bank API Specifications

## Authentication
- Endpoint: POST /auth/login
- Request: { "username": "string", "password": "string" }
- Response: { "token": "string" }

## Account Management
- GET /accounts - Get all accounts for logged in user
- POST /accounts - Create a new account

## Internal Transfers
- Endpoint: POST /transactions/internal
- Required fields: fromAccount, toAccount, amount, currency

## External Transfers
- Endpoint: POST /transfer/external
- Required fields: fromAccount, toAccount, amount, currency

## Incoming Transfers
- Endpoint: POST /transactions/incoming
- Format: JWT-signed transfer data