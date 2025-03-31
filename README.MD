# BankApp

This is a banking application that integrates with the Central Bank and enables money transfers with other banks.

## Functionality

- **User Registration and Login:**  
  Users can register with a valid username and password. Duplicates are not allowed. Upon login, a JWT-based session token is issued.

- **Account Management:**  
  Each user can have multiple accounts in different currencies. New accounts are created with a unique account number using the bank prefix (specified in the .env file).

- **Transactions:**
    - Internal transactions: Transfers between accounts belonging to the same user.
    - External transactions: Money transfers to accounts of other banks.
      Transactions include the fields `fromAccount`, `toAccount`, `amount`, and `currency`, and they have statuses (pending, inProgress, completed, failed).

- **Security and Integration with the Central Bank:**  
  All data packages are signed with JWT. Incoming transaction signatures are validated, and outgoing transactions are signed with the bank's private key (for demo purposes only). The bank provides a JWKS endpoint for publishing public keys.

- **API Documentation:**  
  SwaggerUI is available at `/docs`.

## Installation and Running

1. Clone the repository:
   ```bash
   git clone <repo-url>
2. Navigate to the project directory:
   ```bash
   cd BankApp

3. Install dependencies:
   ```bash
   npm install
4. Create a .env file (use the content provided above).
5. Start the application:
   ```bash
   npm start
6. Open your browser and navigate to http://localhost:3000/docs to view the API documentation.