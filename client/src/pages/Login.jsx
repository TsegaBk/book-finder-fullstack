import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useBookContext } from "../context/BookContext";
import TopNav from "../components/TopNav";

const Login = () => {
  const navigate = useNavigate();
  const { login, token, loading, error, clearError } = useBookContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) navigate("/favorites");
  }, [token, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email and password are required.");
      return;
    }

    const res = await login(email.trim(), password);
    if (res.ok) {
      toast.success("Logged in!");
      navigate("/favorites");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container">
      <TopNav />

      <h1 className="h1">Login</h1>
      <p className="sub">Access your saved favorites.</p>

      <div className="card card-pad" style={{ maxWidth: 520 }}>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="notice" style={{ marginTop: 14 }}>
          Don’t have an account? <Link to="/register"><b>Register</b></Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
