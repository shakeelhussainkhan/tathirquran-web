import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#1a1005',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Green cover background */}
        <div style={{
          position: 'absolute',
          inset: 2,
          background: '#1a3020',
          borderRadius: 4,
          border: '1px solid rgba(201,162,39,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Gold star/medallion suggestion */}
          <div style={{
            width: 14,
            height: 14,
            border: '1.5px solid #c9a227',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: 'serif',
              fontSize: 9,
              color: '#c9a227',
              lineHeight: 1,
            }}>
              ق
            </div>
          </div>
        </div>
        {/* Left spine strip */}
        <div style={{
          position: 'absolute',
          left: 2,
          top: 2,
          bottom: 2,
          width: 4,
          background: '#0a1a10',
          borderRadius: '3px 0 0 3px',
        }} />
      </div>
    ),
    { ...size }
  );
}
