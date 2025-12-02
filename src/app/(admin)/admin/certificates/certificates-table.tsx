"use client";

import { DataTable } from "@/components/ui/data-table";
import { Certificate } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import React from "react";

// Define an extended Certificate type for API response that includes user and course objects
export interface CertificateWithRelations extends Omit<Certificate, 'holderName' | 'courseId' | 'issueDate'> {
  holderName?: string; // This might come from the certificate or from the user relation
  user: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    title: string;
  };
  issuedDate: string; // Using issuedDate as in the page
}

interface CertificatesTableProps {
  initialData: CertificateWithRelations[];
  onEdit?: (certificate: CertificateWithRelations) => void;
  onDelete?: (certificate: CertificateWithRelations) => void;
}

// Define the columns for the certificates table
export const columns: ColumnDef<CertificateWithRelations>[] = [
  {
    accessorKey: "certificateNo",
    header: "Certificate No",
    cell: ({ row }) => row.original.certificateNo || 'N/A'
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => row.original.user?.name || "N/A"
  },
  {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => row.original.course?.title || "N/A"
  },
  {
    accessorKey: "issuedDate",
    header: "Issued Date",
    cell: ({ row }) => {
      return new Date(row.original.issuedDate).toLocaleDateString();
    },
  },
  {
    accessorKey: "isValid",
    header: "Status",
    cell: ({ row }) => {
      const isValid = row.original.isValid;
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
      return new Date(row.original.createdAt).toLocaleDateString();
    },
  },
];

// Export columns as a function that can be used with admin data table
export function getCertificatesColumns(onEdit?: (certificate: CertificateWithRelations) => void, onDelete?: (certificate: CertificateWithRelations) => void) {
  // Base columns
  const baseColumns = [
    {
      key: 'certificateNo',
      title: 'Certificate No',
      render: (certificate: CertificateWithRelations) => certificate.certificateNo || 'N/A'
    },
    {
      key: 'user',
      title: 'User',
      render: (certificate: CertificateWithRelations) => certificate.user?.name || "N/A"
    },
    {
      key: 'course',
      title: 'Course',
      render: (certificate: CertificateWithRelations) => certificate.course?.title || "N/A"
    },
    {
      key: 'issuedDate',
      title: 'Issued Date',
      render: (certificate: CertificateWithRelations) => {
        return new Date(certificate.issuedDate).toLocaleDateString();
      },
    },
    {
      key: 'isValid',
      title: 'Status',
      render: (certificate: CertificateWithRelations) => {
        const isValid = certificate.isValid;
        return (
          <Badge variant={isValid ? "default" : "destructive"}>
            {isValid ? "Valid" : "Invalid"}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (certificate: CertificateWithRelations) => new Date(certificate.createdAt).toLocaleDateString()
    }
  ];

  // No need to add actions column manually as DataTable component handles it
  return baseColumns;
}

// Keep the original component for compatibility with client-side operations
export default function CertificatesTable({
  initialData,
  onEdit,
  onDelete
}: CertificatesTableProps) {
  // Add actions column if callbacks are provided
  const tableColumns = onDelete || onEdit
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }: { row: any }) => {
            const certificate = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(certificate)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(certificate)}
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

  return <DataTable columns={tableColumns} data={initialData} searchKey="holderName" searchPlaceholder="Search certificates..." />;
}