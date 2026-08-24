import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import AnnouncementBar from '@/components/AnnouncementBar'
import OricNavbar from '@/components/OricNavbar'
import OricFooter from '@/components/OricFooter'
import CartSidebar from '@/components/CartSidebar'
import WishlistSidebar from '@/components/WishlistSidebar'
import PageViewTracker from '@/components/PageViewTracker'
import { getProducts } from '@/lib/data/products'

// Without this, the navbar's category dropdown (built from live product
// data) can get baked into a static snapshot on pages that don't already
// opt into revalidation themselves, and go stale until the next deploy.
export const revalidate = 60

export default async function SiteLayout({ children }) {
  const products = await getProducts()
  const shopCategories = [...new Set(products.map((p) => p.category))]

  return (
    <CartProvider>
      <WishlistProvider>
        <PageViewTracker />
        <AnnouncementBar />
        <OricNavbar categories={shopCategories} />
        <CartSidebar />
        <WishlistSidebar />
        {children}
        <OricFooter />
      </WishlistProvider>
    </CartProvider>
  )
}
