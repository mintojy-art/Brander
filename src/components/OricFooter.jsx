import { Link } from 'react-router-dom'

const col1 = [
  { label: 'Home',         to: '/'           },
  { label: 'Shop',         to: '/shop'       },
  { label: 'Services',     to: '/services'   },
  { label: 'About',        to: '/about'      },
  { label: 'Lithophane',   to: '/lithophanes'},
]

const col2 = [
  { label: 'Brander Roller',  to: '/shop/brander-roller' },
  { label: 'Figurines',       to: '/services#figurines'  },
  { label: 'Prototyping',     to: '/services#prototyping'},
  { label: 'Custom Prints',   to: '/services#custom'     },
]

export default function OricFooter() {
  return (
    <footer className="bg-[#F5F5F7] border-t border-[#D2D2D7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-16 border-b border-[#D2D2D7]">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img src="/oriclogo1.png" alt="ORIC" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-[#86868B] text-sm leading-relaxed max-w-xs">
              3D print on demand — figurines, prototypes, custom parts, idols, and more.
              Designed and printed in India.
            </p>
            <a
              href="https://wa.me/918310194953"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#1D1D1F] hover:bg-[#424245] text-white text-sm font-medium rounded-full transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp Us
            </a>
          </div>

          {/* Nav col 1 */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-4">Navigate</p>
            <ul className="space-y-3">
              {col1.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-[#424245] hover:text-[#1D1D1F] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav col 2 */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86868B] mb-4">Products</p>
            <ul className="space-y-3">
              {col2.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-[#424245] hover:text-[#1D1D1F] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-6 text-xs text-[#86868B]">
          <p>&copy; {new Date().getFullYear()} ORIC. Made in India.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/about" className="hover:text-[#1D1D1F] transition-colors">About</Link>
            <Link to="/refund-policy" className="hover:text-[#1D1D1F] transition-colors">Refund Policy</Link>
            <a href="mailto:support@oric3d.com" className="hover:text-[#1D1D1F] transition-colors">support@oric3d.com</a>
            <p>3D Printing Service · Bangalore, Karnataka · +91 83101 94953</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
