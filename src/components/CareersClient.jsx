'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CareerApplicationModal from '@/components/CareerApplicationModal'

function RoleCard({ role, onApply, delay }) {
  return (
    <motion.div
      className="y2k-lift y2k-chrome-surface rounded-2xl p-6 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#F37121] bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-3 py-1 mb-3">
            {role.type}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] leading-snug">{role.title}</h2>
          <p className="text-sm text-[#86868B] mt-1.5">{role.summary}</p>
        </div>
        <button
          onClick={() => onApply(role)}
          className="y2k-accent-surface y2k-shine shrink-0 px-6 py-3 text-white text-sm font-semibold rounded-full transition-all overflow-hidden"
        >
          Apply →
        </button>
      </div>

      {role.description && (
        <p className="text-sm text-[#424245] leading-relaxed mb-5">{role.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {role.responsibilities?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868B] mb-2">What you'll do</p>
            <ul className="space-y-1.5">
              {role.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#424245] leading-snug">
                  <span className="w-1 h-1 rounded-full bg-[#1D1D1F] mt-2 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {role.requirements?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868B] mb-2">What we're looking for</p>
            <ul className="space-y-1.5">
              {role.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#424245] leading-snug">
                  <span className="w-1 h-1 rounded-full bg-[#1D1D1F] mt-2 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function CareersClient({ roles }) {
  const [applyRole, setApplyRole] = useState(null)

  return (
    <div className="pt-[100px] min-h-screen bg-white">

      {/* Header */}
      <div className="y2k-dark-surface">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFA35C] mb-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Careers at ORIC
          </motion.p>
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-orbitron)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Build with us.
          </motion.h1>
          <motion.p
            className="text-[#86868B] text-base max-w-lg mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            We work with freelance consultants across design, marketing, and print production. Open roles below.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
        {roles.length > 0 ? (
          <div className="space-y-6">
            {roles.map((role, i) => (
              <RoleCard key={role.id} role={role} onApply={setApplyRole} delay={i * 0.05} />
            ))}
          </div>
        ) : (
          <div className="y2k-chrome-surface rounded-3xl p-10 md:p-14 text-center">
            <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">No open roles right now</h3>
            <p className="text-sm text-[#424245] max-w-sm mx-auto">
              Check back soon, or reach out on WhatsApp if you'd like to introduce yourself anyway.
            </p>
          </div>
        )}
      </div>

      <CareerApplicationModal
        isOpen={!!applyRole}
        onClose={() => setApplyRole(null)}
        role={applyRole}
      />
    </div>
  )
}
