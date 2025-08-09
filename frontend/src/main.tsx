import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Settings from './pages/Settings.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Header from './components/Header.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminProducts from './pages/admin/AdminProducts.tsx'
import AdminOrders from './pages/admin/AdminOrders.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div style={{ padding: 12 }}>
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/settings" element={<Settings />} />
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
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
