import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!isLogin && password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await signIn(email, password);
        if (err) setError(err.message);
      } else {
        const { error: err } = await signUp(email, password);
        if (err) {
          setError(err.message);
        } else {
          setSuccess(
            'Cuenta creada. Revisá tu email para confirmar.'
          );
        }
      }
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Error al iniciar con Google');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">TRACKEALO</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Iniciá sesión para acceder' : 'Creá tu cuenta gratis'}
        </p>

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn google-btn"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="auth-divider">
          <span>o con email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary-lg"
            style={{ width: '100%' }}
          >
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>
              ¿No tenés cuenta?{' '}
              <a onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>
                Registrate
              </a>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{' '}
              <a onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>
                Iniciá sesión
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
