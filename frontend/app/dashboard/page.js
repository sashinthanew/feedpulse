'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SENTIMENT_COLORS = { Positive: '#16a34a', Neutral: '#d97706', Negative: '#dc2626' };
const SENTIMENT_BG = { Positive: '#dcfce7', Neutral: '#fef3c7', Negative: '#fee2e2' };
const STATUS_COLORS = { New: '#6366f1', 'In Review': '#d97706', Resolved: '#16a34a' };

export default function DashboardPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', search: '', sort: '-createdAt' });
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchFeedbacks = useCallback(async (page = 1) => {
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      [...params.keys()].forEach(k => !params.get(k) && params.delete(k));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
        setPagination({ ...data.pagination, page });
      } else {
        router.push('/login');
      }
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [token, filters, router]);

  useEffect(() => { fetchFeedbacks(1); }, [filters]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      toast.success('Status updated!');
      fetchFeedbacks(pagination.page);
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Deleted!');
      fetchFeedbacks(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const fetchWeeklySummary = async () => {
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSummary(data.data);
      else toast.error('Summary failed');
    } catch {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const retriggerAI = async (id) => {
    toast.loading('Re-analysing with AI...', { id: 'retrigger' });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback/${id}/retrigger`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('AI analysis updated!', { id: 'retrigger' });
        fetchFeedbacks(pagination.page);
      } else {
        toast.error(data.error, { id: 'retrigger' });
      }
    } catch {
      toast.error('Failed', { id: 'retrigger' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const total = pagination.total;
  const open = feedbacks.filter(f => f.status === 'New').length;
  const avgPriority = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.ai_priority || 0), 0) / feedbacks.filter(f => f.ai_priority).length || 0).toFixed(1)
    : 0;

  return (
    <div style={styles.page}>

      {/* ✅ Navbar — Weekly Summary button + Logout */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>⚡ FeedPulse</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={fetchWeeklySummary} style={styles.summaryBtn}>
            🤖 Weekly AI Summary
          </button>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>Admin</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* ✅ Stats Bar — outside grid, correct placement */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total Feedback', value: total, icon: '📋' },
            { label: 'Open Items', value: open, icon: '🔓' },
            { label: 'Avg Priority', value: avgPriority || '—', icon: '🎯' },
            { label: 'This Page', value: feedbacks.length, icon: '📄' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Weekly AI Summary Panel — below stats, above filters */}
        {showSummary && (
          <div style={styles.summaryPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: 18 }}>🤖 Weekly AI Summary</h3>
              <button onClick={() => setShowSummary(false)} style={styles.closeBtn}>✕</button>
            </div>

            {summaryLoading ? (
              <p style={{ color: '#64748b' }}>⏳ Gemini is analysing last 7 days...</p>
            ) : summary ? (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <span style={styles.summaryBadge}>📊 {summary.total_analysed} items analysed</span>
                  <span style={styles.summaryBadge}>💬 {summary.overall_sentiment}</span>
                </div>

                <h4 style={{ color: '#475569', marginBottom: 12 }}>Top 3 Themes</h4>
                {summary.top_themes?.map((t, i) => (
                  <div key={i} style={styles.themeCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#6366f1' }}>#{i + 1} {t.theme}</strong>
                      <span style={styles.countBadge}>{t.count} mentions</span>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>{t.description}</p>
                  </div>
                ))}

                <div style={styles.recommendBox}>
                  <strong>💡 Recommendation:</strong> {summary.recommendation}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Filters */}
        <div style={styles.filterRow}>
          <input
            placeholder="🔍 Search title or summary..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={styles.searchInput}
          />
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} style={styles.select}>
            <option value="">All Categories</option>
            {['Bug', 'Feature Request', 'Improvement', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={styles.select}>
            <option value="">All Status</option>
            {['New', 'In Review', 'Resolved'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} style={styles.select}>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-ai_priority">Highest Priority</option>
            <option value="ai_priority">Lowest Priority</option>
          </select>
        </div>

        {/* Feedback Cards */}
        {loading ? (
          <div style={styles.center}>⏳ Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div style={styles.center}>No feedback found.</div>
        ) : (
          feedbacks.map(fb => (
            <div key={fb._id} style={styles.fbCard}>
              <div style={styles.fbTop}>
                <div>
                  <h3 style={styles.fbTitle}>{fb.title}</h3>
                  <div style={styles.fbMeta}>
                    <span style={styles.tag}>{fb.category}</span>
                    {fb.ai_sentiment && (
                      <span style={{ ...styles.sentimentBadge, background: SENTIMENT_BG[fb.ai_sentiment], color: SENTIMENT_COLORS[fb.ai_sentiment] }}>
                        {fb.ai_sentiment}
                      </span>
                    )}
                    {fb.ai_priority && (
                      <span style={styles.priorityBadge}>🎯 Priority: {fb.ai_priority}/10</span>
                    )}
                    <span style={{ ...styles.statusDot, background: STATUS_COLORS[fb.status] }}>{fb.status}</span>
                  </div>
                </div>
                <div style={styles.fbDate}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>

              {fb.ai_summary && (
                <p style={styles.aiSummary}>🤖 {fb.ai_summary}</p>
              )}

              {fb.ai_tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {fb.ai_tags.map(tag => (
                    <span key={tag} style={styles.aiTag}># {tag}</span>
                  ))}
                </div>
              )}

              {/* ✅ Actions — Status + Re-analyse + Delete */}
              <div style={styles.fbActions}>
                <select
                  value={fb.status}
                  onChange={e => updateStatus(fb._id, e.target.value)}
                  style={styles.statusSelect}
                >
                  {['New', 'In Review', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => retriggerAI(fb._id)} style={styles.retriggerBtn}>
                  🤖 Re-analyse
                </button>
                <button onClick={() => deleteFeedback(fb._id)} style={styles.deleteBtn}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchFeedbacks(p)}
                style={p === pagination.page ? styles.pageActive : styles.pageBtn}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f1f5f9' },
  navbar: { background: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
  logo: { color: '#6366f1', fontSize: 22, fontWeight: 800, margin: 0 },
  logoutBtn: { padding: '6px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  summaryBtn: { padding: '8px 16px', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  content: { maxWidth: 900, margin: '0 auto', padding: '32px 16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 24, fontWeight: 800, color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  summaryPanel: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '2px solid #ede9fe' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
  summaryBadge: { background: '#f1f5f9', padding: '4px 12px', borderRadius: 20, fontSize: 13, color: '#475569', fontWeight: 600 },
  themeCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 10 },
  countBadge: { background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  recommendBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginTop: 16, color: '#15803d', fontSize: 14 },
  filterRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  searchInput: { flex: 2, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, minWidth: 200 },
  select: { flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, minWidth: 130 },
  fbCard: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  fbTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  fbTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' },
  fbMeta: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  fbDate: { fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' },
  tag: { background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  sentimentBadge: { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  priorityBadge: { background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  statusDot: { color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  aiSummary: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#475569', margin: '8px 0', fontStyle: 'italic' },
  aiTag: { background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 12 },
  fbActions: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 },
  statusSelect: { padding: '6px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  retriggerBtn: { padding: '6px 14px', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  deleteBtn: { padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  center: { textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 18 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 },
  pageBtn: { padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer' },
  pageActive: { padding: '8px 14px', border: 'none', borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' },
};