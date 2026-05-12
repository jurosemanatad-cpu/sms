import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "./auth-context";
export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await login(email, password);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("main", { className: "container", children: _jsxs("div", { className: "login-container", children: [_jsx("h1", { children: "School Management System" }), _jsxs("div", { className: "card", children: [_jsx("h2", { children: "Login" }), error && _jsx("div", { className: "error", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "form", children: [_jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: isLoading }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "Logging in..." : "Login" })] }), _jsxs("div", { className: "login-info", children: [_jsx("h3", { children: "Default Admin Account:" }), _jsx("p", { children: "Email: admin@school.com" }), _jsx("p", { children: "Password: admin123" }), _jsx("small", { children: "You can create additional accounts after login." })] })] })] }) }));
}
