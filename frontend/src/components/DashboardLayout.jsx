import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <nav className="navbar glass-panel">
        <h1 className="nav-brand gradient-text">Quiniela 2026</h1>
        <div className="nav-links">
         <Link
  to="/dashboard"
  className="nav-btn"
  style={{ background: 'transparent', border: 'none' }}
>
  Resumen
</Link>

<Link
  to="/matches"
  className="nav-btn"
  style={{ background: 'transparent', border: 'none' }}
>
  Partidos
</Link>

<Link
  to="/predictions"
  className="nav-btn"
  style={{ background: 'transparent', border: 'none' }}
>
  Mis Pronósticos
</Link>

<Link
  to="/groups"
  className="nav-btn"
  style={{ background: 'transparent', border: 'none' }}
>
  Mis Grupos
</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/matches" className="nav-btn" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)' }}>Admin: Partidos</Link>
          )}
          
          <div style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <Link to="/profile" style={{ marginRight: '1rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Hola, {user?.name}</Link>
            <button onClick={logout} className="nav-btn">Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      {/* Outlet renderiza el componente hijo de la ruta actual */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
