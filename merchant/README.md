# LinkSuraksha Merchant

<div align="center">
  <img src="public/logo.png"/>
</div>
A secure merchant payment interface for the LinkSuraksha payment system, built with React and Vite. This application is an E-commerce website to demonstrate transaction on online platform via LinkSuraksha Gateway.

## Features

- **Shopping Cart**: Integrated cart system for order management
- **Secure Payments**: JWT-based authentication and secure payment processing
- **Responsive Design**: Modern UI with Tailwind CSS and Lucide icons

## Screenshots

<div align="center">
  <img src="public/Merchant-Demo_gif.gif"/>
</div>

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
## Installation

1. Clone the repository

```bash
cd merchant
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

