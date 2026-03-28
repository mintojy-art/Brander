import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import MarqueeTicker from './components/MarqueeTicker'
import VideoSection from './components/VideoSection'
import Features from './components/Features'
import WhoItsFor from './components/WhoItsFor'
import Gallery from './components/Gallery'
import DesignLab from './components/DesignLab'
import Specs from './components/Specs'
import FAQ from './components/FAQ'
import WaitlistSection from './components/WaitlistSection'
import Footer from './components/Footer'

export default function App() {
  const scrollToWaitlist = () =>
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar onJoinWaitlist={scrollToWaitlist} />
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
      <Footer />
    </div>
  )
}
