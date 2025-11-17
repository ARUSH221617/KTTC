'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/data-table';
import { toast } from 'sonner';
import { GraduationCap, DollarSign, Plus } from 'lucide-react';
import { getCoursesColumns, CourseWithInstructor } from './courses-table';

interface User {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithInstructor | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructorId: '',
    price: '',
    duration: '',
    thumbnail: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch instructors for the form
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('/api/admin/users?role=admin');
        if (response.ok) {
          const data = await response.json();
          setInstructors(data.users);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };

    fetchInstructors();
  }, []);

  const fetchCourses = async ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    const response = await fetch(`/api/admin/courses?page=${page}&limit=${limit}&search=${search}`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return response.json();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.instructorId) {
      errors.instructorId = 'Instructor is required';
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      errors.price = 'Price must be a valid number';
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
      const method = editingCourse ? 'PUT' : 'POST';
      const url = editingCourse
        ? `/api/admin/courses`
        : `/api/admin/courses`;

      const bodyData = editingCourse
        ? {
            id: editingCourse.id,
            ...formData,
            price: parseFloat(formData.price) || 0
          }
        : {
            ...formData,
            price: parseFloat(formData.price) || 0
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Course ${editingCourse ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setEditingCourse(null);
        setFormData({
          title: '',
          description: '',
          instructorId: '',
          price: '',
          duration: '',
          thumbnail: ''
        });
        setFormErrors({});
      } else {
        toast.error(result.error || `Failed to ${editingCourse ? 'update' : 'create'} course`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      instructorId: '',
      price: '',
      duration: '',
      thumbnail: ''
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
      thumbnail: course.thumbnail || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteCourse = async (course: CourseWithInstructor) => {
    try {
      const response = await fetch(`/api/admin/courses?id=${course.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Course deleted successfully');
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete course');
        return Promise.reject();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('An error occurred while deleting the course');
      return Promise.reject();
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
      />

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full p-2 border rounded ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter course title"
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Instructor</label>
                  <select
                    value={formData.instructorId}
                    onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
                    className={`w-full p-2 border rounded ${formErrors.instructorId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.instructorId && <p className="text-red-500 text-sm mt-1">{formErrors.instructorId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full p-2 pl-8 border border-gray-300 rounded"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter thumbnail URL"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCourse(null);
                    setFormData({
                      title: '',
                      description: '',
                      instructorId: '',
                      price: '',
                      duration: '',
                      thumbnail: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}