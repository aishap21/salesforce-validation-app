# Salesforce Validation Rules Manager

A web app to manage Salesforce Account validation rules.

---

## ⚙️ SETUP INSTRUCTIONS

---


### STEP 1 — Install & Run the Backend

Open a terminal and run:

```bash
cd backend
npm install
node server.js
```

You should see:
```
✅ Backend running on http://localhost:5000
```

---

### STEP 2 — Install & Run the Frontend

Open a SECOND terminal and run:

```bash
cd frontend
npm install
npm start
```

This opens the app at: http://localhost:3000

---

### STEP 3 — Use the App

1. Click **"Login to Salesforce"**
2. Login with your Salesforce credentials
3. Click **"Get Validation Rules"**
4. Toggle rules ON or OFF using the buttons

---

## 📁 Project Structure

```
salesforce-app/
├── backend/
│   ├── .env          
│   ├── server.js     ← Backend server
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js    ← Main React component
    │   ├── App.css   ← Styles
    │   ├── index.js  ← Entry point
    │   └── index.css
    └── package.json
```
