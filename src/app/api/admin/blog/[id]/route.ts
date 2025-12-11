import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postUpdateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  published: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tags: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await db.post.findUnique({
      where: { id: params.id },
      include: {
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_GET_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const body = postUpdateSchema.parse(json);

    // Handle tags
    const tagNames = body.tags
        ? body.tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
        : [];

    const tagsConnect = [];
    for (const name of tagNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        tagsConnect.push({
            where: { slug },
            create: { name, slug },
        });
    }

    // Determine publishedAt
    const currentPost = await db.post.findUnique({ where: { id: params.id }, select: { publishedAt: true } });
    let publishedAt = currentPost?.publishedAt;

    if (body.published && !publishedAt) {
        publishedAt = new Date();
    }

    const post = await db.post.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage,
        published: body.published,
        publishedAt: publishedAt,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        categories: {
          set: [], // clear existing
          connect: body.categoryIds?.map(id => ({ id })) || [],
        },
        tags: {
          set: [], // clear existing connection
          connectOrCreate: tagsConnect // re-add new list
        }
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("[BLOG_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.post.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BLOG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
