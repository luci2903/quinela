import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [myPredictions, setMyPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesData, predictionsData] = await Promise.all([
        api.getMatches(),
        api.getMyPredictions(),
      ]);
      setMatches(matchesData);
      setMyPredictions(predictionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionForMatch = (matchId) => {
    return myPredictions.find(p => p.matchId === matchId);
  };

  const openPredictionModal = (match) => {
    const existing = getPredictionForMatch(match.id);
    setSelectedMatch(match);
    setHomeScore(existing ? existing.homeScoreBet : '');
    setAwayScore(existing ? existing.awayScoreBet : '');
  };

  const closePredictionModal = () => {
    setSelectedMatch(null);
    setHomeScore('');
    setAwayScore('');
  };

  const handlePredictionSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const existing = getPredictionForMatch(selectedMatch.id);
    
    try {
      if (existing) {
        await api.updatePrediction(existing.id, homeScore, awayScore);
      } else {
        await api.createPrediction(selectedMatch.id, homeScore, awayScore);
      }
      await fetchData(); // Refresh data
      closePredictionModal();
    } catch (err) {
      alert(err.message || 'Error al guardar el pronóstico');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [phaseFilter, setPhaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (loading) return <div style={{ padding: '2rem' }}>Cargando partidos...</div>;

  const phases = ['GROUP_STAGE', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'];
  const filteredMatches = matches.filter(match => {
  const phaseOk = !phaseFilter || match.phase === phaseFilter;

  const statusOk = !statusFilter || match.status === statusFilter;

  const dateOk =
    !dateFilter ||
    new Date(match.matchDate).toISOString().slice(0, 10) === dateFilter;

  return phaseOk && statusOk && dateOk;
});


const statusNames = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  FINISHED: "Finalizado",
};

  const phaseNames = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos de final",
  QUARTER_FINAL: "Cuartos de final",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Calendario de Partidos</h2>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>Pronostica antes de que inicien</p>
        </div>
        
        <select 
          className="form-input" 
          style={{ width: 'auto', background: 'var(--bg-glass)' }}
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="">Todas las Fases</option>
          {phases.map(p => (
  <option key={p} value={p}>
    {phaseNames[p]}
  </option>
))}
        </select>
        <select
  className="form-input"
  style={{ width: "auto", background: "var(--bg-glass)" }}
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="">Todos los Estados</option>
  <option value="SCHEDULED">Programado</option>
  <option value="LIVE">En Vivo</option>
  <option value="FINISHED">Finalizado</option>
</select>
<input
  type="date"
  className="form-input"
  style={{ width: "auto", background: "var(--bg-glass)" }}
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
/>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMatches.map(match => {
          const prediction = getPredictionForMatch(match.id);
          const hasStarted = new Date() >= new Date(match.matchDate);
          
          return (
            <div key={match.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                  {new Date(match.matchDate).toLocaleString("es-BO", {
  timeZone: "America/La_Paz",
})}- {match.stadiumCity}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                {prediction && (
                  <div style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.9rem' }}>
                    Tu pronóstico: {prediction.homeScoreBet} - {prediction.awayScoreBet}
                    {match.status === 'FINISHED' && (
                      <span style={{ marginLeft: '1rem', color: 'var(--text-primary)' }}>
                        (Ganaste {prediction.points || 0} pts)
                      </span>
                    )}
                  </div>
                )}
                {match.status === 'FINISHED' && (
                  <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Resultado Final: {match.homeScore} - {match.awayScore}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

  <button
    className="nav-btn"
    onClick={() => setSelectedDetail(match)}
  >
    Ver detalle
  </button>

  {!hasStarted ? (
    <button
      onClick={() => openPredictionModal(match)}
      className="nav-btn"
    >
      {prediction ? 'Editar' : 'Pronosticar'}
    </button>
  ) : (
    <span style={{ color: 'var(--error)', fontSize: '0.9rem' }}>
      {match.status === 'FINISHED'
        ? 'Finalizado'
        : 'En Vivo / Cerrado'}
    </span>
  )}

</div>
            </div>
          );
        })}
      </div>

      {selectedMatch && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="auth-card glass-panel" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pronóstico</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
            </p>
            
            <form onSubmit={handlePredictionSubmit}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{selectedMatch.homeTeam}</label>
                  <input type="number" min="0" required className="form-input" value={homeScore} onChange={e => setHomeScore(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">{selectedMatch.awayTeam}</label>
                  <input type="number" min="0" required className="form-input" value={awayScore} onChange={e => setAwayScore(e.target.value)} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={closePredictionModal} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', boxShadow: 'none' }}>Cancelar</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedDetail && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      className="glass-panel"
      style={{
        padding: "2rem",
        width: "450px",
        borderRadius: "15px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Detalle del Partido</h2>

      <p><strong>Equipos:</strong> {selectedDetail.homeTeam} vs {selectedDetail.awayTeam}</p>

      <p><strong>Fecha:</strong> {new Date(selectedDetail.matchDate).toLocaleString("es-BO", {
  timeZone: "America/La_Paz",
})}</p>

      <p><strong>Ciudad:</strong> {selectedDetail.stadiumCity}</p>

      <p>
  <strong>Fase:</strong> {phaseNames[selectedDetail.phase]}
</p>

<p>
  <strong>Estado:</strong> {statusNames[selectedDetail.status]}
</p>

      {selectedDetail.status === "FINISHED" && (
        <p>
          <strong>Resultado:</strong> {selectedDetail.homeScore} - {selectedDetail.awayScore}
        </p>
      )}

      <button
        className="btn"
        style={{ marginTop: "20px" }}
        onClick={() => setSelectedDetail(null)}
      >
        Cerrar
      </button>
    </div>
  </div>
)}
    </div>
  );
}
