import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

type Class = {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  students: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function Classes() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [academicYear, setAcademicYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("Loading classes...");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/classes`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to load classes");
      const data = (await response.json()) as Class[];
      setClasses(data);
      setFilteredClasses(data);
      setStatus(`Loaded ${data.length} class(es)`);
      setError("");
    } catch (err) {
      setError("Failed to load classes");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // Set current academic year as default
    const currentYear = new Date().getFullYear();
    setAcademicYear(`${currentYear}-${currentYear + 1}`);
  }, []);

  useEffect(() => {
    const filtered = classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.gradeLevel.toString().includes(searchTerm)
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = editingId ? `${API_URL}/classes/${editingId}` : `${API_URL}/classes`;
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, gradeLevel: Number(gradeLevel), academicYear })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save class");
      }

      setName("");
      setGradeLevel(1);
      const currentYear = new Date().getFullYear();
      setAcademicYear(`${currentYear}-${currentYear + 1}`);
      setEditingId(null);
      await loadClasses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editClass = (classItem: Class) => {
    setName(classItem.name);
    setGradeLevel(classItem.gradeLevel);
    setAcademicYear(classItem.academicYear);
    setEditingId(classItem.id);
    setError("");
  };

  const deleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This will also remove all students from this class.")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/classes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete class");
      }

      await loadClasses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setName("");
    setGradeLevel(1);
    const currentYear = new Date().getFullYear();
    setAcademicYear(`${currentYear}-${currentYear + 1}`);
    setEditingId(null);
    setError("");
  };

  return (
    <main className="container">
      <h1>Class Management</h1>
      
      {error && <div className="error">{error}</div>}
      {status && <p>{status}</p>}

      <section className="card">
        <h2>{editingId ? "Edit Class" : "Add Class"}</h2>
        <form onSubmit={submit} className="form">
          <input
            required
            placeholder="Class name (e.g., Math 101)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
          />
          <input
            required
            type="number"
            min={1}
            max={12}
            placeholder="Grade level"
            value={gradeLevel}
            onChange={(event) => setGradeLevel(Number(event.target.value))}
            disabled={isLoading}
          />
          <input
            required
            placeholder="Academic year (e.g., 2024-2025)"
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
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
        <h2>Classes</h2>
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />
        
        {isLoading && <p>Loading...</p>}
        
        {!isLoading && filteredClasses.length === 0 && (
          <p>{classes.length === 0 ? "No classes yet." : "No classes found matching your search."}</p>
        )}
        
        {!isLoading && filteredClasses.length > 0 && (
          <ul>
            {filteredClasses.map((classItem) => (
              <li key={classItem.id} className="class-item">
                <div className="class-info">
                  <h3>{classItem.name}</h3>
                  <p>Grade {classItem.gradeLevel} • {classItem.academicYear}</p>
                  <p>{classItem.students.length} student(s) enrolled</p>
                  {classItem.students.length > 0 && (
                    <div className="students-list">
                      <strong>Students:</strong>
                      <ul>
                        {classItem.students.map((student) => (
                          <li key={student.id}>{student.name} ({student.email})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="class-actions">
                  <button onClick={() => editClass(classItem)} disabled={isLoading}>
                    Edit
                  </button>
                  <button onClick={() => deleteClass(classItem.id)} disabled={isLoading} className="delete">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
