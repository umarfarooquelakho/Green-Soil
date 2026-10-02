import { useEffect, useState } from 'react'
import { Quote } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { contentService } from '@/services/contentService'
import type { CEOMessage } from '@/services/contentService'
import { formatDate } from '@/lib/utils'

export default function CEOMessagePage() {
  const [message, setMessage] = useState<CEOMessage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentService.getCEOMessage().then((data) => {
      setMessage(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: "CEO's Message" }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 text-white">Message from Our CEO</h1>
          <p className="text-primary-200">Leadership vision and company direction</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {!message ? (
          <div className="text-center py-16">
            <Quote className="w-12 h-12 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500">CEO message not available yet.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* CEO profile card */}
            <div className="lg:col-span-1">
              <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100 text-center sticky top-24">
                {message.photo_url ? (
                  <img
                    src={message.photo_url}
                    alt={message.ceo_name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary-200 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                    <span className="text-4xl font-bold text-primary-600">
                      {message.ceo_name[0]}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-dark-900">{message.ceo_name}</h2>
                <p className="text-primary-600 font-medium mt-1">{message.designation}</p>
                <p className="text-sm text-dark-500 mt-1">GREEN SOIL Agri Services</p>
                {message.signature_url && (
                  <div className="mt-6 pt-4 border-t border-primary-200">
                    <img
                      src={message.signature_url}
                      alt="Signature"
                      className="h-12 mx-auto object-contain opacity-70"
                    />
                  </div>
                )}
                <p className="text-xs text-dark-400 mt-3">
                  Last updated: {formatDate(message.updated_at)}
                </p>
              </div>
            </div>

            {/* Message content */}
            <div className="lg:col-span-2">
              {/* Quote icon */}
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mb-8">
                <Quote className="w-6 h-6 text-white" />
              </div>

              <div className="prose prose-lg text-dark-700 leading-relaxed whitespace-pre-line mb-10">
                {message.message}
              </div>

              {message.vision && (
                <div className="bg-primary-900 rounded-2xl p-8 text-white">
                  <h3 className="text-lg font-bold mb-4 text-primary-200">Our Vision</h3>
                  <p className="text-primary-100 leading-relaxed">{message.vision}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
