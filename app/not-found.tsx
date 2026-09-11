import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100svh', background: '#faf5e9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Amiri, serif', textAlign: 'center', padding: '40px' }}>
      <div style={{ height: 7, position: 'fixed', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #8b6520, #c9a227, #e8c96a, #c9a227, #8b6520)' }} />
      <div style={{ fontFamily: 'Amiri, serif', fontSize: 64, color: '#c9a227', marginBottom: 16 }}>٤٠٤</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', color: '#1a1205', marginBottom: 24 }}>
        This page was not found
      </div>
      <div style={{ fontFamily: 'Amiri, serif', fontSize: 20, color: '#0d0a04', direction: 'rtl', marginBottom: 24 }}>
        وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ
      </div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontStyle: 'italic', color: '#7a6030', marginBottom: 32 }}>
        &ldquo;Whoever relies upon Allah — then He is sufficient for him.&rdquo; — Al-Talaq 65:3
      </div>
      <Link href="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em', color: '#c9a227', textTransform: 'uppercase', border: '0.5px solid rgba(201,162,39,0.4)', padding: '8px 20px', borderRadius: 2, textDecoration: 'none' }}>
        Return to Today&apos;s Ayah
      </Link>
      <div style={{ height: 7, position: 'fixed', bottom: 0, left: 0, right: 0, background: 'linear-gradient(90deg, #8b6520, #c9a227, #e8c96a, #c9a227, #8b6520)' }} />
    </main>
  );
}
