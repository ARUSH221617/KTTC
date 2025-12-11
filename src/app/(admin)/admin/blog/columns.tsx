"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  author: {
    name: string | null;
  };
  categories: {
    id: string;
    name: string;
  }[];
  views?: number;
};

export const getBlogColumns = (
  onEdit: (post: BlogPost) => void,
  onDelete: (post: BlogPost) => Promise<void>
) => [
  {
    key: "title",
    title: "Title",
    className: "w-[30%]",
    render: (post: BlogPost) => (
      <div className="flex flex-col">
        <span className="font-medium line-clamp-1">{post.title}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">{post.slug}</span>
      </div>
    ),
  },
  {
    key: "author",
    title: "Author",
    className: "w-[15%]",
    render: (post: BlogPost) => post.author.name || "Unknown",
  },
  {
    key: "status",
    title: "Status",
    className: "w-[10%]",
    render: (post: BlogPost) => (
      <Badge variant={post.published ? "default" : "secondary"}>
        {post.published ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    key: "categories",
    title: "Categories",
    className: "w-[20%]",
    render: (post: BlogPost) => (
      <div className="flex flex-wrap gap-1">
        {post.categories.slice(0, 2).map((cat) => (
          <Badge key={cat.id} variant="outline" className="text-xs">
            {cat.name}
          </Badge>
        ))}
        {post.categories.length > 2 && (
          <span className="text-xs text-muted-foreground">+{post.categories.length - 2}</span>
        )}
      </div>
    ),
  },
  {
    key: "publishedAt",
    title: "Date",
    className: "w-[15%]",
    render: (post: BlogPost) =>
      post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "-",
  },
];
