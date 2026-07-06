import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      await api.updateProfile(name);
      setMessage('Perfil actualizado con éxito. (El cambio se reflejará completamente en tu próximo inicio de sesión o recarga).');
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 className="auth-title">Mi Perfil</h2>
      <p className="auth-subtitle">Actualiza tu información personal</p>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico (No modificable)</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre Completo</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
