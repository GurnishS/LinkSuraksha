# LinkSuraksha Merchant

![alt text](public/logo.png)
A secure merchant payment interface for the LinkSuraksha payment system, built with React and Vite. This application enables merchants to generate QR codes, manage transactions, and process payments securely.

## Features

- **QR Code Generation**: Dynamic QR code generation for secure payment transactions
- **Payment Dashboard**: Real-time transaction monitoring and management
- **Shopping Cart**: Integrated cart system for order management
- **Secure Payments**: JWT-based authentication and secure payment processing
- **Responsive Design**: Modern UI with Tailwind CSS and Lucide icons

## Screenshots

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd linksuraksha-merchant
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable components
│   └── LinkSurakshaQR.jsx
├── Pages/              # Application pages
│   ├── Cart.jsx
│   ├── dashboard.jsx
│   └── payment.jsx
├── CSS/                # Component-specific styles
├── utils/              # Utility functions
│   └── merchantHandler.js
└── App.jsx             # Main application component
```
