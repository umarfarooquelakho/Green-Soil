import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await signUp(data.email, data.password, data.full_name, data.phone)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Account created! Please check your email to verify.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo size="xl" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-dark-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Create account</h1>
          <p className="text-dark-500 text-sm mb-8">Join GREEN SOIL to start shopping</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="Your full name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92 300 000 0000"
              {...register('phone')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-dark-400 hover:text-dark-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
