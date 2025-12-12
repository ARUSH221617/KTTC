import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kttcintl.com'

  // Static routes
  const routes = [
    '',
    '/about',
    '/courses',
    '/blog',
    '/certificate',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  let courseRoutes: MetadataRoute.Sitemap = []
  let postRoutes: MetadataRoute.Sitemap = []

  try {
    // Dynamic course routes
    const courses = await db.course.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    })

    courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Failed to fetch courses for sitemap:', error)
  }

  try {
    // Dynamic blog post routes
    const posts = await db.post.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    postRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error)
  }

  return [...routes, ...courseRoutes, ...postRoutes]
}
