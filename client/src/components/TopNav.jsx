import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useBookContext } from "../context/BookContext";

const TopNav = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useBookContext();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="nav">
      <div className="brand">
        <div className="brand-badge">B</div>
        <div>Book Finder</div>
      </div>

      <div className="nav-links">
        <Link to="/">Search</Link>

        {token ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/favorites">Favorites</Link>

            {/* User section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingLeft: 12,
                borderLeft: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {user && (
                <span style={{ opacity: 0.9, fontSize: 14 }}>
                  Hi, <b>{user.name}</b> 👋
                </span>
              )}

              <button
                onClick={handleLogout}
                className="btn"
                style={{ padding: "8px 10px" }}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default TopNav;
