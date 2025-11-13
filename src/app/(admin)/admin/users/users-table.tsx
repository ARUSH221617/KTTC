"use client";

import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

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
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

export default function UsersTable({ 
  initialData 
}: { 
  initialData: User[] 
}) {
  return <DataTable columns={columns} data={initialData} searchKey="name" searchPlaceholder="Search users..." />;
}