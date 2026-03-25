import { Instagram, Facebook, Youtube, Twitter } from '../icons'

const socials = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook'  },
  { Icon: Youtube,   href: '#', label: 'YouTube'   },
  { Icon: Twitter,   href: '#', label: 'Twitter'   },
]

export default function Footer() {
  return (
    <footer className="bg-black pt-10 pb-8 relative overflow-hidden footer-gradient-top">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.5)]">
            <span className="font-stencil font-bold text-white text-xs leading-none">B</span>
          </div>
          <span className="font-stencil text-xl tracking-tight text-white">BRANDER</span>
        </div>

        {/* Socials */}
        <div className="flex gap-6">
          {socials.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="text-gray-600 hover:text-red-500 transition-colors hover:scale-110 transform inline-block"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-gray-700 text-xs text-center">
          &copy; {new Date().getFullYear()} BRANDER. Made in India.
        </p>
      </div>
    </footer>
  )
}
