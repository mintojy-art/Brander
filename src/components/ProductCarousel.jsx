import { useRef, useState, useEffect, Children } from 'react'

export default function ProductCarousel({ children }) {
  const scrollerRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows)
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [children])

  const scrollBy = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="hidden sm:flex absolute left-0 top-[35%] -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[#D2D2D7] shadow-lg items-center justify-center hover:bg-[#F5F5F7] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="hidden sm:flex absolute right-0 top-[35%] -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[#D2D2D7] shadow-lg items-center justify-center hover:bg-[#F5F5F7] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
      >
        {Children.map(children, (child) => (
          <div className="snap-start shrink-0 w-[70vw] sm:w-[260px]">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
