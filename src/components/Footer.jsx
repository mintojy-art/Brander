import { Instagram, Facebook, Youtube, Twitter } from '../icons'

const socials = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook'  },
  { Icon: Youtube,   href: '#', label: 'YouTube'   },
  { Icon: Twitter,   href: '#', label: 'Twitter'   },
]

const links = [
  { label: 'Product',    href: '#product'    },
  { label: 'Features',   href: '#features'   },
  { label: 'Design Lab', href: '#design-lab' },
  { label: 'FAQ',        href: '#faq'        },
  { label: 'Waitlist',   href: '#waitlist'   },
]

export default function Footer() {
  return (
    <footer className="bg-[#F5F2EE] border-t border-stone-200 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-14 pb-14 border-b border-stone-200">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-[#111111] rounded flex items-center justify-center">
                <span className="font-stencil font-bold text-white text-sm leading-none">B</span>
              </div>
              <span className="font-stencil text-xl tracking-tight text-[#111111]">BRANDER</span>
            </div>
            <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
              A 15mm handheld stamp roller — brand any surface, by hand, in seconds.
              Made in India.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-stone-500 hover:text-[#111111] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Socials */}
          <div className="flex gap-5">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-stone-400 hover:text-[#111111] transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-stone-400 text-xs">
            &copy; {new Date().getFullYear()} Brander. Made in India.
          </p>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-400 hover:text-[#111111] transition-colors"
          >
            WhatsApp: +91 83101 94953
          </a>
        </div>

      </div>
    </footer>
  )
}
