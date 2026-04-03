import { motion } from 'framer-motion'
import { useSEO } from '../hooks/useSEO'

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-[#1D1D1F]">{title}</h2>
      <div className="text-[#424245] text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function RefundPolicy() {
  useSEO({
    title: 'Refund & Reprint Policy — ORIC',
    description: 'ORIC\'s return, refund, and reprint policy. Defective or damaged prints are reprinted free. Learn how to raise a request.',
  })

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-16">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#86868B] mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Policies
          </motion.p>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-[#1D1D1F] leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Refund & Reprint Policy
          </motion.h1>
          <p className="text-[#86868B] mt-3 text-sm max-w-md">
            We stand behind every print. If something goes wrong on our end, we make it right.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-14 space-y-10">

        {/* Reassurance callout */}
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl px-5 py-4 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">✅</span>
          <p className="text-sm text-[#166534] leading-relaxed">
            <strong>Defective prints are reprinted free.</strong> WhatsApp us within 48 hours of delivery with a photo and we'll sort it out — no questions asked.
          </p>
        </div>

        <Section title="What qualifies for a free reprint or refund">
          <p>We will reprint or refund your order if:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The print arrived damaged in transit (broken, crushed, cracked)</li>
            <li>There is a visible printing defect — layer delamination, stringing, warping — that we missed in QC</li>
            <li>The wrong item was sent (different product, size, or colour than ordered)</li>
            <li>The print is structurally unusable due to a printing failure</li>
          </ul>
        </Section>

        <Section title="What does not qualify">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Change of mind</strong> after printing has begun — once your order is in the print queue, materials are committed</li>
            <li><strong>Errors in your STL file</strong> — if the uploaded file had geometry issues, holes, or scale errors, the reprint cost is on the customer. We recommend using a file checker before uploading</li>
            <li><strong>Colour variation</strong> — filament colours may vary slightly between batches; this is normal in FDM printing</li>
            <li><strong>Surface texture</strong> — layer lines are inherent to FDM printing. If you need a smooth finish, please specify post-processing in your order</li>
          </ul>
        </Section>

        <Section title="How to raise a request">
          <p>If your print qualifies for a reprint or refund:</p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>WhatsApp us at <strong>+91 83101 94953</strong> within <strong>48 hours of delivery</strong></li>
            <li>Send a clear photo of the issue — all angles if possible</li>
            <li>Include your order name or reference</li>
            <li>We'll confirm and begin the reprint within 24 hours of approval</li>
          </ol>
        </Section>

        <Section title="Resolution turnaround">
          <p>Once your request is approved:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Reprints:</strong> processed within 1–2 business days, then normal lead time applies</li>
            <li><strong>Refunds:</strong> processed within 5–7 business days via the original payment method (if applicable)</li>
          </ul>
        </Section>

        <Section title="Pre-order items (Brander Roller)">
          <p>Pre-order purchases can be cancelled and fully refunded at any time before the item ships. Once shipped, the standard policy above applies.</p>
        </Section>

        {/* CTA */}
        <div className="bg-[#1D1D1F] rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="text-white text-sm font-semibold">Have an issue with your order?</p>
            <p className="text-[#86868B] text-xs mt-0.5">WhatsApp or email us — fastest response guaranteed.</p>
            <a href="mailto:support@oric3d.com" className="text-[#86868B] text-xs hover:text-white transition-colors">support@oric3d.com</a>
          </div>
          <a
            href="https://wa.me/918310194953"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#1D1D1F] text-sm font-bold rounded-full hover:bg-[#F5F5F7] transition-all"
          >
            WhatsApp Us
          </a>
        </div>

      </div>
    </div>
  )
}
