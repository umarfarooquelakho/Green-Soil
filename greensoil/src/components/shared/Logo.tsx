/**
 * Green Soil — Reusable Logo Component
 *
 * Renders the logo image + branded text:
 *   "Green" (dark green) "Soil" (brown)
 *   "AGRI SERVICES (PVT.) LTD" (green, smaller)
 *
 * Props:
 *   size     — 'sm' | 'md' | 'lg' | 'xl'  (controls image + text sizes)
 *   inverted — true = white text (for dark backgrounds like sidebar/footer)
 *   textOnly — true = hide image, show text only (rare edge case)
 *   noText   — true = image only (for very tight spaces)
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  inverted?: boolean
  noText?: boolean
}

const sizes = {
  sm: { img: 'h-7',  name: 'text-base', sub: 'text-[9px]'  },
  md: { img: 'h-9',  name: 'text-lg',   sub: 'text-[10px]' },
  lg: { img: 'h-12', name: 'text-xl',   sub: 'text-xs'     },
  xl: { img: 'h-16', name: 'text-2xl',  sub: 'text-sm'     },
}

export function Logo({ size = 'md', inverted = false, noText = false }: LogoProps) {
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo image */}
      <img
        src="/images/logo/Logo.jpg"
        alt="Green Soil Agri Services"
        className={`${s.img} w-auto object-contain flex-shrink-0`}
      />

      {/* Text block */}
      {!noText && (
        <div className="leading-none select-none">
          {/* GREEN SOIL */}
          <div className={`${s.name} font-extrabold leading-tight tracking-tight`}>
            <span style={{ color: inverted ? '#86efac' : '#166534' }}>Green</span>
            <span style={{ color: inverted ? '#d2b48c' : '#7c4a1e' }}> Soil</span>
          </div>
          {/* AGRI SERVICES (PVT.) LTD */}
          <div
            className={`${s.sub} font-semibold tracking-wider uppercase mt-0.5`}
            style={{ color: inverted ? '#86efac' : '#166534' }}
          >
            Agri Services (Pvt.) Ltd
          </div>
        </div>
      )}
    </div>
  )
}
