import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kttc.edu.ir'

  // Static routes
  const routes = [
    '',
    '/about',
    '/courses',
    '/certificate',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic course routes
  const courses = await db.course.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  })

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...courseRoutes]
}
