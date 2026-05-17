import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Navbar } from "./components/Navbar";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { Classes } from "./pages/admin/Classes";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { PendingStudents } from "./pages/admin/PendingStudents";
import { StaffManager } from "./pages/admin/StaffManager";

// Dummy Students component to preserve old functionality for Admin
import { useState, useEffect } from "react";
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
    <div className="fade-in">
      <h2>All Students</h2>
      <div className="glass-card" style={{ marginTop: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "1rem" }}>Name</th>
              <th style={{ padding: "1rem" }}>Email</th>
              <th style={{ padding: "1rem" }}>Grade Level</th>
              <th style={{ padding: "1rem" }}>Class</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "1rem" }}>{s.name}</td>
                <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{s.email}</td>
                <td style={{ padding: "1rem" }}>{s.gradeLevel}</td>
                <td style={{ padding: "1rem" }}>
                  {s.class?.name ? (
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "0.25rem 0.5rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {s.class.name}
                    </span>
                  ) : "Unassigned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      {token && user && user.role === "STUDENT" && <Navbar />}
      <main className={user?.role === "STUDENT" ? "main-content" : ""}>
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

          {/* Admin Routes with Sidebar Layout */}
          <Route path="/admin" element={
            <RequireAuth>
              <RequireRole roles={["ADMIN", "TEACHER"]}>
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="pending" element={<PendingStudents />} />
            <Route path="students" element={<StudentsManager />} />
            <Route path="staff" element={<StaffManager />} />
            <Route path="classes" element={<Classes />} />
            <Route path="subjects" element={<div>Subject Management Coming Soon</div>} />
          </Route>

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
