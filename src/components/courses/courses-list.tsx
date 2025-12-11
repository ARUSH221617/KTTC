"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Search, Clock, Users, BookOpen, Star, Filter, ChevronDown } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Teaching Skills", "Psychology", "Management", "Technology", "Curriculum", "Special Education", "Assessment", "Leadership", "Early Education"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const durations = ["All", "Short (1-4 weeks)", "Medium (5-8 weeks)", "Long (9+ weeks)"];
const COURSES_PER_PAGE = 6;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  thumbnail: string | null;
  instructor: {
    name: string | null;
  } | null;
  rating?: number;
  students?: number;
}

interface CoursesListProps {
  initialCourses: Course[];
}

export default function CoursesList({ initialCourses }: CoursesListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [allCourses, setAllCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COURSES_PER_PAGE);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    setAllCourses(initialCourses);
  }, [initialCourses]);

  useEffect(() => {
    filterAndSortCourses();
  }, [searchTerm, selectedCategory, selectedLevel, selectedDuration, sortBy, allCourses]);

  const filterAndSortCourses = () => {
    let filtered = [...allCourses];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== "All") {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by duration
    if (selectedDuration !== "All") {
      filtered = filtered.filter(course => {
        const weeks = parseInt(course.duration);
        switch (selectedDuration) {
          case "Short (1-4 weeks)":
            return weeks <= 4;
          case "Medium (5-8 weeks)":
            return weeks >= 5 && weeks <= 8;
          case "Long (9+ weeks)":
            return weeks >= 9;
          default:
            return true;
        }
      });
    }

    // Sort courses
    switch (sortBy) {
      case "popular":
        // Fallback to 0 if students is undefined
        filtered.sort((a, b) => (b.students || 0) - (a.students || 0));
        break;
      case "rating":
        // Fallback to 0 if rating is undefined
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, '') || '0') - parseInt(b.price.replace(/[^0-9]/g, '') || '0'));
        break;
      case "price-high":
        filtered.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, '') || '0') - parseInt(a.price.replace(/[^0-9]/g, '') || '0'));
        break;
      default:
        break;
    }

    setFilteredCount(filtered.length);
    setCourses(filtered);
  };

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setVisibleCount(COURSES_PER_PAGE);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedDuration("All");
    setSortBy("popular");
    setVisibleCount(COURSES_PER_PAGE);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + COURSES_PER_PAGE);
  };

  const visibleCourses = courses.slice(0, visibleCount);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className={`space-y-4 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Explore Our Courses
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover comprehensive programs designed to enhance your teaching skills and advance your educational career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses by title, instructor, or keyword..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                  className="pl-12 w-full h-full pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-[52px] px-6 border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Courses</DialogTitle>
                    <DialogDescription>
                      Narrow down the course list with the following options.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={(val) => handleFilterChange(setSelectedCategory, val)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Level
                      </label>
                      <Select value={selectedLevel} onValueChange={(val) => handleFilterChange(setSelectedLevel, val)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Duration
                      </label>
                      <Select value={selectedDuration} onValueChange={(val) => handleFilterChange(setSelectedDuration, val)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map(duration => (
                            <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={(val) => handleFilterChange(setSortBy, val)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full sm:w-auto"
                    >
                      Clear Filters
                    </Button>
                    <DialogClose asChild>
                      <Button className="w-full sm:w-auto">Show Results</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{visibleCourses.length}</span> of <span className="font-semibold text-gray-900">{filteredCount}</span> courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {visibleCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleCourses.map((course, index) => (
                <Card key={course.id} className={`hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white/90 border-gray-300 text-gray-700">
                        {course.level}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">{course.instructor?.name || 'Instructor'}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{course.rating?.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{course.students}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {course.price}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={`/courses/${course.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <Button disabled variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Load More / Pagination */}
      {visibleCourses.length < filteredCount && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button
              onClick={loadMore}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              Load More Courses
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
