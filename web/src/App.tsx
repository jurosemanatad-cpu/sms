import { FormEvent, useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gradeLevel, setGradeLevel] = useState(1);
  const [status, setStatus] = useState("Loading students...");

  const loadStudents = async () => {
    const response = await fetch(`${API_URL}/students`);
    const data = (await response.json()) as Student[];
    setStudents(data);
    setStatus(`Loaded ${data.length} student(s)`);
  };

  useEffect(() => {
    loadStudents().catch(() => setStatus("Failed to load students"));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("Saving student...");

    const response = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, gradeLevel: Number(gradeLevel) })
    });

    if (!response.ok) {
      setStatus("Failed to save student");
      return;
    }

    setName("");
    setEmail("");
    setGradeLevel(1);
    await loadStudents();
  };

  return (
    <main className="container">
      <h1>Simple School Management System</h1>
      <p>{status}</p>

      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={submit} className="form">
          <input
            required
            placeholder="Student name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Student email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            required
            type="number"
            min={1}
            max={12}
            value={gradeLevel}
            onChange={(event) => setGradeLevel(Number(event.target.value))}
          />
          <button type="submit">Save</button>
        </form>
      </section>

      <section className="card">
        <h2>Students</h2>
        {students.length === 0 ? (
          <p>No students yet.</p>
        ) : (
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                {student.name} ({student.email}) - Grade {student.gradeLevel}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
