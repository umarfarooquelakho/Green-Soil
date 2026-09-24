import { useEffect, useState } from 'react'
import { Play, Video } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { contentService } from '@/services/contentService'
import type { Video as VideoType } from '@/services/contentService'
import { getYouTubeThumbnail, getYouTubeEmbedUrl, formatDate } from '@/lib/utils'

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    contentService.getVideos().then((data) => {
      setVideos(data)
      setLoading(false)
    })
  }, [])

  const categories = [...new Set(videos.map((v) => v.category).filter(Boolean))] as string[]
  const filtered = filter ? videos.filter((v) => v.category === filter) : videos

  if (loading) return <PageLoading />

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Product Videos' }]} className="mb-4 [&_*]:text-primary-200" />
          <h1 className="text-3xl sm:text-5xl font-bold mb-2">Product Videos</h1>
          <p className="text-primary-200">
            Watch our product demonstrations, usage guides, and agricultural tips.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
              }`}
            >
              All Videos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Video className="w-8 h-8" />}
            title="No Videos Available"
            description="Check back soon for new product videos and tutorials."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((video) => {
              const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_url)
              const embedUrl = getYouTubeEmbedUrl(video.youtube_url)
              const isActive = activeVideoId === video.id

              return (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-dark-100 hover:shadow-md transition-shadow">
                  {/* Video player */}
                  <div
                    className="relative aspect-video bg-dark-900 cursor-pointer overflow-hidden"
                    onClick={() => setActiveVideoId(isActive ? null : video.id)}
                  >
                    {isActive ? (
                      <iframe
                        src={`${embedUrl}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <>
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={video.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-900 flex items-center justify-center">
                            <Play className="w-16 h-16 text-primary-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-primary-700 ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {video.category && (
                      <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                        {video.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-dark-900 mt-1 line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-dark-500 mt-1 line-clamp-2">{video.description}</p>
                    )}
                    <p className="text-xs text-dark-400 mt-2">
                      {formatDate(video.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
