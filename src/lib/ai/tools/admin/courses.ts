import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tool } from "ai";
import { generateImage } from "@/lib/ai/generate-image";

const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
};

// Courses
export const createCourse = tool({
  description: "Create a new course. Requires admin privileges. Supports AI image generation for thumbnail.",
  parameters: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    level: z.string(),
    duration: z.string(),
    price: z.number(),
    instructorId: z.string().describe("ID of the instructor (User ID)"),
    thumbnailPrompt: z.string().optional().describe("Prompt to generate a thumbnail image if no URL is provided"),
    thumbnailUrl: z.string().optional(),
  }),
  execute: async ({ title, description, category, level, duration, price, instructorId, thumbnailPrompt, thumbnailUrl }) => {
    await checkAdmin();

    let thumbnail = thumbnailUrl || "";
    if (!thumbnail && thumbnailPrompt) {
        try {
            thumbnail = await generateImage(thumbnailPrompt);
        } catch (e) {
            console.error("Failed to generate thumbnail", e);
            thumbnail = "https://placehold.co/600x400?text=Course";
        }
    } else if (!thumbnail) {
        thumbnail = "https://placehold.co/600x400?text=Course";
    }

    try {
        const course = await db.course.create({
          data: {
            title,
            description,
            category,
            level,
            duration,
            price,
            instructorId,
            thumbnail,
          },
        });
        return { success: true, course };
    } catch (error: any) {
        return { error: `Failed to create course: ${error.message}` };
    }
  },
});

export const updateCourse = tool({
  description: "Update an existing course. Requires admin privileges.",
  parameters: z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    level: z.string().optional(),
    duration: z.string().optional(),
    price: z.number().optional(),
    instructorId: z.string().optional(),
    thumbnailPrompt: z.string().optional(),
    thumbnailUrl: z.string().optional(),
  }),
  execute: async ({ id, title, description, category, level, duration, price, instructorId, thumbnailPrompt, thumbnailUrl }) => {
    await checkAdmin();

    const data: any = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (category) data.category = category;
    if (level) data.level = level;
    if (duration) data.duration = duration;
    if (price !== undefined) data.price = price;
    if (instructorId) data.instructorId = instructorId;

    if (thumbnailUrl) {
        data.thumbnail = thumbnailUrl;
    } else if (thumbnailPrompt) {
        try {
            data.thumbnail = await generateImage(thumbnailPrompt);
        } catch (e) {
            // keep old thumbnail or ignore
        }
    }

    try {
        const course = await db.course.update({
            where: { id },
            data,
        });
        return { success: true, course };
    } catch (e) {
        return { error: "Failed to update course. Course might not exist." };
    }
  },
});

export const readCourses = tool({
  description: "List courses with optional filtering. Requires admin privileges.",
  parameters: z.object({
    query: z.string().optional().describe("Search by title or description"),
    category: z.string().optional(),
    limit: z.number().default(10),
  }),
  execute: async ({ query, category, limit }) => {
    await checkAdmin();
    const where: any = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const courses = await db.course.findMany({
      where,
      take: limit,
      include: { instructor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return { courses };
  },
});
