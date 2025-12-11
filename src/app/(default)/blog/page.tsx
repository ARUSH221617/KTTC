import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educational Blog | KTTC",
  description: "Insights and articles on teaching methodologies, classroom management, and educational technology.",
};

const posts = [
  {
    id: 1,
    title: "Modern Classroom Management in Iran",
    excerpt: "Exploring effective strategies for maintaining student engagement and discipline in Iranian schools, blending traditional values with modern psychology.",
    date: "December 10, 2024",
    category: "Management",
    author: "Dr. Alavi"
  },
  {
    id: 2,
    title: "EdTech Trends in Khuzestan",
    excerpt: "How technology is transforming classrooms in the region, from smart boards to AI-powered learning assistants.",
    date: "November 25, 2024",
    category: "Technology",
    author: "Eng. Rezaei"
  },
  {
    id: 3,
    title: "Psychology of Learning: A Practical Guide",
    excerpt: "Understanding how students learn best and how to adapt your teaching style to different learning needs.",
    date: "November 15, 2024",
    category: "Psychology",
    author: "Prof. Mohammadi"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
           <h1 className="text-4xl font-bold text-gray-900 mb-4">Educational Insights</h1>
           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
             Latest articles, research, and tips for educators.
           </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <CardTitle className="text-xl">
                    <Link href="#" className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">By {post.author}</span>
                    <Button variant="link" className="text-blue-600 p-0">Read Article</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
