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

const categories = ["All", "Teaching Skills", "Psychology", "Management", "Technology", "Curriculum", "Special Education", "Assessment", "Leadership", "Early Education"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];
const durations = ["All", "Short (1-4 weeks)", "Medium (5-8 weeks)", "Long (9+ weeks)"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [searchTerm, selectedCategory, selectedLevel, selectedDuration, sortBy, allCourses]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const coursesData = await response.json();
        // Add additional data for UI purposes
        const enrichedCourses = coursesData.map((course: any) => ({
          ...course,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          students: Math.floor(Math.random() * 300) + 100, // Random students between 100-400
          price: `$${Math.floor(Math.random() * 400) + 199}` // Random price between $199-$599
        }));
        setAllCourses(enrichedCourses);
        setCourses(enrichedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filteredCourses = [...allCourses];

    // Filter by search term
    if (searchTerm) {
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filteredCourses = filteredCourses.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== "All") {
      filteredCourses = filteredCourses.filter(course => course.level === selectedLevel);
    }

    // Filter by duration
    if (selectedDuration !== "All") {
      filteredCourses = filteredCourses.filter(course => {
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
        filteredCourses.sort((a, b) => b.students - a.students);
        break;
      case "rating":
        filteredCourses.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        filteredCourses.sort((a, b) => parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', '')));
        break;
      case "price-high":
        filteredCourses.sort((a, b) => parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', '')));
        break;
      default:
        break;
    }

    setCourses(filteredCourses);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedDuration("All");
    setSortBy("popular");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
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
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses by title, instructor, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filters Button */}
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
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
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
                      <Select value={sortBy} onValueChange={setSortBy}>
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

            {/* Results Count */}
            <div className="text-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{courses.length}</span> courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <Card key={course.id} className={`hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                      <span className="font-medium">{course.instructor}</span>
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
                      <Button disabled className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
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
      {courses.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
              Load More Courses
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}