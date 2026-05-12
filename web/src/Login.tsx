import { useState, FormEvent } from "react";
import { useAuth } from "./auth-context";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <main className="container">
      <div className="login-container">
        <h1>School Management System</h1>
        <div className="card">
          <h2>Login</h2>
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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="login-info">
            <h3>Default Admin Account:</h3>
            <p>Email: admin@school.com</p>
            <p>Password: admin123</p>
            <small>You can create additional accounts after login.</small>
          </div>
        </div>
      </div>
    </main>
  );
}
