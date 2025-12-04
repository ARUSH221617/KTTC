'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { toast } from 'sonner';
import { Award, Calendar, Plus } from 'lucide-react';
import { getCertificatesColumns, CertificateWithRelations } from './certificates-table';
import { Button } from '@/components/ui/button';
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
  email: string;
}

interface Course {
  id: string;
  title: string;
}

export default function CertificatesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<CertificateWithRelations | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    certificateNo: '',
    userId: '',
    courseId: '',
    status: 'valid'
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
          setUsers(usersData.users || []);
        }

        // Fetch courses
        const coursesResponse = await fetch('/api/admin/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses || []);
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
    const data = await response.json();
    return {
      data: data.certificates,
      pagination: data.pagination
    };
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
            certificateNo: formData.certificateNo,
            status: formData.status
          }
        : {
            certificateNo: formData.certificateNo,
            userId: formData.userId,
            courseId: formData.courseId,
            status: formData.status
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Certificate ${editingCertificate ? 'updated' : 'created'} successfully`);
        setRefreshTrigger(prev => prev + 1);
        handleOpenChange(false);
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
      certificateNo: '',
      userId: '',
      courseId: '',
      status: 'valid'
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditCertificate = (certificate: CertificateWithRelations) => {
    setEditingCertificate(certificate);
    setFormData({
      certificateNo: certificate.certificateNo || '',
      userId: certificate.user.id,
      courseId: certificate.course.id,
      status: certificate.status || 'valid'
    });
    setShowAddModal(true);
  };

  const handleDeleteCertificate = async (certificate: CertificateWithRelations) => {
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

  const handleOpenChange = (open: boolean) => {
    setShowAddModal(open);
    if (!open) {
      setEditingCertificate(null);
      setFormData({
        certificateNo: '',
        userId: '',
        courseId: '',
        status: 'valid'
      });
      setFormErrors({});
    }
  };

  const columns = getCertificatesColumns(handleEditCertificate, handleDeleteCertificate);

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
        refreshTrigger={refreshTrigger}
      />

      <Sheet open={showAddModal} onOpenChange={handleOpenChange}>
        <SheetContent className="flex flex-col h-full sm:max-w-lg w-full">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <SheetTitle>
                {editingCertificate ? 'Edit Certificate' : 'Issue New Certificate'}
              </SheetTitle>
            </div>
            <SheetDescription>
              {editingCertificate ? 'Update the certificate details below.' : 'Fill in the details to issue a new certificate.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            <form id="certificate-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Certificate No (Optional)</label>
                <input
                  type="text"
                  value={formData.certificateNo}
                  onChange={(e) => setFormData({...formData, certificateNo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter certificate number"
                />
              </div>

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
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="valid"
                      checked={formData.status === 'valid'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    />
                    Valid
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="invalid"
                      checked={formData.status === 'invalid'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    />
                    Invalid
                  </label>
                </div>
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
              <Button
                type="submit"
                form="certificate-form"
              >
                {editingCertificate ? 'Update' : 'Issue'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
