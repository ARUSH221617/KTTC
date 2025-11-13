"use client";

import { DataTable } from "@/components/ui/data-table";
import { Course } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import React from "react";

// Define the columns for the courses table
export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {row.getValue("category")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.getValue("level")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "instructor",
    header: "Instructor",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

export default function CoursesTable({ 
  initialData 
}: { 
  initialData: Course[] 
}) {
  return <DataTable columns={columns} data={initialData} searchKey="title" searchPlaceholder="Search courses..." />;
}