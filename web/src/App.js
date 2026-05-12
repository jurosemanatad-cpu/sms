import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Classes } from "./Classes";
import { Login } from "./Login";
import { useAuth } from "./auth-context";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export function App() {
    const { user, token, logout } = useAuth();
    const [currentView, setCurrentView] = useState("students");
    if (!token || !user) {
        return _jsx(Login, {});
    }
    if (currentView === "classes") {
        return (_jsxs("div", { children: [_jsxs("nav", { className: "navigation", children: [_jsx("button", { onClick: () => setCurrentView("students"), children: "Students" }), _jsx("button", { onClick: () => setCurrentView("classes"), className: "active", children: "Classes" }), _jsxs("div", { className: "nav-user", children: [_jsxs("span", { children: [user.email, " (", user.role, ")"] }), _jsx("button", { onClick: logout, className: "logout", children: "Logout" })] })] }), _jsx(Classes, {})] }));
    }
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [gradeLevel, setGradeLevel] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("Loading students...");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadStudents = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/students`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok)
                throw new Error("Failed to load students");
            const data = (await response.json());
            setStudents(data);
            setFilteredStudents(data);
            setStatus(`Loaded ${data.length} student(s)`);
            setError("");
        }
        catch (err) {
            setError("Failed to load students");
            setStatus("");
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadStudents();
    }, []);
    useEffect(() => {
        const filtered = students.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.gradeLevel.toString().includes(searchTerm));
        setFilteredStudents(filtered);
    }, [searchTerm, students]);
    const submit = async (event) => {
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
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const editStudent = (student) => {
        setName(student.name);
        setEmail(student.email);
        setGradeLevel(student.gradeLevel);
        setEditingId(student.id);
        setError("");
    };
    const deleteStudent = async (id) => {
        if (!confirm("Are you sure you want to delete this student?"))
            return;
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
        }
        catch (err) {
            setError(err.message);
        }
        finally {
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
    return (_jsxs("div", { children: [_jsxs("nav", { className: "navigation", children: [_jsx("button", { onClick: () => setCurrentView("students"), className: "active", children: "Students" }), _jsx("button", { onClick: () => setCurrentView("classes"), children: "Classes" }), _jsxs("div", { className: "nav-user", children: [_jsxs("span", { children: [user.email, " (", user.role, ")"] }), _jsx("button", { onClick: logout, className: "logout", children: "Logout" })] })] }), _jsxs("main", { className: "container", children: [_jsx("h1", { children: "Simple School Management System" }), error && _jsx("div", { className: "error", children: error }), status && _jsx("p", { children: status }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: editingId ? "Edit Student" : "Add Student" }), _jsxs("form", { onSubmit: submit, className: "form", children: [_jsx("input", { required: true, placeholder: "Student name", value: name, onChange: (event) => setName(event.target.value), disabled: isLoading }), _jsx("input", { required: true, type: "email", placeholder: "Student email", value: email, onChange: (event) => setEmail(event.target.value), disabled: isLoading }), _jsx("input", { required: true, type: "number", min: 1, max: 12, value: gradeLevel, onChange: (event) => setGradeLevel(Number(event.target.value)), disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "Saving..." : (editingId ? "Update" : "Save") }), editingId && (_jsx("button", { type: "button", onClick: cancelEdit, disabled: isLoading, children: "Cancel" }))] })] }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: "Students" }), _jsx("input", { type: "text", placeholder: "Search students...", value: searchTerm, onChange: (event) => setSearchTerm(event.target.value), className: "search-input" }), isLoading && _jsx("p", { children: "Loading..." }), !isLoading && filteredStudents.length === 0 && (_jsx("p", { children: students.length === 0 ? "No students yet." : "No students found matching your search." })), !isLoading && filteredStudents.length > 0 && (_jsx("ul", { children: filteredStudents.map((student) => (_jsxs("li", { className: "student-item", children: [_jsxs("div", { className: "student-info", children: [_jsx("strong", { children: student.name }), " (", student.email, ") - Grade ", student.gradeLevel] }), _jsxs("div", { className: "student-actions", children: [_jsx("button", { onClick: () => editStudent(student), disabled: isLoading, children: "Edit" }), _jsx("button", { onClick: () => deleteStudent(student.id), disabled: isLoading, className: "delete", children: "Delete" })] })] }, student.id))) }))] })] })] }));
}
