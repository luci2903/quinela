import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  const fetchGroups = async () => {
    try {
      const data = await api.getMyGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await api.createGroup(newGroupName);
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      alert(err.message || 'Error creando grupo');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await api.joinGroup(joinCode);
      setJoinCode('');
      fetchGroups();
    } catch (err) {
      alert(err.message || 'Error al unirse');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado al portapapeles');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando grupos...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="auth-title">Mis Grupos</h2>
      <p className="auth-subtitle">Compite con tus amigos</p>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Crear Nuevo Grupo</h3>
          <form onSubmit={handleCreateGroup} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nombre del grupo" 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)} 
            />
            <button type="submit" className="btn" style={{ width: 'auto' }}>Crear</button>
          </form>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Unirse a un Grupo</h3>
          <form onSubmit={handleJoinGroup} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Código de invitación" 
              value={joinCode} 
              onChange={e => setJoinCode(e.target.value)} 
            />
            <button type="submit" className="btn" style={{ width: 'auto' }}>Unirse</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {groups.map(group => (
          <div key={group.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{group.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                <span>{group._count.memberships} Miembros</span>
                <span>Puntos Totales: {group.myScore}</span>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Código: {group.invitationCode}</span>
                <button onClick={() => copyToClipboard(group.invitationCode)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>Copiar</button>
              </div>
            </div>
            
            <Link to={`/groups/${group.id}`} className="nav-btn" style={{ textDecoration: 'none' }}>
              Ver Tabla
            </Link>
          </div>
        ))}
        {groups.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aún no perteneces a ningún grupo.</p>
        )}
      </div>
    </div>
  );
}
