# SurakshaBank

**SurakshaBank** is a full-stack banking application that demonstrates secure financial transactions and account management capabilities. This project simulates a real banking environment with features for customers to view their accounts, transfer funds, and track transaction history.

## Features

- **Secure Authentication** - Customer ID and password-based login system
- **Account Dashboard** - View account summary and balance
- **Transaction Management** - Send, receive, and track financial transactions
- **Transaction History** - Detailed view of past transactions with status tracking
- **Real-time Notifications** - Updates on transaction status changes
- **Bank-grade Security** - 256-bit SSL encryption to protect user data
- **24/7 Access** - Banking services available anytime, anywhere
- **Logging** - Logs are saved to files organized by date and type for easy troubleshooting and auditing.

## Screenshots

<div align="center">
   <img src="images/Bank-Demo-[gif].gif"/>
</div>

## Project Structure

```
SurakshaBank/
├── backend/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions and logging
│   ├── middleware/     # Express middleware
│   └── app.js          # Express application setup
│
├── frontend/
    ├── src/
    │   ├── pages/      # React components for pages
    │   ├── styles/     # CSS modules
    │   └── constants.js # Configuration constants
    └── index.html      # Entry HTML file
```

## Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/SurakshaBank.git
   cd SurakshaBank
   ```

2. Install backend dependencies

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies

   ```
   cd ../frontend
   npm install
   ```

4. Start the application
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
