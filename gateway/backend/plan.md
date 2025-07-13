# 📄 LinkSuraksha – Data Models

---

## 👤 User

| Field        | Type     | Description                           |
|--------------|----------|---------------------------------------|
| `_id`        | ObjectId | Unique identifier                     |
| `name`       | String   | Full name                             |
| `email`      | String   | Required, unique                      |
| `address`    | String   | User address                          |
| `password`   | String   | Hashed with bcrypt                    |
| `accessToken`| Object   | `{ _id, email ,role("Admin","User") }`                      |
| `createdAt`  | Date     | Timestamp of creation                 |
| `updatedAt`  | Date     | Timestamp of last update              |

---

## 🏦 Account

| Field           | Type     | Description                                             |
|-----------------|----------|---------------------------------------------------------|
| `_id`           | ObjectId | Unique identifier                                       |
| `accountNumber` | String   | Unique account number                                   |
| `accountHolder` | String   | Name of account holder                                  |
| `customerID`    | String   | CustomerID of account holder                            |
| `branchName`    | String   | Name of the branch                                      |
| `ifscCode`      | String   | IFSC code                                               |
| `accountToken`   | Object   | `{ _id (Bank Account ID), accountNumber ,userID}`             |
| `status`        | String   | `Pending`,`Linked`, `Expired`                                     | 
| `gatewayPIN`| String   | AES-encrypted PIN (set after account is linked)         |
| `userID`        | ObjectId | Reference to the User                                   |
| `createdAt`     | Date     | Timestamp of creation                                   |
| `updatedAt`     | Date     | Timestamp of last update                                |

---

## 💸 SenderServiceAccount

| Field              | Type     | Description                                                  |
|--------------------|----------|--------------------------------------------------------------|
| `_id`              | ObjectId | Unique identifier                                            |
| `userID`           | ObjectId | Reference to the user                                        |
| `toAccountNumber`  | String   | Receiver's account number                                    |
| `fromAccountNumber`| String   | Sender's account number                                      |
| `amount`           | Number   | Amount to be transferred                                     |
| `status`           | String   | `Debited` → `Pending` → `Credited` \| `Refunded`             |
| `createdAt`        | Date     | Timestamp of creation                                        |
| `updatedAt`        | Date     | Timestamp of last update                                     |

---

## 📥 ReceiverServiceAccount

| Field            | Type     | Description                          |
|------------------|----------|--------------------------------------|
| `_id`            | ObjectId | Unique identifier                    |
| `userID`         | ObjectId | Reference to the user                |
| `toAccountNumber`| String   | Receiver’s account number            |
| `createdAt`      | Date     | Timestamp of creation                |

---

## 💳 Transaction

| Field              | Type     | Description                                              |
|--------------------|----------|----------------------------------------------------------|
| `_id`              | ObjectId | Unique transaction ID                                    |
| `userID`           | ObjectId | Reference to user                                        |
| `senderServiceID`  | ObjectId | Reference to `SenderServiceAccount`                     |
| `receiverServiceID`| ObjectId | (Optional) Reference to `ReceiverServiceAccount`         |
| `status`           | String   | `Success` or `Failed`                                    |
| `createdAt`        | Date     | Timestamp of creation                                    |
| `updatedAt`        | Date     | Timestamp of last update                                 |

---

## 📚 Log

| Field       | Type     | Description                                 |
|-------------|----------|---------------------------------------------|
| `_id`       | ObjectId | Unique identifier                           |
| `type`      | String   | One of: `INFO`, `ERROR`, `SECURITY`         |
| `log`       | String   | Log message or JSON string                  |
| `createdAt` | Date     | Timestamp of creation                       |

<br>
<br>

# 🌐 LinkSuraksha – API Routes

---

## 👤 User Routes

| Method | Endpoint           | Description                     | Access     |
|--------|--------------------|---------------------------------|------------|
| POST   | `/api/auth/register` | Register a new user             | Public     |
| POST   | `/api/auth/login`    | Login user and return token     | Public     |
| GET    | `/api/users/me`      | Get current user profile        | Authenticated |
| DELETE | `/api/users/me`      | Delete user account             | Authenticated |

---

## 🏦 Account Routes

| Method | Endpoint                | Description                                  | Access         |
|--------|-------------------------|----------------------------------------------|----------------|
| POST   | `/api/accounts/link`    | Link a bank account                          | Authenticated  |
| GET    | `/api/accounts`         | Get all linked accounts for the user         | Authenticated  |
| GET    | `/api/accounts/:id`     | Get details of a specific linked account     | Authenticated  |
| PUT    | `/api/accounts/:id`     | Update account (e.g., re-link or renew token)| Authenticated  |
| DELETE | `/api/accounts/:id`     | Unlink an account                            | Authenticated  |

