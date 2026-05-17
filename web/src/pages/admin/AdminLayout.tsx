import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth-context";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/pending", label: "Pending Students", icon: "⏳" },
    { path: "/admin/students", label: "All Students", icon: "🎓" },
    { path: "/admin/staff", label: "Staff", icon: "👨‍🏫" },
    { path: "/admin/classes", label: "Classes", icon: "🏫" },
    { path: "/admin/subjects", label: "Subjects", icon: "📚" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-card">
        <div className="sidebar-header">
          <h2 style={{ background: "linear-gradient(to right, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EduManage Pro
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Admin Portal
          </p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
            <div className="user-details">
              <span className="user-email" title={user?.email}>{user?.email}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}
