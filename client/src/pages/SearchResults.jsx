import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useBookContext } from "../context/BookContext";
import toast from "react-hot-toast";
import TopNav from "../components/TopNav";

function useQueryString() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

const renderStars = (avg) => {
  const n = Math.round(Number(avg || 0));
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
};

const SearchResults = () => {
  const query = useQueryString();
  const paramsString = query.toString();

  const {
    searchResults,
    loading,
    error,
    token,
    searchBooks,
    addFavorite,
    fetchReviewSummary,
    saveReview,
  } = useBookContext();

  const [summaryMap, setSummaryMap] = useState({});
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Fetch search results when query params change
  useEffect(() => {
    searchBooks(paramsString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  const bookIds = useMemo(() => searchResults.map((b) => b.id), [searchResults]);

  // Fetch rating summaries for the cards
  useEffect(() => {
    const run = async () => {
      if (!bookIds.length) {
        setSummaryMap({});
        return;
      }
      const data = await fetchReviewSummary(bookIds);
      setSummaryMap(data || {});
    };
    run();
  }, [bookIds, fetchReviewSummary]);

  const handleAdd = async (bookId) => {
    const result = await addFavorite(bookId);
    if (!result.ok) toast.error(result.message);
    else toast.success("Added to favorites!");
  };

  const toggleReview = (bookId) => {
    if (!token) {
      toast.error("Please log in to rate/review.");
      return;
    }

    if (openReviewFor === bookId) {
      setOpenReviewFor(null);
      return;
    }

    setOpenReviewFor(bookId);
    setRating(5);
    setComment("");
  };

  const handleSaveReview = async (bookId) => {
    if (comment.length > 500) {
      toast.error("Comment must be 500 characters or less.");
      return;
    }

    const res = await saveReview(bookId, rating, comment);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    toast.success("Review saved!");
    setOpenReviewFor(null);

    // refresh summaries so the stars/avg update
    const updated = await fetchReviewSummary(bookIds);
    setSummaryMap(updated || {});
  };

  return (
    <div className="container">
      <TopNav />

      <h1 className="h1">Search Results</h1>
      <p className="sub">Showing matches for your filters.</p>

      {loading && <div className="notice">Loading...</div>}
      {error && <div className="notice">{error}</div>}

      {!loading && !error && searchResults.length === 0 && (
        <div className="notice">No results found. Try different keywords.</div>
      )}

      <div className="grid">
        {searchResults.map((book) => {
          const meta = summaryMap?.[book.id];
          const avg = meta?.avg_rating ?? null;
          const count = meta?.review_count ?? 0;

          return (
            <div className="card bookCard" key={book.id}>
              <div className="bookMedia">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} />
                ) : (
                  <div style={{ padding: 12, opacity: 0.8 }}>NO COVER</div>
                )}
              </div>

              <div className="bookBody">
                <h3 className="bookTitle">{book.title}</h3>
                <p className="bookDesc">{book.desc}</p>

                <div className="stack">
                  <span className="tag">👤 {book.author}</span>
                  <span className="tag">🏷️ {book.genre}</span>
                  <span className="tag">📅 {book.publication_year ?? "N/A"}</span>
                  <span className="tag">
                    ⭐ {avg ? `${avg} • ${renderStars(avg)} (${count})` : "No ratings yet"}
                  </span>
                </div>

                <div className="actions" style={{ gap: 10 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAdd(book.id)}
                  >
                    Add to Favorites
                  </button>

                  <button className="btn" onClick={() => toggleReview(book.id)}>
                    Rate & Review
                  </button>
                </div>

                {openReviewFor === book.id && (
                  <div className="card" style={{ marginTop: 12, padding: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontSize: 14, opacity: 0.9 }}>Your rating:</div>

                      <select
                        className="input"
                        style={{ maxWidth: 120 }}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        {[5, 4, 3, 2, 1].map((x) => (
                          <option key={x} value={x}>
                            {x} ★
                          </option>
                        ))}
                      </select>

                      <div style={{ fontSize: 14, opacity: 0.9 }}>
                        {renderStars(rating)}
                      </div>
                    </div>

                    <textarea
                      className="input"
                      style={{ marginTop: 10, height: 90, resize: "vertical" }}
                      placeholder="Optional comment (max 500 chars)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveReview(book.id)}
                      >
                        Save Review
                      </button>

                      <button className="btn" onClick={() => setOpenReviewFor(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
