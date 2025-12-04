"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/data-table";
import { toast } from "sonner";
import { GraduationCap, DollarSign, Plus } from "lucide-react";
import { getCoursesColumns, CourseWithInstructor } from "./courses-table";
import ImageUpload from "@/components/ui/image-upload";
import { InstructorSelect } from "@/components/ui/instructor-select";
import Editor from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface User {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] =
    useState<CourseWithInstructor | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructorId: "",
    price: "",
    duration: "",
    thumbnail: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [instructors, setInstructors] = useState<User[]>([]);

  // Fetch instructors for the form
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setInstructors(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    fetchInstructors();
  }, []);

  const fetchCourses = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) => {
    const response = await fetch(
      `/api/admin/courses?page=${page}&limit=${limit}&search=${search}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }
    const data = await response.json();
    return {
      data: data.courses,
      pagination: data.pagination,
    };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.instructorId) {
      errors.instructorId = "Instructor is required";
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      errors.price = "Price must be a valid number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const method = editingCourse ? "PUT" : "POST";
      const url = editingCourse ? `/api/admin/courses` : `/api/admin/courses`;

      const bodyData = editingCourse
        ? {
            id: editingCourse.id,
            ...formData,
            price: parseFloat(formData.price) || 0,
          }
        : {
            ...formData,
            price: parseFloat(formData.price) || 0,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Course ${editingCourse ? "updated" : "created"} successfully`
        );
        setRefreshTrigger((prev) => prev + 1);
        handleOpenChange(false);
      } else {
        toast.error(
          result.error ||
            `Failed to ${editingCourse ? "update" : "create"} course`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred");
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      instructorId: "",
      price: "",
      duration: "",
      thumbnail: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditCourse = (course: CourseWithInstructor) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructorId: course.instructor.id,
      price: course.price.toString(),
      duration: course.duration,
      thumbnail: course.thumbnail || "",
    });
    setShowAddModal(true);
  };

  const handleDeleteCourse = async (course: CourseWithInstructor) => {
    try {
      const response = await fetch(`/api/admin/courses?id=${course.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Course deleted successfully");
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to delete course");
        return Promise.reject();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("An error occurred while deleting the course");
      return Promise.reject();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowAddModal(open);
    if (!open) {
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        instructorId: "",
        price: "",
        duration: "",
        thumbnail: "",
      });
      setFormErrors({});
    }
  };

  const columns = getCoursesColumns(handleEditCourse, handleDeleteCourse);

  return (
    <div className="p-6">
      <DataTable
        title="Courses"
        columns={columns}
        fetchData={fetchCourses}
        onAdd={handleAddCourse}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
        addButtonLabel="Add Course"
        searchPlaceholder="Search courses..."
        refreshTrigger={refreshTrigger}
      />

      <Sheet open={showAddModal} onOpenChange={handleOpenChange}>
        <SheetContent className="flex flex-col h-full sm:max-w-4xl w-full">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <SheetTitle>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </SheetTitle>
            </div>
            <SheetDescription>
              {editingCourse
                ? "Update the course details below."
                : "Fill in the details to create a new course."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            <form
              id="course-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full p-2 border rounded ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter course title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Editor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({ ...formData, description: value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Instructor
                </label>
                <InstructorSelect
                  value={formData.instructorId}
                  onChange={(value) =>
                    setFormData({ ...formData, instructorId: value })
                  }
                  instructors={instructors}
                  error={formErrors.instructorId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full p-2 pl-8 border border-gray-300 rounded"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., 60"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Thumbnail
                </label>
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) =>
                    setFormData({ ...formData, thumbnail: url })
                  }
                />
              </div>
            </form>
          </div>

          <SheetFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" form="course-form">
                {editingCourse ? "Update" : "Create"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
