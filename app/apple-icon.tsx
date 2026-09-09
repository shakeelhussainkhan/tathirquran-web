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
          background: '#1a1005',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          border: '2px solid rgba(201,162,39,0.5)',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 90,
            color: '#c9a227',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          ط
        </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 16,
            color: 'rgba(201,162,39,0.5)',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          TQ
        </div>
      </div>
    ),
    { ...size }
  );
}
