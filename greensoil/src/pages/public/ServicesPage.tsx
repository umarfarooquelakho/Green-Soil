import { useEffect, useState } from 'react'
import { Check, Leaf } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { contentService } from '@/services/contentService'
import type { Service } from '@/services/contentService'

// ─── AI-style illustrated service images (inline SVG, no upload needed) ───────
const SERVICE_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  // Soil Testing
  'soil-testing': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#f0fdf4" rx="16"/>
      {/* Sky */}
      <rect width="480" height="160" fill="#ecfdf5" rx="16"/>
      {/* Ground layers */}
      <rect y="160" width="480" height="40" fill="#a3e635"/>
      <rect y="200" width="480" height="30" fill="#854d0e"/>
      <rect y="230" width="480" height="25" fill="#92400e"/>
      <rect y="255" width="480" height="65" fill="#78350f"/>
      {/* Soil test tube */}
      <rect x="190" y="80" width="28" height="100" rx="14" fill="white" stroke="#16a34a" strokeWidth="3"/>
      <rect x="196" y="140" width="16" height="35" rx="8" fill="#a3e635"/>
      <rect x="196" y="120" width="16" height="22" rx="4" fill="#bbf7d0"/>
      {/* Test tube bubbles */}
      <circle cx="204" cy="150" r="3" fill="#16a34a" opacity="0.5"/>
      <circle cx="200" cy="160" r="2" fill="#16a34a" opacity="0.5"/>
      {/* Clipboard */}
      <rect x="280" y="60" width="90" height="120" rx="8" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <rect x="310" y="50" width="30" height="22" rx="4" fill="#16a34a"/>
      <rect x="295" y="90" width="60" height="3" rx="2" fill="#d1fae5"/>
      <rect x="295" y="102" width="60" height="3" rx="2" fill="#d1fae5"/>
      <rect x="295" y="114" width="45" height="3" rx="2" fill="#d1fae5"/>
      <rect x="295" y="126" width="50" height="3" rx="2" fill="#d1fae5"/>
      <rect x="295" y="138" width="35" height="3" rx="2" fill="#d1fae5"/>
      {/* Magnifying glass */}
      <circle cx="140" cy="130" r="40" fill="none" stroke="#16a34a" strokeWidth="4"/>
      <circle cx="140" cy="130" r="30" fill="white" opacity="0.6"/>
      <circle cx="140" cy="130" r="14" fill="#86efac" opacity="0.6"/>
      <line x1="168" y1="158" x2="190" y2="180" stroke="#15803d" strokeWidth="6" strokeLinecap="round"/>
      {/* Chart bars on clipboard */}
      <rect x="300" y="150" width="10" height="20" rx="2" fill="#16a34a"/>
      <rect x="315" y="140" width="10" height="30" rx="2" fill="#22c55e"/>
      <rect x="330" y="145" width="10" height="25" rx="2" fill="#4ade80"/>
      {/* Sparkles */}
      <circle cx="80" cy="60" r="5" fill="#bbf7d0"/>
      <circle cx="400" cy="80" r="4" fill="#bbf7d0"/>
      <circle cx="420" cy="140" r="3" fill="#86efac"/>
      {/* Label */}
      <rect x="150" y="260" width="180" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="283" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">SOIL TESTING</text>
    </svg>
  ),

  // Crop Advisory
  'crop-advisory': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#f0fdf4" rx="16"/>
      {/* Sky gradient */}
      <rect width="480" height="200" fill="#ecfdf5" rx="16"/>
      {/* Sun */}
      <circle cx="400" cy="70" r="40" fill="#fef9c3" stroke="#fde047" strokeWidth="3"/>
      <circle cx="400" cy="70" r="28" fill="#fef08a"/>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i}
          x1={400 + 46 * Math.cos(angle * Math.PI/180)}
          y1={70 + 46 * Math.sin(angle * Math.PI/180)}
          x2={400 + 58 * Math.cos(angle * Math.PI/180)}
          y2={70 + 58 * Math.sin(angle * Math.PI/180)}
          stroke="#fde047" strokeWidth="3" strokeLinecap="round"
        />
      ))}
      {/* Ground */}
      <ellipse cx="240" cy="250" rx="220" ry="30" fill="#86efac"/>
      <rect y="255" width="480" height="65" fill="#16a34a"/>
      {/* Wheat stalks */}
      {[80, 130, 180, 300, 350, 400].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="250" x2={x} y2="160" stroke="#a3e635" strokeWidth="3"/>
          <ellipse cx={x} cy="155" rx="8" ry="20" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1={x} y1="200" x2={x-20} y2="180" stroke="#a3e635" strokeWidth="2"/>
          <ellipse cx={x-22} cy="178" rx="6" ry="14" fill="#d9f99d" stroke="#65a30d" strokeWidth="1"/>
        </g>
      ))}
      {/* Agronomist */}
      {/* Body */}
      <circle cx="240" cy="130" r="22" fill="#fbbf24"/>
      <rect x="218" y="152" width="44" height="60" rx="10" fill="#16a34a"/>
      {/* Arms */}
      <line x1="218" y1="165" x2="195" y2="190" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
      <line x1="262" y1="165" x2="285" y2="190" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
      {/* Clipboard in hand */}
      <rect x="270" y="185" width="36" height="45" rx="5" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <rect x="275" y="198" width="26" height="2" rx="1" fill="#d1fae5"/>
      <rect x="275" y="206" width="26" height="2" rx="1" fill="#d1fae5"/>
      <rect x="275" y="214" width="18" height="2" rx="1" fill="#d1fae5"/>
      {/* Hat */}
      <rect x="216" y="110" width="48" height="12" rx="4" fill="#15803d"/>
      <rect x="224" y="96" width="32" height="16" rx="4" fill="#15803d"/>
      {/* Speech bubble */}
      <rect x="80" y="80" width="120" height="60" rx="12" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <polygon points="150,140 140,155 160,140" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <circle cx="110" cy="110" r="6" fill="#4ade80"/>
      <circle cx="130" cy="110" r="6" fill="#4ade80"/>
      <circle cx="150" cy="110" r="6" fill="#4ade80"/>
      {/* Label */}
      <rect x="140" y="276" width="200" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="299" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">CROP ADVISORY</text>
    </svg>
  ),

  // Fertilizer Consultation
  'fertilizer-consultation': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#fefce8" rx="16"/>
      {/* Bags */}
      <rect x="50" y="140" width="80" height="110" rx="10" fill="#16a34a"/>
      <rect x="58" y="148" width="64" height="94" rx="6" fill="#15803d"/>
      <text x="90" y="195" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">NPK</text>
      <text x="90" y="210" textAnchor="middle" fill="#bbf7d0" fontSize="10" fontFamily="sans-serif">50 KG</text>
      <ellipse cx="90" cy="140" rx="40" ry="10" fill="#22c55e"/>
      {/* Bag 2 */}
      <rect x="160" y="160" width="70" height="90" rx="10" fill="#f59e0b"/>
      <rect x="167" y="167" width="56" height="76" rx="6" fill="#d97706"/>
      <text x="195" y="205" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">SSP</text>
      <text x="195" y="218" textAnchor="middle" fill="#fef9c3" fontSize="9" fontFamily="sans-serif">50 KG</text>
      <ellipse cx="195" cy="160" rx="35" ry="8" fill="#fbbf24"/>
      {/* Bag 3 */}
      <rect x="250" y="150" width="75" height="100" rx="10" fill="#6d28d9"/>
      <rect x="258" y="158" width="59" height="84" rx="6" fill="#5b21b6"/>
      <text x="287" y="200" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">UREA</text>
      <text x="287" y="213" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontFamily="sans-serif">50 KG</text>
      <ellipse cx="287" cy="150" rx="37" ry="9" fill="#7c3aed"/>
      {/* Chart / recommendation board */}
      <rect x="355" y="60" width="100" height="180" rx="10" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <rect x="365" y="72" width="80" height="8" rx="4" fill="#d1fae5"/>
      <rect x="365" y="88" width="60" height="6" rx="3" fill="#d1fae5"/>
      {/* Bar chart */}
      <rect x="368" y="180" width="16" height="45" rx="3" fill="#16a34a"/>
      <rect x="390" y="165" width="16" height="60" rx="3" fill="#22c55e"/>
      <rect x="412" y="175" width="16" height="50" rx="3" fill="#4ade80"/>
      <line x1="365" y1="225" x2="435" y2="225" stroke="#d1fae5" strokeWidth="2"/>
      {/* Arrows / recommendation */}
      <path d="M345 150 L360 150" stroke="#16a34a" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="4 2"/>
      {/* Plant growing */}
      <line x1="90" y1="248" x2="90" y2="100" stroke="#16a34a" strokeWidth="3"/>
      <ellipse cx="90" cy="95" rx="18" ry="25" fill="#4ade80" stroke="#16a34a" strokeWidth="2"/>
      <ellipse cx="68" cy="120" rx="15" ry="20" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" transform="rotate(-30 68 120)"/>
      <ellipse cx="112" cy="120" rx="15" ry="20" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" transform="rotate(30 112 120)"/>
      {/* Label */}
      <rect x="110" y="274" width="260" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="297" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">FERTILIZER CONSULTATION</text>
    </svg>
  ),

  // Nationwide Delivery
  'nationwide-delivery': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#eff6ff" rx="16"/>
      {/* Road */}
      <rect y="220" width="480" height="60" fill="#374151"/>
      <rect y="244" width="480" height="8" fill="#4b5563"/>
      {/* Road markings */}
      {[0,80,160,240,320,400].map((x,i) => (
        <rect key={i} x={x+20} y="247" width="40" height="3" rx="1.5" fill="#fbbf24" opacity="0.7"/>
      ))}
      {/* Fields background */}
      <rect y="180" width="480" height="40" fill="#4ade80"/>
      <rect y="165" width="480" height="18" fill="#86efac"/>
      {/* Mountains */}
      <polygon points="0,165 80,60 160,165" fill="#d1fae5"/>
      <polygon points="80,165 180,40 280,165" fill="#bbf7d0"/>
      <polygon points="220,165 320,70 420,165" fill="#d1fae5"/>
      <polygon points="350,165 430,80 480,165" fill="#a7f3d0"/>
      {/* Sky */}
      <rect y="0" width="480" height="165" fill="#eff6ff"/>
      {/* Sun */}
      <circle cx="60" cy="50" r="30" fill="#fef08a"/>
      {/* Clouds */}
      <ellipse cx="200" cy="40" rx="50" ry="20" fill="white" opacity="0.9"/>
      <ellipse cx="180" cy="45" rx="35" ry="18" fill="white" opacity="0.9"/>
      <ellipse cx="230" cy="45" rx="35" ry="18" fill="white" opacity="0.9"/>
      <ellipse cx="370" cy="60" rx="45" ry="18" fill="white" opacity="0.9"/>
      <ellipse cx="350" cy="65" rx="30" ry="15" fill="white" opacity="0.9"/>
      <ellipse cx="400" cy="65" rx="30" ry="15" fill="white" opacity="0.9"/>
      {/* Truck */}
      {/* Body */}
      <rect x="160" y="175" width="170" height="50" rx="6" fill="#16a34a"/>
      <rect x="160" y="175" width="50" height="50" rx="6" fill="#15803d"/>
      {/* Cab */}
      <rect x="170" y="148" width="50" height="30" rx="6" fill="#15803d"/>
      <rect x="175" y="153" width="35" height="20" rx="4" fill="#bae6fd"/>
      {/* Wheels */}
      <circle cx="195" cy="228" r="18" fill="#1f2937"/>
      <circle cx="195" cy="228" r="10" fill="#374151"/>
      <circle cx="195" cy="228" r="4" fill="#9ca3af"/>
      <circle cx="295" cy="228" r="18" fill="#1f2937"/>
      <circle cx="295" cy="228" r="10" fill="#374151"/>
      <circle cx="295" cy="228" r="4" fill="#9ca3af"/>
      <circle cx="325" cy="228" r="18" fill="#1f2937"/>
      <circle cx="325" cy="228" r="10" fill="#374151"/>
      <circle cx="325" cy="228" r="4" fill="#9ca3af"/>
      {/* Cargo text */}
      <text x="260" y="206" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">GREEN SOIL</text>
      <text x="260" y="218" textAnchor="middle" fill="#bbf7d0" fontSize="9" fontFamily="sans-serif">Agri Services</text>
      {/* Speed lines */}
      <line x1="100" y1="190" x2="155" y2="190" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <line x1="85" y1="200" x2="155" y2="200" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="100" y1="210" x2="155" y2="210" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      {/* Pin / Location */}
      <circle cx="420" cy="100" r="18" fill="#ef4444"/>
      <circle cx="420" cy="96" r="8" fill="white"/>
      <polygon points="412,112 420,128 428,112" fill="#ef4444"/>
      {/* Label */}
      <rect x="130" y="270" width="220" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="293" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">NATIONWIDE DELIVERY</text>
    </svg>
  ),

  // Training Programs
  'training-programs': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#f0fdf4" rx="16"/>
      {/* Chalkboard */}
      <rect x="60" y="40" width="260" height="170" rx="10" fill="#166534"/>
      <rect x="72" y="52" width="236" height="146" rx="6" fill="#14532d"/>
      {/* Board content */}
      <text x="190" y="85" textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="bold" fontFamily="sans-serif">CROP NUTRITION</text>
      <line x1="85" y1="92" x2="295" y2="92" stroke="#4ade80" strokeWidth="1.5" opacity="0.5"/>
      {/* NPK diagram on board */}
      <circle cx="130" cy="130" r="28" fill="none" stroke="#4ade80" strokeWidth="2"/>
      <text x="130" y="126" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="bold" fontFamily="sans-serif">N</text>
      <text x="130" y="140" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="sans-serif">26%</text>
      <circle cx="190" cy="130" r="28" fill="none" stroke="#a3e635" strokeWidth="2"/>
      <text x="190" y="126" textAnchor="middle" fill="#a3e635" fontSize="11" fontWeight="bold" fontFamily="sans-serif">P</text>
      <text x="190" y="140" textAnchor="middle" fill="#d9f99d" fontSize="9" fontFamily="sans-serif">18%</text>
      <circle cx="250" cy="130" r="28" fill="none" stroke="#fbbf24" strokeWidth="2"/>
      <text x="250" y="126" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="sans-serif">K</text>
      <text x="250" y="140" textAnchor="middle" fill="#fef9c3" fontSize="9" fontFamily="sans-serif">20%</text>
      {/* Board notes */}
      <rect x="85" y="165" width="60" height="5" rx="2" fill="#4ade80" opacity="0.5"/>
      <rect x="85" y="175" width="90" height="5" rx="2" fill="#4ade80" opacity="0.4"/>
      <rect x="85" y="185" width="70" height="5" rx="2" fill="#4ade80" opacity="0.3"/>
      {/* Easel legs */}
      <line x1="100" y1="210" x2="80" y2="270" stroke="#92400e" strokeWidth="5" strokeLinecap="round"/>
      <line x1="280" y1="210" x2="300" y2="270" stroke="#92400e" strokeWidth="5" strokeLinecap="round"/>
      <line x1="190" y1="210" x2="190" y2="270" stroke="#92400e" strokeWidth="4" strokeLinecap="round"/>
      {/* Trainer */}
      <circle cx="380" cy="120" r="22" fill="#fbbf24"/>
      <rect x="360" y="142" width="40" height="55" rx="8" fill="#15803d"/>
      {/* Pointer */}
      <line x1="360" y1="160" x2="310" y2="145" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"/>
      {/* Audience farmers */}
      {[70, 120, 170].map((x, i) => (
        <g key={i}>
          <circle cx={x + 290} cy={230} r={14} fill="#fbbf24"/>
          <rect x={x + 276} y={244} width={28} height={36} rx={6} fill="#16a34a"/>
        </g>
      ))}
      {/* Floor */}
      <rect y="280" width="480" height="40" fill="#d1fae5"/>
      {/* Label */}
      <rect x="130" y="276" width="220" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="299" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">TRAINING PROGRAMS</text>
    </svg>
  ),

  // After-Sale Support
  'after-sale-support': (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#f0fdf4" rx="16"/>
      {/* Background circles */}
      <circle cx="240" cy="160" r="140" fill="#dcfce7" opacity="0.5"/>
      <circle cx="240" cy="160" r="100" fill="#bbf7d0" opacity="0.4"/>
      {/* Phone */}
      <rect x="155" y="60" width="80" height="160" rx="16" fill="#1e293b"/>
      <rect x="163" y="72" width="64" height="110" rx="8" fill="#0ea5e9"/>
      {/* Phone screen content */}
      <circle cx="195" cy="97" r="18" fill="#16a34a"/>
      <text x="195" y="101" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">✓</text>
      <rect x="170" y="122" width="50" height="5" rx="2" fill="white" opacity="0.8"/>
      <rect x="175" y="132" width="40" height="5" rx="2" fill="white" opacity="0.6"/>
      <rect x="170" y="142" width="50" height="5" rx="2" fill="white" opacity="0.7"/>
      <rect x="175" y="152" width="35" height="5" rx="2" fill="white" opacity="0.5"/>
      {/* Home button */}
      <circle cx="195" cy="202" r="8" fill="#334155"/>
      {/* Support agent */}
      <circle cx="340" cy="115" r="28" fill="#fbbf24"/>
      <rect x="315" y="143" width="50" height="65" rx="10" fill="#16a34a"/>
      {/* Headset */}
      <path d="M316 108 Q316 80 340 80 Q364 80 364 108" fill="none" stroke="#1e293b" strokeWidth="4"/>
      <rect x="310" y="104" width="12" height="20" rx="6" fill="#1e293b"/>
      <rect x="358" y="104" width="12" height="20" rx="6" fill="#1e293b"/>
      <line x1="310" y1="118" x2="298" y2="128" stroke="#1e293b" strokeWidth="3"/>
      <rect x="288" y="124" width="16" height="10" rx="4" fill="#374151"/>
      {/* Chat bubbles */}
      <rect x="60" y="80" width="120" height="50" rx="12" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <polygon points="100,130 90,145 115,130" fill="white" stroke="#16a34a" strokeWidth="2"/>
      <rect x="72" y="92" width="96" height="6" rx="3" fill="#d1fae5"/>
      <rect x="72" y="104" width="70" height="6" rx="3" fill="#d1fae5"/>
      <rect x="60" y="160" width="110" height="40" rx="12" fill="#16a34a"/>
      <polygon points="90,200 80,215 105,200" fill="#16a34a"/>
      <rect x="72" y="172" width="86" height="5" rx="2" fill="white" opacity="0.8"/>
      <rect x="72" y="183" width="60" height="5" rx="2" fill="white" opacity="0.6"/>
      {/* Stars rating */}
      {[380, 400, 420, 440, 460].map((x, i) => (
        <text key={i} x={x} y="200" fontSize="20" fill={i < 4 ? "#fbbf24" : "#d1d5db"} fontFamily="sans-serif">★</text>
      ))}
      {/* Label */}
      <rect x="120" y="270" width="240" height="36" rx="10" fill="#16a34a"/>
      <text x="240" y="293" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">AFTER-SALE SUPPORT</text>
    </svg>
  ),
}

