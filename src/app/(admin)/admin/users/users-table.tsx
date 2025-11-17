"use client";

import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface UsersTableProps {
  initialData: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

// Define the columns for the users table
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const userRole = row.original.role || 'user';
      return (
        <Badge variant={userRole === 'admin' ? 'destructive' : 'default'}>
          {userRole}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

// Export columns as a function that can be used with admin data table
export function getUsersColumns(onEdit?: (user: User) => void, onDelete?: (user: User) => void) {
  // Base columns
  const baseColumns = [
    {
      key: 'name',
      title: 'Name',
      render: (user: User) => user.name || 'N/A'
    },
    {
      key: 'email',
      title: 'Email',
      render: (user: User) => (
        <span className="text-blue-600">{user.email}</span>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (user: User) => {
        const userRole = user.role || 'user';
        return (
          <Badge variant={userRole === 'admin' ? 'destructive' : 'default'}>
            {userRole}
          </Badge>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    }
  ];

  // Add actions column if callbacks are provided
  if (onDelete || onEdit) {
    return [
      ...baseColumns,
      {
        key: 'actions',
        title: 'Actions',
        render: (user: User) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ];
  }

  return baseColumns;
}

// Keep the original component for compatibility with client-side operations
export default function UsersTable({ initialData, onEdit, onDelete }: UsersTableProps) {
  // Add actions column if callbacks are provided
  const tableColumns = onDelete || onEdit
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => {
            const user = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ]
    : columns;

  return <DataTable columns={tableColumns} data={initialData} searchKey="name" searchPlaceholder="Search users..." />;
}