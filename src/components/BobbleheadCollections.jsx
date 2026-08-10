import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// No real photography or fixed pricing exists yet for these occasion themes —
// gradient + icon cards ship today; swap in real photos/prices per card
// whenever they're available (image field is intentionally absent).
const COLLECTIONS = [
  {
    title: 'Corporate Gifts',
    tagline: 'Bulk orders for your team, client, or boss.',
    badge: 'Popular',
    icon: '🎁',
    gradient: 'from-[#2A2A2D] to-[#1D1D1F]',
    dark: true,
  },
  {
    title: 'Gifts for Doctor',
    tagline: 'A thank-you they’ll display forever.',
    badge: 'New',
    icon: '🩺',
    gradient: 'from-[#EAF4F2] to-[#D3E9E3]',
    badgeColor: 'bg-[#1D4ED8] text-white',
  },
  {
    title: 'Birthday Gifts',
    tagline: 'A gift as one-of-a-kind as they are.',
    badge: 'Trending',
    icon: '🎂',
    gradient: 'from-[#FDF0F5] to-[#FAD9E6]',
    badgeColor: 'bg-[#DB2777] text-white',
  },
  {
    title: 'Wedding',
    tagline: 'Immortalize your big day, mini-me style.',
    badge: 'Best Seller',
    icon: '💍',
    gradient: 'from-[#FAF6EE] to-[#F1E3C9]',
    badgeColor: 'bg-[#15803D] text-white',
  },
  {
    title: 'Funny Gifts',
    tagline: 'Because they can take a joke.',
    badge: 'Hot',
    icon: '😂',
    gradient: 'from-[#FFF8E8] to-[#FFEAB0]',
    badgeColor: 'bg-[#EA580C] text-white',
  },
]

const SPAN = [
  'md:col-span-4 md:row-span-2',
  'md:col-span-4',
  'md:col-span-4',
  'md:col-span-5',
  'md:col-span-3',
]

function CollectionCard({ c, span, delay }) {
  const waMsg = encodeURIComponent(`Hi ORIC! I'd like a custom bobblehead for ${c.title}. Can you share pricing and next steps?`)
  const textColor = c.dark ? 'text-white' : 'text-[#1D1D1F]'
  const subColor = c.dark ? 'text-white/70' : 'text-[#424245]'
  const badgeColor = c.badgeColor || 'bg-white/15 text-white border border-white/25'
  const ctaColor = c.dark ? 'bg-white text-[#1D1D1F] group-hover:bg-[#F5F5F7]' : 'bg-[#1D1D1F] text-white group-hover:bg-[#424245]'

  return (
    <motion.a
      href={`https://wa.me/918310194953?text=${waMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between min-h-[220px] bg-gradient-to-br ${c.gradient} ${span}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between">
        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${badgeColor}`}>
          {c.badge}
        </span>
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{c.icon}</span>
      </div>
      <div>
        <h3 className={`text-2xl font-bold mb-1 ${textColor}`}>{c.title}</h3>
        <p className={`text-sm mb-4 ${subColor}`}>{c.tagline}</p>
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all ${ctaColor}`}>
          Get a Quote →
        </span>
      </div>
    </motion.a>
  )
}

export default function BobbleheadCollections() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="text-center mb-14">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Bobbleheads
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-[#1D1D1F]"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Shop by Occasion
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 md:h-[640px]">
          {COLLECTIONS.map((c, i) => (
            <CollectionCard key={c.title} c={c} span={SPAN[i]} delay={i * 0.05} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/shop?cat=Bobbleheads"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
          >
            All Bobbleheads
          </Link>
        </div>
      </div>
    </section>
  )
}
