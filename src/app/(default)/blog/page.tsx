import { db } from "@/lib/db";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { BlogBreadcrumb } from "@/components/blog-breadcrumb";
import { BlogToolbar } from "@/components/blog/blog-toolbar";

export const metadata = {
  title: "Blog - Knowledge Transfer",
  description: "Insights and articles on education, technology, and learning.",
};

/**
 * Blog Page - Server Component
 * Fetches and displays blog posts with pagination, search, and category filtering.
 *
 * @param {object} props - The component props.
 * @param {Promise<{ page?: string; category?: string; search?: string }>} props.searchParams - Search parameters for pagination and filtering.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}) {
  const { page, category, search } = await searchParams;

  const pageNum = Number(page) || 1;
  const limit = 9;
  const skip = (pageNum - 1) * limit;

  // Build the where clause
  const where: any = {
    published: true,
  };

  if (category) {
    where.categories = { some: { slug: category } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch posts, count, and categories in parallel
  const [posts, total, categories] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: {
          select: { name: true },
        },
        categories: true,
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.post.count({ where }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container py-10 space-y-8">
      <BlogBreadcrumb items={[{ label: "Blog" }]} />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-xl text-muted-foreground">
          Latest updates, articles, and insights.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <BlogToolbar categories={categories} />

      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No posts found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
               {/* Image placeholder if needed, or if featuredImage exists */}
               {post.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                      {/* Using regular img for simplicity or Next Image if configured */}
                      <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
                  </div>
               )}
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.categories.slice(0, 2).map((cat) => (
                     <Badge key={cat.id} variant="outline" className="font-normal">{cat.name}</Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2 text-xl">
                  <Link href={`/blog/${post.slug}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 mt-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                 {/* Spacer to push footer down */}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground justify-between border-t pt-4 mx-6 px-0 mb-0 pb-0">
                <span>{post.author.name}</span>
                <time dateTime={post.publishedAt?.toISOString()}>
                  {post.publishedAt ? format(post.publishedAt, "MMM d, yyyy") : ""}
                </time>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {pageNum > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/blog?page=${pageNum - 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}>
                Previous
              </Link>
            </Button>
          )}
          <Button variant="outline" disabled>
            Page {pageNum} of {totalPages}
          </Button>
          {pageNum < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/blog?page=${pageNum + 1}${category ? `&category=${category}` : ""}${search ? `&search=${search}` : ""}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
