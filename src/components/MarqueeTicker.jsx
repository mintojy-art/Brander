const items = [
  'BRANDER 15',
  '15MM PRINT WIDTH',
  'PLA FIBER',
  'INDUSTRIAL GRADE',
  '15MM MARKER',
  'NON-STOP ROLLING',
  'MADE IN INDIA',
  'RAPID SWAP SYSTEM',
]

export default function MarqueeTicker({ reverse = false }) {
  // Double the items so the -50% translateX loop is seamless
  const doubled = [...items, ...items]

  return (
    <div className="py-3.5 bg-red-600 overflow-hidden border-y border-red-500/50 select-none">
      <div className={reverse ? 'rolling-text-reverse' : 'rolling-text'}>
        {doubled.map((text, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="text-white font-bold text-sm tracking-[0.22em] uppercase mx-8 whitespace-nowrap">
              {text}
            </span>
            <span className="text-red-200/70 text-xs">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
