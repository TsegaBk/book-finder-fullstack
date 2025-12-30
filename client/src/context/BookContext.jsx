import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8800";

const BookContext = createContext(null);

export const BookProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Auth token (persisted)
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ✅ Logged-in user (persisted)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const clearError = () => setError("");

  // ✅ Helper to attach Authorization header
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* =========================
     AUTH
  ========================= */

  const register = async (name, email, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);

      return { ok: true, user: res.data.user };
    } catch (err) {
      console.log(err);
      const msg = err?.response?.data?.error || "Register failed";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);

      return { ok: true, user: res.data.user };
    } catch (err) {
      console.log(err);
      const msg = err?.response?.data?.error || "Login failed";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setFavorites([]); // clear favorites on logout
  };

  /* =========================
     SEARCH (Public)
  ========================= */

  const searchBooks = async (paramsString) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/books/search?${paramsString}`);
      setSearchResults(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setError("Failed to fetch search results.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FAVORITES (Protected)
  ========================= */

  const fetchFavorites = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE}/api/books/favorites`, {
        headers: getAuthHeaders(),
      });

      setFavorites(res.data);
      return res.data;
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        setError("Please log in to view favorites.");
        return [];
      }

      setError("Failed to load favorites.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (bookId) => {
    setError("");

    try {
      await axios.post(
        `${API_BASE}/api/books/favorites`,
        { book_id: bookId },
        { headers: getAuthHeaders() }
      );

      await fetchFavorites();
      return { ok: true };
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        return { ok: false, message: "Please log in to add favorites." };
      }

      if (err?.response?.status === 409) {
        return { ok: false, message: "This book is already in favorites." };
      }

      return { ok: false, message: "Failed to add to favorites." };
    }
  };

  const removeFavorite = async (favoriteId) => {
    setError("");

    try {
      await axios.delete(`${API_BASE}/api/books/favorites/${favoriteId}`, {
        headers: getAuthHeaders(),
      });

      setFavorites((prev) => prev.filter((f) => f.favorite_id !== favoriteId));
      return { ok: true };
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        return { ok: false, message: "Please log in to remove favorites." };
      }

      return { ok: false, message: "Failed to remove favorite." };
    }
  };

  /* =========================
     REVIEWS (Ratings + Comments)
  ========================= */

  // Summary for multiple books (for cards)
  // returns: { "3": { avg_rating: 4.5, review_count: 2 }, ... }
  const fetchReviewSummary = async (bookIds) => {
    try {
      if (!bookIds || bookIds.length === 0) return {};
      const ids = bookIds.join(",");
      const res = await axios.get(`${API_BASE}/api/reviews/summary?ids=${ids}`);
      return res.data || {};
    } catch (err) {
      console.log(err);
      return {};
    }
  };

  // Reviews for one book
  // returns: { summary: { avg_rating, review_count }, reviews: [...] }
  const fetchBookReviews = async (bookId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/books/${bookId}/reviews`);
      return (
        res.data || {
          summary: { avg_rating: null, review_count: 0 },
          reviews: [],
        }
      );
    } catch (err) {
      console.log(err);
      return { summary: { avg_rating: null, review_count: 0 }, reviews: [] };
    }
  };

  // Create or update your review (auth required)
  const saveReview = async (bookId, rating, comment) => {
    try {
      await axios.post(
        `${API_BASE}/api/books/${bookId}/reviews`,
        { rating, comment },
        { headers: getAuthHeaders() }
      );
      return { ok: true };
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        return { ok: false, message: "Please log in to rate/review." };
      }

      const msg = err?.response?.data?.error || "Failed to save review.";
      return { ok: false, message: msg };
    }
  };

  return (
    <BookContext.Provider
      value={{
        // data
        searchResults,
        favorites,
        loading,
        error,
        token,
        user,

        // helpers
        clearError,

        // auth
        register,
        login,
        logout,

        // actions
        searchBooks,
        fetchFavorites,
        addFavorite,
        removeFavorite,

        // reviews
        fetchReviewSummary,
        fetchBookReviews,
        saveReview,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBookContext = () => {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBookContext must be used inside BookProvider");
  return ctx;
};
