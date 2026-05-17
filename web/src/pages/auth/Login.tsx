import { useState, FormEvent } from "react";
import { useAuth } from "../../auth-context";

interface LoginProps {
  onShowRegister?: () => void;
}

export function Login({ onShowRegister }: LoginProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container fade-in">
      <div className="glass-card">
        <h1 style={{ textAlign: "center", marginBottom: "0.5rem", background: "linear-gradient(to right, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>School Management System</h1>
        <h2 style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "1.25rem", marginBottom: "2rem" }}>Login to your account</h2>
        {error && <div className="error-alert">{error}</div>}
        <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <label className="password-toggle" style={{ cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: "auto", margin: 0 }}
                />
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Show password</span>
              </label>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        {onShowRegister && (
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Need an account? 
              <button 
                type="button" 
                onClick={onShowRegister}
                style={{ background: "none", color: "var(--accent-primary)", padding: "0 0.5rem", fontWeight: "normal" }}
                disabled={isLoading}
              >
                Register here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
