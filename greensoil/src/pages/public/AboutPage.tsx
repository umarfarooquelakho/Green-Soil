import { Target, Eye, Leaf, Award, Users, Globe } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const values = [
  { icon: Leaf, title: 'Quality', desc: 'We never compromise on the quality of our products. Every product undergoes rigorous testing.' },
  { icon: Users, title: 'Farmer First', desc: 'Farmers are at the heart of everything we do. Their success is our success.' },
  { icon: Globe, title: 'Sustainability', desc: 'We are committed to promoting sustainable agricultural practices across Pakistan.' },
  { icon: Award, title: 'Excellence', desc: 'We strive for excellence in every aspect of our business operations.' },
]

const stats = [
  { label: 'Farmers Served', value: '5,000+' },
  { label: 'Products', value: '50+' },
  { label: 'Districts', value: '20+' },
  { label: 'Years of Experience', value: '5+' },
]

export default function AboutPage() {
  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'About Us' }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">About GREEN SOIL</h1>
          <p className="text-primary-200 text-lg max-w-2xl">
            Building a stronger agricultural future for Pakistan — one farm at a time.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Who We Are
              </p>
              <h2 className="text-3xl font-bold text-dark-900 mb-6">
                Pakistan's Trusted Fertilizer Partner
              </h2>
              <div className="space-y-4 text-dark-600 leading-relaxed">
                <p>
                  GREEN SOIL Agri Services (PVT) Limited is a leading agricultural company dedicated to providing premium quality fertilizers and agri solutions to farmers across Pakistan.
                </p>
                <p>
                  Founded with the vision of empowering Pakistan's agricultural sector, we have grown to become one of the most trusted names in the industry. Our products are designed to maximize crop yield while promoting sustainable farming practices.
                </p>
                <p>
                  We work closely with farmers, agronomists, and industry experts to develop products that meet the real needs of Pakistani agriculture. Our team of dedicated professionals ensures that every product we offer is of the highest quality and backed by the latest agricultural science.
                </p>
              </div>
            </div>
            <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-white rounded-xl border border-primary-100">
                    <p className="text-3xl font-bold text-primary-700 mb-1">{stat.value}</p>
                    <p className="text-sm text-dark-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-dark-100">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Our Mission</h3>
              <p className="text-dark-600 leading-relaxed">
                To provide Pakistan's farmers with premium quality fertilizers and agricultural solutions that improve crop productivity, soil health, and farm profitability — while promoting sustainable and responsible farming practices.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-dark-100">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-4">Our Vision</h3>
              <p className="text-dark-600 leading-relaxed">
                To become Pakistan's leading and most trusted agricultural solutions provider, recognized for quality, innovation, and an unwavering commitment to the farmer's success and the nation's food security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">
              What We Stand For
            </p>
            <h2 className="text-3xl font-bold text-dark-900">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 border border-dark-100 hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-dark-900 mb-2">{value.title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Sustainability */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Committed to Quality & Sustainability
              </h2>
              <div className="space-y-4 text-primary-200">
                <p>
                  All GREEN SOIL products meet international quality standards. Our manufacturing partners and suppliers are carefully vetted to ensure consistency and reliability.
                </p>
                <p>
                  We believe that good farming practices today ensure a productive agricultural future for Pakistan. That is why sustainability is at the core of our product development.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Quality Tested', desc: 'Every product tested before distribution' },
                { label: 'Approved', desc: 'Government approved formulations' },
                { label: 'Eco Friendly', desc: 'Environmentally responsible products' },
                { label: 'Farmer Proven', desc: 'Tested and trusted by real farmers' },
              ].map((item) => (
                <div key={item.label} className="bg-primary-800/50 rounded-xl p-4 border border-primary-700">
                  <p className="font-bold text-white mb-1">{item.label}</p>
                  <p className="text-primary-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
