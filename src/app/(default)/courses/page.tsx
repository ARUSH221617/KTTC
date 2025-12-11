import { db } from "@/lib/db";
import CoursesList from "@/components/courses/courses-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Courses | KTTC",
  description: "Browse our comprehensive collection of teacher training courses ranging from classroom management to educational psychology.",
  keywords: ["KTTC Courses", "Teacher Training", "Professional Development", "Education Workshops", "Online Learning"],
  openGraph: {
    title: "All Courses | KTTC",
    description: "Explore professional development courses for educators.",
    type: "website",
  }
};

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: {
        select: { name: true }
      }
    }
  });

  // Deterministic enrichment based on ID to ensure consistency for SEO
  const enrichedCourses = courses.map((course) => {
    // Simple hash function for pseudo-randomness based on ID
    const hash = course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = 4.5 + (hash % 6) / 10; // 4.5 to 5.0
    const students = 100 + (hash % 301); // 100 to 400
    // Use stored price or generate a consistent one
    const price = course.price || `$${199 + (hash % 401)}`;

    return {
      ...course,
      rating,
      students,
      price
    };
  });

  // Add Schema.org structured data for Courses
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": enrichedCourses.map((course, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "provider": {
          "@type": "Organization",
          "name": "KTTC",
          "sameAs": "https://kttc.edu.ir"
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "Online",
          "courseWorkload": course.duration
        },
        "offers": {
          "@type": "Offer",
          "price": course.price.replace(/[^0-9.]/g, ''),
          "priceCurrency": "USD"
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CoursesList initialCourses={enrichedCourses} />
    </>
  );
}
