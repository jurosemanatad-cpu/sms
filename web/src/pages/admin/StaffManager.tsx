import { useState, useEffect, FormEvent } from "react";

interface Staff {
  id: string;
  email: string;
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    subjectSpecialty: string;
  };
}

export function StaffManager() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subjectSpecialty, setSubjectSpecialty] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/add-staff`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, email, password, subjectSpecialty })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add staff");
      }

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setSubjectSpecialty("");
      
      // Refresh list
      fetchStaff();
      alert("Staff added successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Staff Management</h2>
        <span style={{ background: "var(--accent-primary)", padding: "0.25rem 0.75rem", borderRadius: "1rem", fontSize: "0.875rem" }}>
          {staffList.length} Teachers
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Add Staff Form */}
        <div className="glass-card" style={{ alignSelf: "start" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Add New Teacher</h3>
          {error && <div className="error-alert">{error}</div>}
          
          <form onSubmit={handleAddStaff} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isAdding}
              style={{ width: "100%" }}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isAdding}
              style={{ width: "100%" }}
            />
            <input
              type="password"
              placeholder="Temporary Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isAdding}
              style={{ width: "100%" }}
            />
            <input
              type="text"
              placeholder="Subject Specialty (e.g. Mathematics)"
              value={subjectSpecialty}
              onChange={e => setSubjectSpecialty(e.target.value)}
              required
              disabled={isAdding}
              style={{ width: "100%" }}
            />
            <button type="submit" disabled={isAdding} style={{ marginTop: "1rem" }}>
              {isAdding ? "Adding..." : "Add Teacher"}
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="glass-card" style={{ overflowX: "auto" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>Current Staff Directory</h3>
          
          {loading ? (
            <p>Loading staff directory...</p>
          ) : staffList.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No staff members found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "1rem" }}>Name</th>
                  <th style={{ padding: "1rem" }}>Email</th>
                  <th style={{ padding: "1rem" }}>Specialty</th>
                  <th style={{ padding: "1rem" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "1rem" }}>{staff.teacher?.name || "N/A"}</td>
                    <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{staff.email}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ background: "rgba(255,255,255,0.1)", padding: "0.25rem 0.5rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                        {staff.teacher?.subjectSpecialty || "General"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ color: "#10b981", fontSize: "0.875rem" }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
