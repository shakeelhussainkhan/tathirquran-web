'use client';
import { useState } from 'react';

export default function NotifySignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('/api/notify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitted(true); // fail silently
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '13px',
        fontStyle: 'italic',
        color: '#c9a227',
        textAlign: 'center',
        marginTop: '8px',
      }}>
        JazakAllah Khair — we&apos;ll notify you when the app launches 🤲
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      marginTop: '8px',
      justifyContent: 'center',
    }}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          letterSpacing: '0.06em',
          border: '0.5px solid rgba(201,162,39,0.35)',
          background: 'transparent',
          color: '#1a1205',
          padding: '5px 12px',
          borderRadius: '2px',
          outline: 'none',
          width: '180px',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#fff',
          background: '#c9a227',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        {loading ? '...' : 'Notify Me'}
      </button>
    </div>
  );
}
