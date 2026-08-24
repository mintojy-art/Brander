'use client'

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
          className="y2k-chrome-surface hidden sm:flex absolute left-0 top-[35%] -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="y2k-chrome-surface hidden sm:flex absolute right-0 top-[35%] -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      <div
        ref={scrollerRef}
        // Below `sm`, this is a static 2-col grid — no horizontal swipe at
        // all, so there's nothing to compete with the page's vertical
        // scroll. A swipeable row asks a thumb mid vertical-scroll to also
        // recognize and commit to a second, horizontal gesture; even with
        // perfect touch-action tuning that's still two competing gestures
        // in the same space, which reads as janky/confusing on a phone.
        // Sidestepping it entirely is more robust than tuning it further.
        // At `sm` and up (mouse/trackpad, no gesture ambiguity) it becomes
        // the original horizontal snap-scroll carousel with arrow buttons.
        // `touch-pan-x` must only apply at `sm:` — on the mobile grid this
        // element doesn't scroll at all, and `pan-x` there was telling the
        // browser to recognize ONLY horizontal panning on it, which blocked
        // vertical page-scroll from being recognized whenever a thumb
        // started its drag on top of a card instead of the screen edge.
        className="no-scrollbar touch-auto grid grid-cols-2 gap-3 sm:flex sm:gap-5 sm:touch-pan-x sm:overflow-x-auto sm:snap-x sm:snap-mandatory sm:pb-2"
      >
        {Children.map(children, (child) => (
          <div className="sm:snap-start sm:shrink-0 w-full sm:w-[260px]">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
