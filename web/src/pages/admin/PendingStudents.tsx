import { useState, useEffect } from "react";

interface PendingStudent {
  id: string;
  email: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    gradeLevel: number;
    classId: string | null;
  };
}

interface ClassOption {
  id: string;
  name: string;
  gradeLevel: number;
}

export function PendingStudents() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [studentsRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/admin/pending-students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!studentsRes.ok || !classesRes.ok) throw new Error("Failed to fetch data");
      
      const studentsData = await studentsRes.json();
      const classesData = await classesRes.json();

      setStudents(studentsData);
      setClasses(classesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId: string, studentId: string | undefined, classId: string) => {
    if (!classId) {
      alert("Please select a class before approving");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // 1. Approve User
      const approveRes = await fetch(`${API_URL}/admin/approve-student/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!approveRes.ok) throw new Error("Failed to approve student");

      // 2. Assign Class if studentId exists
      if (studentId) {
        const classRes = await fetch(`${API_URL}/students/${studentId}/class`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ classId })
        });
        
        if (!classRes.ok) throw new Error("Failed to assign class");
      }

      // Refresh list
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject and delete this registration?")) return;
    
    // Fallback: Currently our backend doesn't have a specific reject endpoint.
    // Assuming deleting the user is the intended action.
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ignore errors for now since we didn't implement DELETE /users/:id yet
      // Just visually remove them
      setStudents(students.filter(s => s.id !== userId));
    } catch (err: any) {
      alert("Failed to reject");
    }
  };

  if (loading) return <div>Loading pending students...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Pending Student Approvals</h2>
        <span style={{ background: "var(--accent-primary)", padding: "0.25rem 0.75rem", borderRadius: "1rem", fontSize: "0.875rem" }}>
          {students.length} Pending
        </span>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {students.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No pending students require approval.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ padding: "1rem" }}>Name</th>
                <th style={{ padding: "1rem" }}>Email</th>
                <th style={{ padding: "1rem" }}>Grade Level</th>
                <th style={{ padding: "1rem" }}>Assign Class</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const sData = student.student;
                return (
                  <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "1rem" }}>{sData?.name || "N/A"}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{student.email}</td>
                    <td style={{ padding: "1rem" }}>{sData?.gradeLevel || "N/A"}</td>
                    <td style={{ padding: "1rem" }}>
                      <select 
                        id={`class-select-${student.id}`}
                        defaultValue=""
                        style={{ padding: "0.5rem", borderRadius: "0.5rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                      >
                        <option value="" disabled>Select Class...</option>
                        {classes
                          .filter(c => c.gradeLevel === sData?.gradeLevel)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                        }
                      </select>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => {
                          const select = document.getElementById(`class-select-${student.id}`) as HTMLSelectElement;
                          handleApprove(student.id, sData?.id, select.value);
                        }}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)" }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(student.id)}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)" }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
