'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Award, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

interface Certificate {
  id: string;
  certificateNo: string | null;
  user: User;
  course: Course;
  issuedDate: string;
  createdAt: string;
}

export default function CertificatesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    issuedDate: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch users and courses for the form
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }

        // Fetch courses
        const coursesResponse = await fetch('/api/admin/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchCertificates = async ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    const response = await fetch(`/api/admin/certificates?page=${page}&limit=${limit}&search=${search}`);
    if (!response.ok) {
      throw new Error('Failed to fetch certificates');
    }
    return response.json();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.userId) {
      errors.userId = 'User is required';
    }
    
    if (!formData.courseId) {
      errors.courseId = 'Course is required';
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
      const method = editingCertificate ? 'PUT' : 'POST';
      const url = editingCertificate 
        ? `/api/admin/certificates` 
        : `/api/admin/certificates`;
      
      const bodyData = editingCertificate
        ? { 
            id: editingCertificate.id, 
            issuedDate: formData.issuedDate || new Date().toISOString()
          }
        : {
            userId: formData.userId,
            courseId: formData.courseId,
            issuedDate: formData.issuedDate || new Date().toISOString()
          };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Certificate ${editingCertificate ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setEditingCertificate(null);
        setFormData({
          userId: '',
          courseId: '',
          issuedDate: ''
        });
        setFormErrors({});
      } else {
        toast.error(result.error || `Failed to ${editingCertificate ? 'update' : 'create'} certificate`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    }
  };

  const handleAddCertificate = () => {
    setEditingCertificate(null);
    setFormData({
      userId: '',
      courseId: '',
      issuedDate: ''
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      userId: certificate.user.id,
      courseId: certificate.course.id,
      issuedDate: certificate.issuedDate
    });
    setShowAddModal(true);
  };

  const handleDeleteCertificate = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/admin/certificates?id=${certificate.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Certificate deleted successfully');
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete certificate');
        return Promise.reject();
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast.error('An error occurred while deleting the certificate');
      return Promise.reject();
    }
  };

  const columns = [
    {
      key: 'certificateNo',
      title: 'Certificate No',
      render: (cert: Certificate) => cert.certificateNo || 'N/A'
    },
    {
      key: 'user',
      title: 'User',
      render: (cert: Certificate) => cert.user.name
    },
    {
      key: 'course',
      title: 'Course',
      render: (cert: Certificate) => cert.course.title
    },
    {
      key: 'issuedDate',
      title: 'Issued Date',
      render: (cert: Certificate) => new Date(cert.issuedDate).toLocaleDateString()
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (cert: Certificate) => new Date(cert.createdAt).toLocaleDateString()
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Certificates"
        columns={columns}
        fetchData={fetchCertificates}
        onAdd={handleAddCertificate}
        onEdit={handleEditCertificate}
        onDelete={handleDeleteCertificate}
        addButtonLabel="Issue Certificate"
        searchPlaceholder="Search certificates..."
      />

      {/* Add/Edit Certificate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5" />
              <h3 className="text-lg font-semibold">
                {editingCertificate ? 'Edit Certificate' : 'Issue New Certificate'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!editingCertificate && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">User</label>
                      <select
                        value={formData.userId}
                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                        className={`w-full p-2 border rounded ${formErrors.userId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select User</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      {formErrors.userId && <p className="text-red-500 text-sm mt-1">{formErrors.userId}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Course</label>
                      <select
                        value={formData.courseId}
                        onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                        className={`w-full p-2 border rounded ${formErrors.courseId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      {formErrors.courseId && <p className="text-red-500 text-sm mt-1">{formErrors.courseId}</p>}
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Issued Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.issuedDate}
                      onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
                      className="w-full p-2 pl-8 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCertificate(null);
                    setFormData({
                      userId: '',
                      courseId: '',
                      issuedDate: ''
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
                  {editingCertificate ? 'Update' : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}