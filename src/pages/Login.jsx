
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Button from "../components/Button";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get("error");

    if (!oauthError) return;

    const messages = {
      invalid_google_state:
        "Google sign-in verification failed. Please try again.",
      google_login_cancelled:
        "Google sign-in was cancelled.",
      missing_google_code:
        "Google did not return an authorization code.",
      google_not_configured:
        "Google sign-in is not configured correctly.",
      google_token_failed:
        "Unable to verify your Google account. Please try again.",
      google_profile_failed:
        "Unable to retrieve your verified Google profile.",
      google_account_conflict:
        "This email is linked to another Google account.",
    };

    setError(
      messages[oauthError] ||
      "Google sign-in failed. Please try again."
    );

    navigate("/login", { replace: true });
  }, [searchParams, navigate]);

  async function handleLogin(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to sign in.");
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);

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
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Good to see you.</h1>
          <p>Sign in to access your personal digital library.</p>
        </div>

        {/* GOOGLE SIGN IN */}

        <a
          href="/api/auth/google"
          className="google-signin-button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            minHeight: "48px",
            marginTop: "24px",
            marginBottom: "22px",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.27 5.64c4.24-3.91 7.51-9.62 7.51-17.29Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.89.93 7.57 2.56 10.78l7.97-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.91-5.78l-7.27-5.64c-2.02 1.35-4.61 2.15-8.64 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>

          Continue with Google
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "22px",
            color: "rgba(255,255,255,0.45)",
            fontSize: "11px",
            letterSpacing: "1px",
          }}
        >
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.12)",
            }}
          />
          OR CONTINUE WITH EMAIL
          <span
            style={{
              flex: 1,
              height: "1px",
              background: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* EMAIL AND PASSWORD LOGIN */}

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email address</label>

          <div className="auth-input-wrap">
            <Mail size={18} />

            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-label-row">
            <label htmlFor="login-password">Password</label>
            <a href="#forgot-password">Forgot password?</a>
          </div>

          <div className="auth-input-wrap">
            <LockKeyhole size={18} />

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

          <label className="remember-option">
            <input type="checkbox" />
            Remember me
          </label>

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
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={17} />}
          </Button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to home
        </Link>
      </motion.div>
    </main>
  );
}
