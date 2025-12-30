import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";

const Home = () => {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    if (!q.trim() && !author.trim() && !genre.trim()) {
      alert("Please enter at least one search field.");
      return;
    }

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (author.trim()) params.set("author", author.trim());
    if (genre.trim()) params.set("genre", genre.trim());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="container">
      <TopNav />
      <h1 className="h1">Find your next read</h1>
      <p className="sub">
        Search by keyword, author, or genre. Save favorites with one click.
      </p>

      <div className="card card-pad">
        <form className="form" onSubmit={handleSearch}>
          <input
            className="input"
            placeholder="Keyword (title/description)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="row">
            <input
              className="input"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              className="input"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Home;
