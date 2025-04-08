# Secure Messaging App

A secure chat system built with Node.js, React, and MongoDB.

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