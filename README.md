# 📚 Book Finder – Full Stack Application

A full-stack Book Finder web application that allows users to search for books, save favorites, and leave ratings and reviews.  
Built with **React**, **Node.js/Express**, and **MySQL**, following RESTful API design principles.

---

## ✨ Features

### 🔍 Book Search
- Search books by **keyword (title/description)**
- Filter by **author** and **genre**
- Combine multiple filters for advanced search

### ❤️ Favorites
- Add books to favorites
- View and remove favorites
- Favorites are **user-specific**

### 🔐 User Authentication
- Register / Login / Logout
- JWT-based authentication
- Protected routes for authenticated users

### ⭐ Ratings & Reviews (Stretch Goal)
- Users can leave ratings (1–5) and optional reviews
- Reviews are linked to both user and book

### 📱 Responsive UI
- Mobile-friendly layout
- Card-based design
- Clean, modern user interface

---

## 🛠 Tech Stack

### Frontend
- React
- React Router
- Context API
- Axios
- CSS (responsive design)

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- RESTful API

---

## 📂 Project Structure

```
book-finder-fullstack/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
└── .gitignore
```

---

## ⚙️ Setup Instructions (Local)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/book-finder-fullstack.git
cd book-finder-fullstack
```

### 2️⃣ Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=8800
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=test
JWT_SECRET=your_secret_key
```

Start the backend:
```bash
npm start
```

---

### 3️⃣ Frontend setup
```bash
cd ../client
npm install
npm start
```

The application will run at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8800

---

## 🧪 API Overview

| Method | Endpoint | Description |
|------|---------|------------|
| GET | /api/books/search | Search books with filters |
| GET | /api/books/favorites | Get user favorites |
| POST | /api/books/favorites | Add book to favorites |
| DELETE | /api/books/favorites/:id | Remove favorite |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/books/:id/reviews | Add/update review |
| GET | /api/books/:id/reviews | Get reviews for a book |

---

## 🎯 Project Requirements Coverage

✔ Full CRUD functionality  
✔ RESTful API design  
✔ MySQL relational database  
✔ React Context for global state  
✔ Authentication & protected routes  
✔ Advanced search filters  
✔ Responsive design for mobile  
✔ Stretch goals implemented  

---

## 📌 Notes
- `.env` files are intentionally ignored for security.
- This project was built as a full-stack final project and exceeds core requirements.
