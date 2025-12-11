import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kttc.edu.ir'

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

  // Dynamic blog post routes
  const posts = await db.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...courseRoutes, ...postRoutes]
}
