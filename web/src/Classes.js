import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export function Classes() {
    const { token } = useAuth();
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [name, setName] = useState("");
    const [gradeLevel, setGradeLevel] = useState(1);
    const [academicYear, setAcademicYear] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("Loading classes...");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadClasses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/classes`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok)
                throw new Error("Failed to load classes");
            const data = (await response.json());
            setClasses(data);
            setFilteredClasses(data);
            setStatus(`Loaded ${data.length} class(es)`);
            setError("");
        }
        catch (err) {
            setError("Failed to load classes");
            setStatus("");
        }
        finally {
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
        const filtered = classes.filter(classItem => classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.gradeLevel.toString().includes(searchTerm));
        setFilteredClasses(filtered);
    }, [searchTerm, classes]);
    const submit = async (event) => {
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
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const editClass = (classItem) => {
        setName(classItem.name);
        setGradeLevel(classItem.gradeLevel);
        setAcademicYear(classItem.academicYear);
        setEditingId(classItem.id);
        setError("");
    };
    const deleteClass = async (id) => {
        if (!confirm("Are you sure you want to delete this class? This will also remove all students from this class."))
            return;
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
        setGradeLevel(1);
        const currentYear = new Date().getFullYear();
        setAcademicYear(`${currentYear}-${currentYear + 1}`);
        setEditingId(null);
        setError("");
    };
    return (_jsxs("main", { className: "container", children: [_jsx("h1", { children: "Class Management" }), error && _jsx("div", { className: "error", children: error }), status && _jsx("p", { children: status }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: editingId ? "Edit Class" : "Add Class" }), _jsxs("form", { onSubmit: submit, className: "form", children: [_jsx("input", { required: true, placeholder: "Class name (e.g., Math 101)", value: name, onChange: (event) => setName(event.target.value), disabled: isLoading }), _jsx("input", { required: true, type: "number", min: 1, max: 12, placeholder: "Grade level", value: gradeLevel, onChange: (event) => setGradeLevel(Number(event.target.value)), disabled: isLoading }), _jsx("input", { required: true, placeholder: "Academic year (e.g., 2024-2025)", value: academicYear, onChange: (event) => setAcademicYear(event.target.value), disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "Saving..." : (editingId ? "Update" : "Save") }), editingId && (_jsx("button", { type: "button", onClick: cancelEdit, disabled: isLoading, children: "Cancel" }))] })] }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: "Classes" }), _jsx("input", { type: "text", placeholder: "Search classes...", value: searchTerm, onChange: (event) => setSearchTerm(event.target.value), className: "search-input" }), isLoading && _jsx("p", { children: "Loading..." }), !isLoading && filteredClasses.length === 0 && (_jsx("p", { children: classes.length === 0 ? "No classes yet." : "No classes found matching your search." })), !isLoading && filteredClasses.length > 0 && (_jsx("ul", { children: filteredClasses.map((classItem) => (_jsxs("li", { className: "class-item", children: [_jsxs("div", { className: "class-info", children: [_jsx("h3", { children: classItem.name }), _jsxs("p", { children: ["Grade ", classItem.gradeLevel, " \u2022 ", classItem.academicYear] }), _jsxs("p", { children: [classItem.students.length, " student(s) enrolled"] }), classItem.students.length > 0 && (_jsxs("div", { className: "students-list", children: [_jsx("strong", { children: "Students:" }), _jsx("ul", { children: classItem.students.map((student) => (_jsxs("li", { children: [student.name, " (", student.email, ")"] }, student.id))) })] }))] }), _jsxs("div", { className: "class-actions", children: [_jsx("button", { onClick: () => editClass(classItem), disabled: isLoading, children: "Edit" }), _jsx("button", { onClick: () => deleteClass(classItem.id), disabled: isLoading, className: "delete", children: "Delete" })] })] }, classItem.id))) }))] })] }));
}