// Fallback illustration for any service not in the map
function DefaultServiceIllustration({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="480" height="320" fill="#f0fdf4" rx="16"/>
      <circle cx="240" cy="140" r="80" fill="#dcfce7"/>
      <circle cx="240" cy="140" r="55" fill="#bbf7d0"/>
      {/* Leaf */}
      <path d="M240 90 Q280 110 270 160 Q240 180 210 160 Q200 110 240 90Z" fill="#16a34a"/>
      <line x1="240" y1="90" x2="240" y2="180" stroke="#14532d" strokeWidth="2"/>
      <rect x="130" y="250" width="220" height="38" rx="10" fill="#16a34a"/>
      <text x="240" y="274" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
        {title.toUpperCase().slice(0, 22)}
      </text>
    </svg>
  )
}

function ServiceImage({ service }: { service: Service }) {
  // If the service has a real image URL from DB, use it
  if (service.image_url) {
    return (
      <img
        src={service.image_url}
        alt={service.title}
        className="w-full h-72 object-cover rounded-2xl shadow-md"
      />
    )
  }

  // Match by slug to pick the right illustration
  const illustration = SERVICE_ILLUSTRATIONS[service.slug]

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden shadow-md border border-primary-100">
      {illustration ?? <DefaultServiceIllustration title={service.title} />}
    </div>
  )
}

