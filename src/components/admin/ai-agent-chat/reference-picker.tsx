"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export type ReferenceType = "course" | "user" | "certificate" | "testimonial" | "contact";

interface ReferencePickerProps {
  type: ReferenceType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedItems: any[]) => void;
}

export function ReferencePicker({
  type,
  open,
  onOpenChange,
  onSelect,
}: ReferencePickerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItemsMap, setSelectedItemsMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (open) {
      loadData();
    } else {
        // Reset selection when closed if needed
        setSelectedIds(new Set());
        setSelectedItemsMap(new Map());
        setSearch("");
        setPage(1);
    }
  }, [open, type]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [page, search]);

  const getEndpoint = () => {
    switch (type) {
      case "course":
        return "/api/admin/courses";
      case "user":
        return "/api/admin/users";
      case "certificate":
        return "/api/admin/certificates";
      case "testimonial":
        return "/api/admin/testimonials";
      case "contact":
        return "/api/admin/contacts";
      default:
        return "";
    }
  };

  const getColumns = () => {
    switch (type) {
      case "course":
        return [
            { key: "title", title: "Title" },
            { key: "category", title: "Category" },
            { key: "level", title: "Level" }
        ];
      case "user":
        return [
            { key: "name", title: "Name" },
            { key: "email", title: "Email" },
            { key: "role", title: "Role" }
        ];
      case "certificate":
        return [
            { key: "certificateNo", title: "Certificate No" },
            { key: "status", title: "Status" },
        ];
      case "testimonial":
        return [
            { key: "name", title: "Name" },
            { key: "role", title: "Role" },
            { key: "content", title: "Content", truncate: true }
        ];
      case "contact":
        return [
            { key: "name", title: "Name" },
            { key: "email", title: "Email" },
            { key: "subject", title: "Subject" }
        ];
      default:
        return [];
    }
  };

  const getDataKey = () => {
      switch (type) {
          case "course": return "courses";
          case "user": return "users";
          case "certificate": return "certificates";
          case "testimonial": return "testimonials";
          case "contact": return "contacts";
          default: return "data";
      }
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = getEndpoint();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
      });

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch data");

      const json = await res.json();
      const key = getDataKey();
      setData(json[key] || []);
      setPagination(json.pagination);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSelectionMap = (id: string, item: any, checked: boolean) => {
      const newMap = new Map(selectedItemsMap);
      if (checked) {
          // Sanitize item: pick only relevant fields to avoid sending too much data or sensitive data to AI
          const sanitizedItem = sanitizeItem(item);
          newMap.set(id, sanitizedItem);
      } else {
          newMap.delete(id);
      }
      setSelectedItemsMap(newMap);

      const newIds = new Set(selectedIds);
      if (checked) newIds.add(id); else newIds.delete(id);
      setSelectedIds(newIds);
  };

  const sanitizeItem = (item: any) => {
    // Basic sanitization: remove id, createdAt, updatedAt, passwords, etc.
    // Allow-list approach is safer but might be too restrictive if we want generic.
    // Let's remove obviously sensitive or useless fields.
    const { id, password, createdAt, updatedAt, instructorId, userId, courseId, ...rest } = item;

    // For nested objects like user/instructor, we might want to flatten or sanitize them too.
    // But simplistic approach is to just keep the rest.
    return rest;
  };

  const handleSelectAllPage = (checked: boolean) => {
      const newMap = new Map(selectedItemsMap);
      const newIds = new Set(selectedIds);

      data.forEach(item => {
          if (checked) {
              const sanitizedItem = sanitizeItem(item);
              newMap.set(item.id, sanitizedItem);
              newIds.add(item.id);
          } else {
              newMap.delete(item.id);
              newIds.delete(item.id);
          }
      });

      setSelectedItemsMap(newMap);
      setSelectedIds(newIds);
  };

  const handleConfirm = () => {
    const selectedList = Array.from(selectedItemsMap.values());
    onSelect(selectedList);
    onOpenChange(false);
  };

  const columns = getColumns();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select {type} to reference</DialogTitle>
          <DialogDescription>
            Choose one or more items to add to the context.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={data.length > 0 && data.every(item => selectedIds.has(item.id))}
                    onCheckedChange={(checked) => handleSelectAllPage(!!checked)}
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.title}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => updateSelectionMap(item.id, item, !!checked)}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.truncate ? "max-w-[200px] truncate" : ""}>
                        {/* Handle nested properties/objects if simple string */}
                        {typeof item[col.key] === 'object' ? JSON.stringify(item[col.key]) : item[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
                {selectedItemsMap.size} selected
            </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
                Page {page} {pagination && `of ${pagination.totalPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination || page >= pagination.totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={selectedItemsMap.size === 0}>
            Add Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
