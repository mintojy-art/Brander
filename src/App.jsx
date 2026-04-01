import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import OricNavbar from './components/OricNavbar'
import OricFooter from './components/OricFooter'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Services from './pages/Services'
import BranderRollerPage from './pages/BranderRollerPage'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import Lithophane from './pages/Lithophane'
import About from './pages/About'
import RefundPolicy from './pages/RefundPolicy'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <OricNavbar />}
      {!isAdmin && <CartSidebar />}
      <Routes>
        <Route path="/"                       element={<Home />}              />
        <Route path="/shop"                   element={<Shop />}              />
        <Route path="/shop/brander-roller"    element={<BranderRollerPage />} />
        <Route path="/shop/:productId"        element={<ProductDetail />}     />
        <Route path="/services"               element={<Services />}          />
        <Route path="/admin"                  element={<Admin />}             />
        <Route path="/lithophanes"            element={<Lithophane />}        />
        <Route path="/about"                  element={<About />}             />
        <Route path="/refund-policy"          element={<RefundPolicy />}      />
        <Route path="*"                       element={<NotFound />}          />
      </Routes>
      {!isAdmin && <OricFooter />}
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </CartProvider>
  )
}
