// Application-wide constants

export const APP_NAME = 'GREEN SOIL Agri Services'
export const APP_SHORT_NAME = 'GREEN SOIL'
export const APP_TAGLINE = 'Nurturing Growth, Empowering Agriculture'
export const APP_DESCRIPTION =
  'GREEN SOIL Agri Services (PVT) Limited — Premium fertilizers and agricultural solutions for modern farming in Pakistan.'

export const COMPANY = {
  name: 'GREEN SOIL Agri Services (PVT) Limited',
  shortName: 'GREEN SOIL',
  tagline: 'Nurturing Growth, Empowering Agriculture',
  email: 'info@greensoilagri.com',
  phone: '+92 300 000 0000',
  address: 'Pakistan',
  website: 'https://greensoilagri.com',
  foundedYear: 2020,
}

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  SERVICES: '/services',
  VIDEOS: '/videos',
  CEO_MESSAGE: '/ceo-message',
  CONTACT: '/contact',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-conditions',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Customer Account
  ACCOUNT: '/account',
  ACCOUNT_ORDERS: '/account/orders',
  ACCOUNT_ORDER_DETAIL: '/account/orders/:id',
  ACCOUNT_PROFILE: '/account/profile',
  ACCOUNT_ADDRESSES: '/account/addresses',
  ACCOUNT_NOTIFICATIONS: '/account/notifications',

  // Admin
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_NEW: '/admin/products/new',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_VIDEOS: '/admin/videos',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',

  // Employee
  EMPLOYEE: '/employee',
  EMPLOYEE_PROFILE: '/employee/profile',
  EMPLOYEE_ORDERS: '/employee/orders',

  // Management
  MANAGEMENT: '/management',
  MANAGEMENT_REPORTS: '/management/reports',
  MANAGEMENT_SALES: '/management/sales',
  MANAGEMENT_INVENTORY: '/management/inventory',
  MANAGEMENT_EMPLOYEES: '/management/employees',
} as const

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
  { value: 'PROCESSING', label: 'Processing', color: 'purple' },
  { value: 'SHIPPED', label: 'Shipped', color: 'indigo' },
  { value: 'DELIVERED', label: 'Delivered', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'RETURNED', label: 'Returned', color: 'orange' },
] as const

export const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
] as const

export const EMPLOYMENT_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'RESIGNED', label: 'Resigned' },
] as const

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
] as const

export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  PRODUCT_DOCUMENTS: 'product-documents',
  EMPLOYEE_PHOTOS: 'employee-photos',
  CEO_PHOTOS: 'ceo-photos',
  SERVICE_IMAGES: 'service-images',
  VIDEO_THUMBNAILS: 'video-thumbnails',
  COMPANY_IMAGES: 'company-images',
  PAYMENT_PROOFS: 'payment-proofs',
} as const

export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  // Orders
  ORDERS_VIEW_ALL: 'orders.view_all',
  ORDERS_VIEW_OWN: 'orders.view_own',
  ORDERS_MANAGE: 'orders.manage',
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',
  // Employees
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_MANAGE: 'employees.manage',
  // Reports
  REPORTS_VIEW: 'reports.view',
  // Content
  CONTENT_MANAGE: 'content.manage',
  // Settings
  SETTINGS_MANAGE: 'settings.manage',
  // Audit
  AUDIT_LOGS_VIEW: 'audit_logs.view',
} as const
