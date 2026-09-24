import { Breadcrumb } from '@/components/ui/Breadcrumb'

export default function TermsPage() {
  return (
    <div className="page-enter min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Terms & Conditions' }]} className="mb-3 [&_*]:text-primary-200" />
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-dark-700">
        <p className="text-dark-400 text-sm">Last updated: January 2025</p>
        <h2 className="text-xl font-bold text-dark-900">1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.</p>
        <h2 className="text-xl font-bold text-dark-900">2. Products and Pricing</h2>
        <p>All prices are in Pakistani Rupees (PKR) unless otherwise stated. We reserve the right to modify prices at any time without prior notice.</p>
        <h2 className="text-xl font-bold text-dark-900">3. Orders and Payment</h2>
        <p>All orders are subject to availability and acceptance. We reserve the right to cancel any order for any reason. Payment must be received before order dispatch for bank transfer orders.</p>
        <h2 className="text-xl font-bold text-dark-900">4. Shipping and Delivery</h2>
        <p>Delivery times are estimates only. We are not responsible for delays caused by courier services or circumstances beyond our control.</p>
        <h2 className="text-xl font-bold text-dark-900">5. Returns and Refunds</h2>
        <p>Defective or damaged products may be returned within 7 days of receipt. Please contact our support team to initiate a return.</p>
        <h2 className="text-xl font-bold text-dark-900">6. Contact</h2>
        <p>For questions regarding these terms, please contact info@greensoilagri.com</p>
      </div>
    </div>
  )
}
