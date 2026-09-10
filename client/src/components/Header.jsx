import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        AccessiBoard
      </NavLink>
      <nav className="main-nav" aria-label="Primary">
        <ul>
          <li>
            <NavLink to="/" end>
              Jobs
            </NavLink>
          </li>
          <li>
            {isAuthenticated ? (
              <NavLink to="/admin">Admin Dashboard</NavLink>
            ) : (
              <NavLink to="/admin/login">Admin Login</NavLink>
            )}
          </li>
          {isAuthenticated && (
            <li>
              <button type="button" className="theme-toggle" onClick={logout}>
                Log out
              </button>
            </li>
          )}
        </ul>
      </nav>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </button>
    </header>
  );
}
