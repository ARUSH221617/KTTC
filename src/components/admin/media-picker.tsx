"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import {
  Loader2,
  Image as ImageIcon,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
  const [blobs, setBlobs] = useState<MediaBlob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [nextPageCursor, setNextPageCursor] = useState<string | undefined>(undefined);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCursor(undefined);
      setHistory([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load media when dialog opens or params change
  useEffect(() => {
    if (open) {
        fetchMedia();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cursor, debouncedSearch]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (cursor) params.append("cursor", cursor);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "12"); // Smaller grid for modal

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch media");

      const data = await res.json();
      setBlobs(data.blobs);
      setHasMore(data.hasMore);
      setNextPageCursor(data.nextCursor);
    } catch (error) {
      toast.error("Error fetching media files");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      toast.success("File uploaded successfully");

      // Refresh list and select the new file
      setSelectedUrl(newBlob.url);
      fetchMedia();
      // Switch back to library tab if using tabs, but we are inside the picker
      // Maybe immediately select it?
      onSelect(newBlob.url);
      onOpenChange(false);

    } catch (error) {
      console.error(error);
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const filteredBlobs = blobs.filter(blob => {
      if (filterType === 'all') return true;
      if (filterType === 'image') return isImage(blob.pathname);
      if (filterType === 'document') return !isImage(blob.pathname);
      return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
                <DialogTitle>Media Library</DialogTitle>
                <DialogDescription>
                    Select an image from the library or upload a new one.
                </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b flex items-center justify-between bg-gray-50/50">
                    <TabsList className="bg-transparent p-0 gap-4">
                        <TabsTrigger value="library" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">Library</TabsTrigger>
                        <TabsTrigger value="upload" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-2">Upload New</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden p-0 m-0 data-[state=inactive]:hidden">
                    <div className="p-4 border-b flex gap-4 bg-white">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Files</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="document">Documents</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                        {loading ? (
                             <div className="flex h-full w-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                             </div>
                        ) : filteredBlobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                                <p>No media files found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredBlobs.map((blob) => (
                                    <div
                                        key={blob.url}
                                        className={`group relative aspect-[4/3] rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedUrl === blob.url ? 'ring-2 ring-primary ring-offset-2 border-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setSelectedUrl(blob.url)}
                                    >
                                        {isImage(blob.pathname) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={blob.url}
                                                alt={blob.pathname}
                                                className="object-cover w-full h-full"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-white">
                                                <FileText className="h-10 w-10 text-slate-300" />
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs truncate">{blob.pathname}</p>
                                        </div>

                                        {selectedUrl === blob.url && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-white flex justify-between items-center">
                         <div className="flex gap-2">
                             <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={history.length === 0 || loading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={!hasMore || loading}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                         </div>
                         <div className="flex gap-2">
                             <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                             <Button disabled={!selectedUrl} onClick={() => {
                                 if (selectedUrl) {
                                     onSelect(selectedUrl);
                                     onOpenChange(false);
                                 }
                             }}>
                                 Select Media
                             </Button>
                         </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center p-12 data-[state=inactive]:hidden">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleUpload}
                        accept="image/*" // Restrict to images for now as it's mostly for thumbnails/avatars
                    />
                    <div
                        className="w-full max-w-md aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Upload className="h-12 w-12 opacity-20" />
                                <div className="text-center">
                                    <p className="font-medium text-foreground">Click to upload</p>
                                    <p className="text-sm">or drag and drop</p>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
  );
}
