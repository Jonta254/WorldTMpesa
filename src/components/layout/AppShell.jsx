import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { APP_CONFIG, getCurrentUser, getWorldAppContext, logoutUser } from "../../services";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/sell", label: "Sell WLD" },
  { to: "/buy", label: "Buy WLD" },
  { to: "/orders", label: "Orders" },
];

function AppShell() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const worldApp = getWorldAppContext();
  const insets = worldApp.deviceProperties?.safeAreaInsets;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div
      className="page-bg"
      style={{
        paddingTop: insets?.top ? `${Math.max(insets.top, 20)}px` : undefined,
        paddingBottom: insets?.bottom ? `${Math.max(insets.bottom + 20, 32)}px` : undefined,
      }}
    >
      <div className="app-layout app-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="brand-kicker">World App Mini App</span>
            <h1>{APP_CONFIG.appName}</h1>
          </div>
          <button type="button" className="button-ghost" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="context-strip">
          <span>{worldApp.isInstalled ? "Opened in World App" : "Browser preview mode"}</span>
          <span>{user?.username ? `@${user.username}` : user?.phone || "Local prototype session"}</span>
        </div>

        <nav className="nav-row">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
          {user?.isAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Admin
            </NavLink>
          ) : null}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}

export default AppShell;
