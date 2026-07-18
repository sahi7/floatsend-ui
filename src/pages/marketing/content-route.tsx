import { Navigate, useParams } from 'react-router-dom'
import { ContentPage } from '@/components/marketing/content-page'
import { contentRegistry } from '@/pages/marketing/content-registry'

/** Renders a fully designed content page from the registry by slug */
export function ContentRoute({ slug }: { slug?: string }) {
  const params = useParams()
  const key = slug || params.slug || ''
  const page = contentRegistry[key]
  if (!page) return <Navigate to="/" replace />
  return <ContentPage {...page} />
}
