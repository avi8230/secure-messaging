# 🔐 Secure Messaging App

A secure, end-to-end encrypted chat system built with **Node.js**, **React**, and **MongoDB**.

---

## 🧠 Overview

This project provides a robust and secure messaging platform based on **Hybrid Encryption**, combining the strengths of **RSA (asymmetric)** and **AES (symmetric)** cryptography. Messages are encrypted both in transit and before transmission, ensuring true end-to-end encryption.

---

## 🔒 Encryption Strategy

### Hybrid Encryption (RSA + AES)

- All communication between the client and server is encrypted using a hybrid approach.
- Messages are encrypted *before* being sent over HTTPS to prevent man-in-the-middle attacks—even during development.
- Full support for **UTF-8**, including non-ASCII characters (e.g., Hebrew).

### 🔧 How It Works

#### 1. Key Generation
- **Server**:
  - Generates a 2048-bit RSA key pair once and loads it from disk.
- **Client**:
  - Generates its own RSA key pair upon login.
  - Saves the **private key** in `localStorage`.
  - Sends the **public key** to the server.

#### 2. Sending Encrypted Requests (Client ➝ Server)
- Client:
  - Generates an AES-256 key and IV.
  - Encrypts the message payload using `AES-256-CBC`.
  - Encrypts the AES key with the server's **RSA public key**.
  - Sends:
    ```json
    {
      "encryptedKey": "<RSA-encrypted AES key>",
      "encryptedData": {
        "iv": "<AES IV>",
        "data": "<AES-encrypted payload>"
      }
    }
    ```
- Server:
  - Decrypts the AES key using its RSA **private key**.
  - Decrypts the message using AES.

#### 3. Returning Encrypted Responses (Server ➝ Client)
- Server:
  - Encrypts response payload using AES-256.
  - Encrypts AES key using client’s **RSA public key** (stored in DB).
- Client:
  - Decrypts AES key with its **private RSA key**.
  - Decrypts response data using AES.

> ✅ This approach supports large, UTF-8 messages (like Hebrew text) without exceeding RSA limits.

---

## 🔁 Communication Method

The system uses **Polling** instead of WebSockets to fetch messages periodically. This simplifies deployment and avoids persistent connections while maintaining near real-time updates.

---

## ⚙️ Environment Configuration

### Server (`server/.env`)
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your32charlongsecureencryptionkey!
ENCRYPTION_IV=1234567890abcdef
```

> 🧠 `ENCRYPTION_KEY` must be exactly 32 characters, and `ENCRYPTION_IV` must be 16 characters.

### Client (`client/.env`)
```
HTTPS=true
PORT=3000
```

---

## 📦 Installation

In both `server/` and `client/` directories, run:

```bash
npm install
```

---

## 🔑 Generate Server RSA Keys

To generate the RSA public/private key pair for the **server**:

```bash
cd server/scripts
node generateServerKeys.js
```

---

## 🔐 Generate SSL Certificate

1. Navigate to the `server/` directory.
2. Right-click `generate-cert.ps1`.
3. Select **"Run with PowerShell"**.
4. Generated files:
   - `cert/cert.pem`
   - `cert/key.pem`
5. The server will start with HTTPS at:  
   `https://localhost:3001`

### 🧪 Browser Certificate Approval (First Time)

- Open `https://localhost:3001` in your browser and accept the certificate.
- Then open `https://localhost:3000` and accept it again.

---

## 📥 Load Sample Data (Users & Messages)

To preload the database with test users and messages:

```bash
cd server/scripts
node loadSampleData.js
```

This will:

- Connect to `MONGO_URI`.
- Create two users:
  - `user1@example.com` / `password123`
  - `user2@example.com` / `password123`
- Insert encrypted sample messages.

---

## 🧪 Running Tests

```bash
cd server
npm run test:env
```

---


## 🚀 Running the App

Follow these steps to run the full application:

---

### 1. 🔑 Generate Server RSA Keys (only once)

```bash
cd server/scripts
node generateServerKeys.js
```

---

### 2. 🔐 Generate SSL Certificate (only once)

```bash
cd server
powershell ./generate-cert.ps1
```

> This will generate:
> - `cert/cert.pem`
> - `cert/key.pem`

The server will be ready to run over HTTPS at:  
`https://localhost:3001`

---

### 3. ⚙️ Configure Environment Variables

Ensure `.env` files exist in both `server/` and `client/` directories.

#### Example: `server/.env`
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your32charlongsecureencryptionkey!
ENCRYPTION_IV=1234567890abcdef
```

#### Example: `client/.env`
```
HTTPS=true
PORT=3000
```

---

### 4. 📦 Install Dependencies

In both `server/` and `client/` directories, run:

```bash
npm install
```

---

### 5. 🧪 Load Sample Users and Messages (optional)

```bash
cd server/scripts
node loadSampleData.js
```

---

### 6. 🚀 Start the App

#### Start the Server:

```bash
cd server
node index.js
```

#### Start the Client:

In another terminal:

```bash
cd client
npm start
```

---

### 7. 🌐 Accept SSL Certificate in Browser

First time only:

1. Visit `https://localhost:3001` and accept the certificate.
2. Then visit `https://localhost:3000` and accept it.

You're now ready to use the Secure Messaging App! 🎉


## 📚 Libraries Used

### 🖥 Server

- `bcrypt` – Secure password hashing  
- `cookie-parser` – Cookie handling  
- `cors` – Cross-origin support  
- `crypto` – Built-in Node.js cryptography  
- `dotenv` – Environment variable management  
- `express` – Web framework  
- `jsonwebtoken` – JWT token handling  
- `mongoose` – MongoDB ODM  
- `winston` – Logging utility

### 🌐 Client

- `@emotion/react` / `@emotion/styled` – CSS-in-JS styling  
- `@mui/material` – Material UI components  
- `@testing-library/*` – Component testing  
- `axios` – HTTP client  
- `node-forge` – Frontend cryptography (RSA, AES)  
- `react`, `react-dom` – Core React libraries  
- `react-scripts` – Create React App configuration  
- `web-vitals` – App performance metrics

---

## ✅ License

This project is open-source and licensed under the [MIT License](LICENSE).

---

Good luck and have fun! 🚀