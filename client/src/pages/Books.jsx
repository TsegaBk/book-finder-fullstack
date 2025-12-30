import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8800";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/books`);
      setBooks(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/books/${id}`);
      // Better than window.reload
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.log(err);
      alert("Failed to delete book.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return (
    <div>
      <h1>Books</h1>

      <div className="books">
        {books.map((book) => (
          <div className="book" key={book.id}>
            {book.cover && <img src={book.cover} alt={book.title} />}

            <h2>{book.title}</h2>

            <p>{book.desc}</p>

            <p>
              <b>Author:</b> {book.author}
              <br />
              <b>Genre:</b> {book.genre}
              <br />
              <b>Year:</b> {book.publication_year ?? "N/A"}
            </p>

            <span>${book.price}</span>

            <button className="delete" onClick={() => handleDelete(book.id)}>
              Delete
            </button>

            <button className="update">
              <Link to={`/update/${book.id}`}>Update</Link>
            </button>
          </div>
        ))}
      </div>

      <button>
        <Link to="/add">Add New Book</Link>
      </button>
    </div>
  );
};

export default Books;
