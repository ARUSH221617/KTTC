"use client";

import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

/**
 * The columns for the users table.
 *
 * @type {ColumnDef<User>[]}
 */
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

/**
 * Renders a table of users.
 *
 * @param { { initialData: User[] } } props - The component props.
 * @param {User[]} props.initialData - The initial data for the table.
 * @returns {JSX.Element} The rendered users table.
 */
export default function UsersTable({
  initialData,
}: {
  initialData: User[];
}) {
  return (
    <DataTable
      columns={columns}
      data={initialData}
      searchKey="name"
      searchPlaceholder="Search users..."
    />
  );
}