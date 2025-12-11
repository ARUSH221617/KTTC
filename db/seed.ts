import "dotenv/config";
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Start seeding...");

  const hashedPassword = await bcrypt.hash("amir1386", 10);

  // Helper to upsert user
  const upsertUser = async (email: string, name: string, role: string) => {
    return await db.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
  };

  // Create sample user
  const user = await upsertUser("arush221617@gmail.com", "Arush Admin", "admin");
  console.log("Upserted user:", user.email);

  // Create instructors
  const instructor1 = await upsertUser("sarah.johnson@example.com", "Dr. Sarah Johnson", "instructor");
  const instructor2 = await upsertUser("michael.chen@example.com", "Prof. Michael Chen", "instructor");
  const instructor3 = await upsertUser("emily.rodriguez@example.com", "Ms. Emily Rodriguez", "instructor");
  const instructor4 = await upsertUser("james.wilson@example.com", "Dr. James Wilson", "instructor");
  const instructor5 = await upsertUser("maria.garcia@example.com", "Prof. Maria Garcia", "instructor");

  // Create sample courses
  // Helper to upsert course (checking by title and instructor)
  const upsertCourse = async (data: any) => {
    // Since we don't have a unique field for course other than ID, we can check if one exists with the same title
    const existing = await db.course.findFirst({
      where: { title: data.title },
    });
    if (existing) return existing;
    return await db.course.create({ data });
  };

  const courses = await Promise.all([
    upsertCourse({
      title: "Modern Teaching Methodologies",
      description:
        "Learn innovative teaching strategies for the 21st century classroom including project-based learning, flipped classroom, and differentiated instruction.",
      category: "Teaching Skills",
      level: "Intermediate",
      duration: "6 weeks",
      instructorId: instructor1.id,
      thumbnail: "/api/placeholder/300/200",
    }),
    upsertCourse({
      title: "Educational Psychology",
      description:
        "Understanding student behavior, cognitive development, and learning processes. Essential for creating effective learning environments.",
      category: "Psychology",
      level: "Advanced",
      duration: "8 weeks",
      instructorId: instructor2.id,
      thumbnail: "/api/placeholder/300/200",
    }),
    upsertCourse({
      title: "Classroom Management",
      description:
        "Effective strategies for creating positive learning environments, managing student behavior, and fostering engagement.",
      category: "Management",
      level: "Beginner",
      duration: "4 weeks",
      instructorId: instructor3.id,
      thumbnail: "/api/placeholder/300/200",
    }),
    upsertCourse({
      title: "Digital Literacy in Education",
      description:
        "Integrating technology into teaching, using educational software, and developing digital literacy skills for modern classrooms.",
      category: "Technology",
      level: "Intermediate",
      duration: "5 weeks",
      instructorId: instructor4.id,
      thumbnail: "/api/placeholder/300/200",
    }),
    upsertCourse({
      title: "Curriculum Development",
      description:
        "Designing effective curricula, learning objectives, and assessment strategies that align with educational standards.",
      category: "Curriculum",
      level: "Advanced",
      duration: "10 weeks",
      instructorId: instructor5.id,
      thumbnail: "/api/placeholder/300/200",
    }),
  ]);

  console.log("Upserted courses count:", courses.length);

  // Create users for certificates
  const student1 = await upsertUser("fatemeh.alavi@example.com", "Fatemeh Alavi", "user");
  const student2 = await upsertUser("reza.mohammadi@example.com", "Reza Mohammadi", "user");

  // Create sample certificates
  const upsertCertificate = async (certificateNo: string, userId: string, courseId: string, createdAt: Date) => {
    return await db.certificate.upsert({
      where: { certificateNo },
      update: {},
      create: {
        certificateNo,
        userId,
        courseId,
        createdAt,
      },
    });
  };

  const certificates = await Promise.all([
    upsertCertificate("KTTC-2024-0001", student1.id, courses[0].id, new Date("2024-03-15")),
    upsertCertificate("KTTC-2024-0002", student2.id, courses[4].id, new Date("2024-02-20")),
  ]);

  console.log("Upserted certificates count:", certificates.length);

  // Create sample testimonials
  // Check if testimonials exist, if not create
  const testimonialCount = await db.testimonial.count();
  if (testimonialCount === 0) {
    const testimonials = await Promise.all([
      db.testimonial.create({
        data: {
          name: "Fatemeh Alavi",
          role: "Primary School Teacher",
          content:
            "KTTC transformed my teaching career. The modern methodologies I learned have made my classes more engaging and effective.",
          avatar: "/api/placeholder/150/150",
        },
      }),
      db.testimonial.create({
        data: {
          name: "Reza Mohammadi",
          role: "High School Principal",
          content:
            "The management courses at KTTC provided me with the skills needed to lead our school successfully. Highly recommended!",
          avatar: "/api/placeholder/150/150",
        },
      }),
      db.testimonial.create({
        data: {
          name: "Maryam Kazemi",
          role: "Educational Consultant",
          content:
            "The psychology course helped me understand student behavior better. It's been invaluable in my consulting work.",
          avatar: "/api/placeholder/150/150",
        },
      }),
    ]);
    console.log("Created testimonials:", testimonials.length);
  } else {
    console.log("Testimonials already exist, skipping.");
  }

  // Create sample contacts
  // Check if contacts exist, if not create
  const contactCount = await db.contact.count();
  if (contactCount === 0) {
    const contacts = await Promise.all([
      db.contact.create({
        data: {
          name: "Ali Rezaei",
          email: "ali.rezaei@example.com",
          subject: "Course Inquiry",
          message: "I would like to know if you offer any advanced courses in physics.",
        },
      }),
      db.contact.create({
        data: {
          name: "Zahra Kamali",
          email: "zahra.kamali@example.com",
          subject: "Technical Support",
          message: "I am having trouble accessing my certificate for the Psychology course.",
        },
      }),
    ]);
    console.log("Created contacts:", contacts.length);
  } else {
    console.log("Contacts already exist, skipping.");
  }

  // Create sample categories
  const categories = await Promise.all([
    db.category.upsert({ where: { slug: "technology" }, update: {}, create: { name: "Technology", slug: "technology" } }),
    db.category.upsert({ where: { slug: "education" }, update: {}, create: { name: "Education", slug: "education" } }),
    db.category.upsert({ where: { slug: "teaching-tips" }, update: {}, create: { name: "Teaching Tips", slug: "teaching-tips" } }),
  ]);

  // Create sample tags
  const tags = await Promise.all([
    db.tag.upsert({ where: { slug: "nextjs" }, update: {}, create: { name: "Next.js", slug: "nextjs" } }),
    db.tag.upsert({ where: { slug: "seo" }, update: {}, create: { name: "SEO", slug: "seo" } }),
    db.tag.upsert({ where: { slug: "prisma" }, update: {}, create: { name: "Prisma", slug: "prisma" } }),
  ]);

  // Create sample posts
  const post1 = await db.post.upsert({
    where: { slug: "how-to-use-ai-in-education" },
    update: {},
    create: {
      title: "How to use AI in Education",
      slug: "how-to-use-ai-in-education",
      excerpt: "AI is transforming education. Here is how you can use it.",
      content: "<h2>Introduction</h2><p>Artificial Intelligence is changing the way we teach and learn...</p>",
      authorId: instructor1.id,
      published: true,
      publishedAt: new Date(),
      categories: { connect: [{ id: categories[1].id }] },
      tags: { connect: [{ id: tags[0].id }] },
    },
  });

  const post2 = await db.post.upsert({
    where: { slug: "future-of-online-learning" },
    update: {},
    create: {
      title: "The Future of Online Learning",
      slug: "future-of-online-learning",
      excerpt: "Online learning is here to stay. What does the future hold?",
      content: "<h2>The Shift to Digital</h2><p>More and more students are learning online...</p>",
      authorId: instructor2.id,
      published: true,
      publishedAt: new Date(),
      categories: { connect: [{ id: categories[0].id }, { id: categories[1].id }] },
    },
  });

  console.log("Upserted posts");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
