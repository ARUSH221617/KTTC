"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Search,
  Plus,
  Download,
  Trash2, 
  Edit,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Filter definition interface.
 */
interface Filter {
  /** The key in the data object to filter by. */
  key: string;
  /** The display title for the filter. */
  title: string;
  /** Options for the filter dropdown. */
  options: { label: string; value: string }[];
}

/**
 * Column definition interface.
 */
interface Column<T> {
  /** The key in the data object to display. */
  key: string;
  /** The display title for the column header. */
  title: string;
  /** Optional class names for the column. */
  className?: string;
  /** Optional custom render function for the cell content. */
  render?: (item: T) => React.ReactNode;
}

/**
 * Props for the DataTable component.
 */
interface DataTableProps<T> {
  /** The title of the data table. */
  title: string;
  /** Configuration for the columns. */
  columns: Column<T>[];
  /** Configuration for the filters. */
  filters?: Filter[];
  /** Function to fetch data from the API. */
  fetchData: (params: any) => Promise<{ data: T[]; pagination: any }>;
  /** Callback function when the "View" action is clicked. */
  onView?: (item: T) => void;
  /** Callback function when the "Edit" action is clicked. */
  onEdit?: (item: T) => void;
  /** Callback function when the "Delete" action is clicked. */
  onDelete?: (item: T) => Promise<void>;
  /** Callback function when the "Add" button is clicked. */
  onAdd?: () => void;
  /** Label for the "Add" button. */
  addButtonLabel?: string;
  /** Callback function when the "Export" button is clicked. */
  exportData?: () => void;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
}

/**
 * A reusable data table component with search, filtering, pagination, and actions.
 *
 * @template T The type of the data items.
 * @param {DataTableProps<T>} props - The component props.
 * @returns {JSX.Element} The rendered data table.
 */
export function DataTable<T extends { id: string }>({
  title,
  columns,
  filters = [],
  fetchData,
  onView,
  onEdit,
  onDelete,
  onAdd,
  addButtonLabel = "Add New",
  exportData,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // Initial load
  useEffect(() => {
    loadData();
  }, [page, limit, search, selectedFilters]);

  /**
   * Loads data from the API based on current state (search, pagination, filters).
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        ...selectedFilters,
      };
      const response = await fetchData(params);
      setData(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search input changes with debounce.
   * @param {string} value - The new search value.
   */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  /**
   * Handles filter changes.
   * @param {string} key - The filter key.
   * @param {string} value - The selected filter value.
   */
  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
    setPage(1); // Reset to first page on filter change
  };

  /**
   * Initiates the delete confirmation process.
   * @param {T} item - The item to delete.
   */
  const handleDeleteItem = (item: T) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  /**
   * Confirms and executes the deletion of an item.
   */
  const confirmDelete = async () => {
    if (itemToDelete && onDelete) {
      try {
        await onDelete(itemToDelete);
        toast.success('Item deleted successfully');
        // Reload data after deletion
        const params = {
          page,
          limit,
          search,
          ...selectedFilters,
        };
        const response = await fetchData(params);
        setData(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  /**
   * Renders the content of a table cell.
   * @param {T} item - The data item.
   * @param {Column<T>} column - The column definition.
   * @returns {React.ReactNode} The rendered cell content.
   */
  const renderCell = (item: T, column: any) => {
    if (column.render) {
      return column.render(item);
    }
    
    return (item as any)[column.key];
  };

  const hasActions = onEdit || onDelete || onView;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            Manage and view your {title.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {exportData && (
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {filters.map((filter) => (
          <div key={filter.key} className="w-full sm:w-auto">
            <Select
              value={selectedFilters[filter.key] || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={`Filter by ${filter.title}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {filter.title}s</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.title}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item: any, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={`${item.id || index}-${column.key}`} className={column.className}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="h-24 text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {/* Show page numbers with ellipsis for large page counts */}
              {pagination.totalPages <= 7 ? (
                Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                <>
                  {page > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                      </PaginationItem>
                      {page > 4 && (
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )}
                    </>
                  )}
                  
                  {Array.from({ length: 5 }, (_, i) => {
                    const pageNum = Math.max(2, Math.min(pagination.totalPages - 1, page - 2 + i));
                    return pageNum;
                  })
                  .filter((pageNum) => pageNum >= 2 && pageNum <= pagination.totalPages - 1)
                  .map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {page < pagination.totalPages - 2 && (
                    <>
                      {page < pagination.totalPages - 3 && (
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink onClick={() => setPage(pagination.totalPages)}>
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  className={page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
