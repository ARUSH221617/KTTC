"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import {
  Trash2,
  RefreshCw,
  Zap,
  Loader2,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Download,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface MediaBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  usage: {
    count: number;
    locations: string[];
  };
}

export default function MediaPage() {
  const [blobs, setBlobs] = useState<MediaBlob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null); // url being processed
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // Rename state
  const [renamingBlob, setRenamingBlob] = useState<MediaBlob | null>(null);
  const [newFilename, setNewFilename] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCursor(undefined); // Reset cursor on search change
      setHistory([]); // Reset history on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMedia = async (currentCursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentCursor) params.append("cursor", currentCursor);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "24"); // 6x4 or 4x6 grid friendly

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch media");

      const data = await res.json();
      setBlobs(data.blobs);
      setHasMore(data.hasMore);

      // If we have a next cursor, we can update our state to know where to go next
      // But for "Next" button, we need to store the cursor returned by API
      // Actually the API returns `nextCursor`.
      // We'll store it in a way that the Next button can use it.
      // But wait, the API returns `nextCursor` which IS the cursor for the next page.
      // So we need to store `nextCursor` in a ref or state to use when clicking "Next".
      // Let's use a state for `nextPageCursor`.

    } catch (error) {
      toast.error("Error fetching media files");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // We need to store the next cursor returned by the API
  const [nextPageCursor, setNextPageCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cursor) params.append("cursor", cursor);
        if (debouncedSearch) params.append("search", debouncedSearch);
        params.append("limit", "24");

        const res = await fetch(`/api/admin/media?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch media");
        const data = await res.json();
        setBlobs(data.blobs);
        setHasMore(data.hasMore);
        setNextPageCursor(data.nextCursor);
      } catch (error) {
        toast.error("Error fetching media");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cursor, debouncedSearch]);


  const handleNextPage = () => {
    if (nextPageCursor) {
      setHistory((prev) => [...prev, cursor || ""]);
      setCursor(nextPageCursor);
    }
  };

  const handlePrevPage = () => {
    if (history.length > 0) {
      const prevCursor = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor === "" ? undefined : prevCursor);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      setProcessing(url);
      const res = await fetch("/api/admin/media/actions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("File deleted successfully");
      // Refetch current page to handle pagination correctly
      // setBlobs((prev) => prev.filter((b) => b.url !== url)); // This leaves a hole if we don't refetch
      const params = new URLSearchParams();
      if (cursor) params.append("cursor", cursor);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "24");
      const r = await fetch(`/api/admin/media?${params.toString()}`);
      if(r.ok) {
          const d = await r.json();
          setBlobs(d.blobs);
          setHasMore(d.hasMore);
          setNextPageCursor(d.nextCursor);
      }
    } catch (error) {
      toast.error("Error deleting file");
    } finally {
      setProcessing(null);
    }
  };

  const handleOptimize = async (url: string) => {
    try {
      setProcessing(url);
      const res = await fetch("/api/admin/media/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "optimize", url }),
      });

      if (!res.ok) throw new Error("Failed to optimize");
      const data = await res.json();

      toast.success("Image optimized to WebP");
      // Refreshing the whole list might be overkill, maybe just update the item?
      // But the URL might change if it was replaced (though optimize keeps URL usually? No, it replaces content).
      // If extension changes, URL changes? Vercel Blob URLs are immutable.
      // The optimize action likely uploads a NEW blob and replaces references.
      // So we should refresh.
      setCursor(undefined);
      setHistory([]);
      // Trigger reload
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "24");
      const r = await fetch(`/api/admin/media?${params.toString()}`);
      if(r.ok) {
          const d = await r.json();
          setBlobs(d.blobs);
          setHasMore(d.hasMore);
          setNextPageCursor(d.nextCursor);
      }
    } catch (error) {
      toast.error("Error optimizing image");
    } finally {
      setProcessing(null);
    }
  };

  const triggerReplace = (url: string) => {
    setReplaceTarget(url);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    try {
      setProcessing(replaceTarget);
      toast.info("Uploading replacement file...");

      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      toast.info("Updating references...");

      const res = await fetch("/api/admin/media/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "replace_confirm",
          oldUrl: replaceTarget,
          newUrl: newBlob.url,
        }),
      });

      if (!res.ok) throw new Error("Failed to update references");

      toast.success("File replaced successfully");
      // Refresh current page
      const params = new URLSearchParams();
      if (cursor) params.append("cursor", cursor);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "24");
      const r = await fetch(`/api/admin/media?${params.toString()}`);
      if(r.ok) {
          const d = await r.json();
          setBlobs(d.blobs);
          setHasMore(d.hasMore);
          setNextPageCursor(d.nextCursor);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error replacing file");
    } finally {
      setProcessing(null);
      setReplaceTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRenameClick = (blob: MediaBlob) => {
    setRenamingBlob(blob);
    setNewFilename(blob.pathname);
  };

  const handleRenameSubmit = async () => {
    if (!renamingBlob || !newFilename.trim()) return;

    if (newFilename === renamingBlob.pathname) {
        setRenamingBlob(null);
        return;
    }

    try {
        setProcessing(renamingBlob.url);
        setRenamingBlob(null);

        const res = await fetch("/api/admin/media/actions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "rename",
                url: renamingBlob.url,
                newFilename: newFilename.trim()
            }),
        });

        if (!res.ok) throw new Error("Failed to rename");

        const data = await res.json();

        toast.success("File renamed successfully");
        // Refresh
        const params = new URLSearchParams();
        if (cursor) params.append("cursor", cursor);
        if (debouncedSearch) params.append("search", debouncedSearch);
        params.append("limit", "24");
        const r = await fetch(`/api/admin/media?${params.toString()}`);
        if(r.ok) {
            const d = await r.json();
            setBlobs(d.blobs);
            setHasMore(d.hasMore);
            setNextPageCursor(d.nextCursor);
        }
    } catch (error) {
        console.error(error);
        toast.error("Error renaming file");
    } finally {
        setProcessing(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImage = (pathname: string) => {
      const ext = pathname.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext || '');
  }

  const isWebP = (pathname: string) => pathname.toLowerCase().endsWith('.webp');

  const filteredBlobs = blobs.filter(blob => {
      if (filterType === 'all') return true;
      if (filterType === 'image') return isImage(blob.pathname);
      if (filterType === 'document') return !isImage(blob.pathname); // Simple fallback
      return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your files and media assets</p>
        </div>
        <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-base px-3 py-1">{filteredBlobs.length} shown</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
              </Select>
          </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {loading ? (
          <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredBlobs.map((blob) => (
                <Card key={blob.url} className="overflow-hidden py-0 flex flex-col group relative rounded-xl shadow-sm border-gray-200 bg-white hover:shadow-md transition-all hover:border-gray-300">
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                        {isImage(blob.pathname) ? (
                            <Image
                                src={blob.url}
                                alt={blob.pathname}
                                fill
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-slate-50">
                                <FileText className="h-16 w-16 text-slate-300" />
                            </div>
                        )}

                        {/* Usage Badge Overlay */}
                        {blob.usage.count > 0 && (
                            <div className="absolute top-2 right-2 z-10">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-green-700 hover:bg-white border-green-200 shadow-sm">
                                                Used {blob.usage.count}x
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                            <ul className="list-disc pl-4 text-xs">
                                                {blob.usage.locations.slice(0, 5).map((loc, i) => (
                                                    <li key={i}>{loc}</li>
                                                ))}
                                                {blob.usage.locations.length > 5 && <li>...and more</li>}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>

                    <CardContent className="px-3 py-1.5 flex-1 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="truncate font-medium text-sm text-gray-900 leading-tight" title={blob.pathname}>
                            {blob.pathname}
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 -mr-2 -mt-1 hover:bg-transparent hover:text-primary"
                                        onClick={() => handleRenameClick(blob)}
                                        disabled={!!processing}
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rename</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-auto pt-2">
                        <span>{formatSize(blob.size)}</span>
                        <span>{format(new Date(blob.uploadedAt), "MMM d, yyyy")}</span>
                    </div>
                    </CardContent>

                    <CardFooter className="p-3 pt-0 flex justify-between items-center gap-2 mt-auto border-t border-gray-50 bg-gray-50/50">
                        <div className="flex gap-1 items-center">
                            {/* Download Button */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                            asChild
                                        >
                                            <a href={blob.url} download target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Replace Button */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => triggerReplace(blob.url)}
                                            disabled={!!processing}
                                            className="h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Replace File</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Optimize Button (Conditional) */}
                            {isImage(blob.pathname) && !isWebP(blob.pathname) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleOptimize(blob.url)}
                                                disabled={!!processing}
                                                className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                                            >
                                                {processing === blob.url ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Zap className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Convert to WebP</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* Delete Button */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={!!processing}
                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete File?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone.
                                        {blob.usage.count > 0 && (
                                            <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 font-semibold">
                                                <AlertCircle className="h-4 w-4" />
                                                Warning: This file is used in {blob.usage.count} place(s)!
                                            </div>
                                        )}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(blob.url)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
                ))}
            </div>

            {filteredBlobs.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                    <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p>No media files found.</p>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t mt-6">
                <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={history.length === 0 || loading}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    {/* Optional: Show page number if we track it, but simpler to just show navigation */}
                </div>
                <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!hasMore || loading}
                    className="gap-2"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </>
      )}

      <Dialog open={!!renamingBlob} onOpenChange={(open) => !open && setRenamingBlob(null)}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Rename File</DialogTitle>
                <DialogDescription>
                    Enter a new name for the file. This will update all references to this file.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="filename" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="filename"
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setRenamingBlob(null)}>Cancel</Button>
                <Button onClick={handleRenameSubmit} disabled={!newFilename.trim() || newFilename === renamingBlob?.pathname}>
                    Save changes
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
