import { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type PerformanceData = {
  studentId: string;
  name: string;
  className: string;
  gpa: number;
  averageScore: number;
  attendanceRate: number;
  totalSubjects: number;
  totalAbsences: number;
  gradeBreakdown?: {
    id: string;
    subject: string;
    score: number;
    semester: number;
  }[];
};

export function StudentDashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!token || !user?.studentId) {
        setLoading(false);
        setError("Student profile not found. Please contact an administrator.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/students/${user.studentId}/performance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load performance data");
        const perfData = await res.json();
        setData(perfData);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [token, user]);

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <h2>Welcome back, {data?.name || user?.email}</h2>
        <p>Class: {data?.className || "Not assigned"}</p>
      </header>

      {error && <div className="error-alert">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading your dashboard...</div>
      ) : data ? (
        <div className="stats-grid student-stats">
          <div className="stat-card glass-card accent-blue">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <h3>Current GPA</h3>
              <p className="stat-number">{data.gpa.toFixed(2)}</p>
              <small>Average Score: {data.averageScore}%</small>
            </div>
          </div>
          
          <div className="stat-card glass-card accent-green">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Attendance Rate</h3>
              <p className="stat-number">{data.attendanceRate}%</p>
              <small>{data.totalAbsences} total absences</small>
            </div>
          </div>

          <div className="stat-card glass-card accent-purple">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Enrolled Subjects</h3>
              <p className="stat-number">{data.totalSubjects}</p>
              <small>Active this semester</small>
            </div>
          </div>
        </div>
      ) : null}

      {data?.gradeBreakdown && data.gradeBreakdown.length > 0 && (
        <div className="glass-card" style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Grade Breakdown</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding: "1rem" }}>Subject</th>
                <th style={{ padding: "1rem" }}>Semester</th>
                <th style={{ padding: "1rem" }}>Score</th>
                <th style={{ padding: "1rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.gradeBreakdown.map((grade) => (
                <tr key={grade.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem", fontWeight: "500" }}>{grade.subject}</td>
                  <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{grade.semester}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      fontWeight: "bold",
                      color: grade.score >= 90 ? "#10b981" : grade.score >= 75 ? "#3b82f6" : "#ef4444" 
                    }}>
                      {grade.score}%
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {grade.score >= 75 ? "Passed" : "Failed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
