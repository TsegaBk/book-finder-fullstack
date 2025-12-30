import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookContext } from "../context/BookContext";
import toast from "react-hot-toast";
import TopNav from "../components/TopNav";

const Favorites = () => {
  const { favorites, loading, error, fetchFavorites, removeFavorite } =
    useBookContext();

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (favoriteId) => {
    const result = await removeFavorite(favoriteId);
    if (!result.ok) toast.error(result.message);
    else toast.success("Removed from favorites!");
  };

  return (
    <div className="container">
      <TopNav />

      <h1 className="h1">Favorites</h1>
      <p className="sub">Your saved books appear here.</p>

      {loading && <div className="notice">Loading...</div>}
      {error && <div className="notice">{error}</div>}

      {!loading && !error && favorites.length === 0 && (
        <div className="notice">No favorites yet. Go search and add some!</div>
      )}

      <div className="grid">
        {favorites.map((book) => (
          <div className="card bookCard" key={book.favorite_id}>
            <div className="bookMedia">
              {book.cover ? (
                <img src={book.cover} alt={book.title} />
              ) : (
                <div>NO COVER</div>
              )}
            </div>

            <div className="bookBody">
              <h3 className="bookTitle">{book.title}</h3>
              <p className="bookDesc">{book.desc}</p>

              <div className="stack">
                <span className="tag">👤 {book.author}</span>
                <span className="tag">🏷️ {book.genre}</span>
                <span className="tag">📅 {book.publication_year ?? "N/A"}</span>
              </div>

              <div className="actions">
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemove(book.favorite_id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
