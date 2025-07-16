# LinkSuraksha - SecureLink Payment Ecosystem

![LinkSuraksha Logo](home/public/logo.png)

**LinkSuraksha** is a comprehensive privacy-first transaction system that enables secure digital payments without exposing actual bank account details. This innovative platform creates temporary, encrypted "service accounts" that act as isolated digital identities, providing enhanced security and privacy for all financial transactions.

## Overview

LinkSuraksha revolutionizes digital payments by implementing a multi-layered security architecture that protects user privacy while maintaining transaction transparency. Instead of exposing sensitive financial information like account numbers, UPI IDs, or card details, users operate through temporary service accounts that are:

- **Unique and Time-Limited**: Each service account is generated for specific transactions or merchants
- **Privacy-Protected**: Real bank information remains completely hidden from third parties
- **User-Controlled**: Full control over spending limits, merchant access, and validity periods
- **Automatically Deactivated**: Service accounts expire after completion or timeout

## System Architecture

The LinkSuraksha ecosystem consists of multiple interconnected components:

```
LinkSuraksha Ecosystem
├── Gateway System (Core Platform)
├── Banking Integration (SurakshaBank)
├── Merchant Portal
```

## Key Features

### Core Security Features

- **Temporary Service Accounts**: Encrypted, isolated digital identities for transactions
- **Real-time Transaction Tracking**: Individual monitoring and recording of all transactions
- **Tamper Detection**: Immediate alerts and automated countermeasures against breaches
- **Automated Attacker Tracing**: Metadata collection (device ID, IP, digital fingerprint) upon security violations

### User Control Features

- **Spending Policies**: User-defined transaction limits and merchant filters
- **Auto-pay Integration**: Support for subscription and recurring payment services
- **Consent-based Controls**: Grant, revoke, or restrict transaction access at any time
- **Complete Audit Trail**: Comprehensive logging for monitoring and compliance

### Advanced Capabilities

- **QR Code Payments**: Quick and secure payment processing
- **Multi-platform Integration**: Support for various payment methods (UPI, cards, e-mandates)
- **Real-time Notifications**: Live status updates via Server-Sent Events (SSE)
- **Blockchain Integration**: Optional blockchain-backed transaction logs for transparency

## Project Components

### [Banking System (SurakshaBank)](./bank/README.md)

A full-stack banking application that simulates secure financial transactions and account management.

- **Location**: `./bank/`
- **Features**: Account management, secure authentication, transaction processing
- **Tech Stack**: Node.js, React, Express

### [Gateway System (Core Platform)](./gateway/README.md)

The central payment gateway providing seamless financial transactions with enhanced security.

- **Location**: `./gateway/`
- **Features**: JWT authentication, real-time transactions, merchant integration
- **Tech Stack**: Node.js, React, MongoDB, SSE

### [Merchant Portal](./merchant/README.md)

Secure merchant payment interface for business transaction management.

- **Location**: `./merchant/`
- **Features**: QR code generation, payment dashboard, shopping cart integration
- **Tech Stack**: React, Vite, Tailwind CSS

### Access Points

- **Home Interface**: http://localhost:3000
- **Gateway Frontend**: http://localhost:3001
- **Banking Frontend**: http://localhost:3002
- **Merchant Portal**: http://localhost:5173
- **Gateway API**: http://localhost:8000
- **Banking API**: http://localhost:8001

## Security & Privacy

LinkSuraksha implements multiple layers of security:

1. **Data Encryption**: AES encryption for all sensitive data
2. **Secure Authentication**: JWT-based authentication with role-based access
3. **Network Security**: 256-bit SSL encryption for all communications
4. **Privacy Protection**: Zero exposure of actual bank account details
5. **Tamper Detection**: Real-time monitoring and automated response systems

## Transaction Flow

```
User Request → Service Account Creation → Encrypted Transaction →
Bank Processing → Real-time Updates → Transaction Completion →
Service Account Deactivation → Audit Log Entry
```

## Development

### Available Scripts

Each component includes its own development scripts. See individual README files for detailed instructions:

- [Gateway Development Guide](./gateway/README.md#development)
- [Banking System Setup](./bank/README.md#installation)
- [Merchant Portal Guide](./merchant/README.md#installation)

## Compliance & Standards

LinkSuraksha is designed with compliance in mind:

- **DPDP Act (India)**: Digital Personal Data Protection compliance
- **GDPR**: General Data Protection Regulation adherence
- **PCI DSS**: Payment Card Industry Data Security Standards
- **Banking Regulations**: Compliance with local banking and financial regulations
