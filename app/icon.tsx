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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          border: '0.5px solid rgba(201,162,39,0.4)',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: 18,
            color: '#c9a227',
            lineHeight: 1,
          }}
        >
          ط
        </div>
      </div>
    ),
    { ...size }
  );
}
