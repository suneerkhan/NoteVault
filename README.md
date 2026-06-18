# 🗒 NoteVault

> A premium full-stack Notes Management System built with React + Node.js

**Live Demo:** https://suneerkhan.github.io/NoteVault/ 
---

## ✨ Features

- 📝 Create, edit, delete notes
- 📌 Pin important notes to the top
- 🏷️ Tags with color coding (Work, Personal, Ideas, Study, etc.)
- 🔎 Live search by title & content
- 🎨 Custom accent color per note
- ⏰ Relative timestamps ("2m ago")
- 💾 Persistent JSON storage
- 📱 Fully responsive (mobile-first)
- ✨ Smooth animations & transitions

---

## 🚀 Running Locally

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Create .env with: REACT_APP_API_URL=http://localhost:5000
npm start
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
notevault/
├── backend/
│   ├── server.js        # Express API
│   ├── db.json          # JSON database (auto-created)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx      # Main app component
    │   ├── App.css      # All styles
    │   ├── api.js       # API service layer
    │   └── utils.js     # Helpers & constants
    └── package.json
```

---

## 🛠 Tech Stack

| Layer    | Technology           |
|----------|----------------------|
| Frontend | React, CSS3          |
| Backend  | Node.js, Express     |
| Database | JSON flat-file (db.json) |
| Deploy   | GitHub Pages + Render |

---

