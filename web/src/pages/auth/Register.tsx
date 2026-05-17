import { useState, FormEvent } from "react";
import { useAuth } from "../../auth-context";

interface RegisterProps {
  onBackToLogin?: () => void;
}

export function Register({ onBackToLogin }: RegisterProps = {}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "TEACHER" | "STUDENT">("STUDENT");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectSpecialty, setSubjectSpecialty] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          role, 
          name, 
          gradeLevel: gradeLevel ? Number(gradeLevel) : undefined, 
          subjectSpecialty 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (role === "STUDENT") {
        setIsPending(true);
        return;
      }

      // For Admins and Teachers (since teachers are auto-approved right now)
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
        
        {isPending ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <h2 style={{ marginBottom: "1rem" }}>Registration Submitted</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Your account is pending admin approval. You will be able to log in once an administrator approves your registration.
            </p>
            {onBackToLogin && (
              <button onClick={onBackToLogin}>Return to Login</button>
            )}
          </div>
        ) : (
          <>
            <h2 style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "1.25rem", marginBottom: "2rem" }}>Register New User</h2>
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
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "TEACHER" | "STUDENT")}
                disabled={isLoading}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              {role === "STUDENT" && (
                <input
                  type="number"
                  placeholder="Grade Level (e.g. 10)"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  required
                  disabled={isLoading}
                  min="1"
                  max="12"
                />
              )}

              {role === "TEACHER" && (
                <input
                  type="text"
                  placeholder="Subject Specialty (e.g. Math, Science)"
                  value={subjectSpecialty}
                  onChange={(e) => setSubjectSpecialty(e.target.value)}
                  required
                  disabled={isLoading}
                />
              )}

              <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
                {isLoading ? "Registering..." : "Register User"}
              </button>
            </form>
            {onBackToLogin && (
              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)" }}>
                  Already have an account? 
                  <button 
                    type="button" 
                    onClick={onBackToLogin}
                    style={{ background: "none", color: "var(--accent-primary)", padding: "0 0.5rem", fontWeight: "normal" }}
                    disabled={isLoading}
                  >
                    Back to login
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
