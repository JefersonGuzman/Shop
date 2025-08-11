import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home.tsx'
import ProductDetail from './pages/ProductDetail.tsx'
import CartPage from './pages/Cart.tsx'
import Checkout from './pages/Checkout.tsx'
import OrdersPage from './pages/Orders.tsx'
import HelpCenter from './pages/HelpCenter.tsx'
import Returns from './pages/Returns.tsx'
import Contact from './pages/Contact.tsx'
import Terms from './pages/Terms.tsx'
import Privacy from './pages/Privacy.tsx'
import Cookies from './pages/Cookies.tsx'
import Settings from './pages/Settings.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Header from './components/Header.tsx'
import Footer from './components/Footer.tsx'
import ChatBubble from './components/ChatBubble.tsx'
import CartBubble from './components/CartBubble.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminProducts from './pages/admin/AdminProducts.tsx'
import AdminOffers from './pages/admin/AdminOffers.tsx'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import RequireRoles from './components/RequireRoles.tsx'
import AccessDenied from './pages/AccessDenied.tsx'
import AdminOrders from './pages/admin/AdminOrders.tsx'
import AdminCategories from './pages/admin/AdminCategories.tsx'
import AdminBrands from './pages/admin/AdminBrands.tsx'
import AdminSettings from './pages/admin/AdminSettings.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route
                  path="users"
                  element={
                    <RequireRoles allowed={['admin']}>
                      <AdminUsers />
                    </RequireRoles>
                  }
                />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="brands" element={<AdminBrands />} />
                <Route
                  path="settings"
                  element={
                    <RequireRoles allowed={['admin']}>
                      <AdminSettings />
                    </RequireRoles>
                  }
                />
                <Route path="*" element={<AccessDenied />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
        <ChatBubble />
        <CartBubble />
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
