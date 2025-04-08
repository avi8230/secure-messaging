# Secure Messaging App

A secure, end-to-end encrypted chat system built with **Node.js**, **React**, and **MongoDB**.

---

## 🔐 System Overview & Design

This app is designed to provide secure messaging between users using **Hybrid Encryption**, combining the strength of **RSA** (asymmetric encryption) with **AES** (symmetric encryption).

### 🔒 Encryption Strategy

- **Hybrid Encryption (RSA + AES)** is used for all communication between client and server.
- The goal is to support:
  - Secure transmission over HTTPS
  - Full encryption **even before transport**
  - Compatibility with non-ASCII text (e.g., Hebrew)
  - Preventing man-in-the-middle attacks even in development/testing

#### 🔧 How it works

1. **Key Generation**:
   - The **server** generates an RSA key pair (2048-bit) once and loads it from disk.
   - Each **client** generates its own RSA key pair **during login**, storing the private key in `localStorage` and sending the public key to the server.

2. **Secure Requests (Client → Server)**:
   - The client:
     - Generates a random **AES-256 key** and IV.
     - Encrypts the payload (e.g., message) using `AES-256-CBC`.
     - Encrypts the AES key using the **server’s RSA public key**.
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
   - The server:
     - Decrypts the AES key using its **RSA private key**.
     - Decrypts the message with AES.

3. **Secure Responses (Server → Client)**:
   - The server:
     - Prepares a JSON payload (e.g., messages, status).
     - Encrypts it using AES-256 with a fresh key/IV.
     - Encrypts the AES key using the **client’s RSA public key** (stored in the DB).
   - The client:
     - Decrypts the AES key with its **RSA private key**.
     - Decrypts the response with AES.

> ✅ This design allows secure handling of large UTF-8 messages (e.g., in Hebrew), overcoming RSA size limitations.

## 🔁 Communication Method

This app uses **Polling** (periodic API requests) instead of **WebSockets** to fetch new messages from the server. This approach simplifies deployment and avoids persistent connections while still enabling real-time-like updates.

---

## ⚙️ `.env` Configuration

### Server (`server/.env`):
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your32charlongsecureencryptionkey!
ENCRYPTION_IV=1234567890abcdef
```

> 🧠 Note: `ENCRYPTION_KEY` must be exactly 32 characters, `ENCRYPTION_IV` must be 16 characters.

### Client (`client/.env`):
```
HTTPS=true
PORT=3000
```

---

## 🛠 Installation

In both the `server` and `client` directories:

```bash
npm i
```

---

## 🔐 Generating SSL Certificate

1. Navigate to the `server/` directory.
2. Right-click the `generate-cert.ps1` file.
3. Select **"Run with PowerShell"**.
4. The following files will be created:
   - `cert/cert.pem`
   - `cert/key.pem`
5. The server will start automatically with HTTPS at `https://localhost:3001`.

### 🧪 Certificate Confirmation in Browser (first run):

- Go to: `https://localhost:3001` → Accept the certificate.
- Then go to: `https://localhost:3000` → Accept the certificate.

---

## 🧪 Load Sample Users and Messages into MongoDB

Run the following script from the `server/` directory:

```bash
cd server/scripts
node loadSampleData.js
```

The script performs the following:

- Connects to the database (`MONGO_URI`)
- Creates 2 sample users:
  - `user1@example.com` / `password123`
  - `user2@example.com` / `password123`
- Inserts encrypted messages from both users

---

## 🧪 Run Tests

To run tests with environment configuration:

```bash
cd server
npm run test:env
```

---

## 🔑 Generate Server Keys

To generate the RSA public/private key pair for the **server**, run:

```bash
cd server/scripts
node generateServerKeys.js
```

---

## 🚀 Running the App

### Server:
```bash
node index.js
```

### Client:
```bash
npm start
```

---

Good luck!
---

## 📦 Libraries Used

### 📁 Server

- **bcrypt** – Hashing passwords securely.
- **cookie-parser** – Parsing cookies in incoming requests.
- **cors** – Enabling Cross-Origin Resource Sharing.
- **crypto** – Built-in Node.js library for cryptographic operations.
- **dotenv** – Loads environment variables from a `.env` file.
- **express** – Web framework for building the API server.
- **jsonwebtoken** – For issuing and verifying JWT tokens (authentication).
- **mongoose** – MongoDB object modeling tool for Node.js.
- **winston** – Versatile logging library.

### 💻 Client

- **@emotion/react, @emotion/styled** – Styling utilities for writing CSS-in-JS.
- **@mui/material** – Material UI components for React.
- **@testing-library/*** – Suite of libraries for testing React components.
- **axios** – HTTP client for making API requests.
- **node-forge** – Implements RSA, AES, and other cryptographic tools on the frontend.
- **react, react-dom** – Core libraries for building React applications.
- **react-scripts** – Scripts and configuration for Create React App.
- **web-vitals** – Measuring performance metrics of the web app.
