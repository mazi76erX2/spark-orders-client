import { FormEvent, useState } from 'react';
import { ApiError, authenticate, errorText } from '../api';
import type { User } from '../types';

export default function LoginForm({ onSignedIn }: { onSignedIn: (u: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onSignedIn(await authenticate(username.trim(), password));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401 && !err.gateway
          ? 'Wrong username or password. Check them and try again.'
          : errorText(err),
      );
      setBusy(false);
    }
  }

  return (
    <section className="card" aria-labelledby="signin">
      <h2 id="signin">Sign in</h2>
      <p className="sub">Use your salesperson account to place orders.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="u">Username</label>
        <input id="u" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
        <label htmlFor="p">Password</label>
        <input id="p" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="alert" role="alert">{error}</div>
        <div className="actions">
          <button className="primary" type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </section>
  );
}
