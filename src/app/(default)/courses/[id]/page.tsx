"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, ArrowLeft, CheckCircle, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  thumbnail: string;
  price: number;
  instructor: {
    name: string;
  };
  rating?: number;
  students?: number;
}

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();

        // Enrich data with random values if missing (to match courses page)
        const enrichedCourse = {
          ...data,
          rating: data.rating || 4.5 + Math.random() * 0.5,
          students: data.students || Math.floor(Math.random() * 300) + 100,
        };

        setCourse(enrichedCourse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Course</h2>
        <p className="text-gray-600 mb-6">{error || "Course not found"}</p>
        <Button onClick={() => router.push('/courses')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/10 mb-8 pl-0"
            onClick={() => router.push('/courses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white/20">
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-medium text-white">{course.rating?.toFixed(1)}</span>
                  </div>
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
                    {course.instructor?.name?.[0] || 'I'}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Created by</div>
                    <div className="font-medium">{course.instructor?.name || 'Instructor'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    ${course.price}
                  </div>
                  <Button className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 mb-4">
                    Enroll Now
                  </Button>
                  <p className="text-center text-sm text-gray-500 mb-6">
                    30-Day Money-Back Guarantee
                  </p>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">This course includes:</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{course.duration} of on-demand video</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Access on mobile and TV</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-green-500" />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600">
                      Master the fundamental concepts and practical applications of the subject matter.
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <div className="prose max-w-none text-gray-600">
                <p>{course.description}</p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
