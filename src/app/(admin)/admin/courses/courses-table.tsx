"use client";

import { DataTable } from "@/components/ui/data-table";
import { Course } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react";
import React from "react";

// Define an extended Course type for API response that includes instructor object and price
interface CourseWithInstructor extends Omit<Course, 'instructor'> {
  instructor: {
    id: string;
    name: string;
  };
  price: number;
}

interface CoursesTableProps {
  initialData: CourseWithInstructor[];
  onEdit?: (course: CourseWithInstructor) => void;
  onDelete?: (course: CourseWithInstructor) => void;
}

// Define the columns for the courses table
export const columns: ColumnDef<CourseWithInstructor>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.title}</div>
    )
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
    cell: ({ row }) => row.original.instructor?.name || "N/A"
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price || 0;
      return (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
          {price.toFixed(2)}
        </div>
      );
    }
  },
  {
    accessorKey: "duration",
    header: "Duration",
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
export function getCoursesColumns(onEdit?: (course: CourseWithInstructor) => void, onDelete?: (course: CourseWithInstructor) => void) {
  // Base columns
  const baseColumns = [
    {
      key: 'title',
      title: 'Title',
      render: (course: CourseWithInstructor) => (
        <div className="font-medium">{course.title}</div>
      )
    },
    {
      key: 'instructor',
      title: 'Instructor',
      render: (course: CourseWithInstructor) => course.instructor?.name || "N/A"
    },
    {
      key: 'price',
      title: 'Price',
      render: (course: CourseWithInstructor) => {
        const price = course.price || 0;
        return (
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            {price.toFixed(2)}
          </div>
        );
      }
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (course: CourseWithInstructor) => course.duration
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (course: CourseWithInstructor) => new Date(course.createdAt).toLocaleDateString()
    }
  ];

  // No need to add actions column manually as DataTable component handles it
  return baseColumns;
}

// Keep the original component for compatibility with client-side operations
export default function CoursesTable({ initialData, onEdit, onDelete }: CoursesTableProps) {
  // Add actions column if callbacks are provided
  const tableColumns = onDelete || onEdit
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => {
            const course = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(course)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(course)}
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

  return <DataTable columns={tableColumns} data={initialData} searchKey="title" searchPlaceholder="Search courses..." />;
}