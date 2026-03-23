import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import MarqueeTicker from './components/MarqueeTicker'
import VideoSection from './components/VideoSection'
import Features from './components/Features'
import Gallery from './components/Gallery'
import DesignLab from './components/DesignLab'
import Specs from './components/Specs'
import WaitlistSection from './components/WaitlistSection'
import Footer from './components/Footer'

export default function App() {
  const scrollToWaitlist = () =>
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-[#0f1012]">
      <Navbar onJoinWaitlist={scrollToWaitlist} />
      <Hero onJoinWaitlist={scrollToWaitlist} />
      <StatsBar />
      <MarqueeTicker />
      <VideoSection />
      <Features />
      <MarqueeTicker reverse />
      <Gallery />
      <DesignLab />
      <Specs />
      <WaitlistSection />
      <Footer />
    </div>
  )
}
