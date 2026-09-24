import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

// Social icons as inline SVGs (lucide-react v1 removed Facebook/Twitter/Instagram/Youtube)
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M2 4h7l9 12h4L13 4h-4L2 20h4l3-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
    </svg>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">GREEN SOIL</div>
                <div className="text-xs text-dark-400 leading-tight">Agri Services (PVT) Ltd.</div>
              </div>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Pakistan's trusted partner for premium fertilizers and agricultural solutions.
              Empowering farmers since 2020.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FacebookIcon,  href: '#', label: 'Facebook' },
                { icon: TwitterIcon,   href: '#', label: 'Twitter' },
                { icon: InstagramIcon, href: '#', label: 'Instagram' },
                { icon: YoutubeIcon,   href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-primary-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Our Products', href: '/products' },
                { label: 'Our Services', href: '/services' },
                { label: 'Product Videos', href: '/videos' },
                { label: 'CEO Message', href: '/ceo-message' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-dark-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Our Products
            </h3>
            <ul className="space-y-2.5">
              {[
                'NPK Fertilizers',
                'Organic Fertilizers',
                'Micronutrients',
                'Soil Conditioners',
                'Crop Nutrition',
                'Foliar Sprays',
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/products"
                    className="text-dark-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-dark-400 text-sm">
                  Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+923000000000" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  +92 300 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:info@greensoilagri.com" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  info@greensoilagri.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-white mb-2">Business Hours</h4>
              <p className="text-dark-400 text-sm">Mon – Sat: 9:00 AM – 6:00 PM</p>
              <p className="text-dark-400 text-sm">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs">
            © {currentYear} GREEN SOIL Agri Services (PVT) Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-conditions" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
