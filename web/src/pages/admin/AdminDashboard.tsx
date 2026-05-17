import { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ students: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const [studentsRes, classesRes] = await Promise.all([
          fetch(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/classes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (studentsRes.ok && classesRes.ok) {
          const students = await studentsRes.json();
          const classes = await classesRes.json();
          setStats({ students: students.length, classes: classes.length });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <h2>Welcome back, Admin {user?.email}</h2>
        <p>Here is the overview of your institution today.</p>
      </header>

      {loading ? (
        <div className="loading-spinner">Loading overview...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.students}</p>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <h3>Active Classes</h3>
              <p className="stat-number">{stats.classes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
