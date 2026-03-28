const items = [
  'BRANDER ROLLER',
  '15MM PRINT WIDTH',
  'PLA FIBER',
  'INDUSTRIAL GRADE',
  'RAPID SWAP SYSTEM',
  'MADE IN INDIA',
  '6+ SURFACES',
  'NON-STOP ROLLING',
]

export default function MarqueeTicker({ reverse = false }) {
  const doubled = [...items, ...items]

  return (
    <div className="py-3.5 bg-[#111111] overflow-hidden border-y border-stone-800 select-none">
      <div className={reverse ? 'rolling-text-reverse' : 'rolling-text'}>
        {doubled.map((text, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="text-white font-semibold text-xs tracking-[0.28em] uppercase mx-8 whitespace-nowrap">
              {text}
            </span>
            <span className="text-stone-600 text-xs">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
