import { Breadcrumb } from '@/components/ui/Breadcrumb'

export default function PrivacyPage() {
  return (
    <div className="page-enter min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} className="mb-3 [&_*]:text-primary-200" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 prose prose-sm text-dark-700 space-y-6">
        <p className="text-dark-400 text-sm">Last updated: January 2025</p>
        <h2 className="text-xl font-bold text-dark-900">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, and shipping address.</p>
        <h2 className="text-xl font-bold text-dark-900">2. How We Use Your Information</h2>
        <p>We use the information we collect to process orders, manage your account, communicate with you about products and services, and improve our website.</p>
        <h2 className="text-xl font-bold text-dark-900">3. Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent, except as required by law or to fulfill your orders.</p>
        <h2 className="text-xl font-bold text-dark-900">4. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
        <h2 className="text-xl font-bold text-dark-900">5. Contact Us</h2>
        <p>If you have questions about this privacy policy, please contact us at info@greensoilagri.com</p>
      </div>
    </div>
  )
}
