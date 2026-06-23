import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const BRAND = '#01696f'
const BRAND_LIGHT = '#6fb4b6'
const INK = '#0d0d0d'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') ?? 'Built for brains that don’t switch off').slice(0, 120)
  const tag = searchParams.get('tag')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: INK,
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* top accent bar */}
        <div style={{ display: 'flex', height: 10, width: 160, backgroundColor: BRAND, borderRadius: 6 }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tag ? (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                marginBottom: 28,
                padding: '8px 20px',
                borderRadius: 999,
                backgroundColor: 'rgba(1,105,111,0.2)',
                color: BRAND_LIGHT,
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              color: 'white',
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 34, fontWeight: 700, color: 'white' }}>
            WelshDog<span style={{ color: BRAND_LIGHT }}>.</span>
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#888' }}>
            welshdog.designs · South Wales 🏴
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