---


## 💸 SenderServiceAccount Routes

| Method | Endpoint                          | Description                              | Access         |
|--------|-----------------------------------|------------------------------------------|----------------|
| POST   | `/api/send/initiate`              | Initiate a fund transfer                 | Authenticated  |
| GET    | `/api/send`                       | Get all send transactions                | Authenticated  |
| GET    | `/api/send/:id`                   | Get one sender transaction               | Authenticated  |

---

## 📥 ReceiverServiceAccount Routes

| Method | Endpoint                      | Description                            | Access         |
|--------|-------------------------------|----------------------------------------|----------------|
| POST   | `/api/receive/add`            | Add a receiver account                 | Authenticated  |
| GET    | `/api/receive`                | Get all saved receiver accounts        | Authenticated  |
| DELETE | `/api/receive/:id`            | Delete a receiver account              | Authenticated  |

---

## 💳 Transaction Routes

| Method | Endpoint                  | Description                              | Access         |
|--------|---------------------------|------------------------------------------|----------------|
| POST   | `/api/transactions/create`| Record a transaction (after success)     | Internal / Authenticated |
| GET    | `/api/transactions`       | Get all transactions by user             | Authenticated  |
| GET    | `/api/transactions/:id`   | Get transaction details                  | Authenticated  |

---

## 📚 Log Routes

| Method | Endpoint             | Description                            | Access         |
|--------|----------------------|----------------------------------------|----------------|
| POST   | `/api/logs`          | Create a log entry                     | Internal       |
| GET    | `/api/logs`          | Get all logs (filter by type, etc.)    | Admin only     |
| GET    | `/api/logs/:id`      | Get a single log                       | Admin only     |

---

### 🛡️ Access Levels
- `Public`: Anyone can access
- `Authenticated`: Must be logged in with a valid token
- `Internal`: Used within server logic (e.g., microservices, trusted backend)
- `Admin`: Only accessible by users with admin privileges

---

<br>
<br>

# 📦 LinkSuraksha – Full API Documentation

---

## 🔐 Auth Routes

### POST `/api/auth/register`
**Registers a new user.**

#### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "strongpassword",
  "address": "123 Street, City"
}
```

#### Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "accessToken": {"_id": "...", "email": "john@example.com", "role": "User"}
  }
}
```

#### Internal Calls:
- Hash password with bcrypt
- Store accessToken structure

---

### POST `/api/auth/login`
**Authenticates user.**

#### Request Body:
```json
{
  "email": "john@example.com",
  "password": "strongpassword"
}
```

#### Response:
```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🏦 Account Routes

### POST `/api/accounts/link`
**Link a bank account with the user.**

#### 📥 Request Body:
```json
{
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "customerID": "abc123",
  "ifscCode": "ABC0123456",
  "gatewayPIN": "1234"
}
```

#### 📤 Response:
```json
{
  "message": "Account added successfully",
  "account": { "_id": "...", "status": "Pending" },
  "redirect": "<bank-domain>/gateway/link/{customerID}/{token}"
}
```

---

### 🔧 Internal Backend Flow:
1. Create a new `Account` entry with status `"Pending"` and no `accessToken`.
2. Encrypt the `gatewayPIN` using AES (or similar symmetric encryption).
3. Associate this bank account with the currently authenticated user.
4. Generate a time-limited JWT `token` for linking flow.
5. Return a `redirect` URL to the bank's gateway UI.

---

### 🌐 External Flow via Bank Gateway:
- User is redirected to  
  **`<bank-domain>/gateway/link/{customerID}/{token}`**  
  where they enter:
  - Bank password
  - Transaction PIN

#### ✅ If credentials are valid:
- Bank verifies using internal logic.
- Bank system sends a `POST` request to:
  
  **`POST <gateway-domain>/bank/link`**

  With payload like:
  ```json
  {
    "customerID": "abc123",
    "accountNumber": "1234567890",
    "accessToken": {
      "_id": "bankAccountId",
      "accountNumber": "1234567890"
    }
  }
  ```

---

### ✅ Final Backend Processing (on `/bank/link`)
- Find the matching `Account` entry with status `"Pending"` and customerID.
- Update `status` to `"Linked"`.
- Store `accessToken` received from the bank.
- Allow user to continue using their account for transactions.

---

Let me know if you want to include a full flowchart of this interaction, JWT sample token structure, or sample implementation in Express.js or Nest.js.
