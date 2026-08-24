import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'TrustFundX - Transparent Fund Management';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 160, fontWeight: 'bold', marginBottom: 20 }}>
          TrustFundX
        </div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>
          Transparent Fund Management
        </div>
        <div style={{ fontSize: 36, opacity: 0.8, marginTop: 20 }}>
          Blockchain-Based Grant Tracking
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
