import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { FullPageLoading } from '@/components/ui/LoadingSpinner'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AccountLayout } from '@/components/layout/AccountLayout'
import { ManagementLayout } from '@/components/layout/ManagementLayout'
import {
  ProtectedRoute,
  AdminRoute,
  ManagementRoute,
  EmployeeRoute,
  GuestRoute,
} from '@/routes/ProtectedRoute'

// ─── Lazy-loaded public pages ───────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/public/HomePage'))
const AboutPage          = lazy(() => import('@/pages/public/AboutPage'))
const ProductsPage       = lazy(() => import('@/pages/public/ProductsPage'))
const ProductDetailPage  = lazy(() => import('@/pages/public/ProductDetailPage'))
const ServicesPage       = lazy(() => import('@/pages/public/ServicesPage'))
const VideosPage         = lazy(() => import('@/pages/public/VideosPage'))
const CEOMessagePage     = lazy(() => import('@/pages/public/CEOMessagePage'))
const ContactPage        = lazy(() => import('@/pages/public/ContactPage'))
const CartPage           = lazy(() => import('@/pages/public/CartPage'))
const CheckoutPage       = lazy(() => import('@/pages/public/CheckoutPage'))
const PrivacyPage        = lazy(() => import('@/pages/public/PrivacyPage'))
const TermsPage          = lazy(() => import('@/pages/public/TermsPage'))

// ─── Auth pages ──────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// ─── Customer account pages ──────────────────────────────────────────────────
const AccountDashboard   = lazy(() => import('@/pages/account/AccountDashboard'))
const MyOrders           = lazy(() => import('@/pages/account/MyOrders'))
const OrderDetailPage    = lazy(() => import('@/pages/account/OrderDetailPage'))
const ProfilePage        = lazy(() => import('@/pages/account/ProfilePage'))
const AddressesPage      = lazy(() => import('@/pages/account/AddressesPage'))
const NotificationsPage  = lazy(() => import('@/pages/account/NotificationsPage'))

// ─── Admin pages ─────────────────────────────────────────────────────────────
const AdminDashboard         = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProductsPage      = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminProductFormPage   = lazy(() => import('@/pages/admin/AdminProductFormPage'))
const AdminCategoriesPage    = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminOrdersPage        = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage   = lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
const AdminCustomersPage     = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminEmployeesPage     = lazy(() => import('@/pages/admin/AdminEmployeesPage'))
const AdminServicesPage      = lazy(() => import('@/pages/admin/AdminServicesPage'))
const AdminVideosPage        = lazy(() => import('@/pages/admin/AdminVideosPage'))
const AdminContentPage       = lazy(() => import('@/pages/admin/AdminContentPage'))
const AdminMessagesPage      = lazy(() => import('@/pages/admin/AdminMessagesPage'))
const AdminReportsPage       = lazy(() => import('@/pages/admin/AdminReportsPage'))
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotificationsPage'))
const AdminAuditLogsPage     = lazy(() => import('@/pages/admin/AdminAuditLogsPage'))
const AdminSettingsPage      = lazy(() => import('@/pages/admin/AdminSettingsPage'))

// ─── Employee pages ───────────────────────────────────────────────────────────
const EmployeeDashboard  = lazy(() => import('@/pages/employee/EmployeeDashboard'))

// ─── Management pages ────────────────────────────────────────────────────────
const ManagementDashboard      = lazy(() => import('@/pages/management/ManagementDashboard'))
const ManagementReportsPage    = lazy(() => import('@/pages/management/ManagementReportsPage'))

// ─── 404 ─────────────────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Wrap lazy components in suspense
function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullPageLoading />}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SuspenseWrap>
            <Routes>

              {/* ═══ PUBLIC ROUTES ═══ */}
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="videos" element={<VideosPage />} />
                <Route path="ceo-message" element={<CEOMessagePage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="privacy-policy" element={<PrivacyPage />} />
                <Route path="terms-conditions" element={<TermsPage />} />

                {/* Checkout — requires login */}
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* ═══ AUTH ROUTES (redirect if already logged in) ═══ */}
              <Route
                path="login"
                element={<GuestRoute><LoginPage /></GuestRoute>}
              />
              <Route
                path="register"
                element={<GuestRoute><RegisterPage /></GuestRoute>}
              />
              <Route
                path="forgot-password"
                element={<GuestRoute><ForgotPasswordPage /></GuestRoute>}
              />
              <Route
                path="reset-password"
                element={<GuestRoute><ForgotPasswordPage /></GuestRoute>}
              />

              {/* ═══ CUSTOMER ACCOUNT ═══ */}
              <Route
                path="account"
                element={
                  <ProtectedRoute>
                    <AccountLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* ═══ ADMIN PANEL ═══ */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="employees" element={<AdminEmployeesPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* ═══ EMPLOYEE PORTAL ═══ */}
              <Route
                path="employee"
                element={
                  <EmployeeRoute>
                    <EmployeeDashboard />
                  </EmployeeRoute>
                }
              />
              <Route
                path="employee/profile"
                element={
                  <EmployeeRoute>
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  </EmployeeRoute>
                }
              >
                <Route index element={<ProfilePage />} />
              </Route>

              {/* ═══ MANAGEMENT PORTAL ═══ */}
              <Route
                path="management"
                element={
                  <ManagementRoute>
                    <ManagementLayout />
                  </ManagementRoute>
                }
              >
                <Route index element={<ManagementDashboard />} />
                <Route path="reports" element={<ManagementReportsPage />} />
                <Route path="sales" element={<ManagementReportsPage />} />
                <Route path="inventory" element={<ManagementReportsPage />} />
                <Route path="employees" element={<ManagementReportsPage />} />
              </Route>

              {/* ═══ 404 ═══ */}
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </SuspenseWrap>

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#16a34a', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
