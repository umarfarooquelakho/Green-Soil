import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await resetPassword(data.email)
    if (error) { toast.error(error); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-bold text-primary-800 text-lg">GREEN SOIL</div>
              <div className="text-xs text-dark-500">Agri Services</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-dark-100 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-dark-900 mb-2">Check your email</h2>
              <p className="text-dark-500 text-sm mb-6">
                We've sent a password reset link to your email address.
              </p>
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-dark-900 mb-1">Reset password</h1>
              <p className="text-dark-500 text-sm mb-8">
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
                  Send Reset Link
                </Button>
              </form>
              <p className="text-center text-sm text-dark-500 mt-6">
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  ← Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
