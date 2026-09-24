import { useEffect, useState } from 'react'
import { Check, Leaf } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { contentService } from '@/services/contentService'
import type { Service } from '@/services/contentService'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentService.getServices().then((data) => {
      setServices(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Services' }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-3xl sm:text-5xl font-bold mb-2">Our Services</h1>
          <p className="text-primary-200 max-w-xl">
            Comprehensive agricultural solutions to support your farming journey from soil preparation to harvest.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {services.length === 0 ? (
          <EmptyState
            icon={<Leaf className="w-8 h-8" />}
            title="Services Coming Soon"
            description="We are updating our services listing. Please check back soon."
          />
        ) : (
          <div className="space-y-16">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Image */}
                <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-72 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-72 bg-primary-50 rounded-2xl border border-primary-100 flex items-center justify-center">
                      <Leaf className="w-20 h-20 text-primary-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center mb-6">
                    <Leaf className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-4">
                    {service.title}
                  </h2>
                  {service.short_description && (
                    <p className="text-dark-500 text-lg mb-4 leading-relaxed">
                      {service.short_description}
                    </p>
                  )}
                  {service.description && (
                    <p className="text-dark-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary-600 shrink-0" />
                          <span className="text-dark-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
