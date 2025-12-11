"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ui/image-upload";
import dynamic from "next/dynamic";
import { BlogPost } from "./columns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/ui/editor"), { ssr: false });

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryIds: z.array(z.string()).default([]),
  tags: z.string().optional(), // Comma separated string for input
});

type PostFormValues = z.infer<typeof postSchema>;

interface BlogPostFormProps {
  initialData: BlogPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
}

export function BlogPostForm({ initialData, onSuccess, onCancel }: BlogPostFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      published: false,
      metaTitle: "",
      metaDescription: "",
      categoryIds: [],
      tags: "",
    },
  });

  // Fetch full post details if editing
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (initialData?.id) {
        try {
          const res = await fetch(`/api/admin/blog/${initialData.id}`);
          if (res.ok) {
            const data = await res.json();
            form.reset({
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt || "",
              content: data.content,
              featuredImage: data.featuredImage || "",
              published: data.published,
              metaTitle: data.metaTitle || "",
              metaDescription: data.metaDescription || "",
              categoryIds: data.categories.map((c: any) => c.id),
              tags: data.tags.map((t: any) => t.name).join(", "),
            });
          }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch post details");
        }
      }
    };

    fetchPostDetails();
  }, [initialData, form]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
         const res = await fetch("/api/admin/categories");
         if(res.ok) {
             const data = await res.json();
             setCategories(data);
         }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!initialData) { // Only auto-generate slug for new posts
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        form.setValue("slug", slug);
    }
  };

  const onSubmit = async (data: PostFormValues) => {
    setLoading(true);
    try {
      const url = initialData
        ? `/api/admin/blog/${initialData.id}`
        : `/api/admin/blog`;

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Something went wrong");
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Post Title"
                    {...form.register("title")}
                    onChange={handleTitleChange}
                />
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    placeholder="post-slug"
                    {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
            </div>
        </div>

        <div className="space-y-2">
            <Label>Featured Image</Label>
            <Controller
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                    <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                    />
                )}
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
                id="excerpt"
                placeholder="Short summary for SEO and previews"
                className="h-20"
                {...form.register("excerpt")}
            />
        </div>

        <div className="space-y-2">
            <Label>Content</Label>
            <Controller
                control={form.control}
                name="content"
                render={({ field }) => (
                    <Editor
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
            {form.formState.errors.content && (
                <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 mb-2">
                {categories.map(cat => {
                    const selected = form.watch("categoryIds").includes(cat.id);
                    return (
                        <Badge
                            key={cat.id}
                            variant={selected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                                const current = form.getValues("categoryIds");
                                if (selected) {
                                    form.setValue("categoryIds", current.filter(id => id !== cat.id));
                                } else {
                                    form.setValue("categoryIds", [...current, cat.id]);
                                }
                            }}
                        >
                            {cat.name}
                        </Badge>
                    )
                })}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
                id="tags"
                placeholder="nextjs, react, seo"
                {...form.register("tags")}
            />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
                <Label htmlFor="metaTitle">SEO Meta Title</Label>
                <Input
                    id="metaTitle"
                    placeholder="Custom Title for Search Engines"
                    {...form.register("metaTitle")}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="metaDescription">SEO Meta Description</Label>
                <Textarea
                    id="metaDescription"
                    placeholder="Custom Description for Search Engines"
                    className="h-20"
                    {...form.register("metaDescription")}
                />
            </div>
        </div>

        <div className="flex items-center space-x-2">
            <Controller
                control={form.control}
                name="published"
                render={({ field }) => (
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="published"
                    />
                )}
            />
            <Label htmlFor="published">Publish immediately</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
        </Button>
        <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
