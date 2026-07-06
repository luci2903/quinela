import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getGroupLeaderboard(id);
        setLeaderboard(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la tabla de clasificación');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando tabla de posiciones...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/groups" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        &larr; Volver a Mis Grupos
      </Link>
      
      <h2 className="auth-title">Clasificación del Grupo</h2>
      
      <div className="glass-panel" style={{ marginTop: '2rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Posición</th>
              <th style={{ padding: '1rem' }}>Participante</th>
              <th style={{ padding: '1rem' }}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((participant) => (
              <tr 
                key={participant.userId} 
                style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: participant.userId === user.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
              >
                <td style={{ padding: '1rem', fontWeight: participant.position <= 3 ? 'bold' : 'normal' }}>
                  #{participant.position}
                </td>
                <td style={{ padding: '1rem' }}>
                  {participant.name} {participant.userId === user.id && '(Tú)'}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {participant.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
