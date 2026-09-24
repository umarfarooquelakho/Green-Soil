import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const from = (location.state as { from?: string })?.from ?? '/account'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await signIn(data.email, data.password)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Welcome back</h1>
          <p className="text-dark-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-dark-400 hover:text-dark-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
