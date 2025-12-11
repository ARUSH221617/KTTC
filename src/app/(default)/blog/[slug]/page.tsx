import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BlogBreadcrumb } from "@/components/blog-breadcrumb";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates metadata for the blog post page.
 *
 * @param {PageProps} props - The component props.
 * @returns {Promise<Metadata>} The metadata object.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorId],
    },
  };
}

/**
 * Blog Post Detail Page - Server Component
 * Fetches and displays a single blog post.
 *
 * @param {PageProps} props - The component props.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: true,
      tags: true,
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{
        "@type": "Person",
        name: post.author.name,
    }],
    description: post.excerpt,
    articleBody: post.content,
  };

  return (
    <article className="container py-10 max-w-3xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BlogBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      <Button variant="ghost" size="sm" asChild className="-ml-4 text-muted-foreground">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <header className="space-y-4">
        <div className="flex gap-2">
          {post.categories.map(c => (
             <Link key={c.id} href={`/blog?category=${c.slug}`}>
               <Badge variant="secondary">{c.name}</Badge>
             </Link>
          ))}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground">
           <span>{post.author.name}</span>
           <span>•</span>
           <time dateTime={post.publishedAt?.toISOString()}>
             {post.publishedAt ? format(post.publishedAt, "MMM d, yyyy") : ""}
           </time>
        </div>
      </header>

      {/* GEO: Key Takeaways / Quick Summary */}
      {post.excerpt && (
        <section className="bg-muted/50 p-6 rounded-lg border border-primary/20">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                💡 Key Takeaways
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
            </p>
        </section>
      )}

      {post.featuredImage && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 && (
         <div className="pt-8 border-t mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <Badge key={tag.id} variant="outline">#{tag.name}</Badge>
                ))}
            </div>
         </div>
      )}
    </article>
  );
}
