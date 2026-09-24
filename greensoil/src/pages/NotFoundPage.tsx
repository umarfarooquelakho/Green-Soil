import { useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-12 h-12 text-primary-600" />
        </div>
        <h1 className="text-6xl font-bold text-primary-700 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-dark-900 mb-3">Page Not Found</h2>
        <p className="text-dark-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    </div>
  )
}
