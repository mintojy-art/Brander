import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJobs } from '../hooks/useJobs'
import { useSEO } from '../hooks/useSEO'

const WA_NUMBER = '918310194953'

const TYPE_COLORS = {
  'Full-time':  { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' },
  'Part-time':  { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
  'Contract':   { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  'Internship': { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]' },
}

function JobCard({ job, index }) {
  const [open, setOpen] = useState(false)
  const typeStyle = TYPE_COLORS[job.type] || { bg: 'bg-[#F5F5F7]', text: 'text-[#424245]' }
  const waMsg = encodeURIComponent(
    `Hi! I'd like to apply for the "${job.title}" position at ORIC 3D.\n\nDepartment: ${job.department || '—'}\nLocation: ${job.location || '—'}\nType: ${job.type || '—'}`
  )

  return (
    <motion.div
      className="bg-white border border-[#D2D2D7] rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#1D1D1F] leading-snug">{job.title}</h3>
            {job.department && (
              <p className="text-xs text-[#86868B] mt-0.5">{job.department}</p>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${typeStyle.bg} ${typeStyle.text}`}>
            {job.type}
          </span>
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-3 mb-4">
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-[#86868B]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {job.location}
            </span>
          )}
          {job.experience && (
            <span className="flex items-center gap-1 text-xs text-[#86868B]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              {job.experience}
            </span>
          )}
        </div>

        {/* Description preview */}
        {job.description && (
          <p className="text-sm text-[#424245] leading-relaxed line-clamp-2 mb-4">{job.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] hover:bg-[#424245] text-white text-sm font-semibold rounded-xl transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Apply on WhatsApp
          </a>
          {(job.responsibilities?.length > 0 || job.requirements?.length > 0) && (
            <button
              onClick={() => setOpen(o => !o)}
              className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors"
            >
              {open ? 'Hide details ↑' : 'View details ↓'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-[#F0F0F2] px-6 py-5 bg-[#F9F9FB] space-y-5">
          {job.responsibilities?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] mb-3">Responsibilities</p>
              <ul className="space-y-1.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#424245]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D1D1F] mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {job.requirements?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] mb-3">Requirements</p>
              <ul className="space-y-1.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#424245]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function Careers() {
  const { jobs, loading } = useJobs()
  const [filter, setFilter] = useState('All')

  useSEO({
    title: 'Careers at ORIC 3D — Join Our Team in Bangalore',
    description: 'Join the ORIC 3D team. We\'re hiring 3D printing operators, designers, and more. Apply via WhatsApp. Based in Bangalore, India.',
  })

  const types = ['All', ...Array.from(new Set(jobs.map(j => j.type).filter(Boolean)))]
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.type === filter)

  return (
    <div className="pt-16 bg-white min-h-screen">

      {/* Hero */}
      <section className="bg-[#1D1D1F] py-20 px-5 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#86868B] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            We're Hiring
          </motion.p>
          <motion.h1 className="text-5xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            Build the Future<br /><span className="text-[#86868B]">of 3D Printing</span>
          </motion.h1>
          <motion.p className="text-[#86868B] text-base max-w-md mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Join ORIC's growing team in Bangalore. We make things — real, physical things. Come help us do it better.
          </motion.p>
        </div>
      </section>

      {/* Jobs section */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">

          {/* Filter tabs */}
          {types.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === t
                      ? 'bg-[#1D1D1F] text-white'
                      : 'bg-[#F5F5F7] text-[#424245] hover:bg-[#E8E8ED]'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Job cards */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <motion.div className="text-center py-24"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-5xl mb-5">💼</p>
              <h2 className="text-xl font-bold text-[#1D1D1F] mb-2">No openings right now</h2>
              <p className="text-sm text-[#86868B] max-w-sm mx-auto mb-8">
                We don't have any open roles at the moment, but we're always happy to hear from talented people.
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'm interested in joining the ORIC 3D team. I'd love to share my profile.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-xl hover:bg-[#424245] transition-all"
              >
                Send Us Your Profile →
              </a>
            </motion.div>
          )}
        </div>
      </section>

      {/* Culture section */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3">Life at ORIC</p>
            <h2 className="text-4xl font-bold text-[#1D1D1F]">Why Join Us?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🖨️', title: 'Work with Cutting-Edge Tech', desc: 'Operate and experiment with the latest FDM and resin printers in our Bangalore workshop.' },
              { icon: '🚀', title: 'Grow Fast', desc: 'Small team, big impact. Every person owns real work and shapes how ORIC grows.' },
              { icon: '🤝', title: 'Collaborative Culture', desc: 'We design, print, fix, and ship together. No silos, no red tape — just makers making things.' },
            ].map((p, i) => (
              <motion.div key={p.title} className="bg-white rounded-2xl p-6 border border-[#D2D2D7]"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl mb-4">{p.icon}</p>
                <h3 className="text-sm font-bold text-[#1D1D1F] mb-2">{p.title}</h3>
                <p className="text-xs text-[#86868B] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1D1D1F] text-center px-5">
        <motion.h2 className="text-3xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          Don't see your role?
        </motion.h2>
        <p className="text-[#86868B] text-base max-w-sm mx-auto mb-8">
          Send us your resume on WhatsApp. We'll reach out when something fits.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'd like to join the ORIC 3D team. Here's a bit about me:")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#F5F5F7] transition-all"
        >
          Get in Touch →
        </a>
      </section>

    </div>
  )
}
