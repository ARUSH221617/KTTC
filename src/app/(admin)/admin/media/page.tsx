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
  Pencil
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

  // Rename state
  const [renamingBlob, setRenamingBlob] = useState<MediaBlob | null>(null);
  const [newFilename, setNewFilename] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      setBlobs(data.blobs);
    } catch (error) {
      toast.error("Error fetching media files");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

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
      setBlobs((prev) => prev.filter((b) => b.url !== url));
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
      fetchMedia(); // Refresh to see changes
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
      fetchMedia();
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

    // Check if filename changed
    if (newFilename === renamingBlob.pathname) {
        setRenamingBlob(null);
        return;
    }

    try {
        setProcessing(renamingBlob.url);
        setRenamingBlob(null); // Close dialog immediately

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
        fetchMedia();
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
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  }

  const isWebP = (pathname: string) => pathname.toLowerCase().endsWith('.webp');

  if (loading) {
      return (
          <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <Badge variant="secondary">{blobs.length} files</Badge>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {blobs.map((blob) => (
          <Card key={blob.url} className="overflow-hidden flex flex-col group relative rounded-xl shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                {isImage(blob.pathname) ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={blob.url}
                        alt={blob.pathname}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                        <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                )}

                {/* Usage Badge Overlay */}
                {blob.usage.count > 0 && (
                    <div className="absolute top-2 right-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700 shadow-sm">
                                        Used {blob.usage.count}x
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
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

            <CardContent className="p-4 flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="truncate font-medium text-base text-gray-900" title={blob.pathname}>
                      {blob.pathname}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
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
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{formatSize(blob.size)}</span>
                  <span>{format(new Date(blob.uploadedAt), "MMM d, yyyy")}</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between items-center gap-2 mt-auto">
                <div className="flex gap-2 items-center">
                    {/* Download Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
                                    variant="outline"
                                    onClick={() => triggerReplace(blob.url)}
                                    disabled={!!processing}
                                    className="h-9 w-9 rounded-full border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
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
                                        variant="outline"
                                        onClick={() => handleOptimize(blob.url)}
                                        disabled={!!processing}
                                        className="h-9 w-9 rounded-full border-gray-200 text-blue-500 hover:text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
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
                            variant="destructive"
                            disabled={!!processing}
                            className="h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 shadow-sm"
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

        {blobs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                <p>No media files found.</p>
            </div>
        )}
      </div>

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
