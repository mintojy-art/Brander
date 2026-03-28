import { Link } from 'react-router-dom'
import { useEffect } from 'react'
// Brander Roller page — wraps all existing Brander components inside the ORIC site
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import MarqueeTicker from '../components/MarqueeTicker'
import VideoSection from '../components/VideoSection'
import Features from '../components/Features'
import WhoItsFor from '../components/WhoItsFor'
import Gallery from '../components/Gallery'
import DesignLab from '../components/DesignLab'
import Specs from '../components/Specs'
import FAQ from '../components/FAQ'
import WaitlistSection from '../components/WaitlistSection'

export default function BranderRollerPage() {
  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const scrollToWaitlist = () =>
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="pt-16">
      {/* Breadcrumb */}
      <div className="bg-[#F5F5F7] border-b border-[#D2D2D7] py-3 px-5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#86868B]">
          <Link to="/" className="hover:text-[#1D1D1F] transition-colors">ORIC</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1D1D1F] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#1D1D1F] font-medium">Brander Roller</span>
        </div>
      </div>

      {/* All Brander Roller sections */}
      <div style={{ backgroundColor: '#0f1012' }}>
        <Hero onJoinWaitlist={scrollToWaitlist} />
        <StatsBar />
        <MarqueeTicker />
        <VideoSection />
        <Features />
        <WhoItsFor />
        <MarqueeTicker reverse />
        <Gallery />
        <DesignLab />
        <Specs />
        <FAQ />
        <WaitlistSection />
      </div>
    </div>
  )
}
