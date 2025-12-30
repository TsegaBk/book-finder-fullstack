import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useBookContext } from "../context/BookContext";
import TopNav from "../components/TopNav";

const Register = () => {
  const navigate = useNavigate();
  const { register, token, loading, error, clearError } = useBookContext();

  const [name, setName] = useState("");
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

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }

    const res = await register(name.trim(), email.trim(), password);
    if (res.ok) {
      toast.success("Account created!");
      navigate("/favorites");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container">
      <TopNav />

      <h1 className="h1">Register</h1>
      <p className="sub">Create an account to save favorites.</p>

      <div className="card card-pad" style={{ maxWidth: 520 }}>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="notice" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login"><b>Login</b></Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
