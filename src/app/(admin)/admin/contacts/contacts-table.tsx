"use client";

import { DataTable } from "@/components/ui/data-table";
import { Contact } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

/**
 * The columns for the contacts table.
 *
 * @type {ColumnDef<Contact>[]}
 */
export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subject",
    header: "Subject",
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
 * Renders a table of contacts.
 *
 * @param { { initialData: Contact[] } } props - The component props.
 * @param {Contact[]} props.initialData - The initial data for the table.
 * @returns {JSX.Element} The rendered contacts table.
 */
export default function ContactsTable({
  initialData,
}: {
  initialData: Contact[];
}) {
  return (
    <DataTable
      columns={columns}
      data={initialData}
      searchKey="name"
      searchPlaceholder="Search contacts..."
    />
  );
}