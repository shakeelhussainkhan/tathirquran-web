import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0a0802',
          borderRadius: 36,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* LEFT PAGE — dark leather cover */}
        <div style={{
          position: 'absolute',
          left: 8,
          top: 8,
          bottom: 8,
          width: 72,
          background: 'linear-gradient(135deg, #2a1808 0%, #1a1005 100%)',
          borderRadius: '8px 0 0 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(201,162,39,0.3)',
          borderRight: 'none',
        }}>
          {/* Ornament: outer circle */}
          <div style={{
            width: 44,
            height: 44,
            border: '1px solid rgba(201,162,39,0.5)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Inner diamond ornament */}
            <div style={{
              width: 20,
              height: 20,
              border: '1px solid #c9a227',
              transform: 'rotate(45deg)',
            }} />
          </div>
          {/* Bottom ornament line */}
          <div style={{
            marginTop: 10,
            width: 32,
            height: 1,
            background: 'rgba(201,162,39,0.4)',
          }} />
        </div>

        {/* SPINE */}
        <div style={{
          position: 'absolute',
          left: 80,
          top: 8,
          bottom: 8,
          width: 10,
          background: 'linear-gradient(90deg, #1a1005, #c9a227, #1a1005)',
        }} />

        {/* RIGHT PAGE — glowing parchment */}
        <div style={{
          position: 'absolute',
          left: 90,
          top: 8,
          right: 8,
          bottom: 8,
          background: '#f5e8b0',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '8px 6px',
          border: '1px solid rgba(139,101,32,0.3)',
          borderLeft: 'none',
          overflow: 'hidden',
        }}>
          {/* Illuminated header bar */}
          <div style={{
            width: '100%',
            height: 14,
            background: 'rgba(201,162,39,0.25)',
            borderRadius: 2,
            border: '0.5px solid rgba(201,162,39,0.5)',
            marginBottom: 8,
          }} />
          {/* Decorative text lines simulating verse content */}
          <div style={{ width: '90%', height: 1, background: 'rgba(139,101,32,0.4)', borderRadius: 1 }} />
          <div style={{ width: '80%', height: 1, background: 'rgba(139,101,32,0.3)', marginTop: 8, borderRadius: 1 }} />
          <div style={{ width: '90%', height: 1, background: 'rgba(139,101,32,0.35)', marginTop: 8, borderRadius: 1 }} />
          <div style={{ width: '75%', height: 1, background: 'rgba(139,101,32,0.25)', marginTop: 8, borderRadius: 1 }} />
          <div style={{ width: '85%', height: 1, background: 'rgba(139,101,32,0.3)', marginTop: 8, borderRadius: 1 }} />
          <div style={{ width: '70%', height: 1, background: 'rgba(139,101,32,0.2)', marginTop: 8, borderRadius: 1 }} />
          <div style={{ width: '88%', height: 1, background: 'rgba(139,101,32,0.3)', marginTop: 8, borderRadius: 1 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
