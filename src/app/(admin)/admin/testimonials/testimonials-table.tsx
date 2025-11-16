"use client";

import { DataTable } from "@/components/ui/data-table";
import { Testimonial } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

/**
 * The columns for the testimonials table.
 *
 * @type {ColumnDef<Testimonial>[]}
 */
export const columns: ColumnDef<Testimonial>[] = [
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

/**
 * Renders a table of testimonials.
 *
 * @param { { initialData: Testimonial[] } } props - The component props.
 * @param {Testimonial[]} props.initialData - The initial data for the table.
 * @returns {JSX.Element} The rendered testimonials table.
 */
export default function TestimonialsTable({
  initialData,
}: {
  initialData: Testimonial[];
}) {
  return (
    <DataTable
      columns={columns}
      data={initialData}
      searchKey="name"
      searchPlaceholder="Search testimonials..."
    />
  );
}