import { motion } from 'framer-motion'
import { useSEO } from '../hooks/useSEO'

export default function About() {
  useSEO({
    title: 'About ORIC — 3D Printing Studio, Bangalore',
    description: 'Meet the team behind ORIC. A Bangalore-based 3D printing studio crafting custom figurines, prototypes, and prints on demand.',
  })

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#1D1D1F]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Our Story
          </motion.p>
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            We make ideas<br /><span className="text-[#86868B]">tangible.</span>
          </motion.h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-16 space-y-16">

        {/* Story */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B]">Who We Are</p>
            <h2 className="text-3xl font-bold text-[#1D1D1F] leading-snug">Built in Bangalore. Printed with purpose.</h2>
            <p className="text-[#424245] leading-relaxed">
              ORIC started with a single printer and a simple belief: anyone should be able to hold their idea in their hands. We began making custom parts for local engineers, then figurines for collectors, then idols for families — and kept growing from there.
            </p>
            <p className="text-[#424245] leading-relaxed">
              Today we run a full 3D printing studio out of Bangalore, Karnataka. We work with gifters, product designers, small businesses, and hobbyists — anyone who has a vision and needs it printed. No order is too small. No idea is too unusual.
            </p>
            <p className="text-[#424245] leading-relaxed">
              What makes us different is how we work: every order is reviewed by a human, every print is quality-checked before dispatch, and we stay reachable on WhatsApp throughout the process.
            </p>
          </div>

          <div className="rounded-3xl aspect-square overflow-hidden">
            <img src="/profile.jpg" alt="ORIC founder" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { val: 'Bangalore', label: 'Based in' },
            { val: '24 hrs', label: 'Quote turnaround' },
            { val: 'Pan India', label: 'Delivery' },
            { val: '100%', label: 'Quality checked' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-[#F5F5F7] rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-[#1D1D1F] mb-1">{val}</p>
              <p className="text-xs text-[#86868B]">{label}</p>
            </div>
          ))}
        </section>

        {/* Workshop */}
        <section className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B]">The Workshop</p>
          <h2 className="text-2xl font-bold text-[#1D1D1F]">Where the printing happens</h2>
          <p className="text-[#424245] leading-relaxed max-w-2xl">
            Our studio is based in Bangalore, Karnataka. We use FDM printers running PLA, PETG, TPU, ABS, and ASA — giving us the full material range for functional parts, detailed figurines, flexible components, and outdoor-grade prints.
          </p>
          <p className="text-[#424245] leading-relaxed max-w-2xl">
            Every order is printed fresh — we don't hold inventory. This means tighter quality control, more customisation, and no dead stock. From a single figurine to a batch of 500 parts, we treat every run the same way.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-[#1D1D1F] rounded-3xl p-10 md:p-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868B] mb-3">Get in Touch</p>
          <h2 className="text-3xl font-bold text-white mb-6">We're one message away.</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <a href="https://wa.me/918310194953" target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-[#86868B] transition-colors">
                +91 83101 94953 · WhatsApp preferred
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="text-[#86868B] text-sm">Bangalore, Karnataka, India</span>
            </div>
          </div>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            Message Us on WhatsApp →
          </a>
        </section>

      </div>
    </div>
  )
}
