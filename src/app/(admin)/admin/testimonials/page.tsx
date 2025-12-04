'use client';

import { useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { toast } from 'sonner';
import { MessageSquare, Plus } from 'lucide-react';
import { getTestimonialsColumns } from './testimonials-table';
import { Testimonial } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import ImageUpload from '@/components/ui/image-upload';
import Editor from '@/components/ui/editor';

export default function AdminTestimonialsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    avatar: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchTestimonials = async ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    const response = await fetch(`/api/admin/testimonials?page=${page}&limit=${limit}&search=${search}`);
    if (!response.ok) {
      throw new Error('Failed to fetch testimonials');
    }
    const data = await response.json();
    return {
      data: data.testimonials,
      pagination: data.pagination
    };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (!formData.avatar) {
        errors.avatar = 'Avatar is required';
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
      const method = editingTestimonial ? 'PUT' : 'POST';
      const url = editingTestimonial
        ? `/api/admin/testimonials`
        : `/api/admin/testimonials`;

      const bodyData = editingTestimonial
        ? { id: editingTestimonial.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully`);
        setRefreshTrigger(prev => prev + 1);
        handleOpenChange(false);
      } else {
        toast.error(result.error || `Failed to ${editingTestimonial ? 'update' : 'create'} testimonial`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    }
  };

  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setFormData({ name: '', role: '', content: '', avatar: '' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      avatar: testimonial.avatar
    });
    setShowAddModal(true);
  };

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/admin/testimonials?id=${testimonial.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Testimonial deleted successfully');
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete testimonial');
        return Promise.reject();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('An error occurred while deleting the testimonial');
      return Promise.reject();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowAddModal(open);
    if (!open) {
      setEditingTestimonial(null);
      setFormData({ name: '', role: '', content: '', avatar: '' });
      setFormErrors({});
    }
  };

  // getTestimonialsColumns no longer needs arguments
  const columns = getTestimonialsColumns();

  return (
    <div className="p-6">
      <DataTable
        title="Testimonials"
        columns={columns}
        fetchData={fetchTestimonials}
        onAdd={handleAddTestimonial}
        onEdit={handleEditTestimonial}
        onDelete={handleDeleteTestimonial}
        addButtonLabel="Add Testimonial"
        searchPlaceholder="Search testimonials..."
        refreshTrigger={refreshTrigger}
      />

      <Sheet open={showAddModal} onOpenChange={handleOpenChange}>
        <SheetContent className="flex flex-col h-full sm:max-w-4xl w-full">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <SheetTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </SheetTitle>
            </div>
            <SheetDescription>
              {editingTestimonial ? 'Update the testimonial details below.' : 'Fill in the details to create a new testimonial.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <ImageUpload
                    value={formData.avatar}
                    onChange={(url) => setFormData({...formData, avatar: url})}
                />
                {formErrors.avatar && <p className="text-red-500 text-sm mt-1">{formErrors.avatar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className={`w-full p-2 border rounded ${formErrors.role ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter role (e.g. Software Engineer)"
                />
                {formErrors.role && <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Editor
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                />
                {formErrors.content && <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>}
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
                form="testimonial-form"
              >
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
