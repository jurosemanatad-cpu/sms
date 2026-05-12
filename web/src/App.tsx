import { FormEvent, useEffect, useState } from "react";
import { Classes } from "./Classes";
import { Login } from "./Login";
import { useAuth } from "./auth-context";

type Student = {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  classId?: string;
  class?: {
    id: string;
    name: string;
    gradeLevel: number;
    academicYear: string;
  };
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function App() {
  const { user, token, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"students" | "classes">("students");

  if (!token || !user) {
    return <Login />;
  }

  if (currentView === "classes") {
    return (
      <div>
        <nav className="navigation">
          <button onClick={() => setCurrentView("students")}>Students</button>
          <button onClick={() => setCurrentView("classes")} className="active">Classes</button>
          <div className="nav-user">
            <span>{user.email} ({user.role})</span>
            <button onClick={logout} className="logout">Logout</button>
          </div>
        </nav>
        <Classes />
      </div>
    );
  }
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("Loading students...");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/students`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to load students");
      const data = (await response.json()) as Student[];
      setStudents(data);
      setFilteredStudents(data);
      setStatus(`Loaded ${data.length} student(s)`);
      setError("");
    } catch (err) {
      setError("Failed to load students");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.gradeLevel.toString().includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = editingId ? `${API_URL}/students/${editingId}` : `${API_URL}/students`;
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, gradeLevel: Number(gradeLevel) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save student");
      }

      setName("");
      setEmail("");
      setGradeLevel(1);
      setEditingId(null);
      await loadStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editStudent = (student: Student) => {
    setName(student.name);
    setEmail(student.email);
    setGradeLevel(student.gradeLevel);
    setEditingId(student.id);
    setError("");
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete student");
      }

      await loadStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setName("");
    setEmail("");
    setGradeLevel(1);
    setEditingId(null);
    setError("");
  };

  return (
    <div>
      <nav className="navigation">
        <button onClick={() => setCurrentView("students")} className="active">Students</button>
        <button onClick={() => setCurrentView("classes")}>Classes</button>
        <div className="nav-user">
          <span>{user.email} ({user.role})</span>
          <button onClick={logout} className="logout">Logout</button>
        </div>
      </nav>
      <main className="container">
        <h1>Simple School Management System</h1>
        
        {error && <div className="error">{error}</div>}
        {status && <p>{status}</p>}

      <section className="card">
        <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
        <form onSubmit={submit} className="form">
          <input
            required
            placeholder="Student name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
          />
          <input
            required
            type="email"
            placeholder="Student email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading}
          />
          <input
            required
            type="number"
            min={1}
            max={12}
            value={gradeLevel}
            onChange={(event) => setGradeLevel(Number(event.target.value))}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : (editingId ? "Update" : "Save")}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={isLoading}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Students</h2>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
        
        {isLoading && <p>Loading...</p>}
        
        {!isLoading && filteredStudents.length === 0 && (
          <p>{students.length === 0 ? "No students yet." : "No students found matching your search."}</p>
        )}
        
        {!isLoading && filteredStudents.length > 0 && (
          <ul>
            {filteredStudents.map((student) => (
              <li key={student.id} className="student-item">
                <div className="student-info">
                  <strong>{student.name}</strong> ({student.email}) - Grade {student.gradeLevel}
                </div>
                <div className="student-actions">
                  <button onClick={() => editStudent(student)} disabled={isLoading}>
                    Edit
                  </button>
                  <button onClick={() => deleteStudent(student.id)} disabled={isLoading} className="delete">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </main>
    </div>
  );
}
