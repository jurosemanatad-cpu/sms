import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { Login } from "./Login";
import { Register } from "./Register";
import { Navbar } from "./Navbar";
import { AdminDashboard } from "./AdminDashboard";
import { StudentDashboard } from "./StudentDashboard";
import { Classes } from "./Classes";

// Dummy Students component to preserve old functionality for Admin
import { useState, useEffect, FormEvent } from "react";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function StudentsManager() {
  const { token } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(console.error);
  }, [token]);

  return (
    <div className="container fade-in">
      <h2>Manage Students</h2>
      <div className="card">
        <ul>
          {students.map(s => (
            <li key={s.id} className="student-item">
              <strong>{s.name}</strong> ({s.email}) - Grade {s.gradeLevel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, user, isLoading } = useAuth();
  
  if (isLoading) return <div className="loading-spinner">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  
  return children;
}

function RequireRole({ children, roles }: { children: JSX.Element, roles: string[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <>
      {token && user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />
          
          {/* Default Route based on Role */}
          <Route 
            path="/" 
            element={
              !token ? <Navigate to="/login" replace /> : 
              user?.role === "STUDENT" ? <Navigate to="/student" replace /> :
              <Navigate to="/admin" replace />
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RequireAuth>
              <RequireRole roles={["ADMIN", "TEACHER"]}>
                <AdminDashboard />
              </RequireRole>
            </RequireAuth>
          } />
          <Route path="/admin/students" element={
            <RequireAuth>
              <RequireRole roles={["ADMIN", "TEACHER"]}>
                <StudentsManager />
              </RequireRole>
            </RequireAuth>
          } />
          <Route path="/admin/classes" element={
            <RequireAuth>
              <RequireRole roles={["ADMIN", "TEACHER"]}>
                <Classes />
              </RequireRole>
            </RequireAuth>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <RequireAuth>
              <RequireRole roles={["STUDENT"]}>
                <StudentDashboard />
              </RequireRole>
            </RequireAuth>
          } />
        </Routes>
      </main>
    </>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
