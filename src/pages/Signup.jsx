
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import Button from "../components/Button";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to create your account.");
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Signup error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="auth-brand">
          <span className="brand-mark">L</span>
          Linkspace
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">GET STARTED</span>
          <h1>Your space starts here.</h1>
          <p>
            Create an account and bring all your saved links together.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          <label htmlFor="signup-name">Full name</label>

          <div className="auth-input-wrap">
            <User size={18} />

            <input
              id="signup-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <label htmlFor="signup-email">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={18} />

            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="signup-password">Password</label>

          <div className="auth-input-wrap">
            <LockKeyhole size={18} />

            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <p className="password-hint">
            Use at least 8 characters.
          </p>

          {error && (
            <p
              role="alert"
              style={{
                color: "#ff8585",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {error}
            </p>
          )}

          <Button variant="primary" type="submit">
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={17} />}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to home
        </Link>
      </motion.div>
    </main>
  );
}
