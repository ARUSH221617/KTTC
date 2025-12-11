"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getBlogColumns, BlogPost } from "./columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BlogPostForm } from "./blog-post-form";

export default function BlogAdminPage() {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPosts = async ({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }) => {
    const response = await fetch(
      `/api/admin/blog?page=${page}&limit=${limit}&search=${search}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    const data = await response.json();
    return {
      data: data.posts,
      pagination: data.pagination,
    };
  };

  const handleAddPost = () => {
    setEditingPost(null);
    setShowSheet(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowSheet(true);
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Post deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
        return Promise.resolve();
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to delete post");
        return Promise.reject();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post");
      return Promise.reject();
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setShowSheet(open);
    if (!open) {
      setEditingPost(null);
    }
  };

  const handleFormSuccess = () => {
    setShowSheet(false);
    setRefreshTrigger((prev) => prev + 1);
    toast.success(editingPost ? "Post updated successfully" : "Post created successfully");
  };

  const columns = getBlogColumns(handleEditPost, handleDeletePost);

  return (
    <div className="p-6">
      <DataTable
        title="Blog Posts"
        columns={columns}
        fetchData={fetchPosts}
        onAdd={handleAddPost}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        addButtonLabel="New Post"
        searchPlaceholder="Search posts..."
        refreshTrigger={refreshTrigger}
      />

      <Sheet open={showSheet} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="flex flex-col h-full sm:max-w-4xl w-full">
          <SheetHeader>
            <SheetTitle>
              {editingPost ? "Edit Post" : "Create New Post"}
            </SheetTitle>
            <SheetDescription>
              {editingPost
                ? "Update the blog post details below."
                : "Fill in the details to create a new blog post."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
             <BlogPostForm
               initialData={editingPost}
               onSuccess={handleFormSuccess}
               onCancel={() => handleSheetOpenChange(false)}
             />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
