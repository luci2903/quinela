import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emptyForm = {
    homeTeam: '', awayTeam: '', stadiumCity: '', stadiumName: '',
    phase: 'GROUP_STAGE', matchDate: '', status: 'SCHEDULED', externalId: ''
  };

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const phases = ['GROUP_STAGE', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'];

  const fetchMatches = async () => {
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (user?.role !== 'ADMIN') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>Acceso Denegado. Solo para administradores.</div>;
  }

  const openModal = (match = null) => {
    if (match) {
      setSelectedMatch(match);
      setFormData({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        stadiumCity: match.stadiumCity,
        stadiumName: match.stadiumName || '',
        phase: match.phase,
        matchDate: new Date(match.matchDate)
  .toISOString()
  .slice(0, 16),
        status: match.status,
        externalId: match.externalId || ''
      });
    } else {
      setSelectedMatch(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
    setFormData(emptyForm);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchMatch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const query = searchQuery.trim().replace(/\s+/g, '_');
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error al buscar en TheSportsDB');
      const data = await response.json();
      setSearchResults(data.event || []);
      if (!data.event || data.event.length === 0) {
        alert('No se encontraron partidos para esa búsqueda.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al buscar partido');
    } finally {
      setSearching(false);
    }
  };

  const mapPhaseFromEvent = (evt) => {
    const round = evt.intRound ? String(evt.intRound).trim() : '';
    const group = evt.strGroup ? evt.strGroup.trim() : '';

    // Si tiene letra de grupo → fase de grupos
    if (group) return 'GROUP_STAGE';

    // Sin grupo → knockout, determinado por el número de ronda
    switch (round) {
      case '32': return 'ROUND_OF_32';
      case '16': return 'ROUND_OF_16';
      case '8':  return 'QUARTER_FINAL';
      case '4':  return 'SEMI_FINAL';
      case '3':  return 'THIRD_PLACE';
      case '2':
      case '1':  return 'FINAL';
      default:   return 'GROUP_STAGE';
    }
  };

  const selectSearchedEvent = (evt) => {
    let localDateTime = '';
    try {
      // Prefer the explicit local date/time fields from TheSportsDB
      const datePart = evt.dateEventLocal || evt.dateEvent;
      const timePart = evt.strTimeLocal || evt.strTime;
      if (datePart && timePart) {
        // Build an ISO‑8601 compatible string without timezone offset (treated as local by the input type)
        const iso = `${datePart}T${timePart}`;
        const d = new Date(iso);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      }
    } catch (e) {
      console.error('Error al parsear fecha:', e);
    }

    setFormData({
      ...formData,
      homeTeam: evt.strHomeTeam,
      awayTeam: evt.strAwayTeam,
      stadiumCity: evt.strCity || '',
      stadiumName: evt.strVenue || '',
      matchDate: localDateTime,
      phase: mapPhaseFromEvent(evt),
      externalId: evt.idEvent
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleManualSync = async () => {
    try {
      await api.triggerManualSync();
      alert('Sincronización manual completada con éxito.');
      fetchMatches();
    } catch (err) {
      alert(err.message || 'Error al ejecutar la sincronización.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     const payload = {
  ...formData,
  matchDate: new Date(formData.matchDate).toISOString(),
};
      if (selectedMatch) {
        await api.updateMatch(selectedMatch.id, payload);
      } else {
        await api.createMatch(payload);
      }

      fetchMatches();
      closeModal();
      alert(selectedMatch ? 'Partido actualizado' : 'Partido creado');
    } catch (err) {
      alert(err.message || 'Error guardando partido');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  const phaseNames = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos de final",
  QUARTER_FINAL: "Cuartos de final",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};
const statusNames = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  FINISHED: "Finalizado",
};


  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="auth-title">Gestión de Partidos (Admin)</h2>
          <p className="auth-subtitle">Crea o modifica los partidos del Mundial</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleManualSync}
            className="btn"
            style={{ width: 'auto', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', boxShadow: 'none' }}
          >
            🔄 Sincronizar Marcadores
          </button>
          <button onClick={() => openModal()} className="btn" style={{ width: 'auto' }}>+ Nuevo Partido</button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Fecha</th>
              <th style={{ padding: '1rem' }}>Equipos</th>
              <th style={{ padding: '1rem' }}>Fase</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(match => (
              <tr key={match.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(match.matchDate).toLocaleString("es-BO", {
  timeZone: "America/La_Paz",
})}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{match.homeTeam} vs {match.awayTeam}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{phaseNames[match.phase]}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background: match.status === 'FINISHED' ? 'rgba(16, 185, 129, 0.15)' :
                                match.status === 'LIVE' ? 'rgba(239, 68, 68, 0.2)' :
                                'rgba(255,255,255,0.08)',
                    color: match.status === 'FINISHED' ? 'var(--success)' :
                           match.status === 'LIVE' ? 'var(--error)' :
                           'var(--text-secondary)',
                  }}>
                    {statusNames[match.status]}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => openModal(match)} className="nav-btn">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="auth-card glass-panel" style={{ width: '90%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{selectedMatch ? 'Editar Partido' : 'Crear Partido'}</h3>

            {/* Búsqueda en TheSportsDB */}
            {!selectedMatch && (
              <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label className="form-label" style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', display: 'block' }}>
                  🔍 Buscar Partido en TheSportsDB
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="form-input"
                    placeholder="Ej: Portugal vs Spain"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchMatch())}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchMatch}
                    className="btn"
                    style={{ width: 'auto', padding: '0 1rem', boxShadow: 'none' }}
                    disabled={searching}
                  >
                    {searching ? '...' : 'Buscar'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div style={{ marginTop: '0.75rem', maxHeight: '180px', overflowY: 'auto', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    {searchResults.map(evt => (
                      <button
                        key={evt.idEvent}
                        type="button"
                        onClick={() => selectSearchedEvent(evt)}
                        style={{
                          display: 'block', width: '100%', padding: '0.75rem 1rem', textAlign: 'left',
                          background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                          color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 'bold' }}>{evt.strEvent}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {evt.dateEvent} · {evt.strVenue} · {evt.strCity}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Local</label>
                  <input className="form-input" required value={formData.homeTeam} onChange={e => setFormData({...formData, homeTeam: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Visitante</label>
                  <input className="form-input" required value={formData.awayTeam} onChange={e => setFormData({...formData, awayTeam: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha y Hora</label>
                <input type="datetime-local" className="form-input" required value={formData.matchDate} onChange={e => setFormData({...formData, matchDate: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Fase</label>
                <select className="form-input" value={formData.phase} onChange={e => setFormData({...formData, phase: e.target.value})}>
                  {phases.map(p => (
  <option key={p} value={p}>
    {phaseNames[p]}
  </option>
))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input className="form-input" required value={formData.stadiumCity} onChange={e => setFormData({...formData, stadiumCity: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Estadio</label>
                <input className="form-input" value={formData.stadiumName} onChange={e => setFormData({...formData, stadiumName: e.target.value})} />
              </div>

              {formData.externalId && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  ✅ Vinculado a TheSportsDB · ID: {formData.externalId}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={closeModal} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', boxShadow: 'none' }}>Cancelar</button>
                <button type="submit" className="btn">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
