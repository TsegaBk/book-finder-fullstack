import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

/* =========================
   Database Connection
========================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   Helpers
========================= */
function signToken(user) {
  const payload = { id: user.id, email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing auth token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

/* =========================
   AUTH ROUTES
========================= */

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password are required" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const q = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
    db.query(q, [name.trim(), email.trim().toLowerCase(), password_hash], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email already exists" });
        }
        console.error(err);
        return res.status(500).json({ error: "Failed to register" });
      }

      const user = { id: result.insertId, name, email: email.trim().toLowerCase() };
      const token = signToken(user);

      res.status(201).json({ token, user });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to register" });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const q = "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1";
  db.query(q, [email.trim().toLowerCase()], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to login" });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userRow = rows[0];
    const ok = await bcrypt.compare(password, userRow.password_hash);

    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = { id: userRow.id, name: userRow.name, email: userRow.email };
    const token = signToken(user);

    res.json({ token, user });
  });
});

// Get current user
app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

/* =========================
   BOOKS CRUD + SEARCH (API)
========================= */

// GET all books
app.get("/api/books", (req, res) => {
  const q = "SELECT * FROM books";
  db.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch books" });
    }
    res.json(data);
  });
});

// SEARCH books with filters
app.get("/api/books/search", (req, res) => {
  const { q, author, genre } = req.query;

  if (!q && !author && !genre) {
    return res.status(400).json({
      error: "Provide at least one query parameter: q, author, or genre",
    });
  }

  let sql = "SELECT * FROM books WHERE 1=1";
  const values = [];

  if (q) {
    sql += " AND (title LIKE ? OR `desc` LIKE ?)";
    values.push(`%${q}%`, `%${q}%`);
  }
  if (author) {
    sql += " AND author LIKE ?";
    values.push(`%${author}%`);
  }
  if (genre) {
    sql += " AND genre LIKE ?";
    values.push(`%${genre}%`);
  }

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to search books" });
    }
    res.json(data);
  });
});

/* =========================
   FAVORITES (USER-SPECIFIC)
========================= */

// GET favorites for logged-in user
app.get("/api/books/favorites", authRequired, (req, res) => {
  const userId = req.user.id;

  const q = `
    SELECT f.id AS favorite_id, b.*
    FROM favorites f
    JOIN books b ON b.id = f.book_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch favorites" });
    }
    res.json(data);
  });
});

// ADD favorite for logged-in user
app.post("/api/books/favorites", authRequired, (req, res) => {
  const userId = req.user.id;
  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ error: "book_id is required" });
  }

  const q = "INSERT INTO favorites (user_id, book_id) VALUES (?, ?)";

  db.query(q, [userId, book_id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Book is already in favorites" });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(404).json({ error: "Book not found" });
      }
      console.error(err);
      return res.status(500).json({ error: "Failed to add favorite" });
    }

    res.status(201).json({ message: "Added to favorites" });
  });
});

// REMOVE favorite (must belong to logged-in user)
app.delete("/api/books/favorites/:id", authRequired, (req, res) => {
  const userId = req.user.id;
  const favoriteId = req.params.id;

  const q = "DELETE FROM favorites WHERE id = ? AND user_id = ?";

  db.query(q, [favoriteId, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to remove favorite" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Removed from favorites" });
  });
});

/* =========================
   REVIEWS (Ratings + Comments)
========================= */

// Get reviews for a book + average rating
app.get("/api/books/:id/reviews", (req, res) => {
  const bookId = req.params.id;

  const avgQ = `
    SELECT 
      ROUND(AVG(rating), 2) AS avg_rating,
      COUNT(*) AS review_count
    FROM reviews
    WHERE book_id = ?
  `;

  const listQ = `
    SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
           u.id AS user_id, u.name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.book_id = ?
    ORDER BY r.updated_at DESC
  `;

  db.query(avgQ, [bookId], (err1, avgRows) => {
    if (err1) {
      console.error(err1);
      return res.status(500).json({ error: "Failed to load rating summary" });
    }

    db.query(listQ, [bookId], (err2, listRows) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Failed to load reviews" });
      }

      res.json({
        summary: {
          avg_rating: avgRows?.[0]?.avg_rating ?? null,
          review_count: avgRows?.[0]?.review_count ?? 0,
        },
        reviews: listRows,
      });
    });
  });
});

// Get review summary for many books (for cards)
app.get("/api/reviews/summary", (req, res) => {
  const idsRaw = req.query.ids || "";
  const ids = idsRaw
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n));

  if (ids.length === 0) return res.json({});

  const placeholders = ids.map(() => "?").join(",");

  const q = `
    SELECT book_id,
           ROUND(AVG(rating), 2) AS avg_rating,
           COUNT(*) AS review_count
    FROM reviews
    WHERE book_id IN (${placeholders})
    GROUP BY book_id
  `;

  db.query(q, ids, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load review summary" });
    }

    // return as object: { "3": {avg_rating: 4.5, review_count: 2}, ... }
    const out = {};
    rows.forEach((r) => {
      out[r.book_id] = { avg_rating: r.avg_rating, review_count: r.review_count };
    });
    res.json(out);
  });
});

// Create OR update a review (must be logged in)
app.post("/api/books/:id/reviews", authRequired, (req, res) => {
  const bookId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  const ratingNum = parseInt(rating, 10);

  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "rating must be an integer 1–5" });
  }

  if (comment && comment.length > 500) {
    return res.status(400).json({ error: "comment must be <= 500 characters" });
  }

  // Upsert: insert if new, update if exists (because of UNIQUE(user_id, book_id))
  const q = `
    INSERT INTO reviews (user_id, book_id, rating, comment)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      comment = VALUES(comment),
      updated_at = CURRENT_TIMESTAMP
  `;

  db.query(q, [userId, bookId, ratingNum, comment || null], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save review" });
    }
    res.status(201).json({ message: "Review saved" });
  });
});

// Delete your own review
app.delete("/api/reviews/:id", authRequired, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  const q = "DELETE FROM reviews WHERE id = ? AND user_id = ?";

  db.query(q, [reviewId, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete review" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  });
});


/* =========================
   Server Start
========================= */
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
