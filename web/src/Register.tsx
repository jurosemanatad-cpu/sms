import { useState, FormEvent } from "react";
import { useAuth } from "./auth-context";

interface RegisterProps {
  onBackToLogin?: () => void;
}

export function Register({ onBackToLogin }: RegisterProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "TEACHER">("ADMIN");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setError("");
      setEmail("");
      setPassword("");
      alert("User registered successfully! You can now login.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="login-container">
        <h1>School Management System</h1>
        <div className="card">
          <h2>Register New User</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} className="form">
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
              <label className="password-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Show password</span>
              </label>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "TEACHER")}
              disabled={isLoading}
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
            </select>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register User"}
            </button>
          </form>
          {onBackToLogin && (
            <div className="register-link">
              <p>
                Already have an account? 
                <button 
                  type="button" 
                  onClick={onBackToLogin}
                  className="link-button"
                  disabled={isLoading}
                >
                  Back to login
                </button>
              </p>
            </div>
          )}
          <div className="login-info">
            <h3>Registration Info:</h3>
            <p>• Admin users can manage all data</p>
            <p>• Teacher users have limited access</p>
            <p>• Password must be at least 6 characters</p>
            <small>After registration, use the login page to access the system.</small>
          </div>
        </div>
      </div>
    </main>
  );
}
