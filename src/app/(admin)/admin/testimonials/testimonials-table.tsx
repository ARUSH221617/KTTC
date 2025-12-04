"use client";

import { DataTable } from "@/components/admin/data-table";
import { Testimonial } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialsTableProps {
  initialData: Testimonial[];
  onEdit?: (testimonial: Testimonial) => void;
  onDelete?: (testimonial: Testimonial) => void;
}

// Define the columns for the testimonials table
export const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const avatar = row.getValue("avatar") as string;
      const name = row.getValue("name") as string;
      return (
        <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      );
    }
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const content = row.getValue("content") as string;
      return (
        <div className="max-w-md truncate">
          {content.length > 50 ? content.substring(0, 50) + "..." : content}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

export function getTestimonialsColumns() {
    // Base columns
    const baseColumns = [
        {
          key: 'avatar',
          title: 'Avatar',
          render: (testimonial: Testimonial) => (
            <Avatar>
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )
        },
        {
          key: 'name',
          title: 'Name',
          render: (testimonial: Testimonial) => testimonial.name
        },
        {
          key: 'role',
          title: 'Role',
          render: (testimonial: Testimonial) => testimonial.role
        },
        {
          key: 'content',
          title: 'Content',
          render: (testimonial: Testimonial) => (
            <div className="max-w-md truncate" title={testimonial.content}>
              {testimonial.content.length > 50 ? testimonial.content.substring(0, 50) + "..." : testimonial.content}
            </div>
          )
        },
        {
          key: 'createdAt',
          title: 'Date',
          render: (testimonial: Testimonial) => new Date(testimonial.createdAt).toLocaleDateString()
        }
    ];

    return baseColumns;
}

export default function TestimonialsTable({ initialData, onEdit, onDelete }: TestimonialsTableProps) {
  // Add actions column if callbacks are provided
  const tableColumns = onDelete || onEdit
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => {
            const testimonial = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(testimonial)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(testimonial)}
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

  return <DataTable columns={tableColumns} data={initialData} searchKey="name" searchPlaceholder="Search testimonials..." />;
}
