import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { contentService } from '@/services/contentService'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

const subjectOptions = [
  { value: 'product-inquiry', label: 'Product Inquiry' },
  { value: 'order-support', label: 'Order Support' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'partnership', label: 'Business Partnership' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'other', label: 'Other' },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await contentService.submitContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      })
      setSubmitted(true)
      reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Contact' }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-3xl sm:text-5xl font-bold mb-2">Contact Us</h1>
          <p className="text-primary-200 max-w-xl">
            Have questions or need support? Our team is here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">Get In Touch</h2>
              <p className="text-dark-500">
                We'd love to hear from you. Reach out through any of the channels below.
              </p>
            </div>

            {[
              {
                icon: Phone,
                title: 'Phone',
                lines: ['+92 300 000 0000', '+92 300 000 0001'],
              },
              {
                icon: Mail,
                title: 'Email',
                lines: ['info@greensoilagri.com', 'support@greensoilagri.com'],
              },
              {
                icon: MapPin,
                title: 'Address',
                lines: ['GREEN SOIL Agri Services', 'Pakistan'],
              },
              {
                icon: Clock,
                title: 'Business Hours',
                lines: ['Monday – Saturday: 9 AM – 6 PM', 'Sunday: Closed'],
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="text-dark-500 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-dark-100 p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Message Sent!</h3>
                  <p className="text-dark-500 mb-6">
                    Thank you for reaching out. We will get back to you within 24 hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <h2 className="text-xl font-bold text-dark-900 mb-6">Send Us a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      required
                      placeholder="Your name"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="your@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+92 300 000 0000"
                      {...register('phone')}
                    />
                    <Select
                      label="Subject"
                      required
                      placeholder="Select subject"
                      options={subjectOptions}
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                  </div>

                  <Textarea
                    label="Message"
                    required
                    placeholder="How can we help you?"
                    rows={5}
                    error={errors.message?.message}
                    {...register('message')}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
