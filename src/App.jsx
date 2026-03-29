import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom'
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

function ScrollToTop() {
  // Simple scroll-to-top on route change
  return null
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <OricNavbar />
        <CartSidebar />
        <Routes>
          <Route path="/"                       element={<Home />}              />
          <Route path="/shop"                   element={<Shop />}              />
          <Route path="/shop/brander-roller"    element={<BranderRollerPage />} />
          <Route path="/shop/:productId"        element={<ProductDetail />}     />
          <Route path="/services"               element={<Services />}          />
          <Route path="/admin"                  element={<Admin />}             />
        </Routes>
        <OricFooter />
      </BrowserRouter>
    </CartProvider>
  )
}
