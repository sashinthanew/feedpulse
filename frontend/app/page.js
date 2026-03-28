'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];

export default function FeedbackPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Bug',
    submitterName: '',
    submitterEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.title.trim()) {
      toast.error('Title is required!');
      return false;
    }
    if (form.description.trim().length < 20) {
      toast.error('Description must be at least 20 characters!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Feedback submitted!');
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.center}>
        <div style={styles.successBox}>
          <div style={{ fontSize: 60 }}>✅</div>
          <h2 style={{ color: '#16a34a', fontSize: 24, margin: '16px 0 8px' }}>
            Thank you!
          </h2>
          <p style={{ color: '#555' }}>
            Your feedback has been submitted and is being analysed by AI.
          </p>
          <button
            style={styles.btnGreen}
            onClick={() => { setSubmitted(false); setForm({ title: '', description: '', category: 'Bug', submitterName: '', submitterEmail: '' }); }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>⚡ FeedPulse</h1>
        <p style={styles.tagline}>AI-Powered Product Feedback Platform</p>
      </div>

      {/* Form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Submit Feedback</h2>
        <p style={styles.cardSub}>Help us improve — your feedback is analysed instantly by AI.</p>

        {/* Title */}
        <div style={styles.field}>
          <label style={styles.label}>Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of your feedback"
            maxLength={120}
            style={styles.input}
          />
          <span style={styles.hint}>{form.title.length}/120</span>
        </div>

        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category *</label>
          <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div style={styles.field}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your feedback in detail (min 20 characters)"
            rows={5}
            style={{ ...styles.input, resize: 'vertical' }}
          />
          <span style={{ ...styles.hint, color: form.description.length < 20 ? '#ef4444' : '#16a34a' }}>
            {form.description.length} characters {form.description.length < 20 ? `(${20 - form.description.length} more needed)` : '✓'}
          </span>
        </div>

        {/* Optional Fields */}
        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Your Name (optional)</label>
            <input name="submitterName" value={form.submitterName} onChange={handleChange} placeholder="John Doe" style={styles.input} />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Your Email (optional)</label>
            <input name="submitterEmail" value={form.submitterEmail} onChange={handleChange} placeholder="john@example.com" type="email" style={styles.input} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={loading ? styles.btnDisabled : styles.btnPrimary}>
          {loading ? '⏳ Submitting...' : '🚀 Submit Feedback'}
        </button>
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        Admin? <a href="/login" style={{ color: '#6366f1' }}>Login to Dashboard →</a>
      </p>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f1f5f9', padding: '40px 16px' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: 800, color: '#6366f1', margin: 0 },
  tagline: { color: '#64748b', marginTop: 8 },
  card: { maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 },
  cardSub: { color: '#64748b', marginBottom: 24, fontSize: 14 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' },
  row: { display: 'flex', gap: 16 },
  btnPrimary: { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { width: '100%', padding: '12px', background: '#a5b4fc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'not-allowed', marginTop: 8 },
  btnGreen: { marginTop: 20, padding: '10px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 },
  successBox: { background: '#fff', padding: 48, borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  footer: { textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 14 },
};