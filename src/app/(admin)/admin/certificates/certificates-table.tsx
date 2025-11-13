"use client";

import { DataTable } from "@/components/ui/data-table";
import { Certificate } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import React from "react";

// Define the columns for the certificates table
export const columns: ColumnDef<Certificate>[] = [
  {
    accessorKey: "certificateNo",
    header: "Certificate No",
  },
  {
    accessorKey: "holderName",
    header: "Holder Name",
  },
  {
    accessorKey: "course.title",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.course;
      return course?.title || "N/A";
    },
  },
  {
    accessorKey: "issueDate",
    header: "Issue Date",
    cell: ({ row }) => {
      return new Date(row.getValue("issueDate")).toLocaleDateString();
    },
  },
  {
    accessorKey: "isValid",
    header: "Status",
    cell: ({ row }) => {
      const isValid = row.getValue("isValid") as boolean;
      return (
        <Badge variant={isValid ? "default" : "destructive"}>
          {isValid ? "Valid" : "Invalid"}
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

export default function CertificatesTable({ 
  initialData 
}: { 
  initialData: Certificate[] 
}) {
  return <DataTable columns={columns} data={initialData} searchKey="holderName" searchPlaceholder="Search certificates..." />;
}