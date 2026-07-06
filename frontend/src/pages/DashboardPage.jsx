import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="app-container">
      <nav className="navbar glass-panel">
        <h1 className="nav-brand gradient-text">Quiniela 2026</h1>
        <div className="nav-links">
          <span>Hola, {user?.name}</span>
          <button onClick={logout} className="nav-btn">Cerrar Sesión</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2 className="auth-title">Tu Resumen</h2>
          <p className="auth-subtitle">Mantente al tanto de tu rendimiento</p>
        </div>

        {loading ? (
          <p>Cargando información...</p>
        ) : (
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            
            {/* Card: Puntos Totales */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Puntaje Acumulado</h3>
              <p className="gradient-text" style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>
                {summary?.totalScore || 0} pts
              </p>
            </div>

            {/* Card: Grupos */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Mis Grupos ({summary?.groupsCount || 0})</h3>
              {summary?.groupPositions?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {summary.groupPositions.map((g) => (
                    <li key={g.groupId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span>{g.groupName}</span>
                      <strong>Posición #{g.position}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No perteneces a ningún grupo aún.</p>
              )}
            </div>

            {/* Card: Próximos Partidos */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Próximos Partidos Sin Pronóstico</h3>
              {summary?.upcomingPendingMatches?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {summary.upcomingPendingMatches.map((m) => (
                    <li key={m.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div><strong>{m.homeTeam} vs {m.awayTeam}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(m.matchDate).toLocaleString()} - {m.stadiumCity}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>¡Estás al día! No tienes partidos próximos sin pronosticar.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
