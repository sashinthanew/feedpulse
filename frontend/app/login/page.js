'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        toast.success('Welcome Admin!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ FeedPulse</h1>
        <h2 style={styles.title}>Admin Login</h2>
        <p style={styles.sub}>admin@feedpulse.com / admin123</p>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="admin@feedpulse.com"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            style={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={loading ? styles.btnDisabled : styles.btn}
        >
          {loading ? '⏳ Logging in...' : '🔐 Login'}
        </button>

        <p style={styles.back}>
          <a href="/" style={{ color: '#6366f1' }}>← Back to Feedback Form</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', padding: 40, borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logo: { textAlign: 'center', color: '#6366f1', fontSize: 28, fontWeight: 800, margin: '0 0 8px' },
  title: { textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 },
  sub: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 28, background: '#f8fafc', padding: '6px 12px', borderRadius: 8 },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' },
  btn: { width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  btnDisabled: { width: '100%', padding: 12, background: '#a5b4fc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'not-allowed' },
  back: { textAlign: 'center', marginTop: 20, fontSize: 14 },
};