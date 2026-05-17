import { Link } from "react-router-dom";
import { useAuth } from "./auth-context";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navigation glass-nav">
      <div className="nav-brand">
        <h1>EduManage Pro</h1>
      </div>
      <div className="nav-links">
        {user?.role === "ADMIN" || user?.role === "TEACHER" ? (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/classes">Classes</Link>
          </>
        ) : (
          <Link to="/student">My Dashboard</Link>
        )}
      </div>
      <div className="nav-user">
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <span className="user-role badge">{user?.role}</span>
        </div>
        <button onClick={logout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
