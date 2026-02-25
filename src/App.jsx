import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import MarqueeTicker from './components/MarqueeTicker'
import VideoSection from './components/VideoSection'
import Features from './components/Features'
import Gallery from './components/Gallery'
import PreviewTool from './components/PreviewTool'
import Specs from './components/Specs'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <div className="min-h-screen bg-[#0f1012]">
      <Navbar cartCount={cartCount} />
      <Hero onAddToCart={() => setCartCount((c) => c + 1)} />
      <StatsBar />
      <MarqueeTicker />
      <VideoSection />
      <Features />
      <MarqueeTicker reverse />
      <Gallery />
      <PreviewTool />
      <Specs />
      <Contact />
      <Footer />
    </div>
  )
}
