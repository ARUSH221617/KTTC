'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/data-table';
import { toast } from 'sonner';
import { User as UserIcon, Plus } from 'lucide-react';
import { getUsersColumns } from './users-table';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export default function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchUsers = async ({ page, limit, search }: { page: number; limit: number; search: string }) => {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${search}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return {
      data: data.users,
      pagination: data.pagination
    };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
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
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser
        ? `/api/admin/users`
        : `/api/admin/users`;

      const bodyData = editingUser
        ? { id: editingUser.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
        handleOpenChange(false);
      } else {
        toast.error(result.error || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'user' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role
    });
    setShowAddModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete user');
        return Promise.reject();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting the user');
      return Promise.reject();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowAddModal(open);
    if (!open) {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'user' });
      setFormErrors({});
    }
  };

  const columns = getUsersColumns(handleEditUser, handleDeleteUser);

  return (
    <div className="p-6">
      <DataTable
        title="Users"
        columns={columns}
        fetchData={fetchUsers}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        addButtonLabel="Add User"
        searchPlaceholder="Search users..."
      />

      <Sheet open={showAddModal} onOpenChange={handleOpenChange}>
        <SheetContent className="flex flex-col h-full sm:max-w-lg w-full">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <SheetTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </SheetTitle>
            </div>
            <SheetDescription>
              {editingUser ? 'Update the user details below.' : 'Fill in the details to create a new user.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter user name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full p-2 border rounded ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter user email"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
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
                form="user-form"
              >
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
