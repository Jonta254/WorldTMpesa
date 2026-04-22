import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSettings } from "../../hooks/useAppSettings";
import {
  APP_CONFIG,
  buildWorldAppDeeplink,
  getCurrentUser,
  getWorldAppContext,
  logoutUser,
} from "../../services";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/sell", label: "Sell" },
  { to: "/buy", label: "Buy" },
  { to: "/orders", label: "Orders" },
];

function AppShell() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const worldApp = getWorldAppContext();
  const settings = useAppSettings();
  const insets = worldApp.deviceProperties?.safeAreaInsets;
  const worldAppLink = buildWorldAppDeeplink(location.pathname);

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
            <h1>{APP_CONFIG.appName}</h1>
          </div>
          <button type="button" className="button-ghost" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="context-strip">
          <span>{worldApp.isInstalled ? "Opened in World App" : "Open in World App for wallet payments"}</span>
          <span>{user?.username ? `@${user.username}` : user?.phone || "TMpesa session"}</span>
          {!worldApp.isInstalled && settings.worldAppId ? (
            <a href={worldAppLink} className="text-link">
              Open in World App
            </a>
          ) : null}
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
