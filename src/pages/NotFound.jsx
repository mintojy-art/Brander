import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSEO } from '../hooks/useSEO'

export default function NotFound() {
  useSEO({ title: 'Page Not Found' })

  return (
    <div className="pt-16 min-h-screen bg-[#F5F5F7] flex items-center justify-center px-5">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-8xl font-bold text-[#D2D2D7] mb-6">404</p>
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-3">Page not found</h1>
        <p className="text-sm text-[#86868B] leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#424245] transition-all"
          >
            Go Home →
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 border border-[#D2D2D7] text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-white transition-all"
          >
            Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
