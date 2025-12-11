import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  published: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tags: z.string().optional(), // "tag1, tag2"
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { title: { contains: search } }, // mode: 'insensitive' removed for sqlite compat if needed, but we are on PG.
        // But memory says "Prisma queries using contains filters must avoid mode: 'insensitive' to ensure compatibility across different database providers if strict mode is active."
        // I will stick to simple contains or handle case manually if needed.
        // Actually, for PG we usually want insensitive. But I'll follow memory.
        { slug: { contains: search } },
      ],
    };

    // If using PG, mode: 'insensitive' is fine. But I'll check if I can use it.
    // Given the memory warning, I'll omit it to be safe or assuming the project uses a specific config.
    // However, usually search is case insensitive. I'll rely on default behavior or basic contains.

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true } },
          categories: true,
        },
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[BLOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const body = postCreateSchema.parse(json);

    // Handle tags
    const tagNames = body.tags
        ? body.tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
        : [];

    // Process tags: find existing or create new
    // Transaction-like behavior with connectOrCreate
    const tagsConnect = [];
    for (const name of tagNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        tagsConnect.push({
            where: { slug },
            create: { name, slug },
        });
    }

    const post = await db.post.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage,
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        authorId: session.user.id,
        categories: {
          connect: body.categoryIds?.map(id => ({ id })) || [],
        },
        tags: {
          connectOrCreate: tagsConnect
        }
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("[BLOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
