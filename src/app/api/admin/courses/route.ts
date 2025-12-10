import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { courseSchema, courseUpdateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Get courses with optional search
    const courses = await db.course.findMany({
      where: {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        instructor: true,
      },
    });

    // Get total count for pagination
    const totalCount = await db.course.count({
      where: {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      },
    });

    return new Response(
      JSON.stringify({
        courses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch courses" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = courseSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { title, description, instructorId, price, duration, thumbnail, category, level } = result.data;

    // Create new course
    const newCourse = await db.course.create({
      data: {
        title,
        description,
        category: category || "Unknown",
        level: level || "test",
        popularity: 1,
        instructorId,
        price,
        duration,
        thumbnail: thumbnail || "",
      },
    });

    return new Response(JSON.stringify(newCourse), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return new Response(JSON.stringify({ error: "Failed to create course" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = courseUpdateSchema.safeParse(body);
    if (!result.success) {
       return new Response(
        JSON.stringify({ error: "Validation failed", details: result.error.format() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id, title, description, instructorId, price, duration, thumbnail, category, level } = result.data;

    // Update course
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        title,
        description,
        instructorId,
        price,
        duration,
        thumbnail,
        category,
        level,
      },
    });

    return new Response(JSON.stringify(updatedCourse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return new Response(JSON.stringify({ error: "Failed to update course" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    // Verify admin session
    const session = await auth();

    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Course ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete course
    await db.course.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Course deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return new Response(JSON.stringify({ error: "Failed to delete course" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