// Icon for each service (small icon in the content side)
const SERVICE_ICONS: Record<string, string> = {
  'soil-testing':           '🧪',
  'crop-advisory':          '🌾',
  'fertilizer-consultation':'🧪',
  'nationwide-delivery':    '🚚',
  'training-programs':      '📚',
  'after-sale-support':     '🎧',
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentService.getServices().then((data) => {
      setServices(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Services' }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Our Services</h1>
          <p className="text-primary-200 max-w-2xl text-lg leading-relaxed">
            Comprehensive agricultural solutions to support your farming journey —
            from soil preparation and fertilizer planning to nationwide delivery and expert support.
          </p>
          {/* Stats strip */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { label: 'Farmers Served', value: '5,000+' },
              { label: 'Districts Covered', value: '20+' },
              { label: 'Years Experience', value: '5+' },
              { label: 'Products Available', value: '50+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-primary-300 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {services.length === 0 ? (
          <EmptyState
            icon={<Leaf className="w-8 h-8" />}
            title="Services Coming Soon"
            description="We are updating our services listing. Please check back soon."
          />
        ) : (
          <div className="space-y-24">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Illustration */}
                <div className={`${idx % 2 === 1 ? 'lg:col-start-2' : ''} group`}>
                  <div className="transform transition-transform duration-300 group-hover:scale-[1.02]">
                    <ServiceImage service={service} />
                  </div>
                </div>

                {/* Content */}
                <div className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  {/* Icon badge */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-2xl mb-5 shadow-sm">
                    {SERVICE_ICONS[service.slug] ?? '🌱'}
                  </div>

                  {/* Number badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                      Service {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-4">
                    {service.title}
                  </h2>

                  {service.short_description && (
                    <p className="text-dark-500 text-lg mb-4 leading-relaxed font-medium">
                      {service.short_description}
                    </p>
                  )}

                  {service.description && (
                    <p className="text-dark-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2.5 mt-4">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-primary-600" />
                          </div>
                          <span className="text-dark-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 transition-colors"
                  >
                    Get in Touch
                    <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="bg-primary-900 text-white py-16 mt-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
            Need expert agricultural advice?
          </h2>
          <p className="text-primary-300 mb-8">
            Our team of agronomists is ready to help you choose the right fertilizer and service plan for your crops.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-800 rounded-xl font-bold hover:bg-primary-50 transition-colors"
          >
            Contact Our Experts →
          </a>
        </div>
      </div>
    </div>
  )
}
